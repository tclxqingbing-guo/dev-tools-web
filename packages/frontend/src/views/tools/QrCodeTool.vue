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
  CheckCircleIcon,
  ArrowPathIcon,
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
const pastedImage = ref('')
const decodedText = ref('')
const isDecoding = ref(false)
const lastDecodeOk = ref(false)

const MAX_CANVAS_SIDE = 4096
/** 多档放大，缓解「码在整图里很小」时模块像素不足 */
const DECODE_SCALE_STEPS = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6]

/** 相对整图的裁剪（0~1），长海报常见「码在底部」 */
type NormRect = { x: number; y: number; w: number; h: number }

function normRectKey(r: NormRect) {
  return [r.x, r.y, r.w, r.h].map((n) => n.toFixed(3)).join(',')
}

function buildDecodeRegions(nw: number, nh: number): NormRect[] {
  const aspect = nh / Math.max(1, nw)
  const portrait = aspect >= 1.12
  const landscape = aspect <= 0.88

  const list: NormRect[] = [{ x: 0, y: 0, w: 1, h: 1 }]

  if (portrait) {
    list.push(
      { x: 0, y: 0.5, w: 1, h: 0.5 },
      { x: 0, y: 0.52, w: 1, h: 0.48 },
      { x: 0, y: 0.55, w: 1, h: 0.45 },
      { x: 0, y: 0.58, w: 1, h: 0.42 },
      { x: 0, y: 0.62, w: 1, h: 0.38 },
      { x: 0, y: 0.65, w: 1, h: 0.35 },
      { x: 0, y: 0.68, w: 1, h: 0.32 },
      { x: 0.05, y: 0.5, w: 0.9, h: 0.5 },
      { x: 0.1, y: 0.55, w: 0.8, h: 0.4 },
      { x: 0.15, y: 0.58, w: 0.7, h: 0.38 },
    )
  }

  if (landscape) {
    list.push(
      { x: 0.45, y: 0, w: 0.55, h: 1 },
      { x: 0.5, y: 0.08, w: 0.48, h: 0.84 },
    )
  }

  list.push(
    { x: 0, y: 0.33, w: 1, h: 0.34 },
    { x: 0.08, y: 0.12, w: 0.84, h: 0.76 },
    { x: 0.12, y: 0.3, w: 0.76, h: 0.55 },
    { x: 0, y: 0.5, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    { x: 0.25, y: 0.25, w: 0.5, h: 0.5 },
  )

  const seen = new Set<string>()
  return list.filter((r) => {
    const k = normRectKey(r)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

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
  } catch {
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

function clearDecodeImage() {
  pastedImage.value = ''
  decodedText.value = ''
  lastDecodeOk.value = false
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

/** 裁剪 region 后按 scale 放大绘制，再取 ImageData */
function drawRegionScaled(img: HTMLImageElement, region: NormRect, scale: number): ImageData | null {
  const nw = img.naturalWidth || img.width
  const nh = img.naturalHeight || img.height
  if (!nw || !nh) return null

  const sx = Math.max(0, Math.min(nw - 1, Math.floor(region.x * nw)))
  const sy = Math.max(0, Math.min(nh - 1, Math.floor(region.y * nh)))
  const sw = Math.max(1, Math.min(nw - sx, Math.ceil(region.w * nw)))
  const sh = Math.max(1, Math.min(nh - sy, Math.ceil(region.h * nh)))

  let dw = Math.round(sw * scale)
  let dh = Math.round(sh * scale)
  if (dw > MAX_CANVAS_SIDE || dh > MAX_CANVAS_SIDE) {
    const f = Math.min(MAX_CANVAS_SIDE / dw, MAX_CANVAS_SIDE / dh)
    dw = Math.max(1, Math.floor(dw * f))
    dh = Math.max(1, Math.floor(dh * f))
  }
  if (dw < 16 || dh < 16) return null

  const c = document.createElement('canvas')
  c.width = dw
  c.height = dh
  const ctx = c.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh)
  return ctx.getImageData(0, 0, dw, dh)
}

function tryDecodeImageData(imageData: ImageData) {
  return jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth',
  })
}

function decodeFromImage(src: string) {
  decodedText.value = ''
  lastDecodeOk.value = false
  isDecoding.value = true
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const nw = img.naturalWidth || img.width
    const nh = img.naturalHeight || img.height
    const regions = buildDecodeRegions(nw, nh)
    let found: string | null = null
    outer: for (const region of regions) {
      for (const scale of DECODE_SCALE_STEPS) {
        const id = drawRegionScaled(img, region, scale)
        if (!id) continue
        const res = tryDecodeImageData(id)
        if (res?.data) {
          found = res.data
          break outer
        }
      }
    }
    isDecoding.value = false
    if (found) {
      decodedText.value = found
      lastDecodeOk.value = true
      toast.success('识别成功')
    } else {
      toast.warning('未识别到二维码，可换更清晰的图或裁剪放大后再试')
    }
  }
  img.onerror = () => {
    isDecoding.value = false
    toast.error('图片加载失败')
  }
  img.src = src
}

async function copyDecoded() {
  const t = decodedText.value
  if (!t) {
    toast.warning('没有可复制的内容')
    return
  }
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(t)
      toast.success('已复制到剪贴板')
      return
    }
  } catch {
    /* fallback below */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = t
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    ta.style.top = '0'
    document.body.appendChild(ta)
    ta.select()
    ta.setSelectionRange(0, t.length)
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    if (ok) toast.success('已复制到剪贴板')
    else toast.error('复制失败，请手动选中文本复制')
  } catch {
    toast.error('复制失败，请手动选中文本复制')
  }
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
    <div class="space-y-8 max-w-5xl mx-auto">
      <!-- 模式切换 -->
      <div class="inline-flex p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 shadow-sm">
        <button
          type="button"
          @click="mode = 'generate'"
          :class="[
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
            mode === 'generate'
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
              : 'text-slate-600 hover:text-slate-800',
          ]"
        >
          <QrCodeIcon class="w-4 h-4 shrink-0" />
          生成
        </button>
        <button
          type="button"
          @click="mode = 'decode'"
          :class="[
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
            mode === 'decode'
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
              : 'text-slate-600 hover:text-slate-800',
          ]"
        >
          <DocumentMagnifyingGlassIcon class="w-4 h-4 shrink-0" />
          解析
        </button>
      </div>

      <div v-if="mode === 'generate'" class="space-y-6">
        <div class="glass-card p-5 sm:p-6">
          <label class="block text-slate-500 text-sm font-medium mb-2">内容</label>
          <textarea
            v-model="text"
            class="glass-input px-4 py-3 w-full min-h-[100px] resize-y"
            placeholder="输入要编码的文字或链接..."
          />
        </div>
        <div class="glass-card p-5 sm:p-6">
          <h3 class="text-slate-800 font-semibold mb-4">样式</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-slate-500 text-sm mb-2">尺寸</label>
              <input v-model.number="size" type="number" min="64" max="512" class="glass-input px-4 py-3 w-full" />
            </div>
            <div>
              <label class="block text-slate-500 text-sm mb-2">深色</label>
              <div class="flex gap-2">
                <input v-model="darkColor" type="color" class="w-12 h-10 rounded-lg cursor-pointer bg-slate-100 border border-slate-200" />
                <input v-model="darkColor" type="text" class="glass-input px-4 py-3 flex-1 font-mono text-sm" />
              </div>
            </div>
            <div>
              <label class="block text-slate-500 text-sm mb-2">浅色</label>
              <div class="flex gap-2">
                <input v-model="lightColor" type="color" class="w-12 h-10 rounded-lg cursor-pointer bg-slate-100 border border-slate-200" />
                <input v-model="lightColor" type="text" class="glass-input px-4 py-3 flex-1 font-mono text-sm" />
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
        <div v-if="text.trim()" class="glass-card p-6 sm:p-8 flex flex-col items-center gap-5">
          <img v-if="qrDataUrl" :src="qrDataUrl" :width="size" :height="size" class="bg-white rounded-xl shadow-lg ring-1 ring-slate-200/60" />
          <button type="button" class="btn-primary flex items-center gap-2 cursor-pointer" @click="downloadQr">
            <ArrowDownTrayIcon class="w-4 h-4" />
            下载 PNG
          </button>
        </div>
      </div>

      <div v-else class="space-y-6">
        <div
          role="button"
          tabindex="0"
          class="group relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50/90 via-white to-accent/[0.04] hover:border-accent/35 hover:shadow-md hover:shadow-accent/5 transition-all duration-300 cursor-pointer"
          @click="decodeInput?.click()"
          @keydown.enter.prevent="decodeInput?.click()"
        >
          <input
            ref="decodeInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onDecodeFile"
          />
          <div class="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_30%_20%,theme(colors.accent.DEFAULT),transparent_50%),radial-gradient(circle_at_80%_80%,theme(colors.slate.400),transparent_45%)] pointer-events-none" />
          <div class="relative flex flex-col items-center justify-center py-14 sm:py-16 px-6">
            <div
              class="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 text-accent group-hover:scale-105 transition-transform duration-300"
            >
              <PhotoIcon class="w-8 h-8" />
            </div>
            <p class="text-slate-700 font-medium">点击选择图片</p>
            <p class="mt-1 text-sm text-slate-500">或在页面任意处按 <kbd class="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono">Ctrl</kbd> + <kbd class="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono">V</kbd> 粘贴截图</p>
          </div>
        </div>

        <p class="text-xs text-slate-500 leading-relaxed px-1 flex items-start gap-2">
          <span class="text-accent font-medium shrink-0">提示</span>
          <span>会先整图、再自动尝试底部/中部等区域裁剪并放大识别（适合长图、海报）；若仍失败，可手动裁剪只保留二维码后再传。</span>
        </p>

        <div v-if="pastedImage" class="glass-card overflow-hidden border-slate-200/90">
          <div class="grid lg:grid-cols-12 gap-0 lg:divide-x divide-slate-200/80">
            <!-- 预览 -->
            <div class="lg:col-span-5 p-5 sm:p-6 bg-slate-50/50">
              <div class="flex items-center justify-between gap-2 mb-3">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">预览</span>
                <button
                  type="button"
                  class="text-xs font-medium text-slate-500 hover:text-accent flex items-center gap-1 cursor-pointer transition-colors"
                  @click="clearDecodeImage"
                >
                  <ArrowPathIcon class="w-3.5 h-3.5" />
                  清除
                </button>
              </div>
              <div class="rounded-xl bg-[repeating-conic-gradient(#e2e8f0_0%_25%,#f8fafc_0%_50%)] bg-[length:12px_12px] p-3 ring-1 ring-slate-200/60">
                <img
                  :src="pastedImage"
                  alt="上传的二维码图片"
                  class="w-full max-h-56 sm:max-h-64 object-contain rounded-lg mx-auto"
                />
              </div>
            </div>
            <!-- 结果 -->
            <div class="lg:col-span-7 p-5 sm:p-6 flex flex-col min-h-[200px]">
              <div class="flex items-center justify-between gap-3 mb-3">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">解码结果</span>
                <span
                  v-if="!isDecoding"
                  :class="[
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                    lastDecodeOk ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80' : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200/70',
                  ]"
                >
                  <CheckCircleIcon v-if="lastDecodeOk" class="w-3.5 h-3.5" />
                  {{ lastDecodeOk ? '已识别' : '未识别' }}
                </span>
                <span v-else class="text-xs text-slate-500 animate-pulse">识别中…</span>
              </div>

              <div v-if="isDecoding" class="flex-1 flex items-center justify-center text-slate-400 text-sm py-12">
                正在解析图片…
              </div>

              <template v-else-if="decodedText">
                <textarea
                  :value="decodedText"
                  readonly
                  class="glass-input px-4 py-3 w-full min-h-[120px] resize-y font-mono text-sm leading-relaxed mb-4"
                />
                <button
                  type="button"
                  class="btn-primary inline-flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto sm:self-start"
                  @click="copyDecoded"
                >
                  <ClipboardDocumentIcon class="w-4 h-4" />
                  复制内容
                </button>
              </template>

              <div
                v-else
                class="flex-1 flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl bg-slate-50/80 border border-dashed border-slate-200"
              >
                <DocumentMagnifyingGlassIcon class="w-10 h-10 text-slate-300 mb-2" />
                <p class="text-slate-600 text-sm font-medium">未识别到二维码</p>
                <p class="text-slate-500 text-xs mt-1 max-w-sm">可尝试截图仅含二维码、或换一张对比度更高的图片。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
