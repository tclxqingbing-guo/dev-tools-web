<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import { useToast } from '../../composables/useToast'
import { useApi } from '../../composables/useApi'
import {
  DocumentMagnifyingGlassIcon,
  PhotoIcon,
  ClipboardDocumentIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()
const api = useApi()

const fileInput = ref<HTMLInputElement | null>(null)
const imageDataUrl = ref('')
const ocrResult = ref('')
const isRecognizing = ref(false)
const isDragging = ref(false)
const visionModel = ref('gpt-4o-mini')

const visionModels = [
  { value: 'gpt-4o-mini', label: 'gpt-4o-mini' },
  { value: 'gpt-4o', label: 'gpt-4o' },
]

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

async function recognize() {
  if (!imageDataUrl.value || isRecognizing.value) return

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
              {
                type: 'text',
                text: 'Extract all text from this image. Output the recognized text only, preserving line breaks and structure. If the image contains no text, respond with "No text detected."',
              },
              {
                type: 'image_url',
                image_url: { url: imageDataUrl.value },
              },
            ],
          },
        ],
        model: visionModel.value,
        stream: true,
        max_tokens: 4096,
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
  const input = fileInput.value
  if (input) input.value = ''
  toast.success('已清空')
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
    <div class="space-y-6">
      <div class="glass-card p-4 flex flex-wrap items-end gap-4">
        <div>
          <label class="text-slate-500 text-sm block mb-1">视觉模型</label>
          <select
            v-model="visionModel"
            class="glass-input px-3 py-2 cursor-pointer"
          >
            <option
              v-for="m in visionModels"
              :key="m.value"
              :value="m.value"
            >
              {{ m.label }}
            </option>
          </select>
        </div>
      </div>

      <div
        class="glass-card p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-colors"
        :class="
          isDragging
            ? 'border-accent/50 bg-accent/5'
            : 'border-white/10 hover:border-white/20'
        "
        @drop="onDrop"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @click="fileInput?.click()"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileInput"
        />
        <div class="flex flex-col items-center gap-2 text-slate-500">
          <PhotoIcon class="w-12 h-12" />
          <p class="text-sm">拖放图片到此处，或点击选择文件</p>
          <p class="text-xs text-slate-600">支持 Ctrl+V 粘贴剪贴板图片</p>
        </div>
      </div>

      <div
        v-if="imageDataUrl"
        class="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div class="glass-card p-4">
          <h3 class="text-slate-100 font-medium mb-3">图片预览</h3>
          <img
            :src="imageDataUrl"
            alt="Preview"
            class="max-h-64 rounded-xl border border-white/10 w-full object-contain"
          />
          <button
            class="btn-primary flex items-center gap-2 mt-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isRecognizing"
            @click="recognize"
          >
            <DocumentMagnifyingGlassIcon class="w-4 h-4" />
            {{ isRecognizing ? '识别中...' : '识别文字' }}
          </button>
        </div>
        <div class="glass-card p-4 flex flex-col">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-slate-100 font-medium">识别结果</h3>
            <button
              v-if="ocrResult"
              class="btn-secondary px-2 py-1 text-sm cursor-pointer flex items-center gap-1"
              @click="copyResult"
            >
              <ClipboardDocumentIcon class="w-4 h-4" />
              复制
            </button>
          </div>
          <textarea
            v-model="ocrResult"
            placeholder="识别结果将显示在这里..."
            readonly
            class="glass-input flex-1 min-h-[200px] p-3 resize-none bg-white/5 cursor-default"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <button
          class="btn-secondary flex items-center gap-2 cursor-pointer"
          @click="clearAll"
        >
          <TrashIcon class="w-4 h-4" />
          清空
        </button>
      </div>
    </div>
  </ToolLayout>
</template>
