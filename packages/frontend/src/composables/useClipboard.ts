import { useToast } from './useToast'

export const useClipboard = () => {
  const toast = useToast()

  const copyToClipboard = async (text: string, successMessage = '已复制到剪贴板'): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(successMessage)
      return true
    } catch {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        toast.success(successMessage)
        return true
      } catch {
        toast.error('复制失败')
        return false
      }
    }
  }

  const readFromClipboard = async (): Promise<string | null> => {
    try {
      return await navigator.clipboard.readText()
    } catch {
      return null
    }
  }

  return { copyToClipboard, readFromClipboard }
}
