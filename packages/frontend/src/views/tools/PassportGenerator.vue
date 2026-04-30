<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import { GlobeAltIcon, ClipboardDocumentIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline'
import { useToast } from '../../composables/useToast'

const toast = useToast()

const validateInput = ref('')
const genCount = ref(5)
const generatedPassports = ref<string[]>([])

function validatePassportNumber(num: string): { valid: boolean; message: string } {
  const cleaned = num.replace(/\s/g, '').toUpperCase()
  if (cleaned.length < 8 || cleaned.length > 9) {
    return { valid: false, message: '长度应为8-9位（字母+7-8位数字）' }
  }
  const first = cleaned[0]
  if (first !== 'E' && first !== 'G') {
    return { valid: false, message: '中国护照号以 E 或 G 开头' }
  }
  if (cleaned.length === 9) {
    const rest = cleaned.slice(1)
    if (/^[A-Z]\d{7}$/.test(rest)) {
      const letter = rest[0]
      if (letter === 'I' || letter === 'O') {
        return { valid: false, message: '第二字符不能为 I 或 O' }
      }
      return { valid: true, message: '校验通过（电子护照格式）' }
    }
    if (/^\d{8}$/.test(rest)) {
      return { valid: true, message: '校验通过（旧版格式）' }
    }
  }
  if (cleaned.length === 8 && /^E\d{7}$/.test(cleaned)) {
    return { valid: true, message: '校验通过' }
  }
  const rest = cleaned.slice(1)
  if (!/^[A-Za-z0-9]+$/.test(rest)) {
    return { valid: false, message: '格式错误：应为字母+数字' }
  }
  return { valid: false, message: '格式错误：E/G + 8数字 或 E + 1字母(excl I/O) + 7数字' }
}

function generateOne(): string {
  const prefixes = ['E', 'G']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  if (prefix === 'E' && Math.random() > 0.5) {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'.replace(/[IO]/g, '')
    const letter = letters[Math.floor(Math.random() * letters.length)]
    const digits = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('')
    return prefix + letter + digits
  }
  const digits = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('')
  return prefix + digits
}

function generate() {
  const list: string[] = []
  for (let i = 0; i < genCount.value; i++) {
    list.push(generateOne())
  }
  generatedPassports.value = list
  toast.success(`已生成 ${list.length} 个`)
}

const validationResult = computed(() => {
  if (!validateInput.value.trim()) return null
  return validatePassportNumber(validateInput.value)
})

function copyGenerated() {
  if (generatedPassports.value.length === 0) return
  navigator.clipboard.writeText(generatedPassports.value.join('\n')).then(() => toast.success('已复制'))
}

function copyPassport(passport: string) {
  navigator.clipboard.writeText(passport).then(() => toast.success('已复制'))
}
</script>

<template>
  <ToolLayout title="护照号生成验证">
    <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div class="p-5 glass-card">
        <h3 class="flex items-center gap-2 mb-4 font-semibold text-slate-800">
          <CheckCircleIcon class="w-5 h-5 text-accent" />
          校验护照号
        </h3>
        <input
          v-model="validateInput"
          class="w-full px-4 py-3 font-mono tracking-wider glass-input"
          placeholder="输入护照号校验..."
          maxlength="10"
        />
        <div v-if="validationResult" class="flex items-start gap-3 p-3 mt-4 border rounded-xl"
          :class="validationResult.valid
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-rose-50 border-rose-200 text-rose-700'">
          <CheckCircleIcon v-if="validationResult.valid" class="w-5 h-5 flex-shrink-0 mt-0.5" />
          <XCircleIcon v-else class="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span class="text-sm">{{ validationResult.message }}</span>
        </div>
        <div v-else class="p-3 mt-4 space-y-1 text-xs border rounded-xl bg-slate-50 border-slate-200 text-slate-500">
          <div class="flex items-center gap-2"><span class="w-1 h-1 rounded-full bg-slate-400" />E + 8 位数字（旧版）</div>
          <div class="flex items-center gap-2"><span class="w-1 h-1 rounded-full bg-slate-400" />E + 字母 + 7 位数字（电子护照）</div>
          <div class="flex items-center gap-2"><span class="w-1 h-1 rounded-full bg-slate-400" />G + 8 位数字</div>
        </div>
      </div>

      <div class="p-5 glass-card">
        <h3 class="flex items-center gap-2 mb-4 font-semibold text-slate-800">
          <GlobeAltIcon class="w-5 h-5 text-accent" />
          生成护照号
        </h3>
        <div class="flex items-end gap-3">
          <div class="flex-1">
            <label class="text-slate-500 text-xs block mb-1.5">生成数量</label>
            <input v-model.number="genCount" type="number" min="1" max="50" class="w-full px-3 py-2 glass-input" />
          </div>
          <button class="flex items-center gap-2 cursor-pointer btn-primary" @click="generate">
            <GlobeAltIcon class="w-4 h-4" />
            生成
          </button>
        </div>
        <div class="grid grid-cols-4 gap-1.5 mt-3">
          <button
            v-for="n in [1, 5, 10, 50]" :key="n"
            type="button"
            :class="['py-1.5 rounded-lg text-xs cursor-pointer border transition-colors', genCount === n ? 'bg-accent/10 border-accent/30 text-accent font-medium' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300']"
            @click="genCount = n"
          >{{ n }} 个</button>
        </div>
      </div>

      <div v-if="generatedPassports.length > 0" class="p-5 glass-card lg:col-span-2">
        <div class="flex items-center justify-between mb-3">
          <h3 class="flex items-center gap-2 font-semibold text-slate-800">
            <span class="w-1 h-4 rounded-full bg-accent" />
            生成结果
            <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">{{ generatedPassports.length }}</span>
          </h3>
          <button class="flex items-center gap-2 cursor-pointer btn-secondary" @click="copyGenerated">
            <ClipboardDocumentIcon class="w-4 h-4" />
            复制全部
          </button>
        </div>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <div
            v-for="(id, i) in generatedPassports" :key="i"
            class="px-3 py-2 font-mono text-sm tracking-wider text-center transition-colors border rounded-lg cursor-pointer bg-slate-50 border-slate-200 text-slate-700 hover:bg-accent/5 hover:border-accent/30"
            @click="copyPassport(id)"
          >{{ id }}</div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
