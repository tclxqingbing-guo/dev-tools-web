import { ref, onMounted } from 'vue'
import { useApi } from './useApi'

const DEFAULT_CHAT_MODELS = [
  'deepseek-v4-flash',
]

export interface AiModelOption {
  value: string
  label: string
}

export function useAiModels() {
  const api = useApi()
  const chatModels = ref<AiModelOption[]>(
    DEFAULT_CHAT_MODELS.map((id) => ({ value: id, label: id }))
  )
  const loading = ref(false)
  const error = ref<string | null>(null)

  onMounted(async () => {
    loading.value = true
    error.value = null
    try {
      const list = await api.request<string[]>('/ai/models')
      if (Array.isArray(list) && list.length > 0) {
        chatModels.value = list.map((id) => ({ value: id, label: id }))
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load models'
    } finally {
      loading.value = false
    }
  })

  return { chatModels, loading, error }
}
