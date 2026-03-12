<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import { useToast } from '../../composables/useToast'
import { useApi } from '../../composables/useApi'
import { useAiModels } from '../../composables/useAiModels'
import {
  LanguageIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()
const api = useApi()
const { chatModels: models } = useAiModels()

const inputText = ref('')
const outputText = ref('')
const selectedModel = ref('deepseek-v3.2')
const transMode = ref('auto')
const customSource = ref('')
const customTarget = ref('')
const isTranslating = ref(false)

const transModes = [
  { value: 'auto', label: '自动检测' },
  { value: 'zh-en', label: '中文→英文' },
  { value: 'en-zh', label: '英文→中文' },
  { value: 'zh-ja', label: '中文→日文' },
  { value: 'en-ja', label: '英文→日文' },
  { value: 'zh-ko', label: '中文→韩文' },
  { value: 'custom', label: '自定义' },
]

function getSystemPrompt(): string {
  if (
    transMode.value === 'custom' &&
    customSource.value.trim() &&
    customTarget.value.trim()
  ) {
    return `You are a professional translator. Translate the user's text from ${customSource.value.trim()} to ${customTarget.value.trim()}. Output ONLY the translation, no explanations or extra text.`
  }
  const prompts: Record<string, string> = {
    auto:
      'You are a professional translator. Detect the source language and translate to the most appropriate target language (if Chinese, translate to English; if English or other, translate to Chinese). Output ONLY the translation, no explanations.',
    'zh-en':
      "You are a professional translator. Translate the user's text from Chinese to English. Output ONLY the translation, no explanations.",
    'en-zh':
      "You are a professional translator. Translate the user's text from English to Chinese. Output ONLY the translation, no explanations.",
    'zh-ja':
      "You are a professional translator. Translate the user's text from Chinese to Japanese. Output ONLY the translation, no explanations.",
    'en-ja':
      "You are a professional translator. Translate the user's text from English to Japanese. Output ONLY the translation, no explanations.",
    'zh-ko':
      "You are a professional translator. Translate the user's text from Chinese to Korean. Output ONLY the translation, no explanations.",
  }
  return (prompts[transMode.value] ?? prompts.auto) as string
}

async function translate() {
  const text = inputText.value.trim()
  if (!text || isTranslating.value) return

  if (
    transMode.value === 'custom' &&
    (!customSource.value.trim() || !customTarget.value.trim())
  ) {
    toast.warning('请填写自定义的源语言和目标语言')
    return
  }

  isTranslating.value = true
  outputText.value = ''
  try {
    await api.streamRequest(
      '/ai/chat',
      {
        messages: [
          { role: 'system', content: getSystemPrompt() },
          { role: 'user', content: text },
        ],
        model: selectedModel.value,
        stream: true,
        max_tokens: 4096,
      },
      (chunk) => {
        outputText.value += chunk
      },
      () => {
        isTranslating.value = false
      }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '翻译失败'
    outputText.value = `错误: ${message}`
    isTranslating.value = false
    toast.error(message)
  }
}

function swapLanguages() {
  const tempInput = inputText.value
  const tempOutput = outputText.value
  inputText.value = tempOutput
  outputText.value = tempInput
  if (transMode.value === 'zh-en') transMode.value = 'en-zh'
  else if (transMode.value === 'en-zh') transMode.value = 'zh-en'
  else if (transMode.value === 'zh-ja') transMode.value = 'en-ja'
  else if (transMode.value === 'en-ja') transMode.value = 'zh-ja'
  toast.success('已交换')
}

async function copyResult() {
  if (!outputText.value.trim()) {
    toast.warning('无内容可复制')
    return
  }
  try {
    await navigator.clipboard.writeText(outputText.value)
    toast.success('已复制到剪贴板')
  } catch {
    toast.error('复制失败')
  }
}

function clearAll() {
  inputText.value = ''
  outputText.value = ''
  toast.success('已清空')
}

function inputCharCount(): number {
  return inputText.value.length
}

function outputCharCount(): number {
  return outputText.value.length
}
</script>

<template>
  <ToolLayout title="AI 翻译">
    <div class="space-y-6">
      <div class="glass-card p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label class="text-slate-500 text-sm block mb-1">模型</label>
          <select
            v-model="selectedModel"
            class="glass-input px-3 py-2 cursor-pointer"
          >
            <option
              v-for="m in models"
              :key="m.value"
              :value="m.value"
            >
              {{ m.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="text-slate-500 text-sm block mb-1">翻译模式</label>
          <select
            v-model="transMode"
            class="glass-input px-3 py-2 cursor-pointer"
          >
            <option
              v-for="t in transModes"
              :key="t.value"
              :value="t.value"
            >
              {{ t.label }}
            </option>
          </select>
        </div>
        <div
          v-if="transMode === 'custom'"
          class="flex gap-2 items-end"
        >
          <div>
            <label class="text-slate-500 text-sm block mb-1">源语言</label>
            <input
              v-model="customSource"
              type="text"
              placeholder="如: 中文"
              class="glass-input px-3 py-2 w-28 cursor-text"
            />
          </div>
          <span class="text-slate-500">→</span>
          <div>
            <label class="text-slate-500 text-sm block mb-1">目标语言</label>
            <input
              v-model="customTarget"
              type="text"
              placeholder="如: 英文"
              class="glass-input px-3 py-2 w-28 cursor-text"
            />
          </div>
        </div>
      </div>

      <div class="glass-card p-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="flex flex-col">
            <div class="flex justify-between items-center mb-2">
              <label class="text-slate-500 text-sm">原文</label>
              <span class="text-slate-500 text-xs">{{ inputCharCount() }} 字</span>
            </div>
            <textarea
              v-model="inputText"
              placeholder="输入要翻译的文本..."
              class="glass-input flex-1 min-h-[200px] p-3 resize-none cursor-text"
            />
          </div>
          <div class="flex flex-col">
            <div class="flex justify-between items-center mb-2">
              <label class="text-slate-500 text-sm">译文</label>
              <span class="text-slate-500 text-xs">{{ outputCharCount() }} 字</span>
            </div>
            <textarea
              v-model="outputText"
              placeholder="翻译结果..."
              readonly
              class="glass-input flex-1 min-h-[200px] p-3 resize-none bg-white/5 cursor-default"
            />
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mt-4">
          <button
            class="btn-primary flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isTranslating || !inputText.trim()"
            @click="translate"
          >
            <LanguageIcon class="w-4 h-4" />
            {{ isTranslating ? '翻译中...' : '翻译' }}
          </button>
          <button
            class="btn-secondary flex items-center gap-2 cursor-pointer"
            @click="swapLanguages"
          >
            <ArrowPathIcon class="w-4 h-4" />
            交换
          </button>
          <button
            class="btn-secondary flex items-center gap-2 cursor-pointer"
            @click="copyResult"
          >
            <ClipboardDocumentIcon class="w-4 h-4" />
            复制结果
          </button>
          <button
            class="btn-secondary flex items-center gap-2 cursor-pointer"
            @click="clearAll"
          >
            <TrashIcon class="w-4 h-4" />
            清空
          </button>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
