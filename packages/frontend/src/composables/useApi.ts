export const useApi = () => {
  const baseUrl = '/api'

  const request = async <T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(err.message || res.statusText)
    }
    return res.json()
  }

  const streamRequest = async (
    endpoint: string,
    body: any,
    onChunk: (text: string) => void,
    onDone?: () => void
  ) => {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(err.message || res.statusText)
    }
    const reader = res.body?.getReader()
    if (!reader) throw new Error('No readable stream')
    const decoder = new TextDecoder()
    let buffer = ''

    const parseStreamFrame = (frame: string) => {
      const lines = frame.split('\n').filter(line => line.startsWith('data: '))
      for (const line of lines) {
        const data = line.slice(6)
        if (data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) onChunk(content)
        } catch {
          // Skip malformed or incomplete SSE lines; do not append raw JSON to result
        }
      }
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const frames = buffer.split('\n\n')
      buffer = frames.pop() ?? ''
      for (const frame of frames) {
        parseStreamFrame(frame)
      }
    }
    buffer += decoder.decode()
    if (buffer.trim()) {
      parseStreamFrame(buffer)
    }
    onDone?.()
  }

  return { request, streamRequest }
}
