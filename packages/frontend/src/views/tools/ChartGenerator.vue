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

const model = ref('ddeepseek-v4-flash')
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
    <div class="space-y-6">
      <div class="glass-card p-5">
        <h3 class="text-slate-800 font-medium mb-4">配置</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-slate-500 text-sm font-medium block mb-2">模型</label>
            <select
              v-model="model"
              class="glass-input w-full px-4 py-2 cursor-pointer"
            >
              <option v-for="m in chatModels" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
          </div>
          <div>
            <label class="text-slate-500 text-sm font-medium block mb-2">图表类型</label>
            <select
              v-model="chartType"
              class="glass-input w-full px-4 py-2 cursor-pointer"
            >
              <option
                v-for="t in CHART_TYPES"
                :key="t.value"
                :value="t.value"
              >
                {{ t.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="glass-card p-5">
        <label class="text-slate-500 text-sm font-medium block mb-2">数据 / 需求描述</label>
        <textarea
          v-model="inputText"
          placeholder="输入数据或描述图表需求，例如：&#10;月度销售额：1月120万，2月150万，3月180万&#10;或：生成展示各部门占比的饼图"
          class="glass-input w-full min-h-[140px] p-4 text-slate-800 placeholder:text-slate-500 resize-y"
        />
      </div>

      <div class="flex flex-wrap gap-3">
        <button
          class="btn-primary flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading"
          @click="generate"
        >
          <ArrowPathIcon
            v-if="loading"
            class="w-4 h-4 animate-spin"
          />
          <SparklesIcon v-else class="w-4 h-4" />
          {{ loading ? '生成中...' : '生成图表' }}
        </button>
        <button
          class="btn-secondary flex items-center gap-2 cursor-pointer"
          @click="clearChart"
        >
          <TrashIcon class="w-4 h-4" />
          清空
        </button>
        <button
          v-if="chartOption"
          class="btn-secondary flex items-center gap-2 cursor-pointer"
          @click="downloadPng"
        >
          <ArrowDownTrayIcon class="w-4 h-4" />
          下载 PNG
        </button>
      </div>

      <div class="glass-card p-5">
        <h3 class="text-slate-800 font-medium mb-4 flex items-center gap-2">
          <ChartBarIcon class="w-5 h-5 text-accent" />
          图表预览
        </h3>
        <div
          ref="chartContainerRef"
          class="w-full h-[420px] rounded-xl bg-black/20"
        />
        <p v-if="!chartOption && !loading" class="mt-4 text-slate-500 text-sm">
          生成后的图表将在此显示
        </p>
      </div>
    </div>
  </ToolLayout>
</template>
