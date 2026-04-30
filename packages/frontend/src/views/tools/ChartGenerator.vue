<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import { useToast } from '../../composables/useToast'
import { useAiModels } from '../../composables/useAiModels'
import * as echarts from 'echarts'
import {
  ChartBarIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  SparklesIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()
const { chatModels } = useAiModels()

const CHART_TYPES = [
  { value: 'auto', label: '自动' },
  { value: 'line', label: '折线图' },
  { value: 'bar', label: '柱状图' },
  { value: 'pie', label: '饼图' },
  { value: 'scatter', label: '散点图' },
  { value: 'radar', label: '雷达图' },
  { value: 'funnel', label: '漏斗图' },
  { value: 'gauge', label: '仪表盘' },
] as const

const model = ref('deepseek-v4-flash')
const chartType = ref<(typeof CHART_TYPES)[number]['value']>('auto')
const inputText = ref('')
const loading = ref(false)
const chartOption = ref<echarts.EChartsOption | null>(null)
const chartContainerRef = ref<HTMLDivElement | null>(null)
const chartInstance = ref<echarts.ECharts | null>(null)
let resizeObserver: ResizeObserver | null = null

function extractJsonFromResponse(text: string): string | null {
  const trimmed = text.trim()
  const jsonBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonBlockMatch && jsonBlockMatch[1]) {
    return jsonBlockMatch[1].trim()
  }
  const braceStart = trimmed.indexOf('{')
  if (braceStart >= 0) {
    let depth = 0
    let end = -1
    for (let i = braceStart; i < trimmed.length; i++) {
      const c = trimmed[i]
      if (c === '{') depth++
      else if (c === '}') {
        depth--
        if (depth === 0) {
          end = i
          break
        }
      }
    }
    if (end > braceStart) {
      return trimmed.slice(braceStart, end + 1)
    }
  }
  return null
}

function buildSystemPrompt(): string {
  const typeHint = chartType.value === 'auto'
    ? '根据数据特点选择最合适的图表类型'
    : `必须生成 ${chartType.value} 类型的图表`
  return `You are an ECharts expert. Generate a valid ECharts option object as JSON.
${typeHint}.
Return ONLY valid JSON - no markdown, no code blocks, no explanation. The JSON must be parseable and usable with echarts.setOption().
Include title, tooltip, legend if appropriate, and proper series config.`
}

async function generate() {
  const text = inputText.value.trim()
  if (!text) {
    toast.warning('请输入数据或需求描述')
    return
  }

  loading.value = true
  chartOption.value = null

  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model.value,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: text },
        ],
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(err.message || '生成失败')
    }

    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content || ''
    const jsonStr = extractJsonFromResponse(content)
    if (!jsonStr) {
      throw new Error('无法从响应中解析出有效的 ECharts 配置')
    }
    const opt = JSON.parse(jsonStr) as echarts.EChartsOption
    chartOption.value = opt
    toast.success('图表生成成功')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '生成失败'
    toast.error(msg)
  } finally {
    loading.value = false
  }
}

function clearChart() {
  chartOption.value = null
  if (chartInstance.value) {
    chartInstance.value.clear()
  }
  toast.info('已清空')
}

function initChart() {
  if (!chartContainerRef.value) return
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
  chartInstance.value = echarts.init(chartContainerRef.value)
}

watch(chartOption, (opt) => {
  if (!chartInstance.value || !chartContainerRef.value) return
  if (!opt) {
    chartInstance.value.clear()
    return
  }
  chartInstance.value.setOption(opt)
}, { flush: 'post' })

function downloadPng() {
  if (!chartInstance.value || !chartOption.value) {
    toast.warning('请先生成图表')
    return
  }
  const dataUrl = chartInstance.value.getDataURL({ type: 'png' })
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `chart-${Date.now()}.png`
  a.click()
  toast.success('已开始下载')
}

onMounted(() => {
  initChart()
  if (chartContainerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      chartInstance.value?.resize()
    })
    resizeObserver.observe(chartContainerRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  chartInstance.value?.dispose()
  chartInstance.value = null
})
</script>

<template>
  <ToolLayout title="AI 图表生成">
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div class="lg:col-span-2 space-y-5">
        <div class="glass-card p-5">
          <h3 class="text-slate-800 font-semibold mb-4 flex items-center gap-2">
            <SparklesIcon class="w-5 h-5 text-accent" />
            生成配置
          </h3>
          <div class="space-y-3">
            <div>
              <label class="text-slate-500 text-xs block mb-1.5">AI 模型</label>
              <select v-model="model" class="glass-input w-full px-3 py-2 cursor-pointer text-sm">
                <option v-for="m in chatModels" :key="m.value" :value="m.value">{{ m.label }}</option>
              </select>
            </div>
            <div>
              <label class="text-slate-500 text-xs block mb-1.5">图表类型</label>
              <div class="grid grid-cols-4 gap-1.5">
                <button
                  v-for="t in CHART_TYPES" :key="t.value"
                  type="button"
                  :class="['py-1.5 px-2 rounded-lg text-xs cursor-pointer transition-all border', chartType === t.value ? 'bg-accent/10 border-accent/30 text-accent font-medium' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300']"
                  @click="chartType = t.value"
                >{{ t.label }}</button>
              </div>
            </div>
          </div>
        </div>

        <div class="glass-card p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-slate-800 font-semibold flex items-center gap-2">
              <span class="w-1 h-4 bg-accent rounded-full" />
              数据 / 需求描述
            </h3>
            <span class="text-xs text-slate-400">{{ inputText.length }}</span>
          </div>
          <textarea
            v-model="inputText"
            placeholder="输入数据或描述图表需求，例如：&#10;月度销售额：1月120万，2月150万，3月180万&#10;或：生成展示各部门占比的饼图"
            class="glass-input w-full min-h-[200px] p-3 resize-y text-sm"
          />
          <div class="flex flex-wrap gap-2 mt-4">
            <button
              class="btn-primary flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-1 justify-center"
              :disabled="loading"
              @click="generate"
            >
              <ArrowPathIcon v-if="loading" class="w-4 h-4 animate-spin" />
              <SparklesIcon v-else class="w-4 h-4" />
              {{ loading ? '生成中...' : '生成图表' }}
            </button>
            <button class="btn-secondary flex items-center gap-2 cursor-pointer" @click="clearChart">
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div class="lg:col-span-3">
        <div class="glass-card p-5 h-full flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-slate-800 font-semibold flex items-center gap-2">
              <ChartBarIcon class="w-5 h-5 text-accent" />
              图表预览
            </h3>
            <button
              v-if="chartOption"
              class="btn-secondary flex items-center gap-2 cursor-pointer text-sm"
              @click="downloadPng"
            >
              <ArrowDownTrayIcon class="w-4 h-4" />
              下载 PNG
            </button>
          </div>
          <div class="relative flex-1 min-h-[480px] rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
            <div ref="chartContainerRef" class="w-full h-full min-h-[480px]" />
            <div
              v-if="!chartOption && !loading"
              class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center"
            >
              <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <ChartBarIcon class="w-8 h-8 text-slate-300" />
              </div>
              <p class="text-slate-500 text-sm">生成后的图表将在此显示</p>
            </div>
            <div
              v-if="loading"
              class="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm"
            >
              <div class="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mb-2" />
              <p class="text-slate-500 text-sm">AI 正在生成...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
