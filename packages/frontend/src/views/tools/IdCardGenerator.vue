<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import {
  IdentificationIcon,
  ClipboardDocumentIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  HashtagIcon,
  ArrowPathIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
} from '@heroicons/vue/24/outline'
import { useToast } from '../../composables/useToast'
import { provinces, cities } from '../../data/areaData'

const toast = useToast()

type AreaItem = { cityId: string; cityName: string }

function flattenAreas(arr: unknown[]): AreaItem[] {
  const result: AreaItem[] = []
  for (const item of arr) {
    if (item && typeof item === 'object' && 'cityId' in item && 'cityName' in item) {
      result.push({ cityId: (item as AreaItem).cityId, cityName: (item as AreaItem).cityName })
    } else if (item && typeof item === 'object') {
      for (const key of Object.keys(item as object)) {
        const val = (item as Record<string, unknown>)[key]
        if (Array.isArray(val)) result.push(...flattenAreas(val))
      }
    }
  }
  return result
}

function shortenProvinceName(name: string): string {
  return name
    .replace(/省$/, '')
    .replace(/市$/, '')
    .replace(/自治区$/, '')
    .replace(/特别行政区$/, '')
}

const provinceOptions: { code: string; name: string }[] = []
const cityMap: Record<string, { code: string; name: string }[]> = {}
const regionNameMap: Record<string, string> = {}
const provinceNameMap: Record<string, string> = {}

for (const provinceName of provinces) {
  const arr = cities[provinceName as keyof typeof cities]
  if (!Array.isArray(arr)) continue
  const all = flattenAreas(arr)
  const provinceEntry = all.find((e) => e.cityId.endsWith('0000')) ?? all[0]
  if (!provinceEntry) continue
  provinceOptions.push({
    code: provinceEntry.cityId,
    name: shortenProvinceName(provinceEntry.cityName),
  })
  cityMap[provinceEntry.cityId] = all.map((e) => ({ code: e.cityId, name: e.cityName }))
  for (const e of all) {
    regionNameMap[e.cityId] = e.cityName
    provinceNameMap[e.cityId] = provinceEntry.cityName
  }
}

function lookupRegion(idCode: string): string {
  return (
    regionNameMap[idCode] ??
    regionNameMap[idCode.slice(0, 4) + '00'] ??
    regionNameMap[idCode.slice(0, 2) + '0000'] ??
    '未知地区'
  )
}

const firstProvinceCode = provinceOptions[0]?.code ?? '110000'
const firstCityCode = cityMap[firstProvinceCode]?.[0]?.code ?? '110100'

const WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
const CHECK_CODES = '10X98765432'
const COUNT_PRESETS = [1, 5, 10, 50]

const province = ref(firstProvinceCode)
const city = ref(firstCityCode)
const gender = ref<'male' | 'female'>('male')
const ageMin = ref(25)
const ageMax = ref(45)
const count = ref(1)
const validateInput = ref('')
const generatedIds = ref<string[]>([])

const cityOptions = computed(() => cityMap[province.value] ?? [])

const currentProvinceName = computed(
  () => provinceOptions.find((p) => p.code === province.value)?.name ?? '',
)
const currentCityName = computed(
  () => cityOptions.value.find((c) => c.code === city.value)?.name ?? '',
)

watch(province, (p) => {
  const cs = cityMap[p]
  if (cs?.length) {
    const first = cs[0]
    if (first) city.value = first.code
  }
})

watch([ageMin, ageMax], ([min, max]) => {
  if (min > max) ageMin.value = max
  if (max < min) ageMax.value = min
})

type ParsedId = {
  raw: string
  region: string
  birth: string
  age: number
  gender: '男' | '女'
}

function parseIdCard(id: string): ParsedId {
  const region = lookupRegion(id.slice(0, 6))
  const y = id.slice(6, 10)
  const m = id.slice(10, 12)
  const d = id.slice(12, 14)
  const order = parseInt(id[16] ?? '0', 10)
  const now = new Date()
  let age = now.getFullYear() - parseInt(y, 10)
  const birthDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10))
  const beforeBirthday =
    now.getMonth() < birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate())
  if (beforeBirthday) age -= 1
  return {
    raw: id,
    region,
    birth: `${y}-${m}-${d}`,
    age,
    gender: order % 2 === 1 ? '男' : '女',
  }
}

type ValidateResult = {
  valid: boolean
  message: string
  detail?: ParsedId & { checkCode: string }
}

function validateIdCard(id: string): ValidateResult {
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
  const parsed = parseIdCard(cleaned.slice(0, 17) + (expectedCheck ?? ''))
  return {
    valid: true,
    message: '校验通过',
    detail: { ...parsed, checkCode: expectedCheck ?? '' },
  }
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

function resetParams() {
  province.value = firstProvinceCode
  city.value = firstCityCode
  gender.value = 'male'
  ageMin.value = 25
  ageMax.value = 45
  count.value = 1
}

const parsedList = computed(() => generatedIds.value.map((id) => parseIdCard(id)))

const validationResult = computed(() => {
  if (!validateInput.value.trim()) return null
  return validateIdCard(validateInput.value)
})

function copyGenerated() {
  if (generatedIds.value.length === 0) return
  navigator.clipboard.writeText(generatedIds.value.join('\n')).then(() => toast.success('已复制全部'))
}

function copyOne(id: string) {
  navigator.clipboard.writeText(id).then(() => toast.success('已复制'))
}

function clearGenerated() {
  generatedIds.value = []
  toast.success('已清空')
}

function exportTxt() {
  if (generatedIds.value.length === 0) return
  const blob = new Blob([generatedIds.value.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `id-cards-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('已导出')
}

function clearValidate() {
  validateInput.value = ''
}

function formatId(id: string): { a: string; b: string; c: string } {
  return { a: id.slice(0, 6), b: id.slice(6, 14), c: id.slice(14) }
}
</script>

<template>
  <ToolLayout title="身份证生成器">
    <div class="space-y-5">
      <!-- 顶部统计条 -->
      <div class="glass-card px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <div class="flex items-center gap-2">
          <SparklesIcon class="w-4 h-4 text-accent" />
          <span class="text-slate-500">已生成</span>
          <span class="font-semibold text-slate-800">{{ generatedIds.length }}</span>
          <span class="text-slate-500">个</span>
        </div>
        <div class="h-4 w-px bg-slate-200" />
        <div class="flex items-center gap-2 text-slate-600">
          <MapPinIcon class="w-4 h-4 text-slate-400" />
          {{ currentProvinceName }} · {{ currentCityName }}
        </div>
        <div class="h-4 w-px bg-slate-200" />
        <div class="flex items-center gap-2 text-slate-600">
          <UserIcon class="w-4 h-4 text-slate-400" />
          {{ gender === 'male' ? '男' : '女' }}
        </div>
        <div class="h-4 w-px bg-slate-200" />
        <div class="flex items-center gap-2 text-slate-600">
          <CalendarIcon class="w-4 h-4 text-slate-400" />
          {{ ageMin }} - {{ ageMax }} 岁
        </div>
      </div>

      <!-- 双栏 -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <!-- 左：参数 + 校验 -->
        <div class="lg:col-span-2 space-y-5">
          <div class="glass-card p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-slate-800 font-semibold flex items-center gap-2">
                <IdentificationIcon class="w-5 h-5 text-accent" />
                生成参数
              </h3>
              <button
                class="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors flex items-center gap-1 text-xs"
                @click="resetParams"
              >
                <ArrowPathIcon class="w-3.5 h-3.5" />
                重置
              </button>
            </div>

            <div class="space-y-4">
              <!-- 省/市 -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="flex items-center gap-1.5 text-slate-500 text-xs mb-1.5">
                    <MapPinIcon class="w-3.5 h-3.5" /> 省份
                  </label>
                  <select v-model="province" class="glass-input px-3 py-2.5 w-full cursor-pointer text-sm">
                    <option v-for="p in provinceOptions" :key="p.code" :value="p.code">{{ p.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="flex items-center gap-1.5 text-slate-500 text-xs mb-1.5">
                    <MapPinIcon class="w-3.5 h-3.5" /> 城市
                  </label>
                  <select v-model="city" class="glass-input px-3 py-2.5 w-full cursor-pointer text-sm">
                    <option v-for="c in cityOptions" :key="c.code" :value="c.code">{{ c.name }}</option>
                  </select>
                </div>
              </div>

              <!-- 性别分段控件 -->
              <div>
                <label class="flex items-center gap-1.5 text-slate-500 text-xs mb-1.5">
                  <UserIcon class="w-3.5 h-3.5" /> 性别
                </label>
                <div class="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    class="py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
                    :class="gender === 'male' ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                    @click="gender = 'male'"
                  >男</button>
                  <button
                    type="button"
                    class="py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
                    :class="gender === 'female' ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                    @click="gender = 'female'"
                  >女</button>
                </div>
              </div>

              <!-- 年龄滑块 -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="flex items-center gap-1.5 text-slate-500 text-xs">
                    <CalendarIcon class="w-3.5 h-3.5" /> 年龄范围
                  </label>
                  <span class="text-xs text-slate-700 font-mono">{{ ageMin }} - {{ ageMax }} 岁</span>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="space-y-1">
                    <input
                      v-model.number="ageMin"
                      type="range" min="1" max="120"
                      class="w-full accent-accent cursor-pointer"
                    />
                    <input
                      v-model.number="ageMin"
                      type="number" min="1" max="120"
                      class="glass-input px-3 py-1.5 w-full text-sm text-center"
                    />
                  </div>
                  <div class="space-y-1">
                    <input
                      v-model.number="ageMax"
                      type="range" min="1" max="120"
                      class="w-full accent-accent cursor-pointer"
                    />
                    <input
                      v-model.number="ageMax"
                      type="number" min="1" max="120"
                      class="glass-input px-3 py-1.5 w-full text-sm text-center"
                    />
                  </div>
                </div>
              </div>

              <!-- 数量 + 预设 -->
              <div>
                <label class="flex items-center gap-1.5 text-slate-500 text-xs mb-1.5">
                  <HashtagIcon class="w-3.5 h-3.5" /> 生成数量
                </label>
                <div class="flex items-center gap-2">
                  <button
                    class="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors"
                    @click="count = Math.max(1, count - 1)"
                  >−</button>
                  <input
                    v-model.number="count"
                    type="number" min="1" max="100"
                    class="glass-input px-3 py-2 flex-1 text-center text-sm"
                  />
                  <button
                    class="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors"
                    @click="count = Math.min(100, count + 1)"
                  >+</button>
                </div>
                <div class="flex gap-2 mt-2">
                  <button
                    v-for="n in COUNT_PRESETS" :key="n"
                    class="flex-1 py-1 text-xs rounded-md border transition-colors cursor-pointer"
                    :class="count === n
                      ? 'bg-accent/10 border-accent/40 text-accent'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'"
                    @click="count = n"
                  >{{ n }}</button>
                </div>
              </div>
            </div>

            <button
              class="btn-primary mt-5 w-full flex items-center justify-center gap-2 py-3 text-base shadow-sm shadow-accent/20"
              @click="generate"
            >
              <SparklesIcon class="w-5 h-5" />
              立即生成
            </button>
          </div>

          <!-- 校验区 -->
          <div class="glass-card p-5">
            <h3 class="text-slate-800 font-semibold mb-3 flex items-center gap-2">
              <CheckCircleIcon class="w-5 h-5 text-accent" />
              校验身份证号
            </h3>
            <div class="relative">
              <input
                v-model="validateInput"
                class="glass-input pl-3 pr-9 py-2.5 w-full text-sm font-mono"
                placeholder="输入18位身份证号..."
              />
              <button
                v-if="validateInput"
                class="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center"
                @click="clearValidate"
              >
                <XCircleIcon class="w-4 h-4" />
              </button>
            </div>

            <div v-if="validationResult" class="mt-3">
              <div
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                :class="validationResult.valid
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-red-50 text-red-600 border border-red-200'"
              >
                <CheckCircleIcon v-if="validationResult.valid" class="w-3.5 h-3.5" />
                <XCircleIcon v-else class="w-3.5 h-3.5" />
                {{ validationResult.message }}
              </div>

              <div
                v-if="validationResult.valid && validationResult.detail"
                class="mt-3 grid grid-cols-2 gap-2 text-xs"
              >
                <div class="bg-slate-50 rounded-lg px-3 py-2">
                  <div class="text-slate-400">籍贯</div>
                  <div class="text-slate-700 mt-0.5">{{ validationResult.detail.region }}</div>
                </div>
                <div class="bg-slate-50 rounded-lg px-3 py-2">
                  <div class="text-slate-400">出生日期</div>
                  <div class="text-slate-700 mt-0.5 font-mono">{{ validationResult.detail.birth }}</div>
                </div>
                <div class="bg-slate-50 rounded-lg px-3 py-2">
                  <div class="text-slate-400">性别 / 年龄</div>
                  <div class="text-slate-700 mt-0.5">
                    {{ validationResult.detail.gender }} · {{ validationResult.detail.age }} 岁
                  </div>
                </div>
                <div class="bg-slate-50 rounded-lg px-3 py-2">
                  <div class="text-slate-400">校验位</div>
                  <div class="text-slate-700 mt-0.5 font-mono">{{ validationResult.detail.checkCode }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右：结果 -->
        <div class="lg:col-span-3">
          <div class="glass-card p-5 h-full flex flex-col">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-slate-800 font-semibold flex items-center gap-2">
                <IdentificationIcon class="w-5 h-5 text-accent" />
                生成结果
                <span v-if="generatedIds.length" class="text-xs text-slate-400 font-normal">
                  共 {{ generatedIds.length }} 条
                </span>
              </h3>
              <div v-if="generatedIds.length" class="flex items-center gap-2">
                <button class="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1" @click="copyGenerated">
                  <ClipboardDocumentIcon class="w-3.5 h-3.5" /> 全部复制
                </button>
                <button class="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1" @click="exportTxt">
                  <ArrowDownTrayIcon class="w-3.5 h-3.5" /> 导出
                </button>
                <button
                  class="!py-1.5 !px-3 text-xs flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 cursor-pointer transition-colors"
                  @click="clearGenerated"
                >
                  <TrashIcon class="w-3.5 h-3.5" /> 清空
                </button>
              </div>
            </div>

            <!-- 空状态 -->
            <div
              v-if="generatedIds.length === 0"
              class="flex-1 flex flex-col items-center justify-center py-16 text-center"
            >
              <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <IdentificationIcon class="w-8 h-8 text-slate-300" />
              </div>
              <div class="text-slate-500 text-sm">暂无生成记录</div>
              <div class="text-slate-400 text-xs mt-1">设置左侧参数后点击「立即生成」</div>
            </div>

            <!-- 结果列表 -->
            <transition-group
              v-else
              name="fade-slide"
              tag="div"
              class="space-y-2 flex-1 overflow-auto pr-1"
            >
              <div
                v-for="(item, i) in parsedList"
                :key="item.raw + i"
                class="group bg-white border border-slate-200 hover:border-accent/40 hover:shadow-sm transition-all rounded-xl px-4 py-3 flex items-center gap-4"
              >
                <div class="flex-shrink-0 w-7 h-7 rounded-md bg-slate-50 text-slate-400 text-xs flex items-center justify-center font-mono">
                  {{ i + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-sm tracking-wide flex items-baseline gap-1">
                    <span class="text-accent">{{ formatId(item.raw).a }}</span>
                    <span class="text-slate-700">{{ formatId(item.raw).b }}</span>
                    <span class="text-slate-500">{{ formatId(item.raw).c }}</span>
                  </div>
                  <div class="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                    <span class="flex items-center gap-1"><MapPinIcon class="w-3 h-3" />{{ item.region }}</span>
                    <span class="flex items-center gap-1"><CalendarIcon class="w-3 h-3" />{{ item.birth }}</span>
                    <span class="flex items-center gap-1"><UserIcon class="w-3 h-3" />{{ item.gender }} · {{ item.age }} 岁</span>
                  </div>
                </div>
                <button
                  class="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-accent cursor-pointer flex items-center justify-center"
                  title="复制"
                  @click="copyOne(item.raw)"
                >
                  <ClipboardDocumentIcon class="w-4 h-4" />
                </button>
              </div>
            </transition-group>
          </div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(8px);
}
</style>
