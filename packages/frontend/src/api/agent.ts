export type AgentMode = 'auto' | 'general' | 'knowledge' | 'agent'

export interface AgentEvent {
  type: string
  runId?: string
  messageId?: string
  content?: string
  message?: string
  toolName?: string
  summary?: string
  source?: Record<string, unknown>
  [key: string]: unknown
}

export interface Conversation {
  id: string
  title: string
  mode: AgentMode
  createdAt: string
  updatedAt: string
  messages?: ChatMessage[]
  attachments?: Attachment[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  status: string
  trace?: AgentEvent[]
}

export interface Attachment { id: string; filename: string; mimeType: string; sizeBytes: number; status: string }

async function json<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: 'include', ...options, headers: options?.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json', ...options.headers } : options?.headers })
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).detail || `请求失败：${response.status}`)
  return response.status === 204 ? undefined as T : response.json()
}

export const agentApi = {
  listConversations: () => json<Conversation[]>('/api/agent/conversations'),
  getConversation: (id: string) => json<Conversation>(`/api/agent/conversations/${id}`),
  createConversation: (mode: AgentMode = 'auto') => json<Conversation>('/api/agent/conversations', { method: 'POST', body: JSON.stringify({ mode }) }),
  updateConversation: (id: string, input: Partial<Pick<Conversation, 'title' | 'mode'>>) => json<Conversation>(`/api/agent/conversations/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteConversation: (id: string) => json<void>(`/api/agent/conversations/${id}`, { method: 'DELETE' }),
  capabilities: () => json<any>('/api/agent/capabilities'),
  cancel: (conversationId: string, messageId: string) => json(`/api/agent/conversations/${conversationId}/messages/${messageId}/cancel`, { method: 'POST' }),
  async upload(conversationId: string, files: File[]) {
    const form = new FormData(); form.append('conversationId', conversationId)
    files.forEach((file) => form.append('files', file))
    return json<Attachment[]>('/api/agent/attachments', { method: 'POST', body: form })
  },
}

/** 消费统一 Agent SSE，返回中止函数。 */
export function streamAgent(conversationId: string, message: string, mode: AgentMode, onEvent: (event: AgentEvent) => void): () => void {
  const controller = new AbortController()
  void (async () => {
    const response = await fetch(`/api/agent/conversations/${conversationId}/messages/stream`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, mode }), signal: controller.signal,
    })
    if (!response.ok || !response.body) throw new Error((await response.json().catch(() => ({}))).detail || `请求失败：${response.status}`)
    const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ''
    while (true) {
      const { done, value } = await reader.read(); if (done) break
      buffer += decoder.decode(value, { stream: true })
      const blocks = buffer.split('\n\n'); buffer = blocks.pop() || ''
      for (const block of blocks) {
        const raw = block.split('\n').filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trim()).join('\n')
        if (raw) onEvent(JSON.parse(raw))
      }
    }
  })().catch((error) => { if (error.name !== 'AbortError') onEvent({ type: 'error', message: error.message }) })
  return () => controller.abort()
}
