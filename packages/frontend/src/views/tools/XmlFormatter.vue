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
    <div class="space-y-6">
      <div class="glass-card p-4">
        <div class="flex flex-wrap items-center gap-4 mb-4">
          <div class="flex items-center gap-2">
            <Cog6ToothIcon class="w-5 h-5 text-slate-500" />
            <span class="text-slate-500 text-sm">缩进：</span>
            <select v-model="indentSize" class="glass-input px-3 py-1.5 text-sm cursor-pointer">
              <option :value="2">2</option>
              <option :value="4">4</option>
              <option :value="8">8</option>
            </select>
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="preserveComments" type="checkbox" class="rounded cursor-pointer" />
            <span class="text-slate-400 text-sm">保留注释</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="sortAttributes" type="checkbox" class="rounded cursor-pointer" />
            <span class="text-slate-400 text-sm">属性排序</span>
          </label>
        </div>
        <div class="flex flex-wrap gap-2">
          <button class="btn-primary flex items-center gap-2 cursor-pointer" @click="formatXml">
            <ArrowPathIcon class="w-4 h-4" />
            格式化
          </button>
          <button class="btn-secondary flex items-center gap-2 cursor-pointer" @click="compactXml">
            <DocumentDuplicateIcon class="w-4 h-4" />
            压缩
          </button>
          <button class="btn-secondary flex items-center gap-2 cursor-pointer" @click="convertToJson">
            转 JSON
          </button>
          <button class="btn-secondary flex items-center gap-2 cursor-pointer" @click="validateXml">
            <CheckCircleIcon class="w-4 h-4" />
            验证
          </button>
          <button class="btn-secondary flex items-center gap-2 cursor-pointer" @click="downloadFile">
            <ArrowDownTrayIcon class="w-4 h-4" />
            下载
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="glass-card p-4 flex flex-col">
          <label class="text-slate-500 text-sm font-medium mb-2">输入</label>
          <textarea
            v-model="inputXml"
            placeholder="请输入或粘贴 XML..."
            class="glass-input flex-1 min-h-[350px] p-4 font-mono text-sm resize-none"
          />
          <p v-if="errorMessage" class="mt-2 text-red-400 text-sm">{{ errorMessage }}</p>
        </div>

        <div class="glass-card p-4 flex flex-col bg-surface-card">
          <div class="flex items-center justify-between mb-2">
            <label class="text-slate-500 text-sm font-medium">输出</label>
            <div class="flex gap-3 text-slate-500 text-xs">
              <span>元素: {{ stats.elements }}</span>
              <span>属性: {{ stats.attributes }}</span>
              <span>深度: {{ stats.depth }}</span>
            </div>
          </div>
          <pre
            class="flex-1 min-h-[350px] overflow-auto p-4 rounded-xl bg-black/30 font-mono text-sm whitespace-pre-wrap text-slate-300"
            v-html="highlightXml(outputXml || '')"
          />
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
