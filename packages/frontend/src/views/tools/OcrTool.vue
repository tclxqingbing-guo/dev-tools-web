<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { marked } from 'marked'
import ToolLayout from '../../components/ToolLayout.vue'
import { useToast } from '../../composables/useToast'
import { useApi } from '../../composables/useApi'
import { useAiModels } from '../../composables/useAiModels'
import {
  DocumentMagnifyingGlassIcon,
  PhotoIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'

const DEFAULT_OCR_PROMPT = `请识别图片中的全部文字与结构化信息。要求：
- 按原文顺序与层次整理输出，保持可读性。
- 若内容适合表格（如名单、数据、证件信息、对照关系等），请用 Markdown 表格呈现。
- 其他内容可使用标题、列表或段落。
- 只输出 Markdown，不要用代码块包裹，不要额外说明或前缀。`

const toast = useToast()
const api = useApi()
const { chatModels } = useAiModels()

const fileInput = ref<HTMLInputElement | null>(null)
const imageDataUrl = ref('')
const ocrResult = ref('')
const userPrompt = ref(DEFAULT_OCR_PROMPT)
const isRecognizing = ref(false)
const isDragging = ref(false)
const showFullscreen = ref(false)
const visionModel = ref('qwen3-vl-flash')

const visionModelOptions = computed(() => {
  const list = chatModels.value
  const visionIds = ['qwen3-vl-flash', 'qwen3-vl-plus', 'gpt-4o', 'gpt-4o-mini']
  const ordered: { value: string; label: string }[] = []
  for (const id of visionIds) {
    if (list.some((m) => m.value === id)) ordered.push({ value: id, label: id })
  }
  for (const m of list) {
    if (!ordered.some((o) => o.value === m.value)) ordered.push(m)
  }
  return ordered.length ? ordered : [{ value: visionModel.value, label: visionModel.value }]
})

watch(visionModelOptions, (options) => {
  const first = options[0]
  if (first && !options.some((o) => o.value === visionModel.value)) {
    visionModel.value = first.value
  }
}, { immediate: true })

const renderedResult = computed(() => {
  if (!ocrResult.value.trim()) return ''
  return marked.parse(ocrResult.value, { async: false }) as string
})

function processFile(file: File) {
  if (!file.type.startsWith('image/')) {
    toast.warning('请选择图片文件')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    imageDataUrl.value = reader.result as string
    toast.success('图片已加载')
  }
  reader.readAsDataURL(file)
}

function handleFileInput(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) processFile(file)
  target.value = ''
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
  else toast.warning('请拖入图片文件')
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function handlePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      const file = item.getAsFile()
      if (file) processFile(file)
      return
    }
  }
}

function resetPrompt() {
  userPrompt.value = DEFAULT_OCR_PROMPT
  toast.success('已恢复默认提示词')
}

async function recognize() {
  if (!imageDataUrl.value || isRecognizing.value) return
  const prompt = userPrompt.value.trim() || DEFAULT_OCR_PROMPT

  isRecognizing.value = true
  ocrResult.value = ''
  try {
    await api.streamRequest(
      '/ai/chat',
      {
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageDataUrl.value } },
            ],
          },
        ],
        model: visionModel.value,
        stream: true,
        max_tokens: 5000,
      },
      (chunk) => {
        ocrResult.value += chunk
      },
      () => {
        isRecognizing.value = false
        toast.success('识别完成')
      }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '识别失败'
    ocrResult.value = `错误: ${message}`
    isRecognizing.value = false
    toast.error(message)
  }
}

async function copyResult() {
  if (!ocrResult.value.trim()) {
    toast.warning('无内容可复制')
    return
  }
  try {
    await navigator.clipboard.writeText(ocrResult.value)
    toast.success('已复制到剪贴板')
  } catch {
    toast.error('复制失败')
  }
}

function clearAll() {
  imageDataUrl.value = ''
  ocrResult.value = ''
  showFullscreen.value = false
  const input = fileInput.value
  if (input) input.value = ''
  toast.success('已清空')
}

function openFullscreen() {
  if (imageDataUrl.value) showFullscreen.value = true
}

function closeFullscreen() {
  showFullscreen.value = false
}

function onImageAreaClick() {
  if (!imageDataUrl.value) fileInput.value?.click()
}

function replaceImage() {
  fileInput.value?.click()
}

onMounted(() => {
  window.addEventListener('paste', handlePaste)
})
onUnmounted(() => {
  window.removeEventListener('paste', handlePaste)
})
</script>

<template>
  <ToolLayout title="OCR 文字识别">
    <div class="grid grid-cols-1 lg:grid-cols-[minmax(280px,400px)_1fr] gap-6">
      <aside class="space-y-4 flex flex-col">
        <div class="glass-card p-4">
          <label class="text-slate-500 text-sm block mb-1">视觉模型</label>
          <select
            v-model="visionModel"
            class="glass-input w-full px-3 py-2 cursor-pointer"
          >
            <option
              v-for="m in visionModelOptions"
              :key="m.value"
              :value="m.value"
            >
              {{ m.label }}
            </option>
          </select>
        </div>
        <div class="glass-card p-4 flex-1 min-h-0 flex flex-col">
          <div class="flex items-center justify-between mb-2 flex-shrink-0">
            <label class="text-slate-500 text-sm font-medium">识别提示词（可修改）</label>
            <button
              type="button"
              class="text-xs text-slate-500 hover:text-accent cursor-pointer"
              @click="resetPrompt"
            >
              恢复默认
            </button>
          </div>
          <textarea
            v-model="userPrompt"
            placeholder="输入对模型的说明，例如要求输出格式、表格等"
            class="glass-input w-full flex-1 min-h-[140px] p-3 resize-y text-sm"
            spellcheck="false"
          />
        </div>
        <div class="flex gap-2 flex-shrink-0">
          <button
            class="btn-secondary flex items-center gap-2 cursor-pointer"
            @click="clearAll"
          >
            <TrashIcon class="w-4 h-4" />
            清空
          </button>
        </div>
      </aside>

      <div class="space-y-4 min-w-0 flex flex-col">
        <div
          class="image-upload-card glass-card p-4 flex flex-col min-h-[200px] border-2 border-dashed rounded-2xl transition-colors"
          :class="
            imageDataUrl
              ? 'border-slate-200'
              : isDragging
                ? 'border-accent/50 bg-accent/5 cursor-pointer'
                : 'border-slate-200 hover:border-slate-300 cursor-pointer'
          "
          @drop="onDrop"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @click="onImageAreaClick"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileInput"
          />
          <template v-if="!imageDataUrl">
            <div class="flex-1 flex flex-col items-center justify-center gap-2 text-slate-500">
              <PhotoIcon class="w-12 h-12" />
              <p class="text-sm">拖放图片到此处，或点击选择文件</p>
              <p class="text-xs text-slate-600">支持 Ctrl+V 粘贴剪贴板图片</p>
            </div>
          </template>
          <template v-else>
            <div
              class="flex-1 min-h-[180px] flex items-center justify-center overflow-hidden rounded-xl bg-slate-100 cursor-zoom-in"
              @click.stop="openFullscreen"
            >
              <img
                :src="imageDataUrl"
                alt="Preview"
                class="max-h-[200px] w-full object-contain"
              />
            </div>
            <div class="flex items-center gap-2 mt-3 flex-shrink-0">
              <button
                class="btn-primary flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isRecognizing"
                @click.stop="recognize"
              >
                <DocumentMagnifyingGlassIcon class="w-4 h-4" />
                {{ isRecognizing ? '识别中...' : '识别文字' }}
              </button>
              <button
                type="button"
                class="btn-secondary flex items-center gap-2 cursor-pointer"
                @click.stop="replaceImage"
              >
                <ArrowPathIcon class="w-4 h-4" />
                更换图片
              </button>
            </div>
          </template>
        </div>

        <div class="glass-card p-4 flex flex-col flex-1 min-h-0">
          <div class="flex justify-between items-center mb-2 flex-shrink-0">
            <h3 class="text-slate-800 font-medium">识别结果（Markdown 渲染）</h3>
            <button
              v-if="ocrResult"
              class="btn-secondary px-2 py-1 text-sm cursor-pointer flex items-center gap-1"
              @click="copyResult"
            >
              <ClipboardDocumentIcon class="w-4 h-4" />
              复制原文
            </button>
          </div>
          <div
            v-if="renderedResult"
            class="ocr-markdown flex-1 min-h-[160px] overflow-auto p-3 rounded-xl border border-slate-200 text-slate-800 text-sm"
            v-html="renderedResult"
          />
          <div
            v-else
            class="flex-1 min-h-[160px] flex items-center justify-center text-slate-500 text-sm"
          >
            识别结果将显示在这里
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showFullscreen"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 cursor-zoom-out"
          @click.self="closeFullscreen"
        >
          <button
            type="button"
            class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
            aria-label="关闭"
            @click="closeFullscreen"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
          <img
            v-if="imageDataUrl"
            :src="imageDataUrl"
            alt="Fullscreen"
            class="max-h-[90vh] max-w-full object-contain pointer-events-none"
            @click.stop
          />
        </div>
      </Transition>
    </Teleport>
  </ToolLayout>
</template>

<style scoped>
.ocr-markdown :deep(p) {
  margin-bottom: 0.5em;
}
.ocr-markdown :deep(p:last-child) {
  margin-bottom: 0;
}
.ocr-markdown :deep(h1),
.ocr-markdown :deep(h2),
.ocr-markdown :deep(h3) {
  font-weight: 600;
  margin-top: 0.75em;
  margin-bottom: 0.25em;
}
.ocr-markdown :deep(h1) { font-size: 1.25em; }
.ocr-markdown :deep(h2) { font-size: 1.1em; }
.ocr-markdown :deep(h3) { font-size: 1em; }
.ocr-markdown :deep(ul),
.ocr-markdown :deep(ol) {
  margin: 0.25em 0;
  padding-left: 1.5em;
}
.ocr-markdown :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.5em 0;
  font-size: 0.9em;
}
.ocr-markdown :deep(th),
.ocr-markdown :deep(td) {
  border: 1px solid var(--tw-border-opacity, 1);
  border-color: rgb(226 232 240);
  padding: 0.35em 0.6em;
  text-align: left;
}
.ocr-markdown :deep(th) {
  font-weight: 600;
  background: rgb(248 250 252);
}
</style>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
