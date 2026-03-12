<script setup lang="ts">
import { ref, reactive } from 'vue'
import * as prettier from 'prettier/standalone'
import parserBabel from 'prettier/plugins/babel'
import estree from 'prettier/plugins/estree'
import ToolLayout from '../../components/ToolLayout.vue'
import JsonNode from '../../components/JsonNode.vue'
import { useToast } from '../../composables/useToast'
import { useClipboard } from '../../composables/useClipboard'
import {
  ArrowPathIcon,
  SparklesIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardDocumentIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()
const { copyToClipboard } = useClipboard()
const inputJson = ref('')
const parsedJson = ref<any>(null)
const errorMessage = ref('')
const expandedPaths = reactive<Set<string>>(new Set())

function normalizeJsObjectToJson(jsCode: string): string {
  let result = jsCode.trim()
  result = result.replace(/([^:])\/\/[^\n]*/g, '$1')
  result = result.replace(/\/\*[\s\S]*?\*\//g, '')
  const strings: string[] = []
  let stringIndex = 0
  result = result.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, (_match, content) => {
    strings.push(`"${content}"`)
    return `__STRING_${stringIndex++}__`
  })
  result = result.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (_match, content) => {
    strings.push(`"${content}"`)
    return `__STRING_${stringIndex++}__`
  })
  result = result.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
  result = result.replace(/(\n\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
  result = result.replace(/,(\s*[}\]])/g, '$1')
  stringIndex = 0
  result = result.replace(/__STRING_(\d+)__/g, () => strings[stringIndex++] || '')
  return result
}

function parseJsonSafely(input: string): any {
  try {
    return JSON.parse(input)
  } catch {
    try {
      let code = input.trim()
      if (code.endsWith(',')) code = code.slice(0, -1)
      const fn = new Function(`'use strict'; return (${code})`)
      return fn()
    } catch {
      try {
        return JSON.parse(normalizeJsObjectToJson(input))
      } catch (e) {
        throw e
      }
    }
  }
}

function addAllPaths(obj: any, path: string) {
  expandedPaths.add(path)
  if (typeof obj === 'object' && obj !== null) {
    for (const key of Object.keys(obj)) {
      addAllPaths(obj[key], `${path}.${key}`)
    }
  }
}

function formatJson() {
  try {
    errorMessage.value = ''
    const parsed = parseJsonSafely(inputJson.value)
    parsedJson.value = parsed
    expandedPaths.clear()
    addAllPaths(parsed, 'root')
    toast.success('格式化成功')
  } catch (e: any) {
    errorMessage.value = e.message || '解析失败'
    parsedJson.value = null
    toast.error('JSON 格式错误')
  }
}

async function formatWithPrettier() {
  try {
    errorMessage.value = ''
    const parsed = parseJsonSafely(inputJson.value)
    const formatted = await prettier.format(JSON.stringify(parsed, null, 2), {
      parser: 'json',
      plugins: [parserBabel, estree],
      printWidth: 80,
      tabWidth: 2,
    })
    inputJson.value = formatted.trim()
    parsedJson.value = parsed
    expandedPaths.clear()
    addAllPaths(parsed, 'root')
    toast.success('Prettier 格式化成功')
  } catch (e: any) {
    errorMessage.value = e.message || '解析失败'
    parsedJson.value = null
    toast.error('JSON 格式错误')
  }
}

function compactJson() {
  try {
    errorMessage.value = ''
    const parsed = parseJsonSafely(inputJson.value)
    inputJson.value = JSON.stringify(parsed)
    parsedJson.value = parsed
    expandedPaths.clear()
    addAllPaths(parsed, 'root')
    toast.success('压缩成功')
  } catch (e: any) {
    errorMessage.value = e.message || '解析失败'
    parsedJson.value = null
    toast.error('JSON 格式错误')
  }
}

function clearAll() {
  inputJson.value = ''
  parsedJson.value = null
  errorMessage.value = ''
  expandedPaths.clear()
  toast.info('已清空')
}

function expandAll() {
  if (parsedJson.value) {
    addAllPaths(parsedJson.value, 'root')
    toast.info('已展开全部')
  }
}

function collapseAll() {
  expandedPaths.clear()
  toast.info('已折叠全部')
}

function togglePath(path: string) {
  if (expandedPaths.has(path)) {
    expandedPaths.delete(path)
  } else {
    expandedPaths.add(path)
  }
}

function copyNode(value: any) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  copyToClipboard(text)
}

function copyAll() {
  if (parsedJson.value) {
    copyToClipboard(JSON.stringify(parsedJson.value, null, 2))
  } else {
    toast.warning('无内容可复制')
  }
}
</script>

<template>
  <ToolLayout title="JSON 格式化">
    <div class="space-y-6">
      <div class="flex flex-wrap items-center gap-2">
        <button class="btn-primary flex items-center gap-2 cursor-pointer" @click="formatJson">
          <ArrowPathIcon class="w-4 h-4" />
          格式化
        </button>
        <button class="btn-primary flex items-center gap-2 cursor-pointer" @click="formatWithPrettier">
          <SparklesIcon class="w-4 h-4" />
          Prettier
        </button>
        <button class="btn-secondary flex items-center gap-2 cursor-pointer" @click="compactJson">
          <DocumentDuplicateIcon class="w-4 h-4" />
          压缩
        </button>
        <button class="btn-secondary flex items-center gap-2 cursor-pointer" @click="clearAll">
          <TrashIcon class="w-4 h-4" />
          清空
        </button>
        <button
          v-if="parsedJson"
          class="btn-secondary flex items-center gap-2 cursor-pointer"
          @click="expandAll"
        >
          <ChevronDownIcon class="w-4 h-4" />
          展开全部
        </button>
        <button
          v-if="parsedJson"
          class="btn-secondary flex items-center gap-2 cursor-pointer"
          @click="collapseAll"
        >
          <ChevronRightIcon class="w-4 h-4" />
          折叠全部
        </button>
        <button
          v-if="parsedJson"
          class="btn-secondary flex items-center gap-2 cursor-pointer"
          @click="copyAll"
        >
          <ClipboardDocumentIcon class="w-4 h-4" />
          复制全部
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="glass-card p-4 flex flex-col">
          <label class="text-slate-500 text-sm font-medium mb-2">输入</label>
          <textarea
            v-model="inputJson"
            placeholder="请输入或粘贴 JSON 数据..."
            class="glass-input flex-1 min-h-[400px] p-4 font-mono text-sm resize-none"
            @input="errorMessage = ''"
          />
          <p v-if="errorMessage" class="mt-2 text-red-400 text-sm">{{ errorMessage }}</p>
        </div>

        <div class="glass-card p-4 flex flex-col bg-surface-card">
          <label class="text-slate-500 text-sm font-medium mb-2">树形视图</label>
          <div class="flex-1 min-h-[400px] overflow-auto p-4 rounded-xl bg-white/5 font-mono text-sm">
            <JsonNode
              v-if="parsedJson !== null"
              :data="parsedJson"
              path="root"
              :level="0"
              :expanded-paths="expandedPaths"
              @toggle="togglePath"
              @copy="copyNode"
            />
            <div v-else class="py-10 text-center text-slate-500">
              格式化后的 JSON 将在这里显示
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
