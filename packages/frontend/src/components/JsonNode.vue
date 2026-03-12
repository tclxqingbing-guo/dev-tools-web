<script setup lang="ts">
import { computed } from 'vue'
import { ClipboardDocumentIcon } from '@heroicons/vue/24/outline'

interface Props {
  data: any
  name?: string
  path: string
  level: number
  expandedPaths: Set<string>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  toggle: [path: string]
  copy: [value: any]
}>()

const isRoot = computed(() => props.path === 'root')
const isObject = computed(() => typeof props.data === 'object' && props.data !== null && !Array.isArray(props.data))
const isArray = computed(() => Array.isArray(props.data))
const isExpanded = computed(() => props.expandedPaths.has(props.path))

const displayKey = computed(() => isRoot.value ? '' : (props.name || ''))

const valueType = computed(() => {
  if (props.data === null) return 'null'
  if (typeof props.data === 'boolean') return 'boolean'
  if (typeof props.data === 'number') return 'number'
  if (typeof props.data === 'string') return 'string'
  return 'unknown'
})

const valueColorClass = computed(() => {
  const classes: Record<string, string> = {
    string: 'text-emerald-400',
    number: 'text-blue-400 font-semibold',
    boolean: 'text-amber-400 font-semibold',
    null: 'text-red-400 font-semibold italic',
  }
  return classes[valueType.value] || 'text-slate-300'
})

const displayValue = computed(() => {
  if (props.data === null) return 'null'
  if (typeof props.data === 'boolean') return props.data.toString()
  if (typeof props.data === 'number') return props.data.toString()
  if (typeof props.data === 'string') return `"${props.data}"`
  return String(props.data)
})

const objectKeys = computed(() => isObject.value ? Object.keys(props.data) : [])
const arrayLength = computed(() => isArray.value ? props.data.length : 0)

const toggle = () => emit('toggle', props.path)
const copy = () => emit('copy', props.data)

const copyKey = () => {
  if (props.name && navigator.clipboard) navigator.clipboard.writeText(props.name)
}
const copyValue = () => {
  if (typeof props.data === 'string' && navigator.clipboard) navigator.clipboard.writeText(props.data)
}
</script>

<template>
  <div class="json-node">
    <div v-if="isObject || isArray" class="group flex items-center py-0.5 hover:bg-white/5 transition-colors" :style="{ paddingLeft: `${level * 20}px` }">
      <span class="cursor-pointer select-none text-slate-500 mr-1.5 text-xs w-3.5 inline-block hover:text-accent" @click="toggle">
        {{ isExpanded ? '\u25BC' : '\u25B6' }}
      </span>
      <span v-if="!isRoot" class="text-rose-400 font-semibold mr-1.5 cursor-pointer hover:underline" @click="copyKey">{{ displayKey }}:</span>
      <span class="font-bold text-slate-400">{{ isArray ? '[' : '{' }}</span>
      <span v-if="!isExpanded" class="text-slate-500 mx-1.5 italic text-xs">
        {{ isArray ? `${arrayLength} items` : `${objectKeys.length} keys` }}
      </span>
      <span v-if="!isExpanded" class="font-bold text-slate-400">{{ isArray ? ']' : '}' }}</span>
      <button class="opacity-0 group-hover:opacity-100 ml-2 px-1.5 py-0.5 bg-accent/20 text-accent rounded hover:bg-accent/30 text-xs transition-all cursor-pointer" @click.stop="copy">
        <ClipboardDocumentIcon class="inline-block w-3 h-3" />
      </button>
    </div>
    <div v-if="isExpanded && (isObject || isArray)">
      <JsonNode
        v-for="(value, key) in data"
        :key="String(key)"
        :data="value"
        :name="String(key)"
        :path="`${path}.${key}`"
        :level="level + 1"
        :expanded-paths="expandedPaths"
        @toggle="(p) => $emit('toggle', p)"
        @copy="(v) => $emit('copy', v)"
      />
    </div>
    <div v-if="isExpanded && (isObject || isArray)" class="flex items-center py-0.5" :style="{ paddingLeft: `${level * 20}px` }">
      <span class="w-3.5 mr-1.5" />
      <span class="font-bold text-slate-400">{{ isArray ? ']' : '}' }}</span>
    </div>
    <div v-if="!isObject && !isArray" class="group flex items-center py-0.5 hover:bg-white/5 transition-colors" :style="{ paddingLeft: `${level * 20}px` }">
      <span class="text-rose-400 font-semibold mr-1.5 cursor-pointer hover:underline" @click="copyKey">{{ displayKey }}:</span>
      <span :class="`cursor-pointer px-1 py-0.5 rounded transition-colors ${valueColorClass}`" @click="copyValue">{{ displayValue }}</span>
      <span class="text-slate-500 ml-0.5">,</span>
      <button class="opacity-0 group-hover:opacity-100 ml-2 px-1.5 py-0.5 bg-accent/20 text-accent rounded hover:bg-accent/30 text-xs transition-all cursor-pointer" @click.stop="copy">
        <ClipboardDocumentIcon class="inline-block w-3 h-3" />
      </button>
    </div>
  </div>
</template>
