import asyncio
import json
from typing import Any

from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from .agent_def import run_stream
from .settings import settings

app = FastAPI(title='BX Unified Agent Runtime')


class AgentRequest(BaseModel):
    runId: str
    conversationId: str
    user: dict[str, Any]
    question: str
    mode: str = 'auto'
    history: list[dict[str, Any]] = Field(default_factory=list)
    attachments: list[dict[str, Any]] = Field(default_factory=list)
    mcpServers: list[dict[str, Any]] = Field(default_factory=list)
    gateway: dict[str, Any]
    settings: dict[str, Any] = Field(default_factory=dict)


@app.get('/healthz')
async def healthz() -> dict[str, bool]:
    return {'ok': True}


@app.post('/agent/stream')
async def stream_agent(request: Request, body: AgentRequest) -> StreamingResponse:
    async def events():
        queue: asyncio.Queue = asyncio.Queue()
        sentinel = object()

        async def emit(event: dict[str, Any]) -> None:
            await queue.put(event)

        async def worker() -> None:
            try:
                async with asyncio.timeout(int(body.settings.get('agent.maxDurationSeconds') or settings.max_duration_seconds)):
                    await run_stream(body.model_dump(), emit)
            except TimeoutError:
                await emit({'type': 'error', 'runId': body.runId, 'message': 'Agent 执行超时'})
            except asyncio.CancelledError:
                raise
            except Exception as error:  # noqa: BLE001
                await emit({'type': 'error', 'runId': body.runId, 'message': str(error)[:500]})
            finally:
                queue.put_nowait(sentinel)

        task = asyncio.create_task(worker())
        try:
            while True:
                try:
                    item = await asyncio.wait_for(queue.get(), timeout=10)
                except asyncio.TimeoutError:
                    yield json.dumps({'type': 'heartbeat', 'runId': body.runId}, ensure_ascii=False) + '\n'
                    continue
                if item is sentinel:
                    break
                yield json.dumps(item, ensure_ascii=False, default=str) + '\n'
        finally:
            if not task.done():
                task.cancel()
                await asyncio.gather(task, return_exceptions=True)

    return StreamingResponse(events(), media_type='application/x-ndjson')


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=settings.port)
