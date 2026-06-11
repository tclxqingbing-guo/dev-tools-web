<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { compressImage } from 'bx-utils'
import ToolLayout from '../../components/ToolLayout.vue'
import { useToast } from '../../composables/useToast'
import { useApi } from '../../composables/useApi'
import {
  ArrowPathIcon,
  ClipboardDocumentIcon,
  DocumentMagnifyingGlassIcon,
  DocumentTextIcon,
  IdentificationIcon,
  PhotoIcon,
  SparklesIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

type ParseTab = 'document' | 'text'

interface ParsedRecord {
  key: string
  name: string
  gender: string
  card_type: string
  card_no: string
  valid_date: string
  birthday: string
}

interface UsageStats {
  durationMs: number
  promptTokens: number
  completionTokens: number
  totalTokens: number
  model: string
  cost: number | null
  costNote: string
}

interface PriceSegment {
  promptPrice: number
  completionPrice: number
  promptMin?: number
  promptMax?: number
  completionMin?: number
  completionMax?: number
}

interface PricingConfig {
  segments: PriceSegment[]
  note?: string
}

interface VisionModelConfig {
  value: string
  label: string
  supportsThinking: boolean
  priceLabel: string
  pricing: PricingConfig
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
  model?: string
}

const TEXT_MODEL = 'deepseek-v4-flash'
const TEXT_MODEL_PRICE_LABEL = '输入 ¥0.95 / 1M Token · 输出 ¥1.9 / 1M Token'
const TEXT_MODEL_PRICING: PricingConfig = {
  segments: [{ promptPrice: 0.00000095, completionPrice: 0.0000019 }],
}

/** 文本解析切片阈值：每行不超过此字符数，否则报错 */
const SLICE_LINE_MAX_CHARS = 300
/** 每组最多行数，超过则开启新组 */
const MAX_LINES_PER_SLICE = 5
/** 单组最大字符数，超出发起新组 */
const MAX_CHARS_PER_SLICE = SLICE_LINE_MAX_CHARS
/** 文本解析并发令牌桶大小 */
const TEXT_CONCURRENT_LIMIT = 10

const DOCUMENT_MODELS: VisionModelConfig[] = [
  {
    value: 'qwen3-vl-plus',
    label: 'Qwen3-VL-Plus',
    supportsThinking: false,
    priceLabel: '输入 ¥0.8 / 1M Token · 输出 ¥2 / 1M Token',
    pricing: {
      segments: [{ promptPrice: 0.0000008, completionPrice: 0.000002 }],
    },
  },
  {
    value: 'qwen3-vl-flash',
    label: 'Qwen3-VL-Flash',
    supportsThinking: false,
    priceLabel: '输入 ¥0.15 / 1M Token · 输出 ¥1.5 / 1M Token',
    pricing: {
      segments: [{ promptPrice: 0.00000015, completionPrice: 0.0000015 }],
    },
  },
  {
    value: 'qwen3.6-flash',
    label: 'Qwen3.6-Flash',
    supportsThinking: true,
    priceLabel: '输入 ¥1.08 / 1M Token · 输出 ¥6.48 / 1M Token',
    pricing: {
      segments: [
        { promptMax: 256000, promptPrice: 0.00000108, completionPrice: 0.00000648 },
      ],
      note: '仅展示 ≤256K 档位',
    },
  },
  {
    value: 'doubao-seed-1.6-vision',
    label: 'Doubao-Seed-1.6-Vision',
    supportsThinking: true,
    priceLabel: '阶梯计费：<=32K 输入 ¥0.8 / 1M、输出 ¥8 / 1M；32K-128K 输入 ¥1.2 / 1M、输出 ¥16 / 1M；>128K 输入 ¥2.4 / 1M、输出 ¥24 / 1M',
    pricing: {
      segments: [
        { promptMax: 32000, promptPrice: 0.0000008, completionPrice: 0.000008 },
        { promptMin: 32001, promptMax: 128000, promptPrice: 0.0000012, completionPrice: 0.000016 },
        { promptMin: 128001, promptPrice: 0.0000024, completionPrice: 0.000024 },
      ],
      // note: '按本次请求命中的档位估算',
    },
  },
  {
    value: 'kimi-k2.6',
    label: 'Kimi-K2.6',
    supportsThinking: true,
    priceLabel: '输入 ¥6.5 / 1M Token · 输出 ¥27 / 1M Token',
    pricing: {
      segments: [{ promptPrice: 0.0000065, completionPrice: 0.000027 }],
    },
  },
  {
    value: 'doubao-seed-2.0-pro',
    label: 'Doubao-Seed-2.0-Pro',
    supportsThinking: true,
    priceLabel: '输入 ¥3.2 / 1M Token · 输出 ¥16 / 1M Token',
    pricing: {
      segments: [{ promptPrice: 0.0000032, completionPrice: 0.000016 }],
    },
  },
  {
    value: 'doubao-seed-2.0-lite',
    label: 'Doubao-Seed-2.0-Lite',
    supportsThinking: true,
    priceLabel: '输入 ¥0.6 / 1M Token · 输出 ¥3.6 / 1M Token',
    pricing: {
      segments: [{ promptPrice: 0.0000006, completionPrice: 0.0000036 }],
    },
  },
]

const DEFAULT_DOCUMENT_MODEL_CONFIG = DOCUMENT_MODELS.find(
  (model) => model.value === 'doubao-seed-1.6-vision',
) || DOCUMENT_MODELS[0]!

const DEFAULT_DOCUMENT_PROMPT = `请仔细分析这张图片中的证件或证件相关记录，图片可能是：真实证件、手写登记内容、Excel/表格截图、聊天截图、表单、照片墙，或同一张图里包含多个人的证件信息。

请提取每一条可识别的人员证件信息，并输出 JSON 数组。每个对象包含以下字段：
1. name：姓名
2. gender：性别
3. card_type：证件类型，只能是 身份证、中国护照、外国护照、港澳通行证、台胞证，如果无法判断返回 "-"
4. card_no：证件号码
5. valid_date：证件有效期截止日期，如果图片里是区间，请取截止日期；没有则返回 "-"
6. birthday：出生日期，没有则返回 "-"

处理规则：
- 图片里可能包含 1 条或多条记录，请全部提取。
- 不要求一定是真实证件本体，只要图片中出现了明确的姓名、证件号、有效期、出生日期等信息，就按记录提取。
- 可以结合字段标题、表格列名、上下文和证件号码格式判断 card_type。
- 如果字段不存在、不清晰或无法可靠判断，返回 "-"。
- 所有日期统一转成 yyyy-MM-dd。
- 只返回 JSON 数组，不要返回解释、Markdown 或代码块。`

const DEFAULT_TEXT_PROMPT = `请从用户提供的文本中提取一条或多条证件相关信息，并输出 JSON 数组。

每个对象包含以下字段：
1. name：姓名
2. gender：性别
3. card_type：证件类型，只能是 身份证、中国护照、外国护照、港澳通行证、台胞证，如果无法判断返回 "-"
4. card_no：证件号码
5. valid_date：证件有效期截止日期，没有则返回 "-"
6. birthday：出生日期，没有则返回 "-"

处理规则：
- 文本可能来自 OCR、Excel、聊天记录、人工整理、手写转录或多行混合内容。
- 文本里可能包含 1 条或多条记录，请全部提取。
- 可以结合字段名、上下文、证件号码格式和常见证件规则判断 card_type。
- 如果某项缺失、模糊或无法可靠判断，返回 "-"。
- 所有日期统一转成 yyyy-MM-dd。
- 只返回 JSON 数组，不要返回解释、Markdown 或代码块。`

const SAMPLE_TEXT_PLACEHOLDER = `例如：
张三 男 310101198001015898
李四 中国护照 E65895133 有效期 2029/12/15 出生日期 1994年7月11日
王五 女 港澳通行证 C12345678`

const toast = useToast()
const api = useApi()

const activeTab = ref<ParseTab>('document')

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const showFullscreen = ref(false)
const documentSourceFile = ref<File | null>(null)
const imageDataUrl = ref('')
const selectedDocumentModel = ref(DEFAULT_DOCUMENT_MODEL_CONFIG.value)
const documentPrompt = ref(DEFAULT_DOCUMENT_PROMPT)
const documentLoading = ref(false)
const documentResults = ref<ParsedRecord[]>([])
const documentRawOutput = ref('')
const documentStats = ref<UsageStats | null>(null)

const textInput = ref('')
const textPrompt = ref(DEFAULT_TEXT_PROMPT)
const textLoading = ref(false)
const textResults = ref<ParsedRecord[]>([])
const textRawOutput = ref('')
const textStats = ref<UsageStats | null>(null)
/** 文本解析步骤状态：slicing → processing:0/N → processing:N/N → done */
const textStep = ref<{ phase: string; label: string }>({
  phase: 'idle',
  label: '',
})

const currentResults = computed(() => (
  activeTab.value === 'document' ? documentResults.value : textResults.value
))

const currentRawOutput = computed(() => (
  activeTab.value === 'document' ? documentRawOutput.value : textRawOutput.value
))

const currentStats = computed(() => (
  activeTab.value === 'document' ? documentStats.value : textStats.value
))

const selectedDocumentModelConfig = computed<VisionModelConfig>(() => (
  DOCUMENT_MODELS.find((model) => model.value === selectedDocumentModel.value) ?? DEFAULT_DOCUMENT_MODEL_CONFIG
))

const documentModelLabel = computed(() => selectedDocumentModelConfig.value.label)

const currentJson = computed(() => JSON.stringify(
  currentResults.value.map(({ key, ...record }) => record),
  null,
  2,
))

/**
 * 根据 token 区间挑选当前请求命中的计费档位。
 *
 * @param pricing 计费配置。
 * @param promptTokens 输入 token 数。
 * @param completionTokens 输出 token 数。
 * @return 命中的计费档位，未命中时返回 null。
 */
function pickPricingSegment(
  pricing: PricingConfig,
  promptTokens: number,
  completionTokens: number,
): PriceSegment | null {
  return pricing.segments.find((segment) => {
    const matchesPromptMin = segment.promptMin == null || promptTokens >= segment.promptMin
    const matchesPromptMax = segment.promptMax == null || promptTokens <= segment.promptMax
    const matchesCompletionMin = segment.completionMin == null || completionTokens >= segment.completionMin
    const matchesCompletionMax = segment.completionMax == null || completionTokens <= segment.completionMax

    return matchesPromptMin && matchesPromptMax && matchesCompletionMin && matchesCompletionMax
  }) ?? null
}

/**
 * 按模型计费配置估算单次请求花费。
 *
 * @param pricing 计费配置。
 * @param promptTokens 输入 token 数。
 * @param completionTokens 输出 token 数。
 * @return 估算花费，无法估算时返回 null。
 */
function calculateUsageCost(
  pricing: PricingConfig,
  promptTokens: number,
  completionTokens: number,
): number | null {
  const segment = pickPricingSegment(pricing, promptTokens, completionTokens)
  if (!segment) {
    return null
  }

  return Number((promptTokens * segment.promptPrice + completionTokens * segment.completionPrice).toFixed(8))
}

/**
 * 将花费数值格式化为更适合展示的金额字符串。
 *
 * @param cost 估算花费。
 * @return 去掉无意义尾零后的金额文本。
 */
function formatCost(cost: number): string {
  return cost.toFixed(6).replace(/\.?(0+)$/, '')
}

/**
 * 归一化模型返回的普通文本字段。
 *
 * @param input 原始字段值。
 * @return 清理后的字段内容，空值返回 "-"。
 */
function normalizeText(input: unknown): string {
  const value = String(input ?? '').trim()
  if (!value || value === 'null' || value === 'undefined') {
    return '-'
  }
  return value
}

/**
 * 将单个日期文本转成 yyyy-MM-dd。
 *
 * @param input 原始日期文本。
 * @return 标准化日期，无法识别时返回 "-"。
 */
function normalizeSingleDate(input: string): string {
  const compact = input.trim()
  if (/^\d{8}$/.test(compact)) {
    const year = compact.slice(0, 4)
    const month = compact.slice(4, 6)
    const day = compact.slice(6, 8)
    return `${year}-${month}-${day}`
  }

  const matched = compact.match(/(\d{4})[^\d]?(\d{1,2})[^\d]?(\d{1,2})/)
  if (!matched) {
    return '-'
  }

  const [, year = '', month = '', day = ''] = matched
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

/**
 * 提取并标准化模型输出中的日期字段。
 *
 * @param input 原始日期值。
 * @return 标准化日期，无法判断时返回 "-"。
 */
function normalizeDateValue(input: unknown): string {
  const value = normalizeText(input)
  if (value === '-' || /长期/.test(value)) {
    return '-'
  }

  const normalized = value.replace(/\s+/g, '')
  const dateMatches = normalized.match(/\d{4}[年./-]\d{1,2}[月./-]\d{1,2}日?/g) ?? []
  if (dateMatches.length > 0) {
    return normalizeSingleDate(dateMatches[dateMatches.length - 1] as string)
  }

  const compactMatches = normalized.match(/\d{8}/g) ?? []
  if (compactMatches.length > 0) {
    return normalizeSingleDate(compactMatches[compactMatches.length - 1] as string)
  }

  return '-'
}

/**
 * 在模型未稳定返回时，根据证件号补充最基础的证件类型推断。
 *
 * @param cardNo 证件号。
 * @param currentType 模型返回的证件类型。
 * @return 优先使用模型结果，缺失时再做有限推断。
 */
function normalizeCardType(cardNo: string, currentType: string): string {
  if (currentType !== '-') {
    return currentType
  }
  if (/^\d{17}[\dXx]$/.test(cardNo)) {
    return '身份证'
  }
  if (/^[EG]\d{8}$/i.test(cardNo)) {
    return '中国护照'
  }
  return '-'
}

/**
 * 在性别缺失时，基于身份证号码补充推断。
 *
 * @param gender 模型返回的性别。
 * @param cardNo 证件号。
 * @return 标准化后的性别。
 */
function normalizeGender(gender: unknown, cardNo: string): string {
  const value = normalizeText(gender)
  const lower = value.toLowerCase()
  if (['男', 'male', 'm'].includes(lower)) {
    return '男'
  }
  if (['女', 'female', 'f'].includes(lower)) {
    return '女'
  }
  if (value !== '-') {
    return value
  }
  if (/^\d{17}[\dXx]$/.test(cardNo)) {
    return Number(cardNo[16]) % 2 === 0 ? '女' : '男'
  }
  return '-'
}

/**
 * 从模型文本里截取 JSON 数组主体。
 *
 * @param content 模型原始输出。
 * @return 可解析的 JSON 文本，未找到时返回 null。
 */
function extractJsonBlock(content: string): string | null {
  const trimmed = content.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const source = fenced?.[1]?.trim() || trimmed
  if (source.startsWith('[') && source.endsWith(']')) {
    return source
  }
  return source.match(/\[[\s\S]*\]/)?.[0] ?? null
}

/**
 * 将模型输出标准化为页面展示用的结构化记录。
 *
 * @param content 模型原始输出。
 * @return 解析后的记录列表。
 */
function parseRecords(content: string): ParsedRecord[] {
  const jsonBlock = extractJsonBlock(content)
  if (!jsonBlock) {
    return []
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonBlock) as unknown
  } catch {
    return []
  }

  const list = Array.isArray(parsed)
    ? parsed
    : Array.isArray((parsed as { data?: unknown[] }).data)
      ? (parsed as { data: unknown[] }).data
      : Array.isArray((parsed as { records?: unknown[] }).records)
        ? (parsed as { records: unknown[] }).records
        : []

  return list.map((item, index) => {
    const record = item as Record<string, unknown>
    const cardNo = normalizeText(record.card_no)
    return {
      key: String(index),
      name: normalizeText(record.name),
      gender: normalizeGender(record.gender, cardNo),
      card_type: normalizeCardType(cardNo, normalizeText(record.card_type)),
      card_no: cardNo,
      valid_date: normalizeDateValue(record.valid_date),
      birthday: normalizeDateValue(record.birthday),
    }
  })
}

/**
 * 令牌桶并发控制器，用于限制文本切片解析的并发请求数。
 * 实现方式：Semaphore 计数器 + Promise 队列，最多同时 N 个 pending 请求。
 */
function createConcurrentExecutor(maxConcurrency: number) {
  let running = 0
  const queue: Array<() => Promise<void>> = []

  function drain() {
    while (running < maxConcurrency && queue.length > 0) {
      const task = queue.shift()!
      running += 1
      task().finally(() => {
        running -= 1
        drain()
      })
    }
  }

  return function execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      queue.push(async () => {
        try {
          resolve(await fn())
        } catch (e) {
          reject(e)
        } finally {
          drain()
        }
      })
      drain()
    })
  }
}

/** 文本解析并发执行器（最大 10 并发） */
const executeTextSlice = createConcurrentExecutor(TEXT_CONCURRENT_LIMIT)

/**
 * 校验输入文本格式：检查是否有行超过阈值。
 * @param text 用户输入的原始文本。
 * @return 分割后的非空行数组；如果存在超长行则抛出 Error。
 */
function validateTextInput(text: string): string[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const tooLongLines = lines.filter(l => l.length > SLICE_LINE_MAX_CHARS)
  if (tooLongLines.length > 0) {
    throw new Error(`内容格式错误：发现 ${tooLongLines.length} 行长超过 ${SLICE_LINE_MAX_CHARS} 字符，请确保每人信息在同一行且单行不超过 ${SLICE_LINE_MAX_CHARS} 字`)
  }
  return lines
}

/**
 * 将验证后的行数组切分为若干组。每组 ≤ MAX_LINES_PER_SLICE 行且总字符数 ≤ MAX_CHARS_PER_SLICE。
 * 当一行单独就 ≥ MAX_CHARS_PER_SLICE 时，仍会放入切片（但 API 可能因上下文不足报错）。
 *
 * @param lines 已验证的非空行数组。
 * @return 每组的字符串，包含换行分隔的原始行。
 */
function tokenizeInput(lines: string[]): string[] {
  if (lines.length === 0) return []

  const slices: string[] = []
  let currentGroup: string[] = []
  let currentChars = 0

  for (const line of lines) {
    const addedChars = line.length + 1 // include newline

    // Check if adding this line exceeds group size limits
    const wouldExceedLineCount = currentGroup.length >= MAX_LINES_PER_SLICE
    const wouldExceedCharLimit = currentChars + addedChars > MAX_CHARS_PER_SLICE

    if (wouldExceedLineCount || wouldExceedCharLimit) {
      // Finalize current group
      if (currentGroup.length > 0) {
        slices.push(currentGroup.join('\n'))
      }
      currentGroup = [line]
      currentChars = line.length
    } else {
      currentGroup.push(line)
      currentChars += addedChars
    }
  }

  // Push remaining group
  if (currentGroup.length > 0) {
    slices.push(currentGroup.join('\n'))
  }

  return slices
}

/**
 * 从多切片返回结果中合并并去重证件记录。
 * 去重依据：仅按证件号去重（同一证件号视为同一人）。
 */
function mergeResults(recordsList: ParsedRecord[][]): ParsedRecord[] {
  const seen = new Set<string>()
  const merged: ParsedRecord[] = []

  for (const records of recordsList) {
    for (const r of records) {
      const dedupKey = r.card_no !== '-' ? r.card_no : `${r.name}|${merged.length}`
      if (!seen.has(dedupKey)) {
        seen.add(dedupKey)
        merged.push(r)
      }
    }
  }

  return merged
}

/**
 * 从接口响应中提取 assistant 的文本输出。
 *
 * @param response Chat completion 响应。
 * @return 模型输出文本。
 */
function getAssistantContent(response: ChatCompletionResponse): string {
  return response.choices?.[0]?.message?.content?.trim() || ''
}

/**
 * 组装页面展示所需的 token 统计信息。
 *
 * @param response Chat completion 响应。
 * @param durationMs 本次请求耗时。
 * @param fallbackModel 当前页面预设模型。
 * @return 统计信息对象。
 */
function buildStats(
  response: ChatCompletionResponse,
  durationMs: number,
  fallbackModel: string,
  pricing?: PricingConfig,
): UsageStats {
  const promptTokens = response.usage?.prompt_tokens || 0
  const completionTokens = response.usage?.completion_tokens || 0
  const totalTokens = response.usage?.total_tokens || 0
  const cost = pricing ? calculateUsageCost(pricing, promptTokens, completionTokens) : null

  return {
    durationMs,
    promptTokens,
    completionTokens,
    totalTokens,
    model: response.model || fallbackModel,
    cost,
    costNote: pricing?.note || '',
  }
}

/**
 * 处理图片文件并转成 data URL 供视觉模型调用。
 *
 * @param file 用户选择的图片文件。
 * @return 无返回值。
 */
function processImageFile(file: File) {
  if (!file.type.startsWith('image/')) {
    toast.warning('请选择图片文件')
    return
  }

  documentSourceFile.value = file
  const reader = new FileReader()
  reader.onload = () => {
    imageDataUrl.value = reader.result as string
    documentResults.value = []
    documentRawOutput.value = ''
    documentStats.value = null
    toast.success('图片已加载')
  }
  reader.readAsDataURL(file)
}

/**
 * 将文件转换成模型可直接消费的 data URL。
 *
 * @param file 需要编码的图片文件。
 * @return data URL 文本。
 */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(String(reader.result || ''))
    }
    reader.onerror = () => {
      reject(new Error('图片读取失败'))
    }
    reader.readAsDataURL(file)
  })
}

/**
 * 根据当前模型选择合适的上传压缩阈值，避免视觉请求体过大。
 *
 * @param modelValue 当前证件解析模型。
 * @return 压缩目标大小，单位 MB。
 */
function getDocumentImageMaxSizeMb(modelValue: string): number {
  return modelValue === 'kimi-k2.6' ? 2 : 4
}

/**
 * 调用视觉模型解析图片中的证件相关信息。
 *
 * @return 无返回值。
 */
async function analyzeDocument() {
  if (!imageDataUrl.value || documentLoading.value) {
    return
  }

  const modelConfig = selectedDocumentModelConfig.value
  const sourceFile = documentSourceFile.value
  if (!sourceFile) {
    toast.warning('请重新上传图片后再试')
    return
  }

  documentLoading.value = true
  documentResults.value = []
  documentRawOutput.value = ''
  documentStats.value = null
  const startedAt = Date.now()

  try {
    const compressedFile = await compressImage(sourceFile, getDocumentImageMaxSizeMb(modelConfig.value))
    const payloadImageUrl = await readFileAsDataUrl(compressedFile)

    const requestBody: Record<string, unknown> = {
      model: modelConfig.value,
      stream: false,
      max_tokens: 4096,
      temperature: modelConfig.value === 'kimi-k2.6' ? 0.6 : 0,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: payloadImageUrl } },
            { type: 'text', text: documentPrompt.value.trim() || DEFAULT_DOCUMENT_PROMPT },
          ],
        },
      ],
    }

    if (modelConfig.supportsThinking) {
      requestBody.thinking = { type: 'disable' }
      requestBody.reasoning_effort = 'low'
    }

    const response = await api.request<ChatCompletionResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const content = getAssistantContent(response)
    documentRawOutput.value = content
    documentResults.value = parseRecords(content)
    documentStats.value = buildStats(
      response,
      Date.now() - startedAt,
      modelConfig.value,
      modelConfig.pricing,
    )

    if (documentResults.value.length > 0) {
      toast.success(`证件解析完成，共 ${documentResults.value.length} 条记录`)
      return
    }

    toast.warning('已返回结果，但没有解析出有效 JSON，请检查提示词或原始输出')
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '证件解析失败'
    toast.error(message)
  } finally {
    documentLoading.value = false
  }
}

/**
 * 调用文本模型解析输入文本中的证件相关信息。
 * 支持切片并发：将文本按行切分为 ≤300 字符的组，
 * 每组独立请求大模型，令牌桶控制最大并发数（10）。
 *
 * @return 无返回值。
 */
async function analyzeText() {
  if (!textInput.value.trim()) {
    toast.warning('请输入待解析文本')
    return
  }
  if (textLoading.value) {
    return
  }

  const rawInput = textInput.value.trim()

  // --- 阶段 1：校验格式 ---
  let lines: string[]
  try {
    lines = validateTextInput(rawInput)
  } catch (e) {
    const msg = e instanceof Error ? e.message : '输入格式校验失败'
    toast.error(msg)
    return
  }

  if (lines.length === 0) {
    toast.warning('未检测到有效内容行')
    return
  }

  // --- 阶段 2：切分 ---
  const slices = tokenizeInput(lines)
  const systemPrompt = textPrompt.value.trim() || DEFAULT_TEXT_PROMPT

  textLoading.value = true
  textResults.value = []
  textRawOutput.value = ''
  textStats.value = null
  textStep.value = { phase: 'slice', label: `已切分为 ${slices.length} 组` }

  const startedAt = Date.now()
  const allResponses: ChatCompletionResponse[] = []

  try {
    // --- 阶段 3：并发请求 ---
    if (slices.length === 1) {
      // 单组直接请求，不走并发池
      textStep.value = { phase: 'processing', label: '正在解析...' }
      const response = await api.request<ChatCompletionResponse>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          model: TEXT_MODEL,
          stream: false,
          max_tokens: 4096,
          temperature: 0,
          thinking: { type: 'disable' },
          reasoning_effort: 'low',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: slices[0] },
          ],
        }),
      })
      allResponses.push(response)
    } else {
      // 多组并发请求
      textStep.value = { phase: 'processing', label: `正在解析 0/${slices.length}...` }
      await Promise.all(slices.map(async (slice, idx) => {
        // Show progress before starting this request
        textStep.value = { phase: 'processing', label: `正在解析 ${idx + 1}/${slices.length}...` }
        const response = await executeTextSlice(() =>
          api.request<ChatCompletionResponse>('/ai/chat', {
            method: 'POST',
            body: JSON.stringify({
              model: TEXT_MODEL,
              stream: false,
              max_tokens: 4096,
              temperature: 0,
              thinking: { type: 'disable' },
              reasoning_effort: 'low',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: slice },
              ],
            }),
          })
        )
        allResponses[idx] = response
      }))
    }

    // --- 阶段 4：合并结果 ---
    const allRecords: ParsedRecord[] = []
    let totalPromptTokens = 0
    let totalCompletionTokens = 0
    let totalAllTokens = 0

    for (const response of allResponses) {
      if (!response) continue
      const content = getAssistantContent(response)
      const records = parseRecords(content)
      if (records.length > 0) {
        allRecords.push(...records)
      }
      totalPromptTokens += response.usage?.prompt_tokens || 0
      totalCompletionTokens += response.usage?.completion_tokens || 0
      totalAllTokens += response.usage?.total_tokens || 0
    }

    // Deduplicate
    textResults.value = mergeResults([allRecords])
    textRawOutput.value = allResponses.map(r => getAssistantContent(r)).join('\n\n---\n')

    // Calculate total duration as weighted average
    const elapsedMs = Date.now() - startedAt

    // Build combined stats from aggregate token counts
    textStats.value = {
      durationMs: elapsedMs,
      promptTokens: totalPromptTokens,
      completionTokens: totalCompletionTokens,
      totalTokens: totalAllTokens,
      model: TEXT_MODEL,
      cost: calculateUsageCost(TEXT_MODEL_PRICING, totalPromptTokens, totalCompletionTokens),
      costNote: '',
    }

    if (textResults.value.length > 0) {
      const extra = allRecords.length > textResults.value.length
        ? `（已合并 ${allRecords.length - textResults.value.length} 条重复记录）`
        : ''
      toast.success(`文本解析完成，共 ${textResults.value.length} 条记录${extra}`)
    } else {
      toast.warning('已返回结果，但没有解析出有效 JSON，请检查提示词或原始输出')
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '文本解析失败'
    toast.error(message)
  } finally {
    textLoading.value = false
    textStep.value = { phase: 'idle', label: '' }
  }
}

/**
 * 复制当前页签的结构化 JSON 结果。
 *
 * @return 无返回值。
 */
async function copyCurrentJson() {
  if (!currentResults.value.length) {
    toast.warning('当前没有可复制的结构化结果')
    return
  }
  try {
    await navigator.clipboard.writeText(currentJson.value)
    toast.success('JSON 结果已复制')
  } catch {
    toast.error('复制失败')
  }
}

/**
 * 复制当前页签的模型原始输出。
 *
 * @return 无返回值。
 */
async function copyCurrentRawOutput() {
  if (!currentRawOutput.value.trim()) {
    toast.warning('当前没有可复制的原始输出')
    return
  }
  try {
    await navigator.clipboard.writeText(currentRawOutput.value)
    toast.success('原始输出已复制')
  } catch {
    toast.error('复制失败')
  }
}

/**
 * 清空当前页签内的输入与结果状态。
 *
 * @return 无返回值。
 */
function clearCurrentTab() {
  if (activeTab.value === 'document') {
    documentSourceFile.value = null
    imageDataUrl.value = ''
    showFullscreen.value = false
    documentResults.value = []
    documentRawOutput.value = ''
    documentStats.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } else {
    textInput.value = ''
    textResults.value = []
    textRawOutput.value = ''
    textStats.value = null
    textStep.value = { phase: 'idle', label: '' }
  }
  toast.success('已清空当前页签内容')
}

/**
 * 恢复当前页签的默认提示词。
 *
 * @return 无返回值。
 */
function resetCurrentPrompt() {
  if (activeTab.value === 'document') {
    documentPrompt.value = DEFAULT_DOCUMENT_PROMPT
  } else {
    textPrompt.value = DEFAULT_TEXT_PROMPT
  }
  toast.success('提示词已恢复默认')
}

/**
 * 处理图片粘贴，仅在证件解析页签下接管剪贴板图片。
 *
 * @param event 粘贴事件。
 * @return 无返回值。
 */
function handlePaste(event: ClipboardEvent) {
  if (activeTab.value !== 'document') {
    return
  }

  const items = event.clipboardData?.items
  if (!items) {
    return
  }

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      event.preventDefault()
      const file = item.getAsFile()
      if (file) {
        processImageFile(file)
      }
      return
    }
  }
}

function handleImageSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processImageFile(file)
  }
  target.value = ''
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    processImageFile(file)
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function openFilePicker() {
  fileInput.value?.click()
}

onMounted(() => {
  window.addEventListener('paste', handlePaste)
})

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste)
})
</script>

<template>
  <ToolLayout title="证件与文本解析">
    <div class="space-y-5">
      <div class="flex flex-wrap gap-2 p-2 glass-card">
        <button
          type="button"
          class="tab-btn"
          :class="activeTab === 'document' ? 'tab-btn-active' : 'tab-btn-idle'"
          @click="activeTab = 'document'"
        >
          <IdentificationIcon class="w-4 h-4" />
          证件解析
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="activeTab === 'text' ? 'tab-btn-active' : 'tab-btn-idle'"
          @click="activeTab = 'text'"
        >
          <DocumentTextIcon class="w-4 h-4" />
          文本智能解析
        </button>
        <div class="flex items-center gap-2 px-2 ml-auto text-xs text-slate-500">
          <SparklesIcon class="w-4 h-4 text-accent" />
          <span v-if="activeTab === 'document'">当前模型：{{ documentModelLabel }}</span>
          <span v-else>固定模型：{{ TEXT_MODEL }}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-[minmax(320px,420px)_1fr] gap-6">
        <aside class="space-y-4">
          <div class="p-5 space-y-3 glass-card">
            <div class="flex items-center gap-2 font-semibold text-slate-800">
              <DocumentMagnifyingGlassIcon class="w-5 h-5 text-accent" />
              解析策略
            </div>
            <p v-if="activeTab === 'document'" class="text-sm leading-6 text-slate-500">
              适合真实证件、手写登记、Excel 截图、聊天截图等图片场景。支持一张图内识别多条证件记录。
            </p>
            <p v-else class="text-sm leading-6 text-slate-500">
              适合 OCR 结果、表格文本、聊天转录和人工整理内容。按行自动切片（≤300 字/组）并发请求 deepseek-v4-flash 提取多条结构化记录。
            </p>
            <div class="grid grid-cols-1 gap-3 text-xs">
              <div class="p-3 border rounded-xl bg-slate-50 border-slate-200">
                <template v-if="activeTab === 'document'">
                  <label class="block mb-1 text-slate-400">证件模型</label>
                  <select
                    v-model="selectedDocumentModel"
                    class="w-full px-3 py-2 text-sm cursor-pointer glass-input"
                  >
                    <option v-for="model in DOCUMENT_MODELS" :key="model.value" :value="model.value">
                      {{ model.label }}
                    </option>
                  </select>
                  <p class="text-[11px] text-slate-400 leading-5 mt-2">
                    统一关闭思考模式；若模型本身没有思考开关，则直接按普通请求调用。
                  </p>
                </template>
                <template v-else>
                  <div class="mb-1 text-slate-400">模型</div>
                  <div class="font-medium break-all text-slate-700">{{ TEXT_MODEL }}</div>
                </template>
              </div>
              <div class="p-3 border rounded-xl bg-slate-50 border-slate-200">
                <div class="mb-1 text-slate-400">价格 / 输出</div>
                <div v-if="activeTab === 'document'" class="font-medium leading-6 text-slate-700">
                  {{ selectedDocumentModelConfig.priceLabel }}
                </div>
                <div v-else class="font-medium leading-6 text-slate-700">
                  {{ TEXT_MODEL_PRICE_LABEL }}
                </div>
                <p v-if="activeTab === 'text'" class="mt-2 text-[11px] text-slate-400 leading-5">
                  输出格式固定为 JSON 数组。自动切片并发解析，最大并发 10 组。
                </p>
              </div>
            </div>
          </div>

          <div class="glass-card p-5 flex flex-col gap-3 min-h-[340px]">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h3 class="font-semibold text-slate-800">提示词</h3>
                <p class="mt-1 text-xs text-slate-400">可按业务词汇、字段别名、输出规则继续细化</p>
              </div>
              <button
                type="button"
                class="text-xs cursor-pointer text-slate-500 hover:text-accent"
                @click="resetCurrentPrompt"
              >
                恢复默认
              </button>
            </div>
            <textarea
              v-if="activeTab === 'document'"
              v-model="documentPrompt"
              class="glass-input flex-1 min-h-[260px] p-3 resize-none text-sm leading-6"
              spellcheck="false"
            />
            <textarea
              v-else
              v-model="textPrompt"
              class="glass-input flex-1 min-h-[260px] p-3 resize-none text-sm leading-6"
              spellcheck="false"
            />
            <div class="flex gap-2 pt-1">
              <button type="button" class="flex items-center gap-2 btn-secondary" @click="clearCurrentTab">
                <TrashIcon class="w-4 h-4" />
                清空当前页签
              </button>
            </div>
          </div>
        </aside>

        <section class="min-w-0 space-y-4">
          <div v-if="activeTab === 'document'" class="p-5 glass-card">
            <div class="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr] lg:items-stretch">
              <div class="flex flex-col gap-4">
                <div>
                  <h3 class="font-semibold text-slate-800">上传待解析图片</h3>
                  <p class="mt-1 text-sm leading-6 text-slate-500">
                    支持拖拽、点击上传和 Ctrl+V 粘贴剪贴板图片。适合真实证件、手写登记、表格截图和多条混合记录。
                  </p>
                </div>
                <div class="p-4 text-sm leading-6 border rounded-2xl bg-slate-50 border-slate-200 text-slate-500">
                  建议图片尽量清晰、字段完整，证件号与日期不要被遮挡。发送前会按模型自动压缩，Kimi 会使用更严格的体积限制。
                </div>
                <div class="flex flex-wrap gap-2 pt-1 lg:mt-auto">
                  <button type="button" class="flex items-center gap-2 btn-secondary" @click="openFilePicker">
                    <ArrowPathIcon class="w-4 h-4" />
                    更换图片
                  </button>
                  <button
                    type="button"
                    class="flex items-center gap-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="documentLoading || !imageDataUrl"
                    @click="analyzeDocument"
                  >
                    <DocumentMagnifyingGlassIcon class="w-4 h-4" />
                    {{ documentLoading ? '解析中...' : '开始证件解析' }}
                  </button>
                </div>
              </div>

              <div
                class="border-2 border-dashed rounded-2xl p-4 min-h-[280px] transition-colors"
                :class="imageDataUrl
                  ? 'border-slate-200 bg-slate-50/70'
                  : isDragging
                    ? 'border-accent/50 bg-accent/5'
                    : 'border-slate-200 hover:border-slate-300 cursor-pointer'"
                @click="!imageDataUrl && openFilePicker()"
                @drop="handleDrop"
                @dragover="handleDragOver"
                @dragleave="handleDragLeave"
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleImageSelect"
                />

                <div v-if="!imageDataUrl" class="h-full min-h-[248px] flex flex-col items-center justify-center gap-3 text-slate-500">
                  <PhotoIcon class="w-12 h-12" />
                  <p class="text-sm">拖动图片到这里，或点击选择文件</p>
                  <p class="text-xs text-slate-400">图片里可以是真实证件、手写信息、表格截图或多条记录</p>
                </div>

                <div v-else>
                  <div
                    class="overflow-hidden bg-white border rounded-xl border-slate-200 cursor-zoom-in"
                    @click.stop="showFullscreen = true"
                  >
                    <img :src="imageDataUrl" alt="待解析图片" class="w-full max-h-[420px] object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="p-5 space-y-4 glass-card">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 class="font-semibold text-slate-800">输入待解析文本</h3>
                <p class="mt-1 text-sm text-slate-500">可直接粘贴 OCR 结果、Excel 文本、聊天记录或人工整理内容。每行对应一个人，单行不超过 300 字。</p>
              </div>
              <button
                type="button"
                class="flex items-center gap-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="textLoading || !textInput.trim()"
                @click="analyzeText"
              >
                <ArrowPathIcon class="w-4 h-4" />
                {{ textLoading ? '解析中...' : '开始文本解析' }}
              </button>
            </div>
            <textarea
              v-model="textInput"
              :placeholder="SAMPLE_TEXT_PLACEHOLDER"
              class="glass-input min-h-[320px] p-3 resize-y text-sm leading-6 w-full"
              spellcheck="false"
            />
            <Transition name="fade">
              <div v-if="textStep.phase !== 'idle'" class="flex items-center gap-2 text-xs font-medium text-accent">
                <span v-if="textStep.phase === 'slice'">{{ textStep.label }}</span>
                <span v-if="textStep.phase.startsWith('processing')">{{ textStep.label }}</span>
              </div>
            </Transition>
          </div>

          <div v-if="currentStats" class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <div class="p-4 glass-card">
              <div class="mb-1 text-xs text-slate-400">请求耗时</div>
              <div class="font-semibold text-slate-800">{{ (currentStats.durationMs / 1000).toFixed(2) }}s</div>
            </div>
            <div class="p-4 glass-card">
              <div class="mb-1 text-xs text-slate-400">Prompt Tokens</div>
              <div class="font-semibold text-slate-800">{{ currentStats.promptTokens }}</div>
            </div>
            <div class="p-4 glass-card">
              <div class="mb-1 text-xs text-slate-400">Completion Tokens</div>
              <div class="font-semibold text-slate-800">{{ currentStats.completionTokens }}</div>
            </div>
            <div class="p-4 glass-card">
              <div class="mb-1 text-xs text-slate-400">Total Tokens</div>
              <div class="font-semibold text-slate-800">{{ currentStats.totalTokens }}</div>
            </div>
            <div class="p-4 glass-card">
              <div class="mb-1 text-xs text-slate-400">本次花费</div>
              <div class="font-semibold text-slate-800">
                {{ currentStats.cost == null ? '-' : `¥${formatCost(currentStats.cost)}` }}
              </div>
              <div v-if="currentStats.costNote" class="text-[11px] text-slate-400 leading-5 mt-1">
                {{ currentStats.costNote }}
              </div>
            </div>
          </div>

          <div class="p-5 space-y-4 glass-card">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 class="font-semibold text-slate-800">结构化结果</h3>
                <p class="mt-1 text-sm text-slate-500">
                  <span v-if="currentResults.length">已提取 {{ currentResults.length }} 条记录</span>
                  <span v-else>解析完成后，这里会展示结构化 JSON 对应的数据表</span>
                </p>
              </div>
              <div class="flex gap-2">
                <button type="button" class="flex items-center gap-2 btn-secondary" @click="copyCurrentRawOutput">
                  <ClipboardDocumentIcon class="w-4 h-4" />
                  复制原始输出
                </button>
                <button type="button" class="flex items-center gap-2 btn-secondary" @click="copyCurrentJson">
                  <ClipboardDocumentIcon class="w-4 h-4" />
                  复制 JSON
                </button>
              </div>
            </div>

            <div v-if="currentResults.length" class="overflow-x-auto border rounded-2xl border-slate-200">
              <table class="min-w-full text-sm">
                <thead class="bg-slate-50 text-slate-500">
                  <tr>
                    <th class="table-th">姓名</th>
                    <th class="table-th">性别</th>
                    <th class="table-th">证件类型</th>
                    <th class="table-th">证件号码</th>
                    <th class="table-th">有效期</th>
                    <th class="table-th">出生日期</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in currentResults" :key="item.key" class="bg-white border-t border-slate-200">
                    <td class="table-td">{{ item.name }}</td>
                    <td class="table-td">{{ item.gender }}</td>
                    <td class="table-td">{{ item.card_type }}</td>
                    <td class="font-mono text-xs table-td">{{ item.card_no }}</td>
                    <td class="table-td">{{ item.valid_date }}</td>
                    <td class="table-td">{{ item.birthday }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="rounded-2xl border border-slate-200 bg-slate-50 min-h-[180px] flex items-center justify-center text-sm text-slate-400 px-6 text-center">
              暂无结构化结果。若模型已经返回内容但未出表，请先查看下方原始输出并按业务格式微调提示词。
            </div>
          </div>

          <div class="p-5 space-y-3 glass-card">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h3 class="font-semibold text-slate-800">模型原始输出</h3>
                <p class="mt-1 text-sm text-slate-500">用于调试提示词和排查非 JSON 返回</p>
              </div>
            </div>
            <pre class="raw-output">{{ currentRawOutput || '暂无原始输出' }}</pre>
          </div>
        </section>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showFullscreen && imageDataUrl"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 cursor-zoom-out"
          @click.self="showFullscreen = false"
        >
          <button
            type="button"
            class="absolute flex items-center justify-center w-10 h-10 text-white rounded-full cursor-pointer top-4 right-4 bg-white/10 hover:bg-white/20"
            aria-label="关闭"
            @click="showFullscreen = false"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
          <img :src="imageDataUrl" alt="图片预览" class="max-h-[90vh] max-w-full object-contain" @click.stop />
        </div>
      </Transition>
    </Teleport>
  </ToolLayout>
</template>

<style scoped>
.tab-btn {
  @apply inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors;
}

.tab-btn-active {
  @apply bg-accent text-white;
}

.tab-btn-idle {
  @apply bg-slate-100 text-slate-600 hover:bg-slate-200;
}

.table-th {
  @apply px-4 py-3 text-left font-medium whitespace-nowrap;
}

.table-td {
  @apply px-4 py-3 text-slate-700 whitespace-nowrap align-top;
}

.raw-output {
  @apply min-h-[180px] max-h-[320px] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-700 whitespace-pre-wrap break-words;
}
</style>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>