<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import { useToast } from '../../composables/useToast'
import { useClipboard } from '../../composables/useClipboard'
import {
  ArrowPathIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()
const { copyToClipboard } = useClipboard()
const inputXml = ref('')
const outputXml = ref('')
const errorMessage = ref('')
const indentSize = ref(2)
const preserveComments = ref(true)
const sortAttributes = ref(false)

function highlightXml(xml: string): string {
  return xml
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/&lt;!--([\s\S]*?)--&gt;/g, (_, c) => `<span class="text-slate-500">&lt;!--${c}--&gt;</span>`)
    .replace(/&lt;(\/?)([\w.:-]+)([^&]*)&gt;/g, (_, slash, name, rest) => {
      const attrHighlight = rest.replace(
        /(\s+)([\w.:-]+)(=)(["'])([^"']*)\4/g,
        (m: string, s: string, n: string, eq: string, q: string, v: string) =>
          `${s}<span class="text-amber-400">${n}</span>${eq}${q}<span class="text-emerald-400">${v}</span>${q}`
      )
      const color = slash ? 'text-rose-400' : 'text-blue-400'
      return `<span class="${color}">&lt;${slash}${name}${attrHighlight}&gt;</span>`
    })
}

function formatXmlString(xml: string, indent: number, preserve: boolean, sort: boolean): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'text/xml')
  const parseError = doc.querySelector('parsererror')
  if (parseError) throw new Error(parseError.textContent || 'XML 解析错误')

  function serialize(node: Node, level: number): string {
    if (node.nodeType === Node.COMMENT_NODE) {
      if (!preserve) return ''
      return '\n' + ' '.repeat(level * indent) + `<!--${node.textContent}-->`
    }
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim()
      return text ? '\n' + ' '.repeat(level * indent) + text : ''
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return ''

    const el = node as Element
    const tagName = el.tagName
    let attrs = Array.from(el.attributes)
    if (sort) attrs.sort((a, b) => a.name.localeCompare(b.name))
    const attrStr = attrs.map((a) => ` ${a.name}="${a.value}"`).join('')

    const firstChild = el.childNodes[0]
    if (!el.childNodes.length || (el.childNodes.length === 1 && firstChild?.nodeType === Node.TEXT_NODE)) {
      const text = el.textContent?.trim() || ''
      return '\n' + ' '.repeat(level * indent) + `<${tagName}${attrStr}>${text}</${tagName}>`
    }

    let inner = ''
    for (const child of Array.from(el.childNodes)) {
      inner += serialize(child, level + 1)
    }
    return '\n' + ' '.repeat(level * indent) + `<${tagName}${attrStr}>` + inner + '\n' + ' '.repeat(level * indent) + `</${tagName}>`
  }

  let out = ''
  for (const child of Array.from(doc.childNodes)) {
    out += serialize(child, 0)
  }
  return out.trim()
}

const stats = computed(() => {
  if (!inputXml.value.trim()) return { elements: 0, attributes: 0, depth: 0 }
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(inputXml.value, 'text/xml')
    const err = doc.querySelector('parsererror')
    if (err) return { elements: 0, attributes: 0, depth: 0 }

    let elements = 0
    let attrs = 0
    let depth = 0
    function walk(node: Node, d: number) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        elements++
        attrs += (node as Element).attributes.length
        depth = Math.max(depth, d + 1)
        ;(node as Element).childNodes.forEach((c) => walk(c, d + 1))
      }
    }
    doc.childNodes.forEach((c) => walk(c, 0))
    return { elements, attributes: attrs, depth }
  } catch {
    return { elements: 0, attributes: 0, depth: 0 }
  }
})

function formatXml() {
  try {
    errorMessage.value = ''
    outputXml.value = formatXmlString(inputXml.value, indentSize.value, preserveComments.value, sortAttributes.value)
    toast.success('格式化成功')
  } catch (e: any) {
    errorMessage.value = e.message || '格式化失败'
    outputXml.value = ''
    toast.error('XML 格式错误')
  }
}

function compactXml() {
  try {
    errorMessage.value = ''
    const parser = new DOMParser()
    const doc = parser.parseFromString(inputXml.value, 'text/xml')
    const err = doc.querySelector('parsererror')
    if (err) throw new Error(err.textContent || '解析错误')
    const s = new XMLSerializer()
    const str = s.serializeToString(doc)
    outputXml.value = str.replace(/>\s+</g, '><').trim()
    toast.success('压缩成功')
  } catch (e: any) {
    errorMessage.value = e.message || '处理失败'
    outputXml.value = ''
    toast.error('XML 格式错误')
  }
}

function convertToJson() {
  try {
    errorMessage.value = ''
    const parser = new DOMParser()
    const doc = parser.parseFromString(inputXml.value, 'text/xml')
    const err = doc.querySelector('parsererror')
    if (err) throw new Error(err.textContent || '解析错误')

    function toObj(node: Node): any {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent?.trim() || null
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element
        const obj: Record<string, any> = {}
        for (const a of Array.from(el.attributes)) {
          obj['@' + a.name] = a.value
        }
        const children: Record<string, any[]> = {}
        for (const c of Array.from(el.childNodes)) {
          const val = toObj(c)
          if (val === null) continue
          const key = (c as Element).nodeName || '_'
          if (!children[key]) children[key] = []
          children[key].push(val)
        }
        for (const [k, v] of Object.entries(children)) {
          obj[k] = v.length === 1 ? v[0] : v
        }
        return obj
      }
      return null
    }
    const root = doc.documentElement
    const json = root ? { [root.tagName]: toObj(root) } : {}
    outputXml.value = JSON.stringify(json, null, 2)
    toast.success('已转换为 JSON')
  } catch (e: any) {
    errorMessage.value = e.message || '转换失败'
    outputXml.value = ''
    toast.error('转换失败')
  }
}

function validateXml() {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(inputXml.value, 'text/xml')
    const err = doc.querySelector('parsererror')
    if (err) throw new Error(err.textContent || '验证失败')
    toast.success('XML 格式有效')
  } catch (e: any) {
    errorMessage.value = e.message || '验证失败'
    toast.error('XML 格式无效')
  }
}

function downloadFile() {
  if (!outputXml.value) {
    toast.warning('请先格式化或处理 XML')
    return
  }
  const blob = new Blob([outputXml.value], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'output.xml'
  a.click()
  URL.revokeObjectURL(url)
  toast.success('已下载')
}
</script>

<template>
  <ToolLayout title="XML 格式化">
    <div class="space-y-5">
      <div class="glass-card p-5">
        <div class="flex flex-wrap items-center gap-3 mb-4">
          <div class="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200">
            <Cog6ToothIcon class="w-4 h-4 text-slate-400" />
            <span class="text-slate-600 text-xs">缩进</span>
            <select v-model="indentSize" class="bg-transparent border-0 text-sm text-slate-700 cursor-pointer focus:outline-none">
              <option :value="2">2</option>
              <option :value="4">4</option>
              <option :value="8">8</option>
            </select>
          </div>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input v-model="preserveComments" type="checkbox" class="rounded cursor-pointer accent-accent" />
            <span class="text-slate-600 text-sm">保留注释</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input v-model="sortAttributes" type="checkbox" class="rounded cursor-pointer accent-accent" />
            <span class="text-slate-600 text-sm">属性排序</span>
          </label>
        </div>
        <div class="flex flex-wrap gap-2">
          <button class="btn-primary flex items-center gap-2 cursor-pointer !py-2" @click="formatXml">
            <ArrowPathIcon class="w-4 h-4" />
            格式化
          </button>
          <button class="btn-secondary flex items-center gap-2 cursor-pointer !py-2" @click="compactXml">
            <DocumentDuplicateIcon class="w-4 h-4" />
            压缩
          </button>
          <button class="btn-secondary flex items-center gap-2 cursor-pointer !py-2" @click="convertToJson">
            转 JSON
          </button>
          <button class="btn-secondary flex items-center gap-2 cursor-pointer !py-2" @click="validateXml">
            <CheckCircleIcon class="w-4 h-4" />
            验证
          </button>
          <button class="btn-secondary flex items-center gap-2 cursor-pointer !py-2 ml-auto" @click="downloadFile">
            <ArrowDownTrayIcon class="w-4 h-4" />
            下载
          </button>
          <button class="btn-secondary flex items-center gap-2 cursor-pointer !py-2" @click="copyToClipboard(outputXml)">
            <DocumentDuplicateIcon class="w-4 h-4" />
            复制
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div class="glass-card p-5 flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-slate-700 text-sm font-semibold flex items-center gap-2">
              <span class="w-1 h-4 bg-accent rounded-full" />
              输入
            </h3>
            <span class="text-xs text-slate-400">{{ inputXml.length }} 字符</span>
          </div>
          <textarea
            v-model="inputXml"
            placeholder="请输入或粘贴 XML..."
            class="glass-input flex-1 min-h-[400px] p-4 font-mono text-sm resize-none"
          />
          <p
            v-if="errorMessage"
            class="mt-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
          >{{ errorMessage }}</p>
        </div>

        <div class="glass-card p-5 flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-slate-700 text-sm font-semibold flex items-center gap-2">
              <span class="w-1 h-4 bg-accent rounded-full" />
              输出
            </h3>
            <div class="flex gap-2 text-xs">
              <span class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200">元素 {{ stats.elements }}</span>
              <span class="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200">属性 {{ stats.attributes }}</span>
              <span class="px-2 py-0.5 rounded-md bg-violet-50 text-violet-600 border border-violet-200">深度 {{ stats.depth }}</span>
            </div>
          </div>
          <pre
            class="flex-1 min-h-[400px] overflow-auto p-4 rounded-xl bg-slate-900 font-mono text-sm whitespace-pre-wrap text-slate-200"
            v-html="outputXml ? highlightXml(outputXml) : ''"
          />
          <div v-if="!outputXml" class="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-500 text-sm" />
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
