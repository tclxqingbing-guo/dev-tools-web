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
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="space-y-5">
        <div class="glass-card p-5">
          <h3 class="text-slate-800 font-semibold mb-4 flex items-center gap-2">
            <SparklesIcon class="w-5 h-5 text-accent" />
            输入
          </h3>
          <div class="inline-flex gap-1 p-1 bg-slate-100 rounded-xl mb-4">
            <button
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all',
                inputMode === 'css' ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700'
              ]"
              @click="inputMode = 'css'"
            >
              <CodeBracketSquareIcon class="w-4 h-4" />
              CSS 转换
            </button>
            <button
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all',
                inputMode === 'text' ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700'
              ]"
              @click="inputMode = 'text'"
            >
              <ChatBubbleLeftRightIcon class="w-4 h-4" />
              自然语言
            </button>
          </div>

          <textarea
            v-if="inputMode === 'css'"
            v-model="cssInput"
            placeholder="粘贴 CSS 代码：&#10;.box { padding: 1rem; background: #334155; border-radius: 0.5rem; }"
            class="glass-input w-full min-h-[160px] p-4 font-mono text-sm resize-y"
          />
          <textarea
            v-else
            v-model="textInput"
            placeholder="描述你想要的样式：&#10;一个带圆角、深色背景、内边距的卡片容器"
            class="glass-input w-full min-h-[160px] p-4 text-sm resize-y"
          />

          <div class="flex items-center justify-between gap-3 mt-3">
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500">模型</span>
              <select v-model="model" class="glass-input px-3 py-1.5 cursor-pointer text-sm">
                <option v-for="m in chatModels" :key="m.value" :value="m.value">{{ m.label }}</option>
              </select>
            </div>
            <button
              class="btn-primary flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading"
              @click="generate"
            >
              <SparklesIcon v-if="!loading" class="w-4 h-4" />
              <span v-else class="inline-block w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
              {{ loading ? '生成中...' : '生成' }}
            </button>
          </div>
        </div>

        <div class="glass-card p-5">
          <h3 class="text-slate-800 font-semibold mb-3 flex items-center gap-2">
            <CodeBracketSquareIcon class="w-5 h-5 text-accent" />
            Tailwind 速查
          </h3>
          <div class="space-y-3">
            <div v-for="cat in QUICK_REF" :key="cat.name">
              <div class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {{ cat.name }}
              </div>
              <div class="flex flex-wrap gap-1.5">
                <code
                  v-for="ex in cat.examples" :key="ex"
                  class="px-2 py-0.5 rounded bg-slate-100 hover:bg-accent/10 hover:text-accent text-slate-600 text-xs font-mono cursor-pointer transition-colors"
                  @click="resultClasses = resultClasses ? `${resultClasses} ${ex}` : ex"
                >
                  {{ ex }}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-5">
        <div class="glass-card p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-slate-800 font-semibold flex items-center gap-2">
              <SwatchIcon class="w-5 h-5 text-accent" />
              生成结果
            </h3>
            <button
              v-if="resultClasses"
              class="btn-secondary flex items-center gap-1.5 cursor-pointer !py-1.5 !px-3 text-xs"
              @click="copyResult"
            >
              <DocumentDuplicateIcon class="w-3.5 h-3.5" />
              复制
            </button>
          </div>
          <div v-if="resultClasses" class="p-4 rounded-xl bg-slate-900 font-mono text-sm text-emerald-200 break-all min-h-[80px]">
            {{ resultClasses }}
          </div>
          <div v-else class="p-8 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
            <p class="text-slate-400 text-sm">{{ loading ? 'AI 正在生成...' : '生成的 Tailwind 类将在这里显示' }}</p>
          </div>
        </div>

        <div class="glass-card p-5">
          <h3 class="text-slate-800 font-semibold mb-3 flex items-center gap-2">
            <SwatchIcon class="w-5 h-5 text-accent" />
            实时预览
          </h3>
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[120px] flex items-center justify-center">
            <div :class="resultClasses || 'p-4 bg-white border border-slate-200 rounded'">
              <span class="text-slate-500 text-sm">示例内容 Sample Content</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
