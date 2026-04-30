<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import * as Diff from 'diff'
import {
  ArrowsRightLeftIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  Squares2X2Icon,
  DocumentDuplicateIcon,
} from '@heroicons/vue/24/outline'
import { useToast } from '../../composables/useToast'

const toast = useToast()
const original = ref('')
const modified = ref('')
const viewMode = ref<'split' | 'unified'>('split')
const ignoreWhitespace = ref(false)
const ignoreLineBreaks = ref(false)
const ignoreCase = ref(false)

function areLinesRelated(lineA: string, lineB: string): boolean {
  const a = lineA.trim()
  const b = lineB.trim()
  if (!a || !b) return false
  const normalize = (s: string) => {
    let x = s
    if (ignoreCase.value) x = x.toLowerCase()
    if (ignoreWhitespace.value) x = x.replace(/\s+/g, ' ')
    if (ignoreLineBreaks.value) x = x.replace(/[\r\n]+/g, ' ')
    return x
  }
  const na = normalize(a)
  const nb = normalize(b)
  if (na === nb) return true
  const len = Math.min(na.length, nb.length)
  if (len === 0) return false
  let matches = 0
  const longer = na.length >= nb.length ? na : nb
  const shorter = na.length < nb.length ? na : nb
  for (let i = 0; i < shorter.length; i++) {
    const ch = shorter[i]
    if (ch !== undefined && longer.includes(ch)) matches++
  }
  return matches / shorter.length >= 0.5
}

const diffOptions = computed(() => ({
  ignoreWhitespace: ignoreWhitespace.value,
  ignoreCase: ignoreCase.value,
}))

const diffResult = computed(() => {
  let oldText = original.value
  let newText = modified.value
  if (ignoreLineBreaks.value) {
    oldText = oldText.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    newText = newText.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  }
  return Diff.diffLines(oldText, newText, diffOptions.value)
})

const stats = computed(() => {
  let additions = 0
  let deletions = 0
  let changes = 0
  for (const part of diffResult.value) {
    if (part.added) additions += (part.value.match(/\n/g) || []).length + (part.value.endsWith('\n') ? 0 : 1)
    else if (part.removed) deletions += (part.value.match(/\n/g) || []).length + (part.value.endsWith('\n') ? 0 : 1)
  }
  changes = Math.min(additions, deletions)
  additions -= changes
  deletions -= changes
  return { additions, deletions, changes }
})

interface CharDiffLine {
  type: 'add' | 'remove' | 'same'
  oldLine?: string
  newLine?: string
  oldCharDiffs?: Array<{ value: string; added?: boolean; removed?: boolean }>
  newCharDiffs?: Array<{ value: string; added?: boolean; removed?: boolean }>
}

const diffLines = computed((): CharDiffLine[] => {
  const result: CharDiffLine[] = []
  const oldLines = original.value.split(/\r?\n/)
  const newLines = modified.value.split(/\r?\n/)
  const parts = diffResult.value
  let oldIdx = 0
  let newIdx = 0
  for (const part of parts) {
    const lines = part.value.split(/\r?\n/)
    const hasTrailing = part.value.endsWith('\n')
    const lineCount = hasTrailing ? lines.length - 1 : lines.length
    if (lineCount === 0 && lines[0] === '') continue
    if (part.added) {
      for (let i = 0; i < lineCount; i++) {
        const newLine = lines[i] ?? ''
        const oldLine = oldLines[oldIdx - 1] ?? ''
        const related = oldIdx > 0 && areLinesRelated(oldLine, newLine)
        let newCharDiffs: Array<{ value: string; added?: boolean; removed?: boolean }> | undefined
        if (related && oldLine && newLine) {
          const charDiff = Diff.diffChars(oldLine, newLine)
          newCharDiffs = charDiff.map((d) => ({
            value: d.value,
            added: d.added,
            removed: d.removed,
          }))
        } else {
          newCharDiffs = [{ value: newLine, added: true }]
        }
        result.push({ type: 'add', newLine, newCharDiffs })
        newIdx++
      }
    } else if (part.removed) {
      for (let i = 0; i < lineCount; i++) {
        const oldLine = lines[i] ?? ''
        const newLine = newLines[newIdx] ?? ''
        const related = newIdx < newLines.length && areLinesRelated(oldLine, newLine)
        let oldCharDiffs: Array<{ value: string; added?: boolean; removed?: boolean }> | undefined
        if (related && oldLine && newLine) {
          const charDiff = Diff.diffChars(oldLine, newLine)
          oldCharDiffs = charDiff.map((d) => ({
            value: d.value,
            added: d.added,
            removed: d.removed,
          }))
        } else {
          oldCharDiffs = [{ value: oldLine, removed: true }]
        }
        result.push({ type: 'remove', oldLine, oldCharDiffs })
        oldIdx++
      }
    } else {
      for (let i = 0; i < lineCount; i++) {
        const line = lines[i] ?? ''
        result.push({ type: 'same', oldLine: line, newLine: line })
        oldIdx++
        newIdx++
      }
    }
  }
  return result
})

function swap() {
  const a = original.value
  original.value = modified.value
  modified.value = a
  toast.info('已交换')
}

function clearAll() {
  original.value = ''
  modified.value = ''
  toast.info('已清空')
}

function copyDiff() {
  let text = ''
  for (const part of diffResult.value) {
    for (const line of part.value.split(/\r?\n/)) {
      if (part.added) text += `+ ${line}\n`
      else if (part.removed) text += `- ${line}\n`
      else if (line) text += `  ${line}\n`
    }
  }
  navigator.clipboard.writeText(text).then(() => toast.success('已复制到剪贴板'))
}
</script>

<template>
  <ToolLayout title="代码对比">
    <div class="space-y-5">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="glass-card p-5">
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span class="w-1 h-4 bg-rose-400 rounded-full" />
              原始代码
            </label>
            <span class="text-xs text-slate-400">{{ original.split('\n').length }} 行</span>
          </div>
          <textarea
            v-model="original"
            class="glass-input px-4 py-3 w-full min-h-[220px] font-mono text-sm resize-y"
            placeholder="粘贴原始代码..."
            spellcheck="false"
          />
        </div>
        <div class="glass-card p-5">
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span class="w-1 h-4 bg-emerald-400 rounded-full" />
              修改后代码
            </label>
            <span class="text-xs text-slate-400">{{ modified.split('\n').length }} 行</span>
          </div>
          <textarea
            v-model="modified"
            class="glass-input px-4 py-3 w-full min-h-[220px] font-mono text-sm resize-y"
            placeholder="粘贴修改后代码..."
            spellcheck="false"
          />
        </div>
      </div>

      <div class="glass-card p-4 flex flex-wrap items-center gap-4">
        <div class="inline-flex gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            @click="viewMode = 'split'"
            :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-all', viewMode === 'split' ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700']"
          >
            <Squares2X2Icon class="w-4 h-4" />
            分屏
          </button>
          <button
            @click="viewMode = 'unified'"
            :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-all', viewMode === 'unified' ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700']"
          >
            <DocumentDuplicateIcon class="w-4 h-4" />
            统一
          </button>
        </div>
        <div class="h-6 w-px bg-slate-200" />
        <div class="flex items-center gap-3 text-sm">
          <label class="flex items-center gap-1.5 text-slate-600 cursor-pointer">
            <input v-model="ignoreWhitespace" type="checkbox" class="rounded cursor-pointer accent-accent" />
            空白
          </label>
          <label class="flex items-center gap-1.5 text-slate-600 cursor-pointer">
            <input v-model="ignoreLineBreaks" type="checkbox" class="rounded cursor-pointer accent-accent" />
            换行
          </label>
          <label class="flex items-center gap-1.5 text-slate-600 cursor-pointer">
            <input v-model="ignoreCase" type="checkbox" class="rounded cursor-pointer accent-accent" />
            大小写
          </label>
        </div>
        <div class="h-6 w-px bg-slate-200" />
        <div class="flex items-center gap-3 text-xs">
          <span class="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 font-mono">+{{ stats.additions }}</span>
          <span class="px-2 py-1 rounded-md bg-rose-50 text-rose-600 border border-rose-200 font-mono">-{{ stats.deletions }}</span>
          <span v-if="stats.changes" class="px-2 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-200 font-mono">~{{ stats.changes }}</span>
        </div>
        <div class="flex-1" />
        <div class="flex items-center gap-2">
          <button class="btn-secondary flex items-center gap-2 cursor-pointer !py-1.5 text-sm" @click="swap">
            <ArrowsRightLeftIcon class="w-4 h-4" />
            交换
          </button>
          <button class="btn-secondary flex items-center gap-2 cursor-pointer !py-1.5 text-sm" @click="clearAll">
            <TrashIcon class="w-4 h-4" />
            清空
          </button>
          <button class="btn-primary flex items-center gap-2 cursor-pointer !py-1.5 text-sm" @click="copyDiff">
            <ClipboardDocumentIcon class="w-4 h-4" />
            复制差异
          </button>
        </div>
      </div>

      <div class="glass-card p-5 overflow-x-auto">
        <div
          v-if="diffLines.length > 0"
          class="font-mono text-sm"
          :class="viewMode === 'split' ? 'grid grid-cols-2 gap-4' : ''"
        >
          <template v-if="viewMode === 'split'">
            <div class="space-y-0">
              <div class="text-slate-500 text-xs mb-2 font-semibold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-400" /> 原始
              </div>
              <div
                v-for="(line, i) in diffLines"
                :key="'old-' + i"
                class="flex"
                :class="line.type === 'remove' ? 'bg-rose-50' : ''"
              >
                <span class="select-none w-10 text-right pr-2 text-slate-400 flex-shrink-0">{{ i + 1 }}</span>
                <span v-if="line.oldCharDiffs" class="flex-1 break-all">
                  <span
                    v-for="(seg, j) in line.oldCharDiffs"
                    :key="j"
                    :class="seg.removed ? 'bg-rose-200/70 text-rose-800' : ''"
                  >{{ seg.value }}</span>
                </span>
                <span v-else-if="line.oldLine !== undefined" class="flex-1 break-all">{{ line.oldLine }}</span>
              </div>
            </div>
            <div class="space-y-0">
              <div class="text-slate-500 text-xs mb-2 font-semibold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 修改后
              </div>
              <div
                v-for="(line, i) in diffLines"
                :key="'new-' + i"
                class="flex"
                :class="line.type === 'add' ? 'bg-emerald-50' : ''"
              >
                <span class="select-none w-10 text-right pr-2 text-slate-400 flex-shrink-0">{{ i + 1 }}</span>
                <span v-if="line.newCharDiffs" class="flex-1 break-all">
                  <span
                    v-for="(seg, j) in line.newCharDiffs"
                    :key="j"
                    :class="seg.added ? 'bg-emerald-200/70 text-emerald-800' : seg.removed ? 'bg-rose-200/70 text-rose-800' : ''"
                  >{{ seg.value }}</span>
                </span>
                <span v-else-if="line.newLine !== undefined" class="flex-1 break-all">{{ line.newLine }}</span>
              </div>
            </div>
          </template>
          <div v-else class="space-y-0">
            <div
              v-for="(line, i) in diffLines"
              :key="i"
              class="flex"
              :class="line.type === 'add' ? 'bg-emerald-50' : line.type === 'remove' ? 'bg-rose-50' : ''"
            >
              <span class="select-none w-10 text-right pr-2 text-slate-400 flex-shrink-0">{{ i + 1 }}</span>
              <span v-if="line.type === 'add' && line.newCharDiffs" class="flex-1 break-all">
                <span v-for="(seg, j) in line.newCharDiffs" :key="j" :class="seg.added ? 'bg-emerald-200/70 text-emerald-800' : ''">{{ seg.value }}</span>
              </span>
              <span v-else-if="line.type === 'remove' && line.oldCharDiffs" class="flex-1 break-all">
                <span v-for="(seg, j) in line.oldCharDiffs" :key="j" :class="seg.removed ? 'bg-rose-200/70 text-rose-800' : ''">{{ seg.value }}</span>
              </span>
              <span v-else-if="line.oldLine !== undefined" class="flex-1 break-all">{{ line.oldLine }}</span>
              <span v-else-if="line.newLine !== undefined" class="flex-1 break-all">{{ line.newLine }}</span>
            </div>
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <ArrowsRightLeftIcon class="w-7 h-7 text-slate-300" />
          </div>
          <p class="text-slate-500 text-sm">输入两段代码以查看差异</p>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
