<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import {
  QrCodeIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
  PhotoIcon,
  DocumentMagnifyingGlassIcon,
} from '@heroicons/vue/24/outline'
import { useToast } from '../../composables/useToast'

const toast = useToast()
const mode = ref<'generate' | 'decode'>('generate')
const text = ref('')
const qrDataUrl = ref('')
const size = ref(256)
const darkColor = ref('#000000')
const lightColor = ref('#ffffff')
const errorCorrectionLevel = ref<'L' | 'M' | 'Q' | 'H'>('M')
const decodeInput = ref<HTMLInputElement | null>(null)
const decodeImage = ref<HTMLImageElement | null>(null)
const pastedImage = ref<string>('')
const decodedText = ref('')

async function generateQr() {
  if (!text.value.trim()) {
    qrDataUrl.value = ''
    return
  }
  try {
    const opts = {
      width: size.value,
      margin: 2,
      color: { dark: darkColor.value, light: lightColor.value },
      errorCorrectionLevel: errorCorrectionLevel.value,
    }
    qrDataUrl.value = await QRCode.toDataURL(text.value, opts)
  } catch (e) {
    toast.error('生成失败')
  }
}

watch([text, size, darkColor, lightColor, errorCorrectionLevel], generateQr, { immediate: true })

function downloadQr() {
  if (!qrDataUrl.value) return
  const url = qrDataUrl.value
  const a = document.createElement('a')
  a.href = url
  a.download = 'qrcode.png'
  a.click()
  toast.success('已下载')
}

function onDecodeFile(e: Event) {
  const target = e.target as HTMLInputElement
  const f = target.files?.[0]
  if (!f || !f.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = () => {
    pastedImage.value = reader.result as string
    decodeFromImage(reader.result as string)
  }
  reader.readAsDataURL(f)
  target.value = ''
}

function onDecodePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        const reader = new FileReader()
        reader.onload = () => {
          pastedImage.value = reader.result as string
          decodeFromImage(reader.result as string)
          toast.info('已粘贴图片')
        }
        reader.readAsDataURL(file)
        break
      }
    }
  }
}

function decodeFromImage(src: string) {
  decodedText.value = ''
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const c = document.createElement('canvas')
    c.width = img.width
    c.height = img.height
    const ctx = c.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    const id = ctx.getImageData(0, 0, c.width, c.height)
    const res = jsQR(id.data, id.width, id.height)
    if (res) {
      decodedText.value = res.data
    } else {
      toast.warning('未识别到二维码')
    }
  }
  img.onerror = () => toast.error('图片加载失败')
  img.src = src
}

function copyDecoded() {
  if (!decodedText.value) return
  navigator.clipboard.writeText(decodedText.value).then(() => toast.success('已复制'))
}

onMounted(() => {
  document.addEventListener('paste', onDecodePaste as EventListener)
})
onUnmounted(() => {
  document.removeEventListener('paste', onDecodePaste as EventListener)
})
</script>

<template>
  <ToolLayout title="二维码工具">
    <div class="space-y-6">
      <div class="flex gap-2">
        <button
          @click="mode = 'generate'"
          :class="['flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer', mode === 'generate' ? 'btn-primary' : 'btn-secondary']"
        >
          <QrCodeIcon class="w-4 h-4" />
          生成
        </button>
        <button
          @click="mode = 'decode'"
          :class="['flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer', mode === 'decode' ? 'btn-primary' : 'btn-secondary']"
        >
          <DocumentMagnifyingGlassIcon class="w-4 h-4" />
          解码
        </button>
      </div>

      <div v-if="mode === 'generate'" class="space-y-6">
        <div class="glass-card p-5">
          <label class="block text-slate-500 text-sm mb-2">内容</label>
          <textarea
            v-model="text"
            class="glass-input px-4 py-3 w-full min-h-[100px] resize-y"
            placeholder="输入要编码的文字或链接..."
          />
        </div>
        <div class="glass-card p-5">
          <h3 class="text-slate-800 font-medium mb-4">自定义</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-slate-500 text-sm mb-2">尺寸</label>
              <input v-model.number="size" type="number" min="64" max="512" class="glass-input px-4 py-3 w-full" />
            </div>
            <div>
              <label class="block text-slate-500 text-sm mb-2">深色</label>
              <div class="flex gap-2">
                <input v-model="darkColor" type="color" class="w-12 h-10 rounded cursor-pointer bg-slate-100" />
                <input v-model="darkColor" type="text" class="glass-input px-4 py-3 flex-1" />
              </div>
            </div>
            <div>
              <label class="block text-slate-500 text-sm mb-2">浅色</label>
              <div class="flex gap-2">
                <input v-model="lightColor" type="color" class="w-12 h-10 rounded cursor-pointer bg-slate-100" />
                <input v-model="lightColor" type="text" class="glass-input px-4 py-3 flex-1" />
              </div>
            </div>
            <div>
              <label class="block text-slate-500 text-sm mb-2">纠错级别</label>
              <select v-model="errorCorrectionLevel" class="glass-input px-4 py-3 w-full cursor-pointer">
                <option value="L">L (7%)</option>
                <option value="M">M (15%)</option>
                <option value="Q">Q (25%)</option>
                <option value="H">H (30%)</option>
              </select>
            </div>
          </div>
        </div>
        <div v-if="text.trim()" class="glass-card p-5 flex flex-col items-center gap-4">
          <img v-if="qrDataUrl" :src="qrDataUrl" :width="size" :height="size" class="bg-white rounded-lg" />
          <div class="flex gap-3">
            <button class="btn-primary flex items-center gap-2 cursor-pointer" @click="downloadQr">
              <ArrowDownTrayIcon class="w-4 h-4" />
              下载 PNG
            </button>
          </div>
        </div>
      </div>

      <div v-if="mode === 'decode'" class="space-y-6">
        <div
          class="glass-card p-5 border-2 border-dashed border-slate-200 hover:border-slate-300 cursor-pointer transition-colors"
          @click="decodeInput?.click()"
        >
          <input
            ref="decodeInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onDecodeFile"
          />
          <div class="flex flex-col items-center justify-center py-12 text-slate-500">
            <PhotoIcon class="w-16 h-16 mb-4" />
            <p class="text-slate-400">点击选择图片或粘贴 (Ctrl+V)</p>
          </div>
        </div>
        <div v-if="pastedImage" class="glass-card p-5 flex gap-6">
          <img :src="pastedImage" class="max-h-48 rounded-lg object-contain bg-slate-100" />
          <div class="flex-1">
            <label class="block text-slate-500 text-sm mb-2">解码结果</label>
            <div v-if="decodedText" class="flex gap-2">
              <textarea
                :value="decodedText"
                readonly
                class="glass-input px-4 py-3 w-full min-h-[80px] resize-y"
              />
              <button class="btn-primary flex items-center gap-2 cursor-pointer self-start" @click="copyDecoded">
                <ClipboardDocumentIcon class="w-4 h-4" />
                复制
              </button>
            </div>
            <p v-else class="text-slate-500">未识别到二维码</p>
          </div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
