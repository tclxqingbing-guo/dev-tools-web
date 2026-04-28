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
    <div class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="glass-card p-5">
          <label class="block text-sm font-medium text-slate-500 mb-2">原始代码</label>
          <textarea
            v-model="original"
            class="glass-input px-4 py-3 w-full min-h-[200px] font-mono text-sm resize-y"
            placeholder="粘贴原始代码..."
            spellcheck="false"
          />
        </div>
        <div class="glass-card p-5">
          <label class="block text-sm font-medium text-slate-500 mb-2">修改后代码</label>
          <textarea
            v-model="modified"
            class="glass-input px-4 py-3 w-full min-h-[200px] font-mono text-sm resize-y"
            placeholder="粘贴修改后代码..."
            spellcheck="false"
          />
        </div>
      </div>

      <div class="glass-card p-5 flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <button
            @click="viewMode = 'split'"
            :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm cursor-pointer', viewMode === 'split' ? 'btn-primary' : 'btn-secondary']"
          >
            <Squares2X2Icon class="w-4 h-4" />
            分屏
          </button>
          <button
            @click="viewMode = 'unified'"
            :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm cursor-pointer', viewMode === 'unified' ? 'btn-primary' : 'btn-secondary']"
          >
            <DocumentDuplicateIcon class="w-4 h-4" />
            统一
          </button>
        </div>
        <div class="flex items-center gap-4 text-sm">
          <label class="flex items-center gap-2 text-slate-600 cursor-pointer">
            <input v-model="ignoreWhitespace" type="checkbox" class="rounded cursor-pointer" />
            忽略空白
          </label>
          <label class="flex items-center gap-2 text-slate-600 cursor-pointer">
            <input v-model="ignoreLineBreaks" type="checkbox" class="rounded cursor-pointer" />
            忽略换行
          </label>
          <label class="flex items-center gap-2 text-slate-600 cursor-pointer">
            <input v-model="ignoreCase" type="checkbox" class="rounded cursor-pointer" />
            忽略大小写
          </label>
        </div>
        <div class="flex items-center gap-2 text-slate-500 text-sm">
          <span>+{{ stats.additions }}</span>
          <span>-{{ stats.deletions }}</span>
          <span v-if="stats.changes">~{{ stats.changes }}</span>
        </div>
        <div class="flex-1" />
        <div class="flex items-center gap-2">
          <button class="btn-secondary flex items-center gap-2 cursor-pointer" @click="swap">
            <ArrowsRightLeftIcon class="w-4 h-4" />
            交换
          </button>
          <button class="btn-secondary flex items-center gap-2 cursor-pointer" @click="clearAll">
            <TrashIcon class="w-4 h-4" />
            清空
          </button>
          <button class="btn-primary flex items-center gap-2 cursor-pointer" @click="copyDiff">
            <ClipboardDocumentIcon class="w-4 h-4" />
            复制结果
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
              <div class="text-slate-500 text-xs mb-2">原始</div>
              <div
                v-for="(line, i) in diffLines"
                :key="'old-' + i"
                class="flex"
                :class="line.type === 'remove' ? 'bg-red-500/10' : ''"
              >
                <span class="select-none w-10 text-right pr-2 text-slate-500 flex-shrink-0">{{ i + 1 }}</span>
                <span v-if="line.oldCharDiffs" class="flex-1 break-all">
                  <span
                    v-for="(seg, j) in line.oldCharDiffs"
                    :key="j"
                    :class="seg.removed ? 'bg-red-500/30' : ''"
                  >{{ seg.value }}</span>
                </span>
                <span v-else-if="line.oldLine !== undefined" class="flex-1 break-all">{{ line.oldLine }}</span>
              </div>
            </div>
            <div class="space-y-0">
              <div class="text-slate-500 text-xs mb-2">修改后</div>
              <div
                v-for="(line, i) in diffLines"
                :key="'new-' + i"
                class="flex"
                :class="line.type === 'add' ? 'bg-emerald-500/10' : ''"
              >
                <span class="select-none w-10 text-right pr-2 text-slate-500 flex-shrink-0">{{ i + 1 }}</span>
                <span v-if="line.newCharDiffs" class="flex-1 break-all">
                  <span
                    v-for="(seg, j) in line.newCharDiffs"
                    :key="j"
                    :class="seg.added ? 'bg-emerald-500/30' : seg.removed ? 'bg-red-500/30' : ''"
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
              :class="line.type === 'add' ? 'bg-emerald-500/10' : line.type === 'remove' ? 'bg-red-500/10' : ''"
            >
              <span class="select-none w-10 text-right pr-2 text-slate-500 flex-shrink-0">{{ i + 1 }}</span>
              <span v-if="line.type === 'add' && line.newCharDiffs" class="flex-1 break-all">
                <span v-for="(seg, j) in line.newCharDiffs" :key="j" :class="seg.added ? 'bg-emerald-500/30' : ''">{{
                  seg.value
                }}</span>
              </span>
              <span v-else-if="line.type === 'remove' && line.oldCharDiffs" class="flex-1 break-all">
                <span v-for="(seg, j) in line.oldCharDiffs" :key="j" :class="seg.removed ? 'bg-red-500/30' : ''">{{
                  seg.value
                }}</span>
              </span>
              <span v-else-if="line.oldLine !== undefined" class="flex-1 break-all">{{ line.oldLine }}</span>
              <span v-else-if="line.newLine !== undefined" class="flex-1 break-all">{{ line.newLine }}</span>
            </div>
          </div>
        </div>
        <div v-else class="text-slate-500 text-center py-12">输入两段代码以查看差异</div>
      </div>
    </div>
  </ToolLayout>
</template>
