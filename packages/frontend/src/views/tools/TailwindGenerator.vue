<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import { useToast } from '../../composables/useToast'
import { useClipboard } from '../../composables/useClipboard'
import { useAiModels } from '../../composables/useAiModels'
import {
  SwatchIcon,
  DocumentDuplicateIcon,
  SparklesIcon,
  CodeBracketSquareIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()
const { copyToClipboard } = useClipboard()
const { chatModels } = useAiModels()

type InputMode = 'css' | 'text'
const inputMode = ref<InputMode>('text')
const cssInput = ref('')
const textInput = ref('')
const model = ref('deepseek-v4-flash')
const loading = ref(false)
const resultClasses = ref('')

const QUICK_REF: { name: string; examples: string[] }[] = [
  { name: 'spacing', examples: ['p-4', 'm-2', 'px-6', 'py-3', 'gap-4', 'space-x-2', 'rounded-lg'] },
  { name: 'colors', examples: ['bg-slate-800', 'text-white', 'text-slate-600', 'border-slate-200', 'bg-accent'] },
  { name: 'typography', examples: ['text-sm', 'font-medium', 'text-lg', 'leading-relaxed', 'font-mono'] },
  { name: 'layout', examples: ['flex', 'grid', 'block', 'inline-block', 'hidden', 'overflow-hidden'] },
  { name: 'flexbox', examples: ['flex flex-col', 'items-center', 'justify-between', 'flex-wrap', 'flex-1'] },
]

async function generate() {
  const userContent = inputMode.value === 'css'
    ? cssInput.value.trim()
    : textInput.value.trim()
  if (!userContent) {
    toast.warning(inputMode.value === 'css' ? '请输入 CSS 代码' : '请输入自然语言描述')
    return
  }

  loading.value = true
  resultClasses.value = ''

  try {
    const systemPrompt = inputMode.value === 'css'
      ? 'Convert the following CSS to Tailwind CSS classes. Return ONLY the Tailwind classes, no explanation.'
      : 'Generate Tailwind CSS classes for the given description. Return ONLY the Tailwind classes.'
    const userMessage = inputMode.value === 'css'
      ? userContent
      : `Generate Tailwind CSS classes for: ${userContent}. Return ONLY the Tailwind classes.`

    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model.value,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(err.message || '生成失败')
    }

    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content || ''
    resultClasses.value = content.trim().replace(/\n/g, ' ')
    toast.success('生成成功')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '生成失败'
    toast.error(msg)
  } finally {
    loading.value = false
  }
}

function copyResult() {
  if (!resultClasses.value) {
    toast.warning('无内容可复制')
    return
  }
  copyToClipboard(resultClasses.value, '已复制到剪贴板')
}
</script>

<template>
  <ToolLayout title="AI Tailwind CSS 生成器">
    <div class="space-y-6">
      <div class="p-5 glass-card">
        <h3 class="mb-4 font-medium text-slate-800">输入模式</h3>
        <div class="flex gap-2 mb-4">
          <button
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors',
              inputMode === 'css' ? 'btn-primary' : 'btn-secondary'
            ]"
            @click="inputMode = 'css'"
          >
            <CodeBracketSquareIcon class="w-4 h-4" />
            CSS 样式
          </button>
          <button
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors',
              inputMode === 'text' ? 'btn-primary' : 'btn-secondary'
            ]"
            @click="inputMode = 'text'"
          >
            <ChatBubbleLeftRightIcon class="w-4 h-4" />
            自然语言描述
          </button>
        </div>

        <div v-if="inputMode === 'css'" class="space-y-2">
          <label class="block text-sm font-medium text-slate-500">CSS 代码</label>
          <textarea
            v-model="cssInput"
            placeholder="例如：&#10;.box { padding: 1rem; margin: 0.5rem; background: #334155; border-radius: 0.5rem; }"
            class="glass-input w-full min-h-[120px] p-4 text-slate-800 placeholder:text-slate-500 font-mono text-sm resize-y"
          />
        </div>
        <div v-else class="space-y-2">
          <label class="block text-sm font-medium text-slate-500">自然语言描述</label>
          <textarea
            v-model="textInput"
            placeholder="例如：一个带圆角、深色背景、内边距的卡片容器"
            class="glass-input w-full min-h-[120px] p-4 text-slate-800 placeholder:text-slate-500 resize-y"
          />
        </div>

        <div class="mt-4">
          <label class="block mb-2 text-sm font-medium text-slate-500">模型</label>
          <select
            v-model="model"
            class="px-4 py-2 cursor-pointer glass-input"
          >
            <option v-for="m in chatModels" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
        </div>

        <button
          class="flex items-center gap-2 mt-4 cursor-pointer btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading"
          @click="generate"
        >
          <SparklesIcon v-if="!loading" class="w-4 h-4" />
          <span v-else class="inline-block w-4 h-4 border-2 rounded-full border-slate-300 border-t-white animate-spin" />
          {{ loading ? '生成中...' : '生成' }}
        </button>
      </div>

      <div v-if="resultClasses" class="p-5 glass-card">
        <h3 class="flex items-center gap-2 mb-4 font-medium text-slate-800">
          <SwatchIcon class="w-5 h-5 text-accent" />
          生成的 Tailwind 类
        </h3>
        <div class="flex gap-3 mb-4">
          <div class="flex-1 p-4 font-mono text-sm break-all rounded-xl bg-black/30 text-slate-600">
            {{ resultClasses }}
          </div>
          <button
            class="flex items-center self-start flex-shrink-0 gap-2 cursor-pointer btn-secondary"
            @click="copyResult"
          >
            <DocumentDuplicateIcon class="w-4 h-4" />
            复制
          </button>
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-500">预览</label>
          <div
            :class="resultClasses"
            class="border border-slate-200 p-4 min-h-[80px] rounded-xl"
          >
            <span class="text-sm text-slate-400">示例内容</span>
          </div>
        </div>
      </div>

      <div class="p-5 glass-card">
        <h3 class="mb-4 font-medium text-slate-800">Tailwind 速查</h3>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="cat in QUICK_REF"
            :key="cat.name"
            class="p-4 border rounded-xl bg-slate-100 border-slate-200"
          >
            <h4 class="mb-2 text-xs font-medium tracking-wider uppercase text-slate-400">
              {{ cat.name }}
            </h4>
            <div class="flex flex-wrap gap-1.5">
              <code
                v-for="ex in cat.examples"
                :key="ex"
                class="px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-xs font-mono cursor-pointer hover:bg-accent/20 hover:text-accent"
                @click="resultClasses = resultClasses ? `${resultClasses} ${ex}` : ex"
              >
                {{ ex }}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
