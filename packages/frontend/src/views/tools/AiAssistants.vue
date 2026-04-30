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
const selectedChatModel = ref('deepseek-v4-flash')
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
    <div class="space-y-5">
      <div class="inline-flex gap-1 p-1 bg-slate-100 rounded-xl">
        <button
          :class="[
            'px-4 py-2 rounded-lg font-medium flex items-center gap-2 cursor-pointer transition-all text-sm',
            mode === 'chat' ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700',
          ]"
          @click="mode = 'chat'"
        >
          <ChatBubbleLeftRightIcon class="w-4 h-4" />
          AI 对话
        </button>
        <button
          :class="[
            'px-4 py-2 rounded-lg font-medium flex items-center gap-2 cursor-pointer transition-all text-sm',
            mode === 'image' ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700',
          ]"
          @click="mode = 'image'"
        >
          <PhotoIcon class="w-4 h-4" />
          图片生成
        </button>
      </div>

      <!-- Chat mode -->
      <div v-if="mode === 'chat'" class="glass-card p-0 overflow-hidden flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
        <div class="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50/50">
          <div class="flex items-center gap-2">
            <ChatBubbleLeftRightIcon class="w-4 h-4 text-accent" />
            <select
              v-model="selectedChatModel"
              class="glass-input px-3 py-1.5 cursor-pointer text-sm"
            >
              <option v-for="m in chatModels" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
            <span class="text-xs text-slate-400">{{ messages.length }} 条消息</span>
          </div>
          <button
            class="btn-secondary flex items-center gap-1.5 cursor-pointer !py-1.5 !px-3 text-xs"
            @click="clearChat"
          >
            <TrashIcon class="w-3.5 h-3.5" />
            清空
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center">
            <div class="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-3">
              <ChatBubbleLeftRightIcon class="w-8 h-8 text-accent" />
            </div>
            <p class="text-slate-600 font-medium">开始与 AI 对话</p>
            <p class="text-slate-400 text-sm mt-1">在下方输入框输入你的问题</p>
          </div>
          <div
            v-for="(msg, i) in messages" :key="i"
            :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']"
          >
            <div
              :class="[
                'max-w-[85%] rounded-2xl px-4 py-3 text-sm',
                msg.role === 'user'
                  ? 'bg-accent text-white rounded-br-sm'
                  : 'bg-slate-100 text-slate-700 border border-slate-200 rounded-bl-sm',
              ]"
            >
              <div v-if="msg.role === 'user'" class="whitespace-pre-wrap">{{ msg.content }}</div>
              <div v-else class="prose prose-sm max-w-none" v-html="renderedMarkdown(msg.content)" />
            </div>
          </div>
        </div>

        <div class="border-t border-slate-200 p-3 bg-slate-50/50">
          <div class="flex gap-2">
            <textarea
              v-model="inputText"
              placeholder="输入消息，回车发送，Shift + 回车换行..."
              class="glass-input flex-1 min-h-[44px] max-h-32 p-3 resize-none text-sm"
              rows="1"
              :disabled="isStreaming"
              @keydown.enter.exact.prevent="sendMessage"
            />
            <button
              class="btn-primary flex items-center gap-2 cursor-pointer self-end disabled:opacity-50 disabled:cursor-not-allowed !py-2.5"
              :disabled="isStreaming || !inputText.trim()"
              @click="sendMessage"
            >
              <PaperAirplaneIcon class="w-4 h-4" />
              {{ isStreaming ? '生成中' : '发送' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Image mode -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div class="lg:col-span-2 glass-card p-5 space-y-4 h-fit">
          <h3 class="text-slate-800 font-semibold flex items-center gap-2">
            <PhotoIcon class="w-5 h-5 text-accent" />
            生成参数
          </h3>
          <div>
            <label class="text-slate-500 text-xs block mb-1.5">描述</label>
            <textarea
              v-model="imagePrompt"
              placeholder="描述你想生成的图片..."
              class="glass-input w-full min-h-[140px] p-3 resize-none text-sm"
            />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-slate-500 text-xs block mb-1.5">尺寸</label>
              <select v-model="imageSize" class="glass-input px-3 py-2 cursor-pointer w-full text-sm">
                <option v-for="s in sizeOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
              </select>
            </div>
            <div>
              <label class="text-slate-500 text-xs block mb-1.5">模型</label>
              <select v-model="imageModel" class="glass-input px-3 py-2 cursor-pointer w-full text-sm">
                <option v-for="m in imageModels" :key="m.value" :value="m.value">{{ m.label }}</option>
              </select>
            </div>
          </div>
          <button
            class="btn-primary w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed !py-2.5"
            :disabled="isGenerating || !imagePrompt.trim()"
            @click="generateImage"
          >
            {{ isGenerating ? '生成中...' : '生成图片' }}
          </button>
        </div>
        <div class="lg:col-span-3 glass-card p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-slate-800 font-semibold flex items-center gap-2">
              <PhotoIcon class="w-5 h-5 text-accent" />
              生成结果
            </h3>
            <button
              v-if="generatedImageUrl"
              class="btn-secondary flex items-center gap-2 cursor-pointer !py-1.5 !px-3 text-xs"
              @click="downloadImage"
            >
              <ArrowDownTrayIcon class="w-4 h-4" />
              下载
            </button>
          </div>
          <div v-if="generatedImageUrl" class="bg-slate-50 rounded-xl p-3 flex items-center justify-center">
            <img :src="generatedImageUrl" alt="Generated" class="max-h-[500px] rounded-lg" />
          </div>
          <div v-else class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <PhotoIcon class="w-8 h-8 text-slate-300" />
            </div>
            <p class="text-slate-500 text-sm">{{ isGenerating ? 'AI 正在创作中...' : '还未生成图片' }}</p>
            <p class="text-slate-400 text-xs mt-1">{{ isGenerating ? '请耐心等候' : '设置参数后点击「生成图片」' }}</p>
          </div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
