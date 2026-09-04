<script setup lang="ts">
import { computed } from 'vue'
import type { AgentEvent } from '../api/agent'
import { CheckCircleIcon, ExclamationCircleIcon, WrenchScrewdriverIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{ events: AgentEvent[]; running?: boolean }>()
const visible = computed(() => props.events.filter((event) => event.type.startsWith('tool_') || event.type === 'progress'))
</script>

<template>
  <details v-if="visible.length" class="group mt-3 rounded-xl bg-stone-50/80 px-3 py-2 open:pb-3">
    <summary class="flex cursor-pointer list-none items-center gap-2 text-xs font-medium text-stone-500">
      <WrenchScrewdriverIcon class="h-3.5 w-3.5" />
      {{ running ? '正在调用能力' : `查看 ${visible.length} 条执行记录` }}
      <span v-if="running" class="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
    </summary>
    <div class="mt-3 space-y-2 border-l border-stone-200 pl-3">
      <div v-for="(event, index) in visible" :key="`${event.toolCallId || index}-${event.type}`" class="flex gap-2 text-xs">
        <CheckCircleIcon v-if="event.type === 'tool_finished'" class="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
        <ExclamationCircleIcon v-else-if="event.type === 'tool_failed'" class="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
        <span v-else class="mt-1 h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-500" />
        <div class="min-w-0">
          <p class="truncate font-medium text-stone-700">{{ event.toolName || event.title || '分析中' }}</p>
          <p v-if="event.summary" class="mt-0.5 text-stone-400">{{ event.summary }}</p>
        </div>
      </div>
    </div>
  </details>
</template>
