<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import {
  PhotoIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import { useToast } from '../../composables/useToast'

const toast = useToast()
const fileInput = ref<HTMLInputElement | null>(null)
const sourceFile = ref<File | null>(null)
const sourcePreview = ref<string>('')
const resultBlob = ref<Blob | null>(null)
const resultPreview = ref<string>('')
const outputFormat = ref<'auto' | 'png' | 'jpg' | 'webp'>('auto')
const lossless = ref(false)
const maxWidth = ref(1920)
const maxHeight = ref(1080)
const targetSizeKB = ref(200)
const isProcessing = ref(false)
const isDragging = ref(false)

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const compressionRatio = computed(() => {
  if (!sourceFile.value || !resultBlob.value) return null
  const orig = sourceFile.value.size
  const comp = resultBlob.value.size
  return ((1 - comp / orig) * 100).toFixed(1) + '%'
})

const resultSize = computed(() =>
  resultBlob.value ? formatBytes(resultBlob.value.size) : ''
)

function handleFile(file: File) {
  if (!file.type.startsWith('image/')) {
    toast.error('请选择图片文件')
    return
  }
  sourceFile.value = file
  resultBlob.value = null
  resultPreview.value = ''
  const reader = new FileReader()
  reader.onload = () => {
    sourcePreview.value = reader.result as string
  }
  reader.readAsDataURL(file)
  processImage()
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) handleFile(f)
}

function onPaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        handleFile(file)
        toast.info('已粘贴图片')
        break
      }
    }
  }
}

function onFileInput(e: Event) {
  const target = e.target as HTMLInputElement
  const f = target.files?.[0]
  if (f) handleFile(f)
  target.value = ''
}

function getOutputMime(): string {
  if (outputFormat.value === 'png') return 'image/png'
  if (outputFormat.value === 'jpg') return 'image/jpeg'
  if (outputFormat.value === 'webp') return 'image/webp'
  return sourceFile.value?.type === 'image/png' ? 'image/png' : 'image/jpeg'
}

function getOutputExt(): string {
  if (outputFormat.value === 'png') return 'png'
  if (outputFormat.value === 'jpg') return 'jpg'
  if (outputFormat.value === 'webp') return 'webp'
  return sourceFile.value?.name?.endsWith('.png') ? 'png' : 'jpg'
}

function processImage() {
  if (!sourceFile.value || !sourcePreview.value) return
  isProcessing.value = true
  const img = new Image()
  img.onload = () => {
    try {
      const c = document.createElement('canvas')
      let w = img.width
      let h = img.height
      if (maxWidth.value > 0 && w > maxWidth.value) {
        h = Math.round((h * maxWidth.value) / w)
        w = maxWidth.value
      }
      if (maxHeight.value > 0 && h > maxHeight.value) {
        w = Math.round((w * maxHeight.value) / h)
        h = maxHeight.value
      }
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      const mime = getOutputMime()
      const targetBytes = targetSizeKB.value * 1024
      let quality = 0.92
      let minQ = 0.1
      let maxQ = 1
      const attempt = (q: number) => {
        return new Promise<Blob>((res, rej) => {
          c.toBlob(
            (b) => (b ? res(b) : rej(new Error('toBlob failed'))),
            mime,
            lossless.value && (mime === 'image/png' || mime === 'image/webp') ? undefined : q
          )
        })
      }
      const run = async () => {
        let blob = await attempt(quality)
        const isLossy = mime === 'image/jpeg' || (mime === 'image/webp' && !lossless.value)
        if (targetSizeKB.value <= 0 || !isLossy) {
          resultBlob.value = blob
          resultPreview.value = URL.createObjectURL(blob)
          isProcessing.value = false
          return
        }
        for (let i = 0; i < 15; i++) {
          if (Math.abs(blob.size - targetBytes) < targetBytes * 0.1) break
          if (blob.size > targetBytes) {
            maxQ = quality
            quality = (quality + minQ) / 2
          } else {
            minQ = quality
            quality = (quality + maxQ) / 2
          }
          blob = await attempt(quality)
        }
        resultBlob.value = blob
        resultPreview.value = URL.createObjectURL(blob)
        isProcessing.value = false
      }
      if (lossless.value && (mime === 'image/png' || mime === 'image/webp')) {
        c.toBlob(
          (b) => {
            if (b) {
              resultBlob.value = b
              resultPreview.value = URL.createObjectURL(b)
            }
            isProcessing.value = false
          },
          mime
        )
      } else {
        run()
      }
    } catch (e) {
      toast.error('处理失败')
      isProcessing.value = false
    }
  }
  img.onerror = () => {
    toast.error('图片加载失败')
    isProcessing.value = false
  }
  img.src = sourcePreview.value
}

watch([outputFormat, lossless, maxWidth, maxHeight, targetSizeKB], () => {
  if (sourceFile.value && sourcePreview.value) processImage()
})

function download() {
  if (!resultBlob.value) return
  const url = URL.createObjectURL(resultBlob.value)
  const a = document.createElement('a')
  a.href = url
  a.download = `compressed.${getOutputExt()}`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('已下载')
}

function copyBase64() {
  if (!resultBlob.value) return
  const reader = new FileReader()
  reader.onload = () => {
    const base64 = reader.result as string
    navigator.clipboard.writeText(base64).then(() => toast.success('已复制 Base64'))
  }
  reader.readAsDataURL(resultBlob.value)
}

function clearAll() {
  sourceFile.value = null
  sourcePreview.value = ''
  if (resultPreview.value) URL.revokeObjectURL(resultPreview.value)
  resultBlob.value = null
  resultPreview.value = ''
  toast.info('已清空')
}

onMounted(() => {
  document.addEventListener('paste', onPaste)
})
onUnmounted(() => {
  document.removeEventListener('paste', onPaste)
  if (resultPreview.value) URL.revokeObjectURL(resultPreview.value)
})
</script>

<template>
  <ToolLayout title="图片压缩">
    <div class="space-y-5">
      <div
        v-if="!sourceFile"
        class="glass-card p-5 border-2 border-dashed transition-colors cursor-pointer"
        :class="isDragging ? 'border-accent bg-accent/5' : 'border-slate-200 hover:border-accent/40'"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop="onDrop"
        @click="fileInput?.click()"
      >
        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileInput" />
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-3">
            <PhotoIcon class="w-8 h-8 text-accent" />
          </div>
          <p class="text-slate-700 font-medium">拖放图片到此处</p>
          <p class="text-slate-400 text-xs mt-1">点击选择 · 或按 <kbd class="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono">Ctrl + V</kbd> 粘贴</p>
        </div>
      </div>

      <template v-else>
        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileInput" />
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div class="glass-card p-5">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-slate-800 font-semibold flex items-center gap-2">
                <span class="w-1 h-4 bg-slate-400 rounded-full" />
                原图
              </h3>
              <span class="text-xs text-slate-500 font-mono">{{ formatBytes(sourceFile.size) }}</span>
            </div>
            <div class="bg-[repeating-conic-gradient(#e2e8f0_0%_25%,#f8fafc_0%_50%)] bg-[length:12px_12px] rounded-xl p-3">
              <img :src="sourcePreview" class="max-h-64 mx-auto rounded-lg object-contain" />
            </div>
          </div>
          <div class="glass-card p-5">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-slate-800 font-semibold flex items-center gap-2">
                <span class="w-1 h-4 bg-accent rounded-full" />
                压缩结果
              </h3>
              <div v-if="resultSize" class="flex items-center gap-2 text-xs">
                <span class="font-mono text-slate-500">{{ resultSize }}</span>
                <span v-if="compressionRatio" class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-medium">
                  -{{ compressionRatio }}
                </span>
              </div>
            </div>
            <div v-if="isProcessing" class="flex items-center justify-center h-56 text-slate-500 bg-slate-50 rounded-xl">
              <div class="flex flex-col items-center gap-2">
                <div class="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
                <span class="text-sm">处理中...</span>
              </div>
            </div>
            <div v-else class="bg-[repeating-conic-gradient(#e2e8f0_0%_25%,#f8fafc_0%_50%)] bg-[length:12px_12px] rounded-xl p-3">
              <img v-if="resultPreview" :src="resultPreview" class="max-h-64 mx-auto rounded-lg object-contain" />
            </div>
          </div>
        </div>

        <div class="glass-card p-5">
          <h3 class="text-slate-800 font-semibold mb-4 flex items-center gap-2">
            <PhotoIcon class="w-5 h-5 text-accent" />
            压缩参数
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div>
              <label class="text-slate-500 text-xs block mb-1.5">输出格式</label>
              <select v-model="outputFormat" class="glass-input px-3 py-2 w-full cursor-pointer text-sm">
                <option value="auto">自动</option>
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            <div>
              <label class="text-slate-500 text-xs block mb-1.5">最大宽度</label>
              <input v-model.number="maxWidth" type="number" min="0" class="glass-input px-3 py-2 w-full text-sm" />
            </div>
            <div>
              <label class="text-slate-500 text-xs block mb-1.5">最大高度</label>
              <input v-model.number="maxHeight" type="number" min="0" class="glass-input px-3 py-2 w-full text-sm" />
            </div>
            <div>
              <label class="text-slate-500 text-xs block mb-1.5">目标 KB (0=不限)</label>
              <input v-model.number="targetSizeKB" type="number" min="0" class="glass-input px-3 py-2 w-full text-sm" />
            </div>
            <label class="flex items-center gap-2 text-slate-700 cursor-pointer bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-200 text-sm">
              <input v-model="lossless" type="checkbox" class="rounded cursor-pointer accent-accent" />
              无损压缩
            </label>
          </div>
        </div>

        <div v-if="resultBlob" class="glass-card p-4 flex flex-wrap gap-2">
          <button class="btn-primary flex items-center gap-2 cursor-pointer" @click="download">
            <ArrowDownTrayIcon class="w-4 h-4" />
            下载
          </button>
          <button class="btn-secondary flex items-center gap-2 cursor-pointer" @click="copyBase64">
            <ClipboardDocumentIcon class="w-4 h-4" />
            复制 Base64
          </button>
          <button class="btn-secondary flex items-center gap-2 cursor-pointer ml-auto" @click="clearAll">
            <TrashIcon class="w-4 h-4" />
            重新选择
          </button>
        </div>
      </template>
    </div>
  </ToolLayout>
</template>
