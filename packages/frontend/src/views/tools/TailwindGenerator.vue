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
const model = ref('deepseek-v3.2')
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
      <div class="glass-card p-5">
        <h3 class="text-slate-800 font-medium mb-4">输入模式</h3>
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
          <label class="text-slate-500 text-sm font-medium block">CSS 代码</label>
          <textarea
            v-model="cssInput"
            placeholder="例如：&#10;.box { padding: 1rem; margin: 0.5rem; background: #334155; border-radius: 0.5rem; }"
            class="glass-input w-full min-h-[120px] p-4 text-slate-800 placeholder:text-slate-500 font-mono text-sm resize-y"
          />
        </div>
        <div v-else class="space-y-2">
          <label class="text-slate-500 text-sm font-medium block">自然语言描述</label>
          <textarea
            v-model="textInput"
            placeholder="例如：一个带圆角、深色背景、内边距的卡片容器"
            class="glass-input w-full min-h-[120px] p-4 text-slate-800 placeholder:text-slate-500 resize-y"
          />
        </div>

        <div class="mt-4">
          <label class="text-slate-500 text-sm font-medium block mb-2">模型</label>
          <select
            v-model="model"
            class="glass-input px-4 py-2 cursor-pointer"
          >
            <option v-for="m in chatModels" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
        </div>

        <button
          class="btn-primary mt-4 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading"
          @click="generate"
        >
          <SparklesIcon v-if="!loading" class="w-4 h-4" />
          <span v-else class="inline-block w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
          {{ loading ? '生成中...' : '生成' }}
        </button>
      </div>

      <div v-if="resultClasses" class="glass-card p-5">
        <h3 class="text-slate-800 font-medium mb-4 flex items-center gap-2">
          <SwatchIcon class="w-5 h-5 text-accent" />
          生成的 Tailwind 类
        </h3>
        <div class="flex gap-3 mb-4">
          <div class="flex-1 p-4 rounded-xl bg-black/30 font-mono text-sm text-slate-600 break-all">
            {{ resultClasses }}
          </div>
          <button
            class="btn-secondary flex items-center gap-2 cursor-pointer flex-shrink-0 self-start"
            @click="copyResult"
          >
            <DocumentDuplicateIcon class="w-4 h-4" />
            复制
          </button>
        </div>
        <div class="space-y-2">
          <label class="text-slate-500 text-sm font-medium block">预览</label>
          <div
            :class="resultClasses"
            class="border border-slate-200 p-4 min-h-[80px] rounded-xl"
          >
            <span class="text-slate-400 text-sm">示例内容</span>
          </div>
        </div>
      </div>

      <div class="glass-card p-5">
        <h3 class="text-slate-800 font-medium mb-4">Tailwind 速查</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="cat in QUICK_REF"
            :key="cat.name"
            class="p-4 rounded-xl bg-slate-100 border border-slate-200"
          >
            <h4 class="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
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
