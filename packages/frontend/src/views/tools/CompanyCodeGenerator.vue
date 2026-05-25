<script setup lang="ts">
import { ref, computed } from 'vue'
import { validateCreditCode as validateCreditCodeByLib } from 'bx-utils'
import ToolLayout from '../../components/ToolLayout.vue'
import { BuildingOfficeIcon, ClipboardDocumentIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline'
import { useToast } from '../../composables/useToast'
import { cities } from '../../data/areaData'

const toast = useToast()

const CHAR_MAP = '0123456789ABCDEFGHJKLMNPQRTUWXY'
const ORGANIZATION_CODE_CHAR_VALUES = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const WEIGHTS = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28]
const ORGANIZATION_CODE_WEIGHTS = [3, 7, 9, 10, 5, 8, 4, 2]
const REGISTRATION_AUTHORITY_CODES = '159Y'
const ENTITY_TYPE_CODES = '1239'

/**
 * 提取可用于生成信用代码的 6 位行政区划码。
 *
 * @return 可选的行政区划码列表。
 */
function collectAreaCodes(): string[] {
  const codes = new Set<string>()

  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit)
      return
    }

    if (!value || typeof value !== 'object') {
      return
    }

    const record = value as Record<string, unknown>
    if (typeof record.cityId === 'string' && /^\d{6}$/.test(record.cityId)) {
      codes.add(record.cityId)
    }

    Object.values(record).forEach(visit)
  }

  visit(cities)

  return [...codes]
}

const AREA_CODES = collectAreaCodes()

/**
 * 计算统一社会信用代码的校验位。
 *
 * @param code 前 17 位代码。
 * @return 对应的校验字符。
 */
function getCreditCodeCheckChar(code: string): string {
  let sum = 0

  for (let i = 0; i < 17; i++) {
    const idx = CHAR_MAP.indexOf(code[i] ?? '')
    sum += idx * (WEIGHTS[i] ?? 0)
  }

  const remainder = sum % 31
  const checkValue = remainder === 0 ? 0 : 31 - remainder
  return CHAR_MAP[checkValue] ?? ''
}

/**
 * 生成有效的 9 位组织机构代码段。
 *
 * @return 9 位组织机构代码段。
 */
function generateOrganizationCodeSegment(): string {
  let body = ''
  for (let i = 0; i < 8; i++) {
    body += CHAR_MAP[Math.floor(Math.random() * CHAR_MAP.length)]
  }

  let sum = 0
  for (let i = 0; i < body.length; i++) {
    const idx = ORGANIZATION_CODE_CHAR_VALUES.indexOf(body[i] ?? '')
    sum += idx * (ORGANIZATION_CODE_WEIGHTS[i] ?? 0)
  }

  const remainder = 11 - (sum % 11)
  const checkChar = remainder === 10 ? 'X' : remainder === 11 ? '0' : remainder === 12 ? '1' : String(remainder)

  return `${body}${checkChar}`
}

function validateCreditCode(code: string): { valid: boolean; message: string } {
  const cleaned = code.replace(/\s/g, '').toUpperCase()
  const valid = validateCreditCodeByLib(cleaned)
  return { valid, message: valid ? '校验通过' : '校验不通过' }
}

function generateOne(): string {
  let code = ''
  code += REGISTRATION_AUTHORITY_CODES[Math.floor(Math.random() * REGISTRATION_AUTHORITY_CODES.length)] ?? '9'
  code += ENTITY_TYPE_CODES[Math.floor(Math.random() * ENTITY_TYPE_CODES.length)] ?? '1'
  code += AREA_CODES[Math.floor(Math.random() * AREA_CODES.length)] ?? '110000'
  code += generateOrganizationCodeSegment()
  code += getCreditCodeCheckChar(code)
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

function copyCode(code: string) {
  navigator.clipboard.writeText(code).then(() => toast.success('已复制'))
}
</script>

<template>
  <ToolLayout title="企业信用代码">
    <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div class="p-5 glass-card">
        <h3 class="flex items-center gap-2 mb-4 font-semibold text-slate-800">
          <CheckCircleIcon class="w-5 h-5 text-accent" />
          校验信用代码
        </h3>
        <input
          v-model="validateInput"
          class="w-full px-4 py-3 font-mono tracking-wider glass-input"
          placeholder="输入18位统一社会信用代码..."
          maxlength="18"
        />
        <div v-if="validationResult" class="flex items-start gap-3 p-3 mt-4 border rounded-xl"
          :class="validationResult.valid
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-rose-50 border-rose-200 text-rose-700'">
          <CheckCircleIcon v-if="validationResult.valid" class="w-5 h-5 flex-shrink-0 mt-0.5" />
          <XCircleIcon v-else class="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span class="text-sm">{{ validationResult.message }}</span>
        </div>
        <div v-else class="p-3 mt-4 text-xs border rounded-xl bg-slate-50 border-slate-200 text-slate-400">
          代码格式：18 位数字 + 大写英文字母（不含 I、O、S、V、Z）
        </div>
      </div>

      <div class="p-5 glass-card">
        <h3 class="flex items-center gap-2 mb-4 font-semibold text-slate-800">
          <BuildingOfficeIcon class="w-5 h-5 text-accent" />
          生成信用代码
        </h3>
        <div class="flex items-end gap-3">
          <div class="flex-1">
            <label class="text-slate-500 text-xs block mb-1.5">生成数量</label>
            <input v-model.number="genCount" type="number" min="1" max="50" class="w-full px-3 py-2 glass-input" />
          </div>
          <button class="flex items-center gap-2 cursor-pointer btn-primary" @click="generate">
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

      <div v-if="generatedCodes.length > 0" class="p-5 glass-card lg:col-span-2">
        <div class="flex items-center justify-between mb-3">
          <h3 class="flex items-center gap-2 font-semibold text-slate-800">
            <span class="w-1 h-4 rounded-full bg-accent" />
            生成结果
            <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">{{ generatedCodes.length }}</span>
          </h3>
          <button class="flex items-center gap-2 cursor-pointer btn-secondary" @click="copyGenerated">
            <ClipboardDocumentIcon class="w-4 h-4" />
            复制全部
          </button>
        </div>
        <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
          <div
            v-for="(code, i) in generatedCodes" :key="i"
            class="px-3 py-2 font-mono text-sm tracking-wider transition-colors border rounded-lg cursor-pointer bg-slate-50 border-slate-200 text-slate-700 hover:bg-accent/5 hover:border-accent/30"
            @click="copyCode(code)"
          >{{ code }}</div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
