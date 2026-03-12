<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import { useToast } from '../../composables/useToast'
import { useApi } from '../../composables/useApi'
import { useAiModels } from '../../composables/useAiModels'
import { marked } from 'marked'
import {
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  PaperAirplaneIcon,
  TrashIcon,
  ArrowDownTrayIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()
const api = useApi()
const { chatModels } = useAiModels()
const mode = ref<'chat' | 'image'>('chat')

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<ChatMessage[]>([])
const inputText = ref('')
const selectedChatModel = ref('deepseek-v3.2')
const isStreaming = ref(false)

function clearChat() {
  messages.value = []
  toast.success('对话已清空')
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isStreaming.value) return

  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  const assistantIndex = messages.value.length
  messages.value.push({ role: 'assistant', content: '' })
  isStreaming.value = true

  try {
    const chatMessages = messages.value
      .slice(0, -1)
      .map((m) => ({ role: m.role, content: m.content }))
    await api.streamRequest(
      '/ai/chat',
      {
        messages: chatMessages,
        model: selectedChatModel.value,
        stream: true,
        max_tokens: 4096,
      },
      (chunk) => {
        const last = messages.value[messages.value.length - 1]
        if (last) last.content += chunk
      },
      () => {
        isStreaming.value = false
      }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '请求失败'
    const last = messages.value[messages.value.length - 1]
    if (last) last.content = `错误: ${message}`
    isStreaming.value = false
    toast.error(message)
  }
}

function renderedMarkdown(content: string): string {
  if (!content) return ''
  return marked.parse(content, { async: false }) as string
}

// Image mode
const imagePrompt = ref('')
const imageSize = ref('1024x1024')
const imageModel = ref('dall-e-3')
const generatedImageUrl = ref('')
const isGenerating = ref(false)

const sizeOptions = [
  { value: '1024x1024', label: '1024×1024' },
  { value: '1024x1792', label: '1024×1792' },
  { value: '1792x1024', label: '1792×1024' },
]

const imageModels = [
  { value: 'dall-e-3', label: 'dall-e-3' },
  { value: 'dall-e-2', label: 'dall-e-2' },
]

async function generateImage() {
  const prompt = imagePrompt.value.trim()
  if (!prompt || isGenerating.value) return

  isGenerating.value = true
  generatedImageUrl.value = ''
  try {
    const res = await api.request<{
      data?: Array<{ url?: string; b64_json?: string }>
    }>('/ai/image', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        model: imageModel.value,
        size: imageSize.value,
        n: 1,
      }),
    })
    const img = res?.data?.[0]
    if (img?.url) {
      generatedImageUrl.value = img.url
      toast.success('图片生成成功')
    } else if (img?.b64_json) {
      generatedImageUrl.value = `data:image/png;base64,${img.b64_json}`
      toast.success('图片生成成功')
    } else {
      toast.error('未获取到图片')
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '生成失败'
    toast.error(message)
  } finally {
    isGenerating.value = false
  }
}

function downloadImage() {
  if (!generatedImageUrl.value) return
  const a = document.createElement('a')
  a.href = generatedImageUrl.value
  a.download = 'ai-image.png'
  a.click()
  toast.success('已下载')
}
</script>

<template>
  <ToolLayout title="AI 助手">
    <div class="space-y-6">
      <div class="flex gap-2">
        <button
          :class="[
            'px-4 py-2 rounded-xl font-medium flex items-center gap-2 cursor-pointer transition-colors',
            mode === 'chat' ? 'bg-accent hover:bg-accent-hover text-white' : 'btn-secondary',
          ]"
          @click="mode = 'chat'"
        >
          <ChatBubbleLeftRightIcon class="w-4 h-4" />
          AI 对话
        </button>
        <button
          :class="[
            'px-4 py-2 rounded-xl font-medium flex items-center gap-2 cursor-pointer transition-colors',
            mode === 'image' ? 'bg-accent hover:bg-accent-hover text-white' : 'btn-secondary',
          ]"
          @click="mode = 'image'"
        >
          <PhotoIcon class="w-4 h-4" />
          图片生成
        </button>
      </div>

      <!-- Chat mode -->
      <div v-if="mode === 'chat'" class="space-y-4">
        <div
          class="glass-card p-4 flex flex-wrap items-center gap-3"
        >
          <select
            v-model="selectedChatModel"
            class="glass-input px-3 py-2 cursor-pointer"
          >
            <option
              v-for="m in chatModels"
              :key="m.value"
              :value="m.value"
            >
              {{ m.label }}
            </option>
          </select>
          <button
            class="btn-secondary flex items-center gap-2 cursor-pointer"
            @click="clearChat"
          >
            <TrashIcon class="w-4 h-4" />
            清空对话
          </button>
        </div>

        <div class="glass-card p-4 min-h-[400px] flex flex-col">
          <div class="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[500px]">
            <div
              v-for="(msg, i) in messages"
              :key="i"
              :class="[
                'flex',
                msg.role === 'user' ? 'justify-end' : 'justify-start',
              ]"
            >
              <div
                :class="[
                  'max-w-[85%] rounded-2xl px-4 py-3',
                  msg.role === 'user'
                    ? 'bg-accent/20 text-slate-100'
                    : 'bg-white/5 text-slate-300 border border-white/10',
                ]"
              >
                <div
                  v-if="msg.role === 'user'"
                  class="whitespace-pre-wrap"
                >
                  {{ msg.content }}
                </div>
                <div
                  v-else
                  class="prose prose-invert prose-sm max-w-none"
                  v-html="renderedMarkdown(msg.content)"
                />
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <textarea
              v-model="inputText"
              placeholder="输入消息..."
              class="glass-input flex-1 min-h-[44px] max-h-32 p-3 resize-none cursor-text"
              rows="1"
              :disabled="isStreaming"
              @keydown.enter.exact.prevent="sendMessage"
            />
            <button
              class="btn-primary flex items-center gap-2 cursor-pointer self-end disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isStreaming || !inputText.trim()"
              @click="sendMessage"
            >
              <PaperAirplaneIcon class="w-4 h-4" />
              发送
            </button>
          </div>
        </div>
      </div>

      <!-- Image mode -->
      <div v-else class="space-y-4">
        <div class="glass-card p-4">
          <label class="text-slate-500 text-sm block mb-2">描述</label>
          <textarea
            v-model="imagePrompt"
            placeholder="描述你想生成的图片..."
            class="glass-input w-full min-h-[100px] p-3 resize-none cursor-text"
          />
          <div class="flex flex-wrap gap-3 mt-3">
            <div>
              <label class="text-slate-500 text-sm block mb-1">尺寸</label>
              <select
                v-model="imageSize"
                class="glass-input px-3 py-2 cursor-pointer"
              >
                <option
                  v-for="s in sizeOptions"
                  :key="s.value"
                  :value="s.value"
                >
                  {{ s.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="text-slate-500 text-sm block mb-1">模型</label>
              <select
                v-model="imageModel"
                class="glass-input px-3 py-2 cursor-pointer"
              >
                <option
                  v-for="m in imageModels"
                  :key="m.value"
                  :value="m.value"
                >
                  {{ m.label }}
                </option>
              </select>
            </div>
            <div class="flex items-end">
              <button
                class="btn-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isGenerating || !imagePrompt.trim()"
                @click="generateImage"
              >
                {{ isGenerating ? '生成中...' : '生成图片' }}
              </button>
            </div>
          </div>
        </div>
        <div v-if="generatedImageUrl" class="glass-card p-4">
          <img
            :src="generatedImageUrl"
            alt="Generated"
            class="max-h-96 rounded-xl border border-white/10"
          />
          <button
            class="btn-secondary flex items-center gap-2 mt-3 cursor-pointer"
            @click="downloadImage"
          >
            <ArrowDownTrayIcon class="w-4 h-4" />
            下载图片
          </button>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
