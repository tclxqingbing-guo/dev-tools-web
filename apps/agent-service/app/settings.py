import os
from dataclasses import dataclass


def env_int(name: str, default: int) -> int:
    try:
        return int(os.environ.get(name) or default)
    except ValueError:
        return default


@dataclass
class Settings:
    port: int = env_int('AGENT_SERVICE_PORT', 8200)
    context_window: int = env_int('AGENT_CONTEXT_WINDOW', 128000)
    max_rounds: int = env_int('AGENTIC_MAX_ROUNDS', 30)
    max_duration_seconds: int = env_int('AGENTIC_MAX_DURATION_SECONDS', 600)
    docker_host: str = os.environ.get('DOCKER_HOST', 'tcp://sandbox-engine:2375')
    sandbox_image: str = os.environ.get('SANDBOX_IMAGE', 'bx-agent-sandbox:latest')


settings = Settings()
