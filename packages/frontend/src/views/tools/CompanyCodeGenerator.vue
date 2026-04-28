<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import { BuildingOfficeIcon, ClipboardDocumentIcon } from '@heroicons/vue/24/outline'
import { useToast } from '../../composables/useToast'

const toast = useToast()

const CHAR_MAP = '0123456789ABCDEFGHJKLMNPQRTUWXY'
const WEIGHTS = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28]

function validateCreditCode(code: string): { valid: boolean; message: string } {
  const cleaned = code.replace(/\s/g, '').toUpperCase()
  if (cleaned.length !== 18) {
    return { valid: false, message: '长度必须为18位' }
  }
  for (let i = 0; i < 18; i++) {
    if (!CHAR_MAP.includes(cleaned[i] ?? '')) {
      return { valid: false, message: `第${i + 1}位字符无效，允许字符: ${CHAR_MAP}` }
    }
  }
  let sum = 0
  for (let i = 0; i < 17; i++) {
    const idx = CHAR_MAP.indexOf(cleaned[i] ?? '')
    sum += idx * (WEIGHTS[i] ?? 0)
  }
  const remainder = sum % 31
  const checkValue = remainder === 0 ? 0 : 31 - remainder
  const expectedCheck = CHAR_MAP[checkValue]
  const actualCheck = cleaned[17] ?? ''
  if (actualCheck !== expectedCheck) {
    return { valid: false, message: `校验位错误：应为 ${expectedCheck}，实际为 ${actualCheck}` }
  }
  return { valid: true, message: '校验通过' }
}

function generateOne(): string {
  const deptCodes = '1239'
  const orgCodes = '123456789ABCDEFGHJKLMNPQRTUWXY'
  let code = ''
  code += deptCodes[Math.floor(Math.random() * deptCodes.length)]
  code += orgCodes[Math.floor(Math.random() * orgCodes.length)]
  for (let i = 0; i < 6; i++) {
    code += CHAR_MAP[Math.floor(Math.random() * CHAR_MAP.length)]
  }
  for (let i = 0; i < 9; i++) {
    code += CHAR_MAP[Math.floor(Math.random() * CHAR_MAP.length)]
  }
  let sum = 0
  for (let i = 0; i < 17; i++) {
    const idx = CHAR_MAP.indexOf(code[i] ?? '')
    sum += idx * (WEIGHTS[i] ?? 0)
  }
  const remainder = sum % 31
  const checkValue = remainder === 0 ? 0 : 31 - remainder
  code += CHAR_MAP[checkValue] ?? ''
  return code
}

const validateInput = ref('')
const genCount = ref(5)
const generatedCodes = ref<string[]>([])

const validationResult = computed(() => {
  if (!validateInput.value.trim()) return null
  return validateCreditCode(validateInput.value)
})

function generate() {
  const codes: string[] = []
  for (let i = 0; i < genCount.value; i++) {
    codes.push(generateOne())
  }
  generatedCodes.value = codes
  toast.success(`已生成 ${codes.length} 个`)
}

function copyGenerated() {
  if (generatedCodes.value.length === 0) return
  navigator.clipboard.writeText(generatedCodes.value.join('\n')).then(() => toast.success('已复制'))
}
</script>

<template>
  <ToolLayout title="企业信用代码">
    <div class="space-y-6">
      <div class="glass-card p-5">
        <h3 class="text-slate-800 font-medium mb-4">校验统一社会信用代码</h3>
        <div class="flex gap-3">
          <input
            v-model="validateInput"
            class="glass-input px-4 py-3 flex-1"
            placeholder="输入18位统一社会信用代码..."
            maxlength="18"
          />
        </div>
        <div v-if="validationResult" class="mt-3 text-sm" :class="validationResult.valid ? 'text-accent' : 'text-red-400'">
          {{ validationResult.message }}
        </div>
      </div>

      <div class="glass-card p-5">
        <h3 class="text-slate-800 font-medium mb-4">生成</h3>
        <div class="flex gap-4 items-end">
          <div>
            <label class="block text-slate-500 text-sm mb-2">数量</label>
            <input v-model.number="genCount" type="number" min="1" max="50" class="glass-input px-4 py-3 w-24" />
          </div>
          <button class="btn-primary flex items-center gap-2 cursor-pointer" @click="generate">
            <BuildingOfficeIcon class="w-4 h-4" />
            生成
          </button>
        </div>
      </div>

      <div v-if="generatedCodes.length > 0" class="glass-card p-5">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-slate-800 font-medium">生成结果</h3>
          <button class="btn-secondary flex items-center gap-2 cursor-pointer" @click="copyGenerated">
            <ClipboardDocumentIcon class="w-4 h-4" />
            复制
          </button>
        </div>
        <div class="space-y-1 font-mono text-sm">
          <div v-for="(code, i) in generatedCodes" :key="i" class="text-slate-300">{{ code }}</div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
