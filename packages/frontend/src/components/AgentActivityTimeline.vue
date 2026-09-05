<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { AgentEvent } from '../api/agent'
import { CheckCircleIcon, ChevronDownIcon, ExclamationCircleIcon, WrenchScrewdriverIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{ events: AgentEvent[]; running?: boolean }>()
const summaryOpen = ref(Boolean(props.running))
const openKeys = ref(new Set<string>())
type ToolItem = { key: string; name: string; status: 'running' | 'finished' | 'failed'; summary?: string; output?: string; server?: string; round?: number }
const grouped = computed<ToolItem[]>(() => {
  const items = new Map<string, ToolItem>()
  props.events.forEach((event, index) => {
    if (!event.type.startsWith('tool_')) return
    const key = String(event.toolCallId || `${event.toolName || 'tool'}-${index}`)
    const current = items.get(key) || { key, name: String(event.toolName || event.title || '分析中'), status: 'running' }
    current.name = String(event.toolName || current.name)
    current.server = String(event.server || current.server || '')
    current.round = Number(event.round || current.round || 0) || undefined
    current.status = event.type === 'tool_failed' ? 'failed' : event.type === 'tool_finished' ? 'finished' : 'running'
    if (event.summary) current.summary = String(event.summary)
    if (event.output) current.output = String(event.output)
    items.set(key, current)
  })
  return [...items.values()]
})
const progress = computed(() => props.events.filter((event) => event.type === 'progress'))
const visible = computed(() => grouped.value.length + progress.value.length)
const activeKey = computed(() => grouped.value.find((item) => item.status === 'running')?.key || '')
watch(() => props.running, (running) => {
  summaryOpen.value = Boolean(running)
  if (!running) openKeys.value = new Set()
}, { immediate: true })
watch(activeKey, (key) => { if (key) openKeys.value = new Set([...openKeys.value, key]) })
function toggleKey(key: string, event: Event) {
  const next = new Set(openKeys.value)
  if ((event.target as HTMLDetailsElement).open) next.add(key); else next.delete(key)
  openKeys.value = next
}
function toggleSummary(event: Event) { summaryOpen.value = (event.target as HTMLDetailsElement).open }
</script>

<template>
  <details v-if="visible" :open="summaryOpen" class="group mt-3 rounded-xl border border-[#e8e8e3] bg-[#fafaf8] px-3 py-2 open:pb-3" @toggle="toggleSummary">
    <summary class="flex cursor-pointer list-none items-center gap-2 text-xs font-medium text-[#66706b]">
      <WrenchScrewdriverIcon class="h-3.5 w-3.5 text-[#718778]" /><span>{{ running ? '正在调用能力' : `查看 ${visible} 条执行记录` }}</span>
      <span v-if="running" class="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-[#8aa58a]" /><ChevronDownIcon class="ml-auto h-3.5 w-3.5 transition group-open:rotate-180" />
    </summary>
    <div class="mt-3 space-y-2 border-l border-[#e2e4de] pl-3">
      <details v-for="item in grouped" :key="item.key" :open="openKeys.has(item.key)" class="rounded-lg border border-transparent px-2 py-1.5 open:border-[#e6e9e3] open:bg-white" @toggle="toggleKey(item.key, $event)">
        <summary class="flex cursor-pointer list-none items-start gap-2 text-xs">
          <CheckCircleIcon v-if="item.status === 'finished'" class="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6f9276]" /><ExclamationCircleIcon v-else-if="item.status === 'failed'" class="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b76a61]" /><span v-else class="mt-1 h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#a88752]" />
          <span class="min-w-0 flex-1"><span class="block truncate font-medium text-[#3e4642]">{{ item.name }}</span><span class="mt-0.5 block truncate text-[#9a9f9a]">{{ item.status === 'running' ? '执行中' : item.status === 'failed' ? '执行失败' : '已完成' }}<span v-if="item.server"> · {{ item.server }}</span></span></span>
          <ChevronDownIcon class="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#a6aaa5] transition group-open:rotate-180" />
        </summary>
        <div v-if="item.summary || item.output" class="ml-5 mt-1 max-h-48 overflow-y-auto whitespace-pre-wrap break-words text-[11px] leading-5 text-[#727a74]"><p v-if="item.summary && item.summary !== '工具调用完成'">{{ item.summary }}</p><p v-if="item.output" class="mt-1 rounded-md bg-[#f1f3f0] p-2 font-mono text-[10px] leading-4 text-[#59635d]">{{ item.output }}</p><p v-else-if="item.status === 'finished'" class="text-[#9a9f9a]">工具调用完成，未返回可展示内容</p></div>
      </details>
      <details v-for="(event, index) in progress" :key="`progress-${index}`" class="rounded-lg px-2 py-1.5 text-xs"><summary class="flex cursor-pointer list-none items-center gap-2 text-[#727a74]"><span class="h-1.5 w-1.5 rounded-full bg-[#9da99a]" /><span class="truncate">{{ event.summary || event.message || '处理中' }}</span></summary><p v-if="event.content" class="ml-4 mt-1 whitespace-pre-wrap text-[11px] text-[#9a9f9a]">{{ event.content }}</p></details>
    </div>
  </details>
</template>
