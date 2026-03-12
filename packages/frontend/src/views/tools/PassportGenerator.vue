<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import { GlobeAltIcon, ClipboardDocumentIcon } from '@heroicons/vue/24/outline'
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
</script>

<template>
  <ToolLayout title="护照号生成验证">
    <div class="space-y-6">
      <div class="glass-card p-5">
        <h3 class="text-slate-100 font-medium mb-4">校验护照号</h3>
        <p class="text-slate-500 text-sm mb-2">支持格式：E+8数字、E+字母+7数字、G+8数字</p>
        <div class="flex gap-3">
          <input
            v-model="validateInput"
            class="glass-input px-4 py-3 flex-1"
            placeholder="输入护照号校验..."
            maxlength="10"
          />
        </div>
        <div v-if="validationResult" class="mt-3 text-sm" :class="validationResult.valid ? 'text-accent' : 'text-red-400'">
          {{ validationResult.message }}
        </div>
      </div>

      <div class="glass-card p-5">
        <h3 class="text-slate-100 font-medium mb-4">生成</h3>
        <div class="flex gap-4 items-end">
          <div>
            <label class="block text-slate-500 text-sm mb-2">数量</label>
            <input v-model.number="genCount" type="number" min="1" max="50" class="glass-input px-4 py-3 w-24" />
          </div>
          <button class="btn-primary flex items-center gap-2 cursor-pointer" @click="generate">
            <GlobeAltIcon class="w-4 h-4" />
            生成
          </button>
        </div>
      </div>

      <div v-if="generatedPassports.length > 0" class="glass-card p-5">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-slate-100 font-medium">生成结果</h3>
          <button class="btn-secondary flex items-center gap-2 cursor-pointer" @click="copyGenerated">
            <ClipboardDocumentIcon class="w-4 h-4" />
            复制
          </button>
        </div>
        <div class="space-y-1 font-mono text-sm">
          <div v-for="(id, i) in generatedPassports" :key="i" class="text-slate-300">{{ id }}</div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
