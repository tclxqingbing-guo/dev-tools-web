<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import { IdentificationIcon, ClipboardDocumentIcon } from '@heroicons/vue/24/outline'
import { useToast } from '../../composables/useToast'

const toast = useToast()

const REGIONS: Record<string, string[]> = {
  '110000': ['北京市'],
  '110100': ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '门头沟区', '房山区', '通州区', '顺义区', '昌平区', '大兴区', '怀柔区', '平谷区', '密云区', '延庆区'],
  '310000': ['上海市'],
  '310100': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '闵行区', '宝山区', '嘉定区', '浦东新区', '金山区', '松江区', '青浦区', '奉贤区', '崇明区'],
  '440000': ['广东省'],
  '440100': ['广州市'],
  '440300': ['深圳市'],
  '440600': ['佛山市'],
  '510000': ['四川省'],
  '510100': ['成都市'],
  '510300': ['自贡市'],
  '330000': ['浙江省'],
  '330100': ['杭州市'],
  '330200': ['宁波市'],
  '330300': ['温州市'],
}

const provinceOptions = [
  { code: '110000', name: '北京' },
  { code: '310000', name: '上海' },
  { code: '440000', name: '广东' },
  { code: '510000', name: '四川' },
  { code: '330000', name: '浙江' },
]

const cityMap: Record<string, { code: string; name: string }[]> = {
  '110000': [{ code: '110100', name: '北京市' }],
  '310000': [{ code: '310100', name: '上海市' }],
  '440000': [
    { code: '440100', name: '广州市' },
    { code: '440300', name: '深圳市' },
    { code: '440600', name: '佛山市' },
  ],
  '510000': [
    { code: '510100', name: '成都市' },
    { code: '510300', name: '自贡市' },
  ],
  '330000': [
    { code: '330100', name: '杭州市' },
    { code: '330200', name: '宁波市' },
    { code: '330300', name: '温州市' },
  ],
}

const WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
const CHECK_CODES = '10X98765432'

const province = ref('110000')
const city = ref('110100')
const gender = ref<'male' | 'female'>('male')
const ageMin = ref(25)
const ageMax = ref(45)
const count = ref(1)
const validateInput = ref('')
const generatedIds = ref<string[]>([])

const cityOptions = computed(() => cityMap[province.value] ?? [])

watch(province, (p) => {
  const cities = cityMap[p]
  if (cities?.length) {
    const first = cities[0]
    if (first) city.value = first.code
  }
})

function validateIdCard(id: string): { valid: boolean; message: string } {
  const cleaned = id.replace(/\s/g, '')
  if (!/^\d{17}[\dXx]$/.test(cleaned)) {
    return { valid: false, message: '格式错误：应为18位数字或17位数字+X' }
  }
  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(cleaned[i] ?? '0', 10) * (WEIGHTS[i] ?? 0)
  }
  const checkIndex = sum % 11
  const expectedCheck = CHECK_CODES[checkIndex]
  const actualCheck = (cleaned[17] ?? '').toUpperCase()
  if (actualCheck !== expectedCheck) {
    return { valid: false, message: `校验位错误：应为 ${expectedCheck}，实际为 ${actualCheck}` }
  }
  const birthStr = cleaned.slice(6, 14)
  const year = parseInt(birthStr.slice(0, 4), 10)
  const month = parseInt(birthStr.slice(4, 6), 10)
  const day = parseInt(birthStr.slice(6, 8), 10)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return { valid: false, message: '出生日期无效' }
  }
  const order = parseInt(cleaned[16] ?? '0', 10)
  const isMale = order % 2 === 1
  return { valid: true, message: `校验通过，${isMale ? '男' : '女'}` }
}

function randomDate(minAge: number, maxAge: number): string {
  const now = new Date()
  const maxYear = now.getFullYear() - minAge
  const minYear = now.getFullYear() - maxAge
  const year = minYear + Math.floor(Math.random() * (maxYear - minYear + 1))
  const month = 1 + Math.floor(Math.random() * 12)
  const daysInMonth = new Date(year, month, 0).getDate()
  const day = 1 + Math.floor(Math.random() * daysInMonth)
  return (
    String(year) +
    String(month).padStart(2, '0') +
    String(day).padStart(2, '0')
  )
}

function generateOne(): string {
  const region = city.value
  const birth = randomDate(ageMin.value, ageMax.value)
  const orderBase = Math.floor(Math.random() * 500) + 1
  const order = gender.value === 'male' ? orderBase * 2 - 1 : orderBase * 2
  const orderStr = String(order).padStart(3, '0')
  const first17 = region + birth + orderStr
  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(first17[i] ?? '0', 10) * (WEIGHTS[i] ?? 0)
  }
  const checkIndex = sum % 11
  const checkChar = CHECK_CODES[checkIndex] ?? ''
  return first17 + checkChar
}

function generate() {
  const ids: string[] = []
  for (let i = 0; i < count.value; i++) {
    ids.push(generateOne())
  }
  generatedIds.value = ids
  toast.success(`已生成 ${ids.length} 个`)
}

const validationResult = computed(() => {
  if (!validateInput.value.trim()) return null
  return validateIdCard(validateInput.value)
})

function copyGenerated() {
  if (generatedIds.value.length === 0) return
  navigator.clipboard.writeText(generatedIds.value.join('\n')).then(() => toast.success('已复制'))
}
</script>

<template>
  <ToolLayout title="身份证生成器">
    <div class="space-y-6">
      <div class="glass-card p-5">
        <h3 class="text-slate-800 font-medium mb-4">生成参数</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-slate-500 text-sm mb-2">省份</label>
            <select v-model="province" class="glass-input px-4 py-3 w-full cursor-pointer">
              <option v-for="p in provinceOptions" :key="p.code" :value="p.code">{{ p.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-slate-500 text-sm mb-2">城市</label>
            <select v-model="city" class="glass-input px-4 py-3 w-full cursor-pointer">
              <option v-for="c in cityOptions" :key="c.code" :value="c.code">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-slate-500 text-sm mb-2">性别</label>
            <select v-model="gender" class="glass-input px-4 py-3 w-full cursor-pointer">
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
          <div>
            <label class="block text-slate-500 text-sm mb-2">年龄范围</label>
            <div class="flex gap-2">
              <input v-model.number="ageMin" type="number" min="1" max="120" class="glass-input px-4 py-3 flex-1" />
              <span class="text-slate-500 self-center">-</span>
              <input v-model.number="ageMax" type="number" min="1" max="120" class="glass-input px-4 py-3 flex-1" />
            </div>
          </div>
          <div>
            <label class="block text-slate-500 text-sm mb-2">生成数量</label>
            <input v-model.number="count" type="number" min="1" max="100" class="glass-input px-4 py-3 w-full" />
          </div>
        </div>
        <button class="btn-primary mt-4 flex items-center gap-2 cursor-pointer" @click="generate">
          <IdentificationIcon class="w-4 h-4" />
          生成
        </button>
      </div>

      <div v-if="generatedIds.length > 0" class="glass-card p-5">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-slate-800 font-medium">生成结果</h3>
          <button class="btn-secondary flex items-center gap-2 cursor-pointer" @click="copyGenerated">
            <ClipboardDocumentIcon class="w-4 h-4" />
            复制
          </button>
        </div>
        <div class="space-y-1 font-mono text-sm">
          <div v-for="(id, i) in generatedIds" :key="i" class="text-slate-300">{{ id }}</div>
        </div>
      </div>

      <div class="glass-card p-5">
        <h3 class="text-slate-800 font-medium mb-4">校验身份证号</h3>
        <div class="flex gap-3">
          <input
            v-model="validateInput"
            class="glass-input px-4 py-3 flex-1"
            placeholder="输入18位身份证号校验..."
          />
        </div>
        <div v-if="validationResult" class="mt-3 text-sm" :class="validationResult.valid ? 'text-accent' : 'text-red-400'">
          {{ validationResult.message }}
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
