<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  PhotoIcon,
  SparklesIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import ToolLayout from '../../components/ToolLayout.vue'
import { useToast } from '../../composables/useToast'

// ==============================================
//  关键修复：只引入你包真实存在的方法 + 内部定义类型
// ==============================================
import {
  revealWatermark,
} from 'bx-utils'

// 你包里的类型，必须在页面重新定义（或让包导出类型）
export type RevealMethod = 'multiscale' | 'highfreq' | 'amplify' | 'stretch' | 'filter'

export interface RevealWatermarkOptions {
  method?: RevealMethod
  grayscale?: boolean
  amplify?: number
  blockSize?: number
  blurRadius?: number
  contrast?: number
  brightness?: number
}

// 自己实现 formatFileSize（你的包没导出！）
function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// ==============================================
//  以下逻辑完全不变，只修复了依赖
// ==============================================

interface MethodOption {
  value: RevealMethod
  label: string
  description: string
}

const methodOptions: MethodOption[] = [
  { value: 'multiscale', label: '块均值高频', description: '适合轻度暗水印和背景纹理较少的截图。' },
  { value: 'highfreq', label: '高频分离', description: '通过低通差值增强局部纹理，适合大部分截图。' },
  { value: 'amplify', label: '偏差放大', description: '适合接近纯色背景的界面，如表单和空白区域。' },
  { value: 'stretch', label: '分位数拉伸', description: '自动拉开弱对比，适合对比度极低的水印。' },
  { value: 'filter', label: '亮度对比拉伸', description: '快速试错型方案，适合先看轮廓。' },
]

const toast = useToast()
const fileInput = ref<HTMLInputElement | null>(null)
const sourceFile = ref<File | null>(null)
const sourcePreview = ref('')
const resultPreview = ref('')
const isDragging = ref(false)
const isRevealing = ref(false)
const sourceWidth = ref(0)
const sourceHeight = ref(0)
const method = ref<RevealMethod>('multiscale')
const grayscale = ref(true)
const amplify = ref(40)
const blockSize = ref(16)
const blurRadius = ref(3)
const contrast = ref(15)
const brightness = ref(0.5)
const lastError = ref('')
const previewState = ref({
  visible: false,
  title: '',
  src: '',
})

let revealTimer: ReturnType<typeof setTimeout> | null = null
let revealTaskId = 0

const defaultMethodOption = methodOptions[0]!
const activeMethod = computed<MethodOption>(() => methodOptions.find((item) => item.value === method.value) ?? defaultMethodOption)
const sourceSizeLabel = computed(() => sourceFile.value ? formatFileSize(sourceFile.value.size, 2) : '')
const showAmplify = computed(() => ['multiscale', 'highfreq', 'amplify'].includes(method.value))
const showBlockSize = computed(() => method.value === 'multiscale')
const showBlurRadius = computed(() => method.value === 'highfreq')
const showFilter = computed(() => method.value === 'filter')
const canDownload = computed(() => !!resultPreview.value)

const revealOptions = computed<RevealWatermarkOptions>(() => ({
  method: method.value,
  grayscale: grayscale.value,
  amplify: amplify.value,
  blockSize: blockSize.value,
  blurRadius: blurRadius.value,
  contrast: contrast.value,
  brightness: brightness.value,
}))

watch(
  [method, grayscale, amplify, blockSize, blurRadius, contrast, brightness],
  () => {
    if (sourceFile.value) scheduleReveal()
  }
)

function clearRevealTimer() {
  if (!revealTimer) return
  clearTimeout(revealTimer)
  revealTimer = null
}

function revokeSourcePreview() {
  if (sourcePreview.value.startsWith('blob:')) URL.revokeObjectURL(sourcePreview.value)
  sourcePreview.value = ''
}

function resetResultState() {
  resultPreview.value = ''
  lastError.value = ''
}

function scheduleReveal(immediate = false) {
  if (!sourceFile.value) return
  clearRevealTimer()
  if (immediate) {
    void runReveal()
    return
  }
  revealTimer = setTimeout(() => {
    void runReveal()
  }, 180)
}

async function resolveImageMeta(file: File) {
  const objectUrl = URL.createObjectURL(file)
  try {
    await new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        sourceWidth.value = img.naturalWidth
        sourceHeight.value = img.naturalHeight
        resolve()
      }
      img.onerror = () => reject(new Error('图片尺寸读取失败'))
      img.src = objectUrl
    })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

async function runReveal() {
  if (!sourceFile.value) return
  const taskId = ++revealTaskId
  isRevealing.value = true
  lastError.value = ''

  try {
    const dataUrl = await revealWatermark(sourceFile.value, revealOptions.value)
    if (taskId !== revealTaskId) return
    resultPreview.value = dataUrl
  } catch (error: unknown) {
    if (taskId !== revealTaskId) return
    const message = error instanceof Error ? error.message : '水印还原失败'
    lastError.value = message
    toast.error(message)
  } finally {
    if (taskId === revealTaskId) isRevealing.value = false
  }
}

async function processFile(file: File) {
  if (!file.type.startsWith('image/')) {
    toast.warning('请选择图片文件')
    return
  }

  clearRevealTimer()
  revokeSourcePreview()
  resetResultState()
  sourceFile.value = file
  sourcePreview.value = URL.createObjectURL(file)

  try {
    await resolveImageMeta(file)
    toast.success('图片已加载，开始还原')
    scheduleReveal(true)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '图片读取失败'
    clearAll(false)
    toast.error(message)
  }
}

function onFileInput(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) void processFile(file)
  target.value = ''
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    void processFile(file)
    return
  }
  toast.warning('请拖入图片文件')
}

function onPaste(event: ClipboardEvent) {
  const items = event.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (!item.type.startsWith('image/')) continue
    event.preventDefault()
    const file = item.getAsFile()
    if (file) void processFile(file)
    return
  }
}

function downloadResult() {
  if (!resultPreview.value || !sourceFile.value) return
  const link = document.createElement('a')
  const baseName = sourceFile.value.name.replace(/\.[^.]+$/, '') || 'watermark'
  link.href = resultPreview.value
  link.download = `${baseName}-revealed.png`
  link.click()
}

function clearAll(showToast = true) {
  revealTaskId++
  clearRevealTimer()
  revokeSourcePreview()
  sourceFile.value = null
  sourceWidth.value = 0
  sourceHeight.value = 0
  isDragging.value = false
  isRevealing.value = false
  resetResultState()
  if (fileInput.value) fileInput.value = null
  if (showToast) toast.success('已清空')
}

function triggerFileSelect() {
  fileInput.value?.click()
}

function openImagePreview(title: string, src: string) {
  previewState.value = {
    visible: true,
    title,
    src,
  }
}

function closeImagePreview() {
  previewState.value = {
    visible: false,
    title: '',
    src: '',
  }
}

function onWindowKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && previewState.value.visible) {
    closeImagePreview()
  }
}

onMounted(() => {
  window.addEventListener('paste', onPaste)
  window.addEventListener('keydown', onWindowKeydown)
})

onUnmounted(() => {
  window.removeEventListener('paste', onPaste)
  window.removeEventListener('keydown', onWindowKeydown)
  clearRevealTimer()
  revokeSourcePreview()
})
</script>

<template>
  <ToolLayout title="暗水印还原">
    <div class="space-y-6">
      <section class="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(30,64,175,0.18),rgba(148,163,184,0.12)_38%,rgba(15,23,42,0.16))] p-4 lg:p-6">
        <div class="absolute inset-0 pointer-events-none">
          <div class="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.45),transparent_70%)]" />
          <div class="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_72%)]" />
          <div class="absolute w-40 h-40 rounded-full -bottom-16 left-1/3 bg-accent/10 blur-3xl" />
        </div>

        <div class="relative grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside class="glass-card bg-white/78 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.14)]">
            <div class="mb-5">
              <p class="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">Reveal</p>
              <h2 class="mt-2 text-2xl font-semibold text-slate-800">还原参数</h2>
              <p class="mt-2 text-sm leading-6 text-slate-500">
                图片只在当前浏览器本地处理。先上传带暗水印的截图，再调参数看结果。
              </p>
            </div>

            <div class="space-y-5">
              <div class="space-y-2">
                <label class="text-sm text-slate-500">处理方法</label>
                <select
                  v-model="method"
                  class="w-full px-4 py-3 text-base cursor-pointer glass-input"
                >
                  <option
                    v-for="item in methodOptions"
                    :key="item.value"
                    :value="item.value"
                  >
                    {{ item.label }}
                  </option>
                </select>
                <p class="text-xs leading-5 text-slate-400">{{ activeMethod.description }}</p>
              </div>

              <div v-if="showAmplify" class="space-y-2">
                <div class="flex items-center justify-between text-sm text-slate-500">
                  <span>差值放大</span>
                  <span class="font-medium text-accent">{{ amplify }}×</span>
                </div>
                <input
                  v-model.number="amplify"
                  type="range"
                  min="1"
                  max="80"
                  step="1"
                  class="w-full cursor-pointer accent-accent"
                />
              </div>

              <div v-if="showBlockSize" class="space-y-2">
                <div class="flex items-center justify-between text-sm text-slate-500">
                  <span>块大小</span>
                  <span class="font-medium text-accent">{{ blockSize }} px</span>
                </div>
                <input
                  v-model.number="blockSize"
                  type="range"
                  min="4"
                  max="48"
                  step="2"
                  class="w-full cursor-pointer accent-accent"
                />
              </div>

              <div v-if="showBlurRadius" class="space-y-2">
                <div class="flex items-center justify-between text-sm text-slate-500">
                  <span>模糊半径</span>
                  <span class="font-medium text-accent">{{ blurRadius }} px</span>
                </div>
                <input
                  v-model.number="blurRadius"
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  class="w-full cursor-pointer accent-accent"
                />
              </div>

              <template v-if="showFilter">
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-sm text-slate-500">
                    <span>对比度</span>
                    <span class="font-medium text-accent">{{ contrast.toFixed(1) }}</span>
                  </div>
                  <input
                    v-model.number="contrast"
                    type="range"
                    min="1"
                    max="40"
                    step="0.5"
                    class="w-full cursor-pointer accent-accent"
                  />
                </div>
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-sm text-slate-500">
                    <span>亮度系数</span>
                    <span class="font-medium text-accent">{{ brightness.toFixed(2) }}</span>
                  </div>
                  <input
                    v-model.number="brightness"
                    type="range"
                    min="0.2"
                    max="2"
                    step="0.05"
                    class="w-full cursor-pointer accent-accent"
                  />
                </div>
              </template>

              <!-- <div class="flex items-center justify-between pt-5 border-t border-slate-200"> -->
                <!-- <div> -->
                  <!-- <p class="text-sm text-slate-500">输出灰度图</p> -->
                  <!-- <p class="mt-1 text-xs text-slate-400">开启后更容易观察弱对比暗纹。</p> -->
                <!-- </div> -->
                <!-- <button
                  type="button"
                  :aria-pressed="grayscale"
                  class="relative inline-flex items-center w-16 transition-colors rounded-full cursor-pointer h-9"
                  :class="grayscale ? 'bg-accent' : 'bg-slate-200'"
                  @click="grayscale = !grayscale"
                >
                  <span
                    class="inline-block transition-transform bg-white rounded-full shadow-sm h-7 w-7"
                    :class="grayscale ? 'translate-x-8' : 'translate-x-1'"
                  />
                </button>
              </div> -->

              <div class="p-4 text-sm rounded-2xl bg-slate-50/90 text-slate-500">
                <div class="flex items-center justify-between gap-3">
                  <span>当前图像</span>
                  <span class="font-medium text-slate-700">{{ sourceFile?.name || '未上传' }}</span>
                </div>
                <div class="flex items-center justify-between gap-3 mt-2">
                  <span>尺寸</span>
                  <span class="text-slate-700">{{ sourceWidth && sourceHeight ? `${sourceWidth} × ${sourceHeight}` : '--' }}</span>
                </div>
                <div class="flex items-center justify-between gap-3 mt-2">
                  <span>大小</span>
                  <span class="text-slate-700">{{ sourceSizeLabel || '--' }}</span>
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  type="button"
                  class="flex items-center gap-2 btn-secondary"
                  @click="clearAll()"
                >
                  <TrashIcon class="w-4 h-4" />
                  清空
                </button>
                <button
                  type="button"
                  class="flex items-center gap-2 btn-secondary"
                  :disabled="!sourceFile"
                  @click="scheduleReveal(true)"
                >
                  <ArrowPathIcon class="w-4 h-4" />
                  重新还原
                </button>
              </div>
            </div>
          </aside>

          <div class="min-w-0 space-y-4">
            <div class="glass-card bg-white/82 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.14)]">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">Upload</p>
                  <h2 class="mt-2 text-xl font-semibold text-slate-800">上传截图进行水印还原</h2>
                  <p class="mt-2 text-sm leading-6 text-slate-500">
                    点击、拖拽，或直接按 Ctrl+V 粘贴已加暗水印的截图。参数变化后会自动重新计算。
                  </p>
                </div>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="flex items-center gap-2 btn-primary"
                    @click="triggerFileSelect"
                  >
                    <PhotoIcon class="w-4 h-4" />
                    选择图片
                  </button>
                  <button
                    type="button"
                    class="flex items-center gap-2 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="!canDownload"
                    @click="downloadResult"
                  >
                    <ArrowDownTrayIcon class="w-4 h-4" />
                    下载结果
                  </button>
                </div>
              </div>

              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFileInput"
              />

              <div
                class="mt-5 flex min-h-[240px] items-center justify-center rounded-[28px] border-2 border-dashed bg-slate-50/70 px-6 py-10 text-center transition-colors"
                :class="isDragging ? 'border-accent/60 bg-accent/5' : 'border-slate-300/80 hover:border-slate-400'"
                @click="triggerFileSelect"
                @dragover.prevent="isDragging = true"
                @dragleave="isDragging = false"
                @drop="onDrop"
              >
                <div class="space-y-3 text-slate-500">
                  <div class="flex items-center justify-center w-16 h-16 mx-auto rounded-2xl bg-slate-100 text-slate-400">
                    <SparklesIcon class="h-9 w-9" />
                  </div>
                  <p class="text-lg font-medium text-slate-700">点击 / 拖拽 / Ctrl+V 粘贴</p>
                  <p class="text-sm leading-6 text-slate-400">
                    支持 PNG、JPG、WebP 等常见截图格式
                  </p>
                </div>
              </div>
            </div>

            <div class="grid gap-4 xl:grid-cols-2">
              <div class="glass-card bg-white/82 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.12)]">
                <div class="flex items-center justify-between gap-3 mb-3">
                  <h3 class="text-base font-semibold text-slate-800">原图</h3>
                  <span class="text-xs text-slate-400">已加水印截图</span>
                </div>
                <div class="preview-panel">
                  <img
                    v-if="sourcePreview"
                    :src="sourcePreview"
                    alt="原图预览"
                    class="max-h-[420px] w-full cursor-zoom-in object-contain"
                    @click="openImagePreview('原图预览', sourcePreview)"
                  >
                  <div v-else class="preview-placeholder">上传后的原图会显示在这里</div>
                </div>
              </div>

              <div class="glass-card bg-white/82 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.12)]">
                <div class="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 class="text-base font-semibold text-slate-800">还原结果</h3>
                    <p class="mt-1 text-xs text-slate-400">{{ activeMethod.label }} · {{ grayscale ? '灰度输出' : '彩色输出' }}</p>
                  </div>
                  <span
                    class="px-3 py-1 text-xs font-medium rounded-full"
                    :class="isRevealing ? 'bg-accent/10 text-accent' : 'bg-slate-100 text-slate-500'"
                  >
                    {{ isRevealing ? '处理中...' : '已就绪' }}
                  </span>
                </div>
                <div class="preview-panel">
                  <div v-if="isRevealing" class="preview-placeholder">正在计算还原结果...</div>
                  <img
                    v-else-if="resultPreview"
                    :src="resultPreview"
                    alt="还原结果"
                    class="max-h-[420px] w-full cursor-zoom-in object-contain"
                    @click="openImagePreview('还原结果', resultPreview)"
                  >
                  <div v-else-if="lastError" class="preview-placeholder text-rose-500">{{ lastError }}</div>
                  <div v-else class="preview-placeholder">结果会在这里显示</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="previewState.visible"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          @click.self="closeImagePreview"
        >
          <button
            type="button"
            class="absolute flex items-center justify-center text-white transition-colors rounded-full right-4 top-4 h-11 w-11 bg-white/10 hover:bg-white/20"
            aria-label="关闭预览"
            @click="closeImagePreview"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
          <div class="w-full max-w-6xl">
            <div class="flex items-center justify-between gap-4 mb-4 text-white">
              <div>
                <p class="text-xs uppercase tracking-[0.28em] text-white/60">Preview</p>
                <h3 class="mt-1 text-lg font-medium">{{ previewState.title }}</h3>
              </div>
              <p class="text-sm text-white/70">点击空白区域或按 Esc 关闭</p>
            </div>
            <div class="flex min-h-[320px] max-h-[82vh] items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-black/20 p-4 shadow-2xl">
              <img
                :src="previewState.src"
                :alt="previewState.title"
                class="max-h-[76vh] max-w-full object-contain"
              >
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </ToolLayout>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.preview-panel {
  min-height: 440px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background:
    linear-gradient(45deg, rgba(241, 245, 249, 0.9) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(241, 245, 249, 0.9) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(241, 245, 249, 0.9) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(241, 245, 249, 0.9) 75%);
  background-color: rgba(248, 250, 252, 0.92);
  background-position: 0 0, 0 10px, 10px -10px, -10px 0;
  background-size: 20px 20px;
}

.preview-placeholder {
  padding: 1.5rem;
  text-align: center;
  color: rgb(148 163 184);
}
</style>