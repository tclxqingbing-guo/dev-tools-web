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
    <div class="space-y-5">
      <div class="glass-card px-4 py-3 flex flex-wrap items-center gap-2">
        <button class="btn-primary flex items-center gap-2 cursor-pointer !py-2" @click="formatJson">
          <ArrowPathIcon class="w-4 h-4" />
          格式化
        </button>
        <button class="btn-primary flex items-center gap-2 cursor-pointer !py-2" @click="formatWithPrettier">
          <SparklesIcon class="w-4 h-4" />
          Prettier
        </button>
        <button class="btn-secondary flex items-center gap-2 cursor-pointer !py-2" @click="compactJson">
          <DocumentDuplicateIcon class="w-4 h-4" />
          压缩
        </button>
        <div class="h-6 w-px bg-slate-200 mx-1" />
        <button
          v-if="parsedJson"
          class="btn-secondary flex items-center gap-2 cursor-pointer !py-2"
          @click="expandAll"
        >
          <ChevronDownIcon class="w-4 h-4" />
          展开
        </button>
        <button
          v-if="parsedJson"
          class="btn-secondary flex items-center gap-2 cursor-pointer !py-2"
          @click="collapseAll"
        >
          <ChevronRightIcon class="w-4 h-4" />
          折叠
        </button>
        <button
          v-if="parsedJson"
          class="btn-secondary flex items-center gap-2 cursor-pointer !py-2"
          @click="copyAll"
        >
          <ClipboardDocumentIcon class="w-4 h-4" />
          复制
        </button>
        <button class="btn-secondary flex items-center gap-2 cursor-pointer !py-2 ml-auto" @click="clearAll">
          <TrashIcon class="w-4 h-4" />
          清空
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div class="glass-card p-5 flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-slate-700 text-sm font-semibold flex items-center gap-2">
              <span class="w-1 h-4 bg-accent rounded-full" />
              输入
            </h3>
            <span class="text-xs text-slate-400">{{ inputJson.length }} 字符</span>
          </div>
          <textarea
            v-model="inputJson"
            placeholder="请输入或粘贴 JSON 数据..."
            class="glass-input flex-1 min-h-[480px] p-4 font-mono text-sm resize-none"
            @input="errorMessage = ''"
          />
          <p
            v-if="errorMessage"
            class="mt-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
          >{{ errorMessage }}</p>
        </div>

        <div class="glass-card p-5 flex flex-col">
          <h3 class="text-slate-700 text-sm font-semibold flex items-center gap-2 mb-3">
            <span class="w-1 h-4 bg-accent rounded-full" />
            树形视图
          </h3>
          <div class="flex-1 min-h-[480px] overflow-auto p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-sm">
            <JsonNode
              v-if="parsedJson !== null"
              :data="parsedJson"
              path="root"
              :level="0"
              :expanded-paths="expandedPaths"
              @toggle="togglePath"
              @copy="copyNode"
            />
            <div v-else class="h-full flex flex-col items-center justify-center text-center">
              <div class="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-3">
                <SparklesIcon class="w-7 h-7 text-slate-300" />
              </div>
              <p class="text-slate-500 text-sm">格式化后的 JSON 将在这里显示</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
