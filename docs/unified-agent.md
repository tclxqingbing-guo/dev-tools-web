# 统一 AI Agent 部署与联调

## 先跑起来

1. 分别复制三个仓库的环境变量示例，并生成随机强密钥。`bx-tools` 的 `KNOWLEDGE_MCP_TOKEN` 必须与 `bx-libary` 的 `MCP_SERVICE_TOKEN` 相同；`MONITOR_MCP_TOKEN` 必须与 `bx-monitor/infra` 的 `MCP_SERVICE_TOKEN` 相同。
2. 创建三套 Compose 共用的内部网络：`docker network create bx-agent-shared`。
3. 先启动知识库与监控，再启动公共工具系统：

   ```bash
   cd /Users/qingbing/projects/bx/bx-libary/docker && docker compose up -d --build
   cd /Users/qingbing/projects/bx/bx-monitor/infra && docker compose up -d --build
   cd /Users/qingbing/projects/bx/bx-tools && docker compose up -d --build
   ```

4. 打开公共工具系统的 `/agent/settings`。探测 `knowledge`、`monitor`、`codegraph` 三个 MCP，确认状态为可用。
5. 配置 GitLab 地址、Token 和项目 ID，然后触发 Code Graph 同步。同步完成后检查 commit、节点数和关系数。

默认 MCP 地址使用共享网络中的容器名：

- `http://kb-server:3000/api/mcp`
- `http://monitor-collector:3001/api/v1/mcp`
- `http://backend:3001/api/mcp/codegraph`

## 页面与开放 API

- 统一页面：`https://bx-tools.17usoft.com/tool/ai-assistants`
- 浏览器会话 API：`/api/agent/*`，使用 SSO Cookie，支持会话、附件、SSE、取消和能力查询。
- 开放 API：`POST /api/open/agent/v1/chat/completions`，兼容 OpenAI Chat Completions 的流式和非流式响应。
- 模型查询：`GET /api/open/agent/v1/models`。

开放 API 使用 `Authorization: Bearer <token>` 和 `X-BX-User-Id: <业务用户ID>`。Token 可在 Agent 系统设置中配置，也可通过 `AGENT_EXTERNAL_API_TOKEN` 注入；默认每个来源 IP 每分钟 30 次。

```bash
curl https://bx-tools.17usoft.com/api/open/agent/v1/chat/completions \
  -H 'Authorization: Bearer <token>' \
  -H 'X-BX-User-Id: wecom-user-id' \
  -H 'Content-Type: application/json' \
  -d '{"mode":"auto","stream":false,"messages":[{"role":"user","content":"你好"}]}'
```

## 配置说明

- SSO 未接通时，仅在本地联调环境启用 `AUTH_MOCK_ENABLED=true`；生产必须启用 SSO 和统一权限。
- `MCP_ALLOWED_HOSTS` 是服务地址白名单。生产不要放宽为任意私网地址。
- Tavily Key、GitLab Token 和 MCP Token 在数据库中加密保存，管理 API 不回传明文。
- 沙盒使用独立 rootless Docker daemon。Agent 容器不会挂载宿主 Docker Socket；任务默认禁网、只读根文件系统，并限制 CPU、内存、PID、时间和输出。
- 会话附件不会进入知识库。删除会话时同步清理，未绑定会话的临时文件 24 小时后回收。
- Code Graph 使用独立 Neo4j，与知识库实体图谱分开部署和维护。
- 正式环境先执行 `SANDBOX_IMAGE=harbor.17usoft.com/bx/base/bx-agent-sandbox:<版本> docker buildx bake --push agent-sandbox`，生成并推送 amd64/arm64 沙盒镜像；本地 Compose 会为当前架构构建联调镜像。

## 联调顺序

1. 在 `自动` 模式验证不需要工具的通识问题。
2. 验证时效问题触发 `web.search`，回答保留来源链接。
3. 上传 PDF、DOCX、PPTX 或图片，验证摘要和多文档比较。
4. 执行 Python/Node 脚本，验证禁网、超时和资源上限。
5. 在 `知识检索` 模式确认只调用一次 `knowledge.search`。
6. 在 `Agent 增强` 模式执行真实链路：监控 MCP 查异常，Code Graph 查调用关系，知识库 MCP 查处理规范，最后汇总证据。

## 当前迁移边界

公共入口与旧知识库、监控 Agent 先并行运行。旧入口和知识库旧 Code Graph 暂不删除；完成新旧仓库 commit、节点、关系和代表性查询对比，并经过灰度观察后，再切换旧查询并移除旧编排代码。
