import json
from dataclasses import asdict, is_dataclass
from typing import Any
from urllib.parse import quote

from pydantic_ai import Agent, AgentRunResultEvent, FunctionToolCallEvent, FunctionToolResultEvent, PartDeltaEvent, UsageLimits
from pydantic_ai.mcp import MCPToolset
from pydantic_ai.messages import ModelMessage, ModelRequest, ModelResponse, RetryPromptPart, TextPart, UserPromptPart
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider
from pydantic_ai.settings import ModelSettings

from .tools.documents import read_document
from .tools.sandbox import execute as sandbox_execute
from .tools.web import read_web_page, search_web


def history_messages(items: list[dict[str, Any]]) -> list[ModelMessage]:
    history: list[ModelMessage] = []
    for item in items:
        content = str(item.get('content') or '')
        if item.get('role') == 'user':
            history.append(ModelRequest(parts=[UserPromptPart(content=content)]))
        elif item.get('role') == 'assistant':
            history.append(ModelResponse(parts=[TextPart(content=content)]))
    return history


def build_mcp_toolsets(servers: list[dict[str, Any]], user: dict[str, Any]) -> list[Any]:
    toolsets: list[Any] = []
    for server in servers:
        headers = {
            'X-BX-User-Id': str(user.get('id') or ''),
            # HTTP 头仅允许 ASCII；中文显示名使用百分号编码传递。
            'X-BX-User-Name': quote(str(user.get('name') or ''), safe=''),
            'X-BX-User-Name-Encoding': 'percent',
            'X-BX-User-Roles': ','.join(user.get('roles') or []),
        }
        if server.get('token'):
            headers['Authorization'] = f"Bearer {server['token']}"
        toolset: Any = MCPToolset(
            str(server['url']), id=str(server['name']), headers=headers,
            init_timeout=float(server.get('timeoutSeconds') or 20),
            read_timeout=float(server.get('timeoutSeconds') or 20),
            tool_error_behavior='failed',
        )
        allowlist = set(server.get('toolAllowlist') or [])
        if allowlist:
            toolset = toolset.filtered(lambda _ctx, tool, allowed=allowlist: tool.name in allowed)
        toolsets.append(toolset)
    return toolsets


def system_instructions(mode: str, attachments: list[dict[str, Any]]) -> str:
    files = '\n'.join(f"- {item['id']}: {item['filename']}" for item in attachments) or '（无）'
    return f"""你是 BX 企业统一 AI Agent。使用简体中文回答，结论必须区分事实、推断和建议。
当前模式：{mode}。
工具要求：
- 涉及时效信息必须使用 web_search，并在答案保留 Markdown 来源链接。
- 涉及知识库、监控或代码实现时主动调用对应 MCP 工具，不可根据名称猜测。
- terminal 命令只能使用 sandbox_execute；不得声称访问宿主机。
- 每次工具调用的 reason 只写一句可安全展示的中文目的，不输出隐藏思维链。
- 调用工具前不要输出面向用户的正文；工具返回后再组织最终答案。
- 工具不可用时明确说明证据边界，禁止编造结果。
会话附件：
{files}
附件只能通过 document_read 使用给定 attachment_id 读取。"""


async def run_stream(body: dict[str, Any], emit) -> str:
    gateway = body['gateway']
    if not gateway.get('model'):
        raise ValueError('未配置 Agent 聊天模型')
    model = OpenAIChatModel(
        gateway['model'],
        provider=OpenAIProvider(base_url=str(gateway['baseURL']).rstrip('/').removesuffix('/v1') + '/v1', api_key=gateway['apiKey']),
    )
    config = body.get('settings') or {}
    attachments = body.get('attachments') or []
    attachment_map = {str(item['id']): item for item in attachments}

    async def web_search(reason: str, query: str, max_results: int = 8) -> dict[str, Any]:
        """联网搜索。reason 是展示给用户的一句中文目的。"""
        result = await search_web(reason, query, config, max_results)
        for source in result.get('results') or []:
            await emit({'type': 'source', 'runId': body['runId'], 'source': source})
        return result

    async def web_read(reason: str, url: str) -> str:
        """读取公开网页正文。reason 是展示给用户的一句中文目的。"""
        return await read_web_page(reason, url, config)

    async def document_read(reason: str, attachment_id: str) -> str:
        """读取会话附件文字。reason 是展示给用户的一句中文目的。"""
        item = attachment_map.get(attachment_id)
        if not item:
            return '附件不存在或无权访问'
        return read_document(str(item['storagePath']))

    async def sandbox_execute_tool(reason: str, command: str, attachment_ids: list[str] | None = None) -> dict[str, Any]:
        """在无网络一次性容器内执行命令；输入位于 input，需返回的文件写到 output。"""
        selected = [str(attachment_map[item]['storagePath']) for item in attachment_ids or [] if item in attachment_map]
        artifact_dir = f"/app/data/agent/artifacts/{body['runId']}"
        result = await sandbox_execute(reason, command, config, selected, artifact_dir)
        for artifact in result.get('artifacts') or []:
            await emit({'type': 'artifact', 'runId': body['runId'], **artifact})
        return result

    mode = str(body.get('mode') or 'auto')
    toolsets = build_mcp_toolsets(body.get('mcpServers') or [], body.get('user') or {}) if mode in {'auto', 'agent'} else []
    tools = [web_search, web_read, document_read, sandbox_execute_tool] if mode != 'knowledge' else []

    # 基础知识检索严格执行一次 knowledge.search，不进入多轮工具循环。
    knowledge_context = ''
    if mode == 'knowledge':
        basic_servers = [{**server, 'toolAllowlist': []} for server in body.get('mcpServers') or [] if server.get('name') == 'knowledge']
        candidates = build_mcp_toolsets(basic_servers, body.get('user') or {})
        for toolset in candidates:
            try:
                available = await toolset.list_tools()
                match = next((tool for tool in available if tool.name == 'knowledge.search'), None)
                if not match:
                    continue
                await emit({'type': 'tool_started', 'runId': body['runId'], 'toolCallId': 'knowledge-basic', 'server': 'knowledge', 'toolName': 'knowledge.search', 'summary': '执行一次基础知识检索'})
                knowledge_context = str(await toolset.direct_call_tool('knowledge.search', {'query': body['question'], 'reason': '检索相关知识库内容'}))
                await emit({'type': 'tool_finished', 'runId': body['runId'], 'toolCallId': 'knowledge-basic', 'server': 'knowledge', 'toolName': 'knowledge.search', 'summary': '基础知识检索完成'})
                break
            except Exception as error:  # noqa: BLE001
                await emit({'type': 'tool_failed', 'runId': body['runId'], 'toolCallId': 'knowledge-basic', 'server': 'knowledge', 'toolName': 'knowledge.search', 'summary': str(error)[:300]})
        if not knowledge_context:
            knowledge_context = '知识库 MCP 当前不可用或未返回结果。'

    agent = Agent(model, tools=tools, toolsets=toolsets)
    settings = ModelSettings(
        temperature=float(config.get('model.temperature') or 0.3),
        max_tokens=int(config.get('model.maxTokens') or 4096),
        parallel_tool_calls=False,
        extra_body={'thinking': {'type': 'disable'}},
    )
    prompt = body['question'] + (f'\n\n唯一一次知识库检索结果：\n{knowledge_context}' if knowledge_context else '')
    answer: list[str] = []
    streamed_text = ''
    round_no = 0
    async with agent.run_stream_events(
        prompt,
        message_history=history_messages(body.get('history') or []),
        instructions=system_instructions(mode, attachments),
        model_settings=settings,
        usage_limits=UsageLimits(request_limit=max(1, min(100, int(config.get('agent.maxRounds') or 30)))),
    ) as run:
        async for event in run:
            if isinstance(event, FunctionToolCallEvent):
                round_no += 1
                args = event.part.args
                if isinstance(args, str):
                    try: args = json.loads(args)
                    except Exception: args = {}
                await emit({'type': 'tool_started', 'runId': body['runId'], 'toolCallId': event.part.tool_call_id, 'toolName': event.part.tool_name, 'round': round_no, 'summary': (args or {}).get('reason') or '调用工具'})
            elif isinstance(event, FunctionToolResultEvent):
                failed = isinstance(event.part, RetryPromptPart)
                await emit({'type': 'tool_failed' if failed else 'tool_finished', 'runId': body['runId'], 'toolCallId': event.part.tool_call_id, 'toolName': event.part.tool_name, 'round': round_no, 'summary': str(event.part.content)[:300] if failed else '工具调用完成'})
            elif isinstance(event, PartDeltaEvent):
                value = getattr(event.delta, 'content_delta', None)
                # pydantic-ai 会在这里逐段返回正文；立即转成 SSE，前端才能实时绘制。
                if getattr(event.delta, 'part_delta_kind', None) == 'text' and isinstance(value, str) and value:
                    streamed_text += value
                    answer.append(value)
                    await emit({'type': 'delta', 'runId': body['runId'], 'content': value})
            elif isinstance(event, AgentRunResultEvent):
                value = getattr(event.result, 'output', None)
                final = value if isinstance(value, str) else ''
                usage = event.result.usage
                usage_value = asdict(usage) if is_dataclass(usage) else {}
                await emit({'type': 'context_usage', 'runId': body['runId'], 'usage': usage_value})
                # 某些模型没有 PartDeltaEvent，只在结果事件提供完整正文；仅在未流出正文时兜底。
                if final and not streamed_text:
                    answer.append(final)
                    await emit({'type': 'delta', 'runId': body['runId'], 'content': final})
    return ''.join(answer)
