<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import { useToast } from '../../composables/useToast'
import { useClipboard } from '../../composables/useClipboard'
import {
  ArrowPathIcon,
  PhotoIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  DocumentPlusIcon,
  MusicalNoteIcon,
  FilmIcon,
  DocumentIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()
const { copyToClipboard, readFromClipboard } = useClipboard()

const mode = ref<'text' | 'file'>('text')
const fileInput = ref<HTMLInputElement | null>(null)

// 文本模式
const textInput = ref('')
const textOutput = ref('')

// 文件模式：文件 → Base64
const sourceFile = ref<File | null>(null)
const sourcePreview = ref('')
const fileBase64 = ref('')
const isDragging = ref(false)

// 文件模式：Base64 → 文件
const base64Input = ref('')
const resultBlob = ref<Blob | null>(null)
const resultPreview = ref('')
const resultType = ref<string>('')
const resultName = ref<string>('')

// 进度
const progress = ref(0)
const isBusy = ref(false)
const statusText = ref('')

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 让出主线程，避免大文件阻塞 UI
function yieldToUI() {
  return new Promise<void>((r) => setTimeout(r, 0))
}

const textOutSize = computed(() => textOutput.value.length)

// ---------- 文本编解码（分块，防卡死） ----------
async function encodeText() {
  const text = textInput.value
  if (!text) {
    toast.warning('请输入要编码的文本')
    return
  }
  isBusy.value = true
  progress.value = 0
  statusText.value = '编码中...'
  textOutput.value = ''
  try {
    const te = new TextEncoder()
    const CHUNK = 256 * 1024 // 每块 256K 字符
    const pieces: string[] = []
    let total = text.length
    for (let i = 0; i < total; i += CHUNK) {
      const bytes = te.encode(text.slice(i, i + CHUNK))
      let bin = ''
      // 用数组避免大量字符串拼接
      const arr: string[] = []
      for (let j = 0; j < bytes.length; j += 0x8000) {
        arr.push(String.fromCharCode.apply(null, bytes.subarray(j, Math.min(j + 0x8000, bytes.length)) as unknown as number[]))
      }
      bin = arr.join('')
      pieces.push(btoa(bin))
      progress.value = Math.min(99, Math.round((i + CHUNK) / total * 100))
      await yieldToUI()
    }
    textOutput.value = pieces.join('')
    progress.value = 100
    statusText.value = ''
    toast.success('编码完成')
  } catch (e: any) {
    toast.error(e?.message || '编码失败')
  } finally {
    isBusy.value = false
  }
}

async function decodeText() {
  const b64 = textInput.value.trim().replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/')
  if (!b64) {
    toast.warning('请输入要解码的 Base64')
    return
  }
  isBusy.value = true
  progress.value = 0
  statusText.value = '解码中...'
  textOutput.value = ''
  try {
    const pad = b64.length % 4
    const src = pad ? b64 + '='.repeat(4 - pad) : b64
    const CHUNK = 1 * 1024 * 1024 // 每块 1M base64 字符
    const dec = new TextDecoder('utf-8')
    let out = ''
    for (let i = 0; i < src.length; i += CHUNK) {
      const part = src.slice(i, i + CHUNK)
      const raw = atob(part)
      const u = new Uint8Array(raw.length)
      for (let j = 0; j < raw.length; j++) u[j] = raw.charCodeAt(j)
      out += dec.decode(u, { stream: true })
      progress.value = Math.min(99, Math.round((i + CHUNK) / src.length * 100))
      await yieldToUI()
    }
    out += dec.decode()
    textOutput.value = out
    progress.value = 100
    statusText.value = ''
    toast.success('解码完成')
  } catch (e: any) {
    toast.error(e?.message || '解码失败')
  } finally {
    isBusy.value = false
  }
}

// ---------- 文件 → Base64 ----------
function handleFile(file: File) {
  sourceFile.value = file
  resultBlob.value = null
  resultPreview.value = ''
  resultType.value = ''
  resultName.value = ''
  fileBase64.value = ''
  const reader = new FileReader()
  reader.onload = async () => {
    const result = reader.result as string
    const comma = result.indexOf(',')
    const b64 = comma >= 0 ? result.substring(comma + 1) : result
    sourcePreview.value = result
    fileBase64.value = b64
    toast.success(`已编码 ${formatBytes(file.size)}`)
  }
  // readAsDataURL 底层同步，超大文件也会卡；用分块读取优化
  if (file.size > 8 * 1024 * 1024) {
    encodeFileChunked(file)
  } else {
    reader.readAsDataURL(file)
  }
}

// 大文件分块编码，避免 UI 冻结
async function encodeFileChunked(file: File) {
  isBusy.value = true
  progress.value = 0
  statusText.value = '编码中...'
  try {
    const CHUNK = 2 * 1024 * 1024 // 2MB 每块
    const total = file.size
    const pieces: string[] = []
    let offset = 0
    while (offset < total) {
      const blob = file.slice(offset, Math.min(offset + CHUNK, total))
      const buf = await blob.arrayBuffer()
      const bytes = new Uint8Array(buf)
      let bin = ''
      const arr: string[] = []
      for (let j = 0; j < bytes.length; j += 0x8000) {
        arr.push(String.fromCharCode.apply(null, bytes.subarray(j, Math.min(j + 0x8000, bytes.length)) as unknown as number[]))
      }
      bin = arr.join('')
      pieces.push(btoa(bin))
      offset += CHUNK
      progress.value = Math.min(99, Math.round(offset / total * 100))
      await yieldToUI()
    }
    fileBase64.value = pieces.join('')
    const reader = new FileReader()
    reader.onload = () => { sourcePreview.value = reader.result as string }
    reader.readAsDataURL(file.slice(0, Math.min(total, 2 * 1024 * 1024))) // 预览只需开头一部分
    progress.value = 100
    statusText.value = ''
    toast.success(`已编码 ${formatBytes(total)}`)
  } catch (e: any) {
    toast.error(e?.message || '编码失败')
  } finally {
    isBusy.value = false
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) handleFile(f)
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onFileInput(e: Event) {
  const target = e.target as HTMLInputElement
  const f = target.files?.[0]
  if (f) handleFile(f)
  target.value = ''
}

function onPaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.type.startsWith('image/') || item.type.startsWith('audio/') || item.type.startsWith('video/')) {
      const f = item.getAsFile()
      if (f) {
        handleFile(f)
        toast.info('已粘贴文件')
        break
      }
    }
  }
}

// ---------- Base64 → 文件 ----------
function detectMime(bytes: Uint8Array): string {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png'
  if (bytes.length >= 3 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return 'image/gif'
  if (bytes.length >= 4 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return 'image/webp'
  if (bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return 'audio/mpeg'
  if (bytes.length >= 4 && bytes[0] === 0x66 && bytes[1] === 0x4c && bytes[2] === 0x61 && bytes[3] === 0x67) return 'audio/flac'
  if (bytes.length >= 4 && bytes[0] === 0x4f && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) return 'audio/ogg'
  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return 'application/pdf'
  if (bytes.length >= 4 && bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x00 && bytes[3] === 0x18) return 'video/mp4'
  if (bytes.length >= 4 && bytes[0] === 0x1f && bytes[1] === 0x8b) return 'application/gzip'
  return ''
}

async function decodeBase64ToBytes(b64: string): Promise<Uint8Array<ArrayBuffer>> {
  const pad = b64.length % 4
  const src = pad ? b64 + '='.repeat(4 - pad) : b64
  const CHUNK = 1 * 1024 * 1024
  const parts: Uint8Array<ArrayBuffer>[] = []
  for (let i = 0; i < src.length; i += CHUNK) {
    const raw = atob(src.slice(i, i + CHUNK))
    const u = new Uint8Array(raw.length)
    for (let j = 0; j < raw.length; j++) u[j] = raw.charCodeAt(j)
    parts.push(u)
    await yieldToUI()
  }
  let total = 0
  for (const p of parts) total += p.length
  const buf = new ArrayBuffer(total)
  const out = new Uint8Array(buf)
  let off = 0
  // 分块合并，避免一次大拷贝阻塞
  for (const p of parts) {
    out.set(p, off)
    off += p.length
    await yieldToUI()
  }
  return out
}

async function decodeToFile() {
  let b64 = base64Input.value.trim().replace(/\s+/g, '')
  if (!b64) {
    toast.warning('请粘贴 Base64 字符串')
    return
  }
  // 支持带 data: 前缀的字符串
  if (b64.startsWith('data:')) {
    const m = b64.match(/^data:([^;]+);base64,/)
    if (m) {
      resultType.value = m[1] || ''
      b64 = b64.substring(b64.indexOf(',') + 1)
    }
  }
  isBusy.value = true
  progress.value = 0
  statusText.value = '解码中...'
  resultBlob.value = null
  resultPreview.value = ''
  try {
    const bytes = await decodeBase64ToBytes(b64)
    if (!bytes.length) {
      toast.warning('解码出 0 字节')
      return
    }
    const mime = resultType.value || detectMime(bytes)
    resultType.value = mime || 'application/octet-stream'
    const ext = (resultType.value.split('/')[1] || 'bin').replace('mpeg', 'mp3')
    resultName.value = `decoded_${Date.now()}.${ext}`
    const blob = new Blob([bytes], { type: resultType.value })
    resultBlob.value = blob
    resultPreview.value = URL.createObjectURL(blob)
    progress.value = 100
    statusText.value = ''
    toast.success(`解码完成 ${formatBytes(bytes.length)}`)
  } catch (e: any) {
    toast.error(e?.message || '解码失败')
  } finally {
    isBusy.value = false
  }
}

function pasteBase64() {
  readFromClipboard().then((text) => {
    if (text) {
      base64Input.value = text.trim()
      toast.success('已粘贴')
    } else {
      toast.warning('无法读取剪贴板')
    }
  })
}

function downloadResult() {
  if (!resultBlob.value) return
  const url = URL.createObjectURL(resultBlob.value)
  const a = document.createElement('a')
  a.href = url
  a.download = resultName.value
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
  toast.success('已下载')
}

function copyBase64() {
  const b64 = fileBase64.value || (sourcePreview.value ? sourcePreview.value.split(',')[1] || '' : '')
  if (b64) copyToClipboard(b64)
  else toast.warning('无内容可复制')
}

function copyDataUrl() {
  if (sourcePreview.value) {
    copyToClipboard(sourcePreview.value)
  } else {
    toast.warning('无内容可复制')
  }
}

function copyOutput() {
  if (textOutput.value) copyToClipboard(textOutput.value)
  else toast.warning('无内容可复制')
}

function clearText() {
  textInput.value = ''
  textOutput.value = ''
}

function clearFileSource() {
  sourceFile.value = null
  sourcePreview.value = ''
  fileBase64.value = ''
}

function clearResult() {
  base64Input.value = ''
  resultBlob.value = null
  if (resultPreview.value) URL.revokeObjectURL(resultPreview.value)
  resultPreview.value = ''
  resultType.value = ''
  resultName.value = ''
}

function isImage(t: string) { return t.startsWith('image/') }
function isAudio(t: string) { return t.startsWith('audio/') }
function isVideo(t: string) { return t.startsWith('video/') }

// 进度条样式
const progressStyle = computed(() => ({
  width: progress.value + '%',
}))

function resetProgress() {
  progress.value = 0
  statusText.value = ''
}
</script>

<template>
  <ToolLayout title="Base64 编解码">
    <div class="space-y-5">
      <!-- 模式切换 -->
      <div class="inline-flex gap-1 p-1 bg-slate-100 rounded-xl">
        <button
          :class="[
            'px-4 py-2 rounded-lg font-medium flex items-center gap-2 cursor-pointer transition-all text-sm',
            mode === 'text' ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700',
          ]"
          @click="mode = 'text'"
        >
          <DocumentTextIcon class="w-4 h-4" />
          文本模式
        </button>
        <button
          :class="[
            'px-4 py-2 rounded-lg font-medium flex items-center gap-2 cursor-pointer transition-all text-sm',
            mode === 'file' ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700',
          ]"
          @click="mode = 'file'"
        >
          <PhotoIcon class="w-4 h-4" />
          文件模式
        </button>
      </div>

      <!-- 文本模式 -->
      <div v-if="mode === 'text'" class="p-5 glass-card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="flex items-center gap-2 font-semibold text-slate-800">
            <DocumentTextIcon class="w-5 h-5 text-accent" />
            文本编解码
          </h3>
          <div class="flex gap-2">
            <button class="btn-secondary flex items-center gap-1.5 cursor-pointer !py-1.5 !px-3 text-xs" @click="clearText">
              <TrashIcon class="w-3.5 h-3.5" />
              清空
            </button>
            <button class="btn-secondary flex items-center gap-1.5 cursor-pointer !py-1.5 !px-3 text-xs" :disabled="isBusy" @click="decodeText">
              解码
            </button>
            <button class="btn-primary flex items-center gap-1.5 cursor-pointer !py-1.5 !px-3 text-xs" :disabled="isBusy" @click="encodeText">
              <ArrowPathIcon class="w-3.5 h-3.5" />
              编码
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <label class="text-slate-500 text-xs block mb-1.5">输入文本 / Base64</label>
            <textarea
              v-model="textInput"
              placeholder="输入要编码的文本，或要解码的 Base64 字符串..."
              class="glass-input w-full min-h-[240px] p-3 font-mono text-sm resize-none"
            />
          </div>
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-slate-500 text-xs">输出结果</label>
              <button
                v-if="textOutput"
                class="text-xs text-accent flex items-center gap-1 cursor-pointer"
                @click="copyOutput"
              >
                <ClipboardDocumentIcon class="w-3.5 h-3.5" />
                复制
              </button>
            </div>
            <textarea
              v-model="textOutput"
              readonly
              placeholder="结果..."
              class="glass-input w-full min-h-[240px] p-3 font-mono text-sm resize-none bg-slate-50"
            />
          </div>
        </div>

        <!-- 进度条 -->
        <div v-if="isBusy" class="mt-3">
          <div class="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>{{ statusText }}</span>
            <span class="font-mono ml-auto">{{ progress }}%</span>
          </div>
          <div class="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div class="h-full bg-accent rounded-full transition-all" :style="progressStyle" />
          </div>
        </div>
      </div>

      <!-- 文件模式 -->
      <div v-else class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <!-- 文件 → Base64 -->
        <div class="p-5 glass-card">
          <h3 class="flex items-center gap-2 mb-3 font-semibold text-slate-800">
            <PhotoIcon class="w-5 h-5 text-accent" />
            文件 → Base64
          </h3>

          <div
            v-if="!sourceFile"
            :class="[
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors min-h-[220px] flex flex-col items-center justify-center',
              isDragging ? 'border-accent bg-accent/10' : 'border-slate-200 hover:border-accent/40 hover:bg-slate-50',
            ]"
            @drop="onDrop"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @click="fileInput?.click()"
          >
            <input ref="fileInput" type="file" class="hidden" @change="onFileInput" />
            <div class="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-3">
              <DocumentPlusIcon class="w-7 h-7 text-accent" />
            </div>
            <p class="text-sm font-medium text-slate-600">拖放文件到此处</p>
            <p class="mt-1 text-xs text-slate-400">或点击选择文件</p>
            <p class="mt-2 text-xs text-slate-400">支持图片、MP3/音频、视频、PDF 等任意格式</p>
          </div>

          <template v-else>
            <div class="flex items-center justify-between mb-3 text-sm">
              <span class="font-medium text-slate-700 truncate">{{ sourceFile.name }}</span>
              <span class="font-mono text-slate-500 text-xs ml-2">{{ formatBytes(sourceFile.size) }}</span>
            </div>
            <div v-if="isImage(sourceFile.type) || isAudio(sourceFile.type) || isVideo(sourceFile.type)"
                 class="bg-slate-50 rounded-xl p-3 mb-3 flex items-center justify-center">
              <img v-if="isImage(sourceFile.type)" :src="sourcePreview" class="max-h-40 rounded-lg object-contain" />
              <audio v-else-if="isAudio(sourceFile.type)" :src="sourcePreview" controls class="w-full" />
              <video v-else-if="isVideo(sourceFile.type)" :src="sourcePreview" controls class="max-h-40 rounded-lg" />
            </div>
            <textarea
              v-model="fileBase64"
              readonly
              placeholder="Base64 结果..."
              class="glass-input w-full min-h-[160px] p-3 font-mono text-sm resize-none bg-slate-50"
            />
            <div class="flex flex-wrap gap-2 mt-3">
              <button class="btn-primary flex items-center gap-2 cursor-pointer !py-1.5 text-sm" @click="copyBase64">
                <ClipboardDocumentIcon class="w-4 h-4" />
                复制 Base64
              </button>
              <button class="btn-secondary flex items-center gap-2 cursor-pointer !py-1.5 text-sm" @click="copyDataUrl">
                复制 Data URL
              </button>
              <button class="btn-secondary flex items-center gap-2 cursor-pointer !py-1.5 text-sm ml-auto" @click="clearFileSource">
                <TrashIcon class="w-4 h-4" />
                清空
              </button>
            </div>
          </template>

          <div v-if="isBusy && sourceFile" class="mt-3">
            <div class="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>{{ statusText }}</span>
              <span class="font-mono ml-auto">{{ progress }}%</span>
            </div>
            <div class="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div class="h-full bg-accent rounded-full transition-all" :style="progressStyle" />
            </div>
          </div>
        </div>

        <!-- Base64 → 文件 -->
        <div class="p-5 glass-card">
          <div class="flex items-center justify-between mb-3">
            <h3 class="flex items-center gap-2 font-semibold text-slate-800">
              <ArrowPathIcon class="w-5 h-5 text-accent" />
              Base64 → 文件
            </h3>
            <div class="flex gap-2">
              <button class="btn-secondary flex items-center gap-1.5 cursor-pointer !py-1.5 !px-3 text-xs" :disabled="isBusy" @click="pasteBase64">
                <DocumentPlusIcon class="w-3.5 h-3.5" />
                粘贴
              </button>
              <button class="btn-primary flex items-center gap-1.5 cursor-pointer !py-1.5 !px-3 text-xs" :disabled="isBusy" @click="decodeToFile">
                解码
              </button>
            </div>
          </div>
          <textarea
            v-model="base64Input"
            placeholder="粘贴 Base64 字符串（可带 data: 前缀，自动识别 MP3/图片/视频/PDF 等格式）..."
            class="glass-input w-full min-h-[220px] p-3 font-mono text-sm resize-none"
          />

          <div v-if="isBusy" class="mt-3">
            <div class="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>{{ statusText }}</span>
              <span class="font-mono ml-auto">{{ progress }}%</span>
            </div>
            <div class="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div class="h-full bg-accent rounded-full transition-all" :style="progressStyle" />
            </div>
          </div>

          <div v-if="resultBlob" class="mt-4">
            <div class="flex items-center gap-2 mb-2 text-sm text-slate-500">
              <span class="font-medium text-slate-700">{{ resultName }}</span>
              <span class="font-mono text-xs">{{ formatBytes(resultBlob.size) }}</span>
              <span class="ml-auto px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-mono">{{ resultType }}</span>
            </div>
            <div class="bg-slate-50 rounded-xl p-3 flex items-center justify-center">
              <img v-if="isImage(resultType)" :src="resultPreview" class="max-h-64 rounded-lg object-contain" />
              <audio v-else-if="isAudio(resultType)" :src="resultPreview" controls class="w-full" />
              <video v-else-if="isVideo(resultType)" :src="resultPreview" controls class="max-h-64 rounded-lg" />
              <div v-else class="flex flex-col items-center py-8 text-slate-400">
                <DocumentIcon class="w-10 h-10 mb-2" />
                <span class="text-xs">{{ resultType }}</span>
              </div>
            </div>
            <div class="flex flex-wrap gap-2 mt-3">
              <button class="btn-primary flex items-center gap-2 cursor-pointer !py-1.5 text-sm" @click="downloadResult">
                <ArrowDownTrayIcon class="w-4 h-4" />
                下载
              </button>
              <button class="btn-secondary flex items-center gap-2 cursor-pointer !py-1.5 text-sm ml-auto" @click="clearResult">
                <TrashIcon class="w-4 h-4" />
                清空
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
