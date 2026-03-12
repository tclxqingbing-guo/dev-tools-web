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
    <div class="space-y-6">
      <div class="flex gap-2">
        <button
          :class="[
            'px-4 py-2 rounded-xl font-medium flex items-center gap-2 cursor-pointer transition-colors',
            mode === 'text' ? 'btn-primary' : 'btn-secondary',
          ]"
          @click="mode = 'text'"
        >
          <DocumentTextIcon class="w-4 h-4" />
          文本
        </button>
        <button
          :class="[
            'px-4 py-2 rounded-xl font-medium flex items-center gap-2 cursor-pointer transition-colors',
            mode === 'image' ? 'btn-primary' : 'btn-secondary',
          ]"
          @click="mode = 'image'"
        >
          <PhotoIcon class="w-4 h-4" />
          图片
        </button>
      </div>

      <div v-if="mode === 'text'" class="space-y-4">
        <div class="glass-card p-4">
          <div class="flex gap-2 mb-2">
            <button class="btn-primary flex items-center gap-2 cursor-pointer" @click="encodeText">
              <ArrowPathIcon class="w-4 h-4" />
              编码
            </button>
            <button class="btn-secondary flex items-center gap-2 cursor-pointer" @click="decodeText">
              解码
            </button>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label class="text-slate-500 text-sm block mb-1">输入</label>
              <textarea
                v-model="textInput"
                placeholder="输入要编码或解码的文本..."
                class="glass-input w-full min-h-[120px] p-3 font-mono text-sm resize-none"
              />
            </div>
            <div>
              <label class="text-slate-500 text-sm block mb-1">输出</label>
              <textarea
                v-model="textOutput"
                readonly
                placeholder="结果..."
                class="glass-input w-full min-h-[120px] p-3 font-mono text-sm resize-none bg-white/5"
              />
            </div>
          </div>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div class="glass-card p-4">
          <h3 class="text-slate-100 font-medium mb-3">编码（上传图片）</h3>
          <div
            :class="[
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
              isDragging ? 'border-accent bg-accent/10' : 'border-white/20 hover:border-white/30 hover:bg-white/5',
            ]"
            @drop="onDrop"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @click="fileInput?.click()"
          >
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFile" />
            <PhotoIcon class="w-12 h-12 text-slate-500 mx-auto mb-2" />
            <p class="text-slate-400 text-sm">拖放图片到此处，或点击选择文件</p>
          </div>
        </div>

        <div class="glass-card p-4">
          <h3 class="text-slate-100 font-medium mb-3">解码（Base64 → 图片）</h3>
          <div class="flex gap-2 mb-2">
            <button class="btn-primary flex items-center gap-2 cursor-pointer" @click="decodeImage">
              解码
            </button>
            <button class="btn-secondary flex items-center gap-2 cursor-pointer" @click="pasteBase64">
              <DocumentPlusIcon class="w-4 h-4" />
              粘贴
            </button>
          </div>
          <textarea
            v-model="base64Input"
            placeholder="粘贴 Base64 字符串..."
            class="glass-input w-full min-h-[80px] p-3 font-mono text-sm resize-none mb-4"
          />
          <div v-if="imagePreview" class="mt-4">
            <img :src="imagePreview" alt="Preview" class="max-h-64 rounded-xl border border-white/10" />
          </div>
        </div>

        <div class="glass-card p-4 flex flex-wrap gap-2">
          <button class="btn-secondary flex items-center gap-2 cursor-pointer" @click="copyBase64">
            <ClipboardDocumentIcon class="w-4 h-4" />
            复制 Base64
          </button>
          <button class="btn-secondary flex items-center gap-2 cursor-pointer" @click="copyDataUrl">
            复制 Data URL
          </button>
          <button class="btn-secondary flex items-center gap-2 cursor-pointer" @click="downloadImage">
            <ArrowDownTrayIcon class="w-4 h-4" />
            下载图片
          </button>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
