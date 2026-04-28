import { ref } from 'vue'

export interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration: number
}

let nextId = 0
const toasts = ref<ToastItem[]>([])

export const useToast = () => {
  const show = (message: string, type: ToastItem['type'] = 'info', duration = 2000) => {
    const toast: ToastItem = { id: nextId++, message, type, duration }
    toasts.value.push(toast)
    setTimeout(() => {
      const idx = toasts.value.findIndex(t => t.id === toast.id)
      if (idx > -1) toasts.value.splice(idx, 1)
    }, duration)
  }

  return {
    toasts,
    show,
    success: (msg: string, d?: number) => show(msg, 'success', d),
    error: (msg: string, d?: number) => show(msg, 'error', d),
    warning: (msg: string, d?: number) => show(msg, 'warning', d),
    info: (msg: string, d?: number) => show(msg, 'info', d),
  }
}
