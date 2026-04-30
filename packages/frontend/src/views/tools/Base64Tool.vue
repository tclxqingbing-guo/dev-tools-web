<script setup lang="ts">
import { ref } from 'vue'
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
} from '@heroicons/vue/24/outline'

const toast = useToast()
const { copyToClipboard, readFromClipboard } = useClipboard()
const mode = ref<'text' | 'image'>('text')
const fileInput = ref<HTMLInputElement | null>(null)
const textInput = ref('')
const textOutput = ref('')
const base64Input = ref('')
const imagePreview = ref('')
const isDragging = ref(false)

function encodeText() {
  try {
    textOutput.value = btoa(unescape(encodeURIComponent(textInput.value)))
    toast.success('编码完成')
  } catch (e: any) {
    toast.error(e.message || '编码失败')
  }
}

function decodeText() {
  try {
    textOutput.value = decodeURIComponent(escape(atob(textInput.value)))
    toast.success('解码完成')
  } catch (e: any) {
    toast.error(e.message || '解码失败')
  }
}

function encodeImage(file: File) {
  const reader = new FileReader()
  reader.onload = () => {
    const result = reader.result as string
    base64Input.value = result.includes(',') ? (result.split(',')[1] ?? '') : result
    imagePreview.value = result
    toast.success('编码完成')
  }
  reader.readAsDataURL(file)
}

function decodeImage() {
  let b64 = base64Input.value.trim()
  if (!b64) {
    toast.warning('请输入 Base64 字符串')
    return
  }
  if (!b64.startsWith('data:')) {
    b64 = `data:image/png;base64,${b64}`
  }
  imagePreview.value = b64
  toast.success('解码完成')
}

function handleFile(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && file.type.startsWith('image/')) {
    encodeImage(file)
  } else {
    toast.warning('请选择图片文件')
  }
  target.value = ''
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    encodeImage(file)
  } else {
    toast.warning('请拖入图片文件')
  }
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function copyBase64() {
  const b64 = base64Input.value || (imagePreview.value ? imagePreview.value.split(',')[1] : '')
  if (b64) {
    copyToClipboard(b64)
  } else {
    toast.warning('无内容可复制')
  }
}

function copyDataUrl() {
  const url = imagePreview.value || (base64Input.value ? `data:image/png;base64,${base64Input.value}` : '')
  if (url) {
    copyToClipboard(url)
  } else {
    toast.warning('无内容可复制')
  }
}

async function pasteBase64() {
  const text = await readFromClipboard()
  if (text) {
    base64Input.value = text.trim()
    toast.success('已粘贴')
  } else {
    toast.warning('无法读取剪贴板')
  }
}

async function downloadImage() {
  const url = imagePreview.value || (base64Input.value ? `data:image/png;base64,${base64Input.value}` : '')
  if (!url) {
    toast.warning('无图片可下载')
    return
  }
  const blob = await fetch(url).then((r) => r.blob())
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = 'image.png'
  a.click()
  URL.revokeObjectURL(blobUrl)
  toast.success('已下载')
}
</script>

<template>
  <ToolLayout title="Base64 编解码">
    <div class="space-y-5">
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
            mode === 'image' ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700',
          ]"
          @click="mode = 'image'"
        >
          <PhotoIcon class="w-4 h-4" />
          图片模式
        </button>
      </div>

      <div v-if="mode === 'text'" class="p-5 glass-card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="flex items-center gap-2 font-semibold text-slate-800">
            <DocumentTextIcon class="w-5 h-5 text-accent" />
            文本编解码
          </h3>
          <div class="flex gap-2">
            <button class="btn-primary flex items-center gap-2 cursor-pointer !py-2" @click="encodeText">
              <ArrowPathIcon class="w-4 h-4" />
              编码
            </button>
            <button class="btn-secondary flex items-center gap-2 cursor-pointer !py-2" @click="decodeText">
              解码
            </button>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <label class="text-slate-500 text-xs block mb-1.5">输入</label>
            <textarea
              v-model="textInput"
              placeholder="输入要编码或解码的文本..."
              class="glass-input w-full min-h-[180px] p-3 font-mono text-sm resize-none"
            />
          </div>
          <div>
            <label class="text-slate-500 text-xs block mb-1.5">输出</label>
            <textarea
              v-model="textOutput"
              readonly
              placeholder="结果..."
              class="glass-input w-full min-h-[180px] p-3 font-mono text-sm resize-none bg-slate-50"
            />
          </div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div class="p-5 glass-card">
          <h3 class="flex items-center gap-2 mb-3 font-semibold text-slate-800">
            <PhotoIcon class="w-5 h-5 text-accent" />
            图片 → Base64
          </h3>
          <div
            :class="[
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
              isDragging ? 'border-accent bg-accent/10' : 'border-slate-200 hover:border-accent/40 hover:bg-slate-50',
            ]"
            class="min-h-[420px]"
            @drop="onDrop"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @click="fileInput?.click()"
          >
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFile" />
            <div class="flex items-center justify-center mx-auto mt-10 mb-3 w-14 h-14 rounded-2xl bg-accent/10">
              <PhotoIcon class="w-8 h-8 text-accent" />
            </div>
            <p class="text-sm font-medium text-slate-600">拖放图片到此处</p>
            <p class="mt-1 text-xs text-slate-400">或点击选择文件</p>
          </div>
          <div v-if="imagePreview" class="flex flex-wrap gap-2 mt-4">
            <button class="btn-secondary flex items-center gap-2 cursor-pointer !py-2 text-sm" @click="copyBase64">
              <ClipboardDocumentIcon class="w-4 h-4" />
              复制 Base64
            </button>
            <button class="btn-secondary flex items-center gap-2 cursor-pointer !py-2 text-sm" @click="copyDataUrl">
              复制 Data URL
            </button>
            <button class="btn-secondary flex items-center gap-2 cursor-pointer !py-2 text-sm" @click="downloadImage">
              <ArrowDownTrayIcon class="w-4 h-4" />
              下载
            </button>
          </div>
        </div>

        <div class="p-5 glass-card">
          <div class="flex items-center justify-between mb-3">
            <h3 class="flex items-center gap-2 font-semibold text-slate-800">
              <ArrowPathIcon class="w-5 h-5 text-accent" />
              Base64 → 图片
            </h3>
            <div class="flex gap-2">
              <button class="btn-secondary flex items-center gap-1.5 cursor-pointer !py-1.5 !px-3 text-xs" @click="pasteBase64">
                <DocumentPlusIcon class="w-3.5 h-3.5" />
                粘贴
              </button>
              <button class="btn-primary flex items-center gap-1.5 cursor-pointer !py-1.5 !px-3 text-xs" @click="decodeImage">
                解码
              </button>
            </div>
          </div>
          <textarea
            v-model="base64Input"
            placeholder="粘贴 Base64 字符串..."
            class="glass-input w-full min-h-[420px] p-3 font-mono text-sm resize-none"
          />
          <div v-if="imagePreview" class="flex items-center justify-center p-3 mt-4 bg-slate-50 rounded-xl">
            <img :src="imagePreview" alt="Preview" class="rounded-lg max-h-64" />
          </div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
