<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import jsQR from 'jsqr'
import ToolLayout from '../../components/ToolLayout.vue'
import { useToast } from '../../composables/useToast'
import { useClipboard } from '../../composables/useClipboard'
import { useApi } from '../../composables/useApi'
import {
  parseWxMpTextLocally,
  tryExtractAppIdFromUrl,
  normalizeWxMpInput,
  type WxMpParseResult,
} from '../../utils/wechatMiniprogramParser'
import {
  LinkIcon,
  PhotoIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  DocumentMagnifyingGlassIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()
const { copyToClipboard } = useClipboard()
const { request } = useApi()

const inputTab = ref<'text' | 'image'>('text')
const rawInput = ref('')
const localResult = ref<WxMpParseResult | null>(null)

const resolveLoading = ref(false)
const resolveChain = ref<{ url: string; status: number }[]>([])
const resolveFinalUrl = ref<string | null>(null)
const resolveError = ref<string | null>(null)
const resolvedAppId = ref<string | null>(null)

const decodeInput = ref<HTMLInputElement | null>(null)
const pastedImage = ref('')
const decodedQrText = ref('')
const isDecoding = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

/**
 * 将当前输入做一次本地解析并写入 localResult。
 * @returns void
 */
function runLocalParse() {
  localResult.value = parseWxMpTextLocally(rawInput.value)
}

/**
 * 防抖触发本地解析，减少输入时的重复计算。
 * @returns void
 */
function scheduleLocalParse() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    runLocalParse()
  }, 320)
}

/**
 * 调用后端安全跟随重定向，解析 HTTPS 短链的最终 URL。
 * @returns Promise<void>
 */
async function resolveHttpsLink() {
  const n = normalizeWxMpInput(rawInput.value)
  if (!/^https?:\/\//i.test(n)) {
    toast.warning('当前输入不是 http(s) 链接')
    return
  }
  resolveLoading.value = true
  resolveChain.value = []
  resolveFinalUrl.value = null
  resolveError.value = null
  resolvedAppId.value = null
  try {
    const data = await request<{
      chain: { url: string; status: number }[]
      finalUrl: string | null
      error?: string
    }>('/miniprogram/resolve-link', {
      method: 'POST',
      body: JSON.stringify({ url: n }),
    })
    resolveChain.value = data.chain ?? []
    resolveFinalUrl.value = data.finalUrl ?? null
    resolveError.value = data.error ?? null
    const appFromFinal = data.finalUrl ? tryExtractAppIdFromUrl(data.finalUrl) : null
    const appFromAny =
      appFromFinal ||
      (data.chain || []).map((h) => tryExtractAppIdFromUrl(h.url)).find(Boolean) ||
      null
    resolvedAppId.value = appFromAny
    if (data.error && !data.finalUrl) toast.warning(data.error)
    else toast.success('链接解析完成')
  } catch (e) {
    const msg = e instanceof Error ? e.message : '解析失败'
    resolveError.value = msg
    toast.error(msg)
  } finally {
    resolveLoading.value = false
  }
}

/**
 * 若本地结果为 https 类型，自动尝试一次短链解析（静默失败仅提示）。
 * @returns Promise<void>
 */
async function autoResolveIfHttps() {
  const r = localResult.value
  if (!r || r.kind !== 'https') return
  await resolveHttpsLink()
}

watch(rawInput, () => scheduleLocalParse(), { immediate: true })

watch(
  () => localResult.value?.kind,
  (k) => {
    if (k === 'https') void autoResolveIfHttps()
  },
)

/**
 * 将二维码解码得到的文本写回输入框并切换到文本模式。
 * @param text 解码结果
 * @returns void
 */
function applyDecodedToInput(text: string) {
  rawInput.value = text
  inputTab.value = 'text'
  toast.success('已填入解码内容')
}

/**
 * 从 Data URL 读取图片并用 jsQR 尝试解码（多倍缩放提高成功率）。
 * @param src 图片 Data URL
 * @returns void
 */
function decodeFromImage(src: string) {
  decodedQrText.value = ''
  isDecoding.value = true
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const nw = img.naturalWidth || img.width
    const nh = img.naturalHeight || img.height
    const scales = [1, 1.5, 2, 3, 4]
    let found: string | null = null
    for (const sc of scales) {
      const w = Math.max(1, Math.round(nw * sc))
      const h = Math.max(1, Math.round(nh * sc))
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d', { willReadFrequently: true })
      if (!ctx) continue
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(img, 0, 0, w, h)
      const imageData = ctx.getImageData(0, 0, w, h)
      const res = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      })
      if (res?.data) {
        found = res.data
        break
      }
    }
    isDecoding.value = false
    if (found) {
      decodedQrText.value = found
      applyDecodedToInput(found)
    } else {
      toast.warning('未识别到二维码，可改用「二维码工具」多区域识别')
    }
  }
  img.onerror = () => {
    isDecoding.value = false
    toast.error('图片加载失败')
  }
  img.src = src
}

/**
 * 处理用户选择的图片文件。
 * @param e input change 事件
 * @returns void
 */
function onImageFile(e: Event) {
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

/**
 * 监听剪贴板粘贴图片事件。
 * @param e 剪贴板事件
 * @returns void
 */
function onGlobalPaste(e: ClipboardEvent) {
  if (inputTab.value !== 'image') return
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
        }
        reader.readAsDataURL(file)
      }
      break
    }
  }
}

/**
 * 清空图片解码状态。
 * @returns void
 */
function clearImage() {
  pastedImage.value = ''
  decodedQrText.value = ''
}

onMounted(() => {
  document.addEventListener('paste', onGlobalPaste as EventListener)
})
onUnmounted(() => {
  document.removeEventListener('paste', onGlobalPaste as EventListener)
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<template>
  <ToolLayout title="微信小程序解析">
    <div class="space-y-6 max-w-4xl mx-auto">
      <p class="text-sm text-slate-600 leading-relaxed">
        支持：小程序码/二维码图片识别、<code class="text-xs bg-slate-100 px-1 rounded">#小程序://</code>
        Scheme、<code class="text-xs bg-slate-100 px-1">wxaurl.cn</code> 等短链（后端白名单跟随重定向）、以及
        <code class="text-xs bg-slate-100 px-1">pages/...?...</code> 页面路径（自动解码常见 WebView 参数如 src）。
      </p>

      <div class="inline-flex p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 shadow-sm">
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer"
          :class="
            inputTab === 'text'
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
              : 'text-slate-600 hover:text-slate-800'
          "
          @click="inputTab = 'text'"
        >
          <span class="inline-flex items-center gap-2">
            <LinkIcon class="w-4 h-4" />
            文本 / 链接
          </span>
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer"
          :class="
            inputTab === 'image'
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
              : 'text-slate-600 hover:text-slate-800'
          "
          @click="inputTab = 'image'"
        >
          <span class="inline-flex items-center gap-2">
            <PhotoIcon class="w-4 h-4" />
            小程序码图片
          </span>
        </button>
      </div>

      <div v-if="inputTab === 'text'" class="glass-card p-4 space-y-3">
        <label class="text-slate-500 text-sm font-medium block">粘贴内容</label>
        <textarea
          v-model="rawInput"
          class="glass-input w-full min-h-[140px] p-4 font-mono text-sm resize-y"
          placeholder="Scheme、URL Link 或 pages/index/index?src=https%3A%2F%2F..."
        />
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="btn-primary inline-flex items-center gap-2 cursor-pointer"
            :disabled="resolveLoading"
            @click="resolveHttpsLink"
          >
            <DocumentMagnifyingGlassIcon class="w-4 h-4" />
            {{ resolveLoading ? '解析中…' : '解析 HTTPS 短链' }}
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
            @click="copyToClipboard(rawInput)"
          >
            <span class="inline-flex items-center gap-2">
              <ClipboardDocumentIcon class="w-4 h-4" />
              复制原文
            </span>
          </button>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div
          role="button"
          tabindex="0"
          class="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 hover:border-accent/35 transition-colors cursor-pointer p-10 text-center"
          @click="decodeInput?.click()"
          @keydown.enter.prevent="decodeInput?.click()"
        >
          <input
            ref="decodeInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onImageFile"
          />
          <PhotoIcon class="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p class="text-slate-700 font-medium">点击选择小程序码图片</p>
          <p class="text-xs text-slate-500 mt-1">或在图片模式下使用 Ctrl+V 粘贴截图</p>
        </div>
        <div v-if="pastedImage" class="glass-card p-4 flex flex-col sm:flex-row gap-4">
          <img
            :src="pastedImage"
            alt="预览"
            class="max-h-48 rounded-lg object-contain bg-[repeating-conic-gradient(#e2e8f0_0%_25%,#f8fafc_0%_50%)] bg-[length:12px_12px] p-2 ring-1 ring-slate-200/60"
          />
          <div class="flex-1 min-w-0 space-y-2">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">解码</span>
              <button
                type="button"
                class="text-xs text-slate-500 hover:text-accent inline-flex items-center gap-1 cursor-pointer"
                @click="clearImage"
              >
                <ArrowPathIcon class="w-3.5 h-3.5" />
                清除
              </button>
            </div>
            <p v-if="isDecoding" class="text-sm text-slate-500 animate-pulse">识别中…</p>
            <textarea
              v-else-if="decodedQrText"
              v-model="decodedQrText"
              class="glass-input w-full min-h-[100px] p-3 font-mono text-xs"
            />
            <p v-else class="text-sm text-slate-500">等待识别结果</p>
          </div>
        </div>
      </div>

      <div v-if="localResult" class="glass-card p-5 space-y-4">
        <h2 class="text-slate-800 font-semibold text-sm">解析结果</h2>
        <div class="grid gap-2 text-sm">
          <div class="flex flex-wrap gap-2">
            <span class="text-slate-500">类型</span>
            <span class="font-mono text-slate-800">{{ localResult.kind }}</span>
          </div>
          <div v-if="localResult.scheme" class="rounded-xl bg-slate-50 border border-slate-200/80 p-3 space-y-1">
            <p class="text-xs text-slate-500">Scheme</p>
            <p class="font-mono text-sm break-all">
              名称：{{ localResult.scheme.nickname }} / 令牌：{{ localResult.scheme.pathToken }}
            </p>
          </div>
          <div v-if="localResult.pagePath" class="rounded-xl bg-slate-50 border border-slate-200/80 p-3 space-y-2">
            <p class="text-xs text-slate-500">页面路径</p>
            <p class="font-mono text-sm break-all">{{ localResult.pagePath.path }}</p>
            <p v-if="localResult.pagePath.queryString" class="font-mono text-xs text-slate-600 break-all">
              ?{{ localResult.pagePath.queryString }}
            </p>
          </div>
          <div v-if="localResult.webviewUrls.length" class="space-y-2">
            <p class="text-xs text-slate-500">WebView / H5 候选</p>
            <ul class="space-y-2">
              <li
                v-for="(w, i) in localResult.webviewUrls"
                :key="i"
                class="rounded-lg border border-slate-200 bg-white p-3"
              >
                <div class="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span class="text-xs font-medium text-accent">{{ w.param }}</span>
                  <button
                    type="button"
                    class="text-xs text-slate-500 hover:text-accent cursor-pointer"
                    @click="copyToClipboard(w.url)"
                  >
                    复制链接
                  </button>
                </div>
                <p class="font-mono text-xs break-all text-slate-800">{{ w.url }}</p>
              </li>
            </ul>
          </div>
        </div>

        <div v-if="resolveChain.length || resolveFinalUrl || resolveError" class="rounded-xl border border-slate-200/90 p-3 space-y-2">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">短链重定向</p>
          <p v-if="resolveError" class="text-sm text-amber-800">{{ resolveError }}</p>
          <p v-if="resolveFinalUrl" class="font-mono text-xs break-all text-slate-800">
            最终：{{ resolveFinalUrl }}
          </p>
          <p v-if="resolvedAppId" class="font-mono text-xs text-slate-700">AppID：{{ resolvedAppId }}</p>
          <ol class="list-decimal list-inside text-xs font-mono text-slate-600 space-y-1 max-h-40 overflow-auto">
            <li v-for="(h, i) in resolveChain" :key="i">{{ h.status }} {{ h.url }}</li>
          </ol>
        </div>

        <ul v-if="localResult.hints.length" class="text-xs text-slate-500 space-y-1 list-disc list-inside">
          <li v-for="(h, i) in localResult.hints" :key="i">{{ h }}</li>
        </ul>
      </div>
    </div>
  </ToolLayout>
</template>
