<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import { BuildingOfficeIcon, ClipboardDocumentIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline'
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
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="glass-card p-5">
        <h3 class="text-slate-800 font-semibold mb-4 flex items-center gap-2">
          <CheckCircleIcon class="w-5 h-5 text-accent" />
          校验信用代码
        </h3>
        <input
          v-model="validateInput"
          class="glass-input px-4 py-3 w-full font-mono tracking-wider"
          placeholder="输入18位统一社会信用代码..."
          maxlength="18"
        />
        <div v-if="validationResult" class="mt-4 flex items-start gap-3 p-3 rounded-xl border"
          :class="validationResult.valid
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-rose-50 border-rose-200 text-rose-700'">
          <CheckCircleIcon v-if="validationResult.valid" class="w-5 h-5 flex-shrink-0 mt-0.5" />
          <XCircleIcon v-else class="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span class="text-sm">{{ validationResult.message }}</span>
        </div>
        <div v-else class="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-xs">
          代码格式：18 位数字 + 大写英文字母（不含 I、O、S、V、Z）
        </div>
      </div>

      <div class="glass-card p-5">
        <h3 class="text-slate-800 font-semibold mb-4 flex items-center gap-2">
          <BuildingOfficeIcon class="w-5 h-5 text-accent" />
          生成信用代码
        </h3>
        <div class="flex items-end gap-3">
          <div class="flex-1">
            <label class="text-slate-500 text-xs block mb-1.5">生成数量</label>
            <input v-model.number="genCount" type="number" min="1" max="50" class="glass-input px-3 py-2 w-full" />
          </div>
          <button class="btn-primary flex items-center gap-2 cursor-pointer" @click="generate">
            <BuildingOfficeIcon class="w-4 h-4" />
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

      <div v-if="generatedCodes.length > 0" class="glass-card p-5 lg:col-span-2">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-slate-800 font-semibold flex items-center gap-2">
            <span class="w-1 h-4 bg-accent rounded-full" />
            生成结果
            <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">{{ generatedCodes.length }}</span>
          </h3>
          <button class="btn-secondary flex items-center gap-2 cursor-pointer" @click="copyGenerated">
            <ClipboardDocumentIcon class="w-4 h-4" />
            复制全部
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div
            v-for="(code, i) in generatedCodes" :key="i"
            class="font-mono text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 hover:bg-accent/5 hover:border-accent/30 transition-colors cursor-pointer tracking-wider"
            @click="() => { navigator.clipboard.writeText(code); toast.success('已复制') }"
          >{{ code }}</div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
