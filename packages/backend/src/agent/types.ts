import type { Request } from 'express'

export type AgentMode = 'auto' | 'general' | 'knowledge' | 'agent'

export interface AgentUser {
  id: string
  name: string
  roles: string[]
  admin: boolean
}

export interface AuthenticatedRequest extends Request {
  agentUser?: AgentUser
}

export interface AgentSettings {
  model: {
    baseUrl: string
    apiKeyConfigured: boolean
    model: string
    temperature: number
    maxTokens: number
  }
  search: {
    primary: 'searxng' | 'tavily'
    fallback: 'searxng' | 'tavily' | 'none'
    searxngUrl: string
    tavilyKeyConfigured: boolean
    timeoutSeconds: number
    maxResults: number
  }
  agent: { maxRounds: number; maxDurationSeconds: number; contextWindow: number }
  sandbox: { timeoutSeconds: number; memoryMb: number; cpus: number; pids: number; outputMb: number }
}

export const STREAM_EVENT_TYPES = [
  'message_started', 'progress', 'tool_started', 'tool_finished', 'tool_failed',
  'source', 'context_usage', 'delta', 'artifact', 'done', 'error', 'heartbeat',
] as const
