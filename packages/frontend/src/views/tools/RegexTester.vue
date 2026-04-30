<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import {
  EnvelopeIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  IdentificationIcon,
  HashtagIcon,
  LinkIcon,
} from '@heroicons/vue/24/outline'

const regexPattern = ref('')
const regexFlags = ref({ g: true, i: false, m: false, s: false })
const testText = ref('')

const templates = [
  { name: '手机号', pattern: '1[3-9]\\d{9}', icon: DevicePhoneMobileIcon },
  { name: '邮箱', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', icon: EnvelopeIcon },
  { name: 'URL', pattern: 'https?://[^\\s]+', icon: GlobeAltIcon },
  {
    name: 'IPv4',
    pattern: '\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b',
    icon: LinkIcon,
  },
  { name: '身份证', pattern: '\\d{17}[0-9Xx]', icon: IdentificationIcon },
  { name: '数字', pattern: '\\d+', icon: HashtagIcon },
  { name: '中文', pattern: '[\\u4e00-\\u9fa5]+', icon: HashtagIcon },
  { name: '整数', pattern: '-?\\d+', icon: HashtagIcon },
  { name: '浮点数', pattern: '-?\\d+\\.\\d+', icon: HashtagIcon },
]

const flagsStr = computed(() => {
  return ['g', 'i', 'm', 's'].filter((f) => regexFlags.value[f as keyof typeof regexFlags.value]).join('')
})

interface MatchResult {
  match: string
  index: number
  groups: string[]
}

const matchResults = computed<MatchResult[]>(() => {
  if (!regexPattern.value || !testText.value) return []
  try {
    const re = new RegExp(regexPattern.value, flagsStr.value)
    const results: MatchResult[] = []
    let m: RegExpExecArray | null
    while ((m = re.exec(testText.value)) !== null) {
      results.push({
        match: m[0],
        index: m.index,
        groups: m.slice(1),
      })
      if (!re.global) break
    }
    return results
  } catch {
    return []
  }
})

const regexValid = computed(() => {
  try {
    new RegExp(regexPattern.value)
    return true
  } catch {
    return false
  }
})

function highlightText(): string {
  if (!regexPattern.value || !testText.value || !regexValid.value) return ''
  try {
    const re = new RegExp(regexPattern.value, flagsStr.value)
    const parts: { text: string; matched: boolean }[] = []
    let lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(testText.value)) !== null) {
      if (m.index > lastIndex) {
        parts.push({ text: testText.value.slice(lastIndex, m.index), matched: false })
      }
      parts.push({ text: m[0], matched: true })
      lastIndex = m.index + m[0].length
      if (!re.global) break
    }
    if (lastIndex < testText.value.length) {
      parts.push({ text: testText.value.slice(lastIndex), matched: false })
    }
    return parts
      .map((p) => {
        const escaped = p.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
        return p.matched ? `<mark class="bg-accent/30 text-accent rounded px-0.5 cursor-default">${escaped}</mark>` : escaped
      })
      .join('')
  } catch {
    return testText.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
}

function applyTemplate(t: (typeof templates)[0]) {
  regexPattern.value = t.pattern
}
</script>

<template>
  <ToolLayout title="正则表达式测试">
    <div class="flex flex-col lg:flex-row gap-5">
      <aside class="lg:w-52 flex-shrink-0">
        <div class="glass-card p-4 lg:sticky lg:top-24">
          <h3 class="text-slate-700 text-sm font-semibold mb-3 flex items-center gap-2">
            <HashtagIcon class="w-4 h-4 text-accent" />
            常用模板
          </h3>
          <div class="space-y-1">
            <button
              v-for="t in templates"
              :key="t.name"
              class="w-full text-left px-3 py-2 rounded-lg text-slate-600 hover:bg-accent/10 hover:text-accent flex items-center gap-2 text-sm cursor-pointer transition-colors"
              @click="applyTemplate(t)"
            >
              <component :is="t.icon" class="w-4 h-4 flex-shrink-0" />
              {{ t.name }}
            </button>
          </div>
        </div>
      </aside>

      <div class="flex-1 space-y-5 min-w-0">
        <div class="glass-card p-5">
          <h3 class="text-slate-800 font-semibold mb-3 flex items-center gap-2">
            <span class="w-1 h-4 bg-accent rounded-full" />
            正则表达式
          </h3>
          <div class="flex items-center gap-2">
            <span class="text-slate-400 font-mono text-lg">/</span>
            <input
              v-model="regexPattern"
              placeholder="pattern"
              class="glass-input flex-1 px-3 py-2 font-mono"
              :class="!regexValid && regexPattern ? '!border-red-300' : ''"
            />
            <span class="text-slate-400 font-mono text-lg">/{{ flagsStr }}</span>
          </div>
          <div class="flex gap-2 mt-3">
            <label
              v-for="f in ['g', 'i', 'm', 's']"
              :key="f"
              class="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border text-sm font-mono transition-colors"
              :class="regexFlags[f as keyof typeof regexFlags]
                ? 'bg-accent/10 border-accent/40 text-accent'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'"
            >
              <input v-model="regexFlags[f as keyof typeof regexFlags]" type="checkbox" class="hidden" />
              {{ f }}
            </label>
          </div>
          <p
            v-if="!regexValid && regexPattern"
            class="mt-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
          >正则表达式无效</p>
        </div>

        <div class="glass-card p-5">
          <h3 class="text-slate-800 font-semibold mb-3 flex items-center gap-2">
            <span class="w-1 h-4 bg-accent rounded-full" />
            测试文本
          </h3>
          <textarea
            v-model="testText"
            placeholder="输入用于匹配的文本..."
            class="glass-input w-full min-h-[140px] p-4 font-mono text-sm resize-y"
          />
        </div>

        <div class="glass-card p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-slate-800 font-semibold flex items-center gap-2">
              <span class="w-1 h-4 bg-accent rounded-full" />
              匹配结果
            </h3>
            <span v-if="matchResults.length" class="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              {{ matchResults.length }} 处匹配
            </span>
          </div>
          <div v-if="matchResults.length > 0" class="space-y-1.5 mb-5 max-h-60 overflow-auto">
            <div
              v-for="(r, i) in matchResults"
              :key="i"
              class="text-sm flex flex-wrap items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5"
            >
              <span class="text-xs text-slate-400 w-6">#{{ i + 1 }}</span>
              <code class="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5 font-mono text-xs">{{ r.match }}</code>
              <span class="text-xs text-slate-400">位置 {{ r.index }}</span>
              <span v-if="r.groups.length" class="text-amber-600 text-xs">
                捕获: {{ r.groups.join(' · ') }}
              </span>
            </div>
          </div>
          <div v-else-if="regexPattern && testText && regexValid" class="text-slate-400 text-sm mb-5 text-center py-4 bg-slate-50 rounded-lg">
            未匹配到结果
          </div>
          <h3 class="text-slate-700 text-sm font-semibold mb-2">高亮输出</h3>
          <div
            class="min-h-[80px] p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-sm whitespace-pre-wrap overflow-auto text-slate-700"
            v-html="highlightText() || (testText ? '无匹配' : '')"
          />
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
