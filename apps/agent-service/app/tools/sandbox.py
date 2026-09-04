import asyncio
import io
import os
import mimetypes
import tarfile
import uuid
from typing import Any

import docker


async def execute(reason: str, command: str, config: dict[str, Any], input_files: list[str] | None = None, artifact_dir: str | None = None) -> dict[str, Any]:
    """在独立一次性容器中执行命令，默认禁网、非特权、只读根文件系统。"""
    timeout = min(600, max(1, int(config.get('sandbox.timeoutSeconds') or 120)))
    memory = min(4096, max(128, int(config.get('sandbox.memoryMb') or 1024)))
    pids = min(512, max(32, int(config.get('sandbox.pids') or 256)))
    output_limit = min(50, max(1, int(config.get('sandbox.outputMb') or 10))) * 1024 * 1024
    client = docker.DockerClient(base_url=os.environ.get('DOCKER_HOST', 'tcp://sandbox-engine:2375'))

    def run() -> dict[str, Any]:
        container = client.containers.create(
            os.environ.get('SANDBOX_IMAGE', 'bx-agent-sandbox:latest'),
            ['/bin/sh', '-lc', 'while true; do sleep 3600; done'], user='1000:1000', working_dir='/workspace',
            network_disabled=True, read_only=True, mem_limit=f'{memory}m', pids_limit=pids,
            nano_cpus=int(float(config.get('sandbox.cpus') or 1) * 1_000_000_000),
            cap_drop=['ALL'], security_opt=['no-new-privileges'], tmpfs={'/workspace': f'rw,size={min(memory, 512)}m', '/tmp': 'rw,size=64m'},
            labels={'bx.agent.sandbox': 'true'},
        )
        try:
            container.start()
            if input_files:
                archive = io.BytesIO()
                with tarfile.open(fileobj=archive, mode='w') as tar:
                    for raw in input_files:
                        if os.path.isfile(raw):
                            tar.add(raw, arcname=f'input/{os.path.basename(raw)}', recursive=False)
                container.put_archive('/workspace', archive.getvalue())
            shell_command = f'ulimit -v {memory * 1024}; ulimit -u {pids}; exec /bin/bash -lc "$BX_SANDBOX_COMMAND"'
            result = container.exec_run(
                ['/usr/bin/timeout', f'{timeout}s', '/bin/bash', '-lc', shell_command],
                environment={'BX_SANDBOX_COMMAND': command}, demux=False,
            )
            logs = result.output or b''
            text = logs[:output_limit].decode('utf-8', errors='replace')
            if len(logs) > output_limit:
                text += '\n[输出已截断]'
            artifacts: list[dict[str, Any]] = []
            if artifact_dir:
                try:
                    stream, _stat = container.get_archive('/workspace/output')
                    archive_bytes = b''.join(stream)
                    if len(archive_bytes) > output_limit * 5:
                        raise ValueError('生成文件总大小超过限制')
                    os.makedirs(artifact_dir, exist_ok=True)
                    with tarfile.open(fileobj=io.BytesIO(archive_bytes), mode='r:*') as archive:
                        for member in archive.getmembers():
                            if not member.isfile():
                                continue
                            source = archive.extractfile(member)
                            if not source:
                                continue
                            filename = os.path.basename(member.name)
                            target = os.path.join(artifact_dir, f'{uuid.uuid4().hex}-{filename}')
                            data = source.read(output_limit + 1)
                            if len(data) > output_limit:
                                continue
                            with open(target, 'wb') as output:
                                output.write(data)
                            artifacts.append({'filename': filename, 'storagePath': target, 'mimeType': mimetypes.guess_type(filename)[0] or 'application/octet-stream', 'sizeBytes': len(data)})
                except docker.errors.NotFound:
                    pass
            return {'exitCode': result.exit_code, 'output': text, 'artifacts': artifacts}
        finally:
            container.remove(force=True)

    try:
        return await asyncio.wait_for(asyncio.to_thread(run), timeout=timeout + 10)
    except (TimeoutError, asyncio.TimeoutError):
        return {'exitCode': 124, 'output': f'执行超过 {timeout} 秒，已终止', 'artifacts': []}
