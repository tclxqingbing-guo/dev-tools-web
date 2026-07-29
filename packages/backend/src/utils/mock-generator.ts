import { randomUUID } from 'crypto'

/** 列表生成上限 */
const MAX_REPEAT = 1000

/** 随机字符串字符集 */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

/**
 * 生成指定长度的随机字符串。
 *
 * @param min 最小长度。
 * @param max 最大长度。
 * @return 随机字符串。
 */
function randomString(min: number, max: number): string {
  const len = Math.floor(Math.random() * (max - min + 1)) + min
  let result = ''
  for (let i = 0; i < len; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return result
}

/**
 * 生成指定范围内的随机整数。
 *
 * @param min 最小值。
 * @param max 最大值。
 * @return 随机整数。
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 生成指定范围内的随机浮点数。
 *
 * @param min 最小值。
 * @param max 最大值。
 * @param dmin 最小小数位。
 * @param dmax 最大小数位。
 * @return 随机浮点数。
 */
function randomFloat(min: number, max: number, dmin: number, dmax: number): number {
  const decimals = randomInt(dmin, dmax)
  const val = Math.random() * (max - min) + min
  return parseFloat(val.toFixed(decimals))
}

/**
 * 格式化日期时间。
 *
 * @param format 格式模板，如 yyyy-MM-dd HH:mm:ss。
 * @return 格式化后的日期字符串。
 */
function formatDatetime(format: string): string {
  const now = new Date()
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  return format
    .replace('yyyy', String(now.getFullYear()))
    .replace('MM', pad(now.getMonth() + 1))
    .replace('dd', pad(now.getDate()))
    .replace('HH', pad(now.getHours()))
    .replace('mm', pad(now.getMinutes()))
    .replace('ss', pad(now.getSeconds()))
}

/**
 * 解析单个占位符字符串，返回生成的值。
 *
 * @param placeholder 占位符字符串，如 @string(6,12)。
 * @return 生成的值，无法识别时返回原字符串。
 */
function resolvePlaceholder(placeholder: string): unknown {
  // @uuid
  if (placeholder === '@uuid') return randomUUID()
  // @timestamp
  if (placeholder === '@timestamp') return Date.now()
  // @boolean
  if (placeholder === '@boolean') return Math.random() > 0.5

  // @string(min,max)
  const strMatch = placeholder.match(/^@string\((\d+),(\d+)\)$/)
  if (strMatch) return randomString(parseInt(strMatch[1]), parseInt(strMatch[2]))

  // @int(min,max)
  const intMatch = placeholder.match(/^@int\((-?\d+),(-?\d+)\)$/)
  if (intMatch) return randomInt(parseInt(intMatch[1]), parseInt(intMatch[2]))

  // @float(min,max,dmin,dmax)
  const floatMatch = placeholder.match(/^@float\((-?[\d.]+),(-?[\d.]+),(\d+),(\d+)\)$/)
  if (floatMatch) return randomFloat(parseFloat(floatMatch[1]), parseFloat(floatMatch[2]), parseInt(floatMatch[3]), parseInt(floatMatch[4]))

  // @datetime(format)
  const dtMatch = placeholder.match(/^@datetime\((.+)\)$/)
  if (dtMatch) return formatDatetime(dtMatch[1])

  // @pick(a,b,c)
  const pickMatch = placeholder.match(/^@pick\((.+)\)$/)
  if (pickMatch) {
    const items = pickMatch[1].split(',')
    return items[Math.floor(Math.random() * items.length)].trim()
  }

  return placeholder
}

/**
 * 递归解析模板中的占位符，生成动态数据。
 * 支持字符串值中的 @placeholder 语法。
 *
 * @param template 模板数据（可以是对象、数组、字符串等）。
 * @return 解析后的数据。
 */
export function generateFromTemplate(template: unknown): unknown {
  if (typeof template === 'string') {
    // 整个字符串就是一个占位符
    if (/^@\w+(\(.+\))?$/.test(template)) {
      return resolvePlaceholder(template)
    }
    // 字符串中内嵌占位符，替换为字符串形式
    return template.replace(/@\w+(\([^)]*\))?/g, (match) => {
      const val = resolvePlaceholder(match)
      return String(val)
    })
  }
  if (Array.isArray(template)) {
    return template.map(item => generateFromTemplate(item))
  }
  if (template !== null && typeof template === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(template as Record<string, unknown>)) {
      result[key] = generateFromTemplate(value)
    }
    return result
  }
  return template
}

/**
 * 根据模板和数量生成列表数据。
 *
 * @param template 列表项模板。
 * @param count 生成数量（上限 1000）。
 * @return 生成的数组。
 */
export function generateList(template: unknown, count: number): unknown[] {
  const safeCount = Math.min(Math.max(count, 1), MAX_REPEAT)
  const list: unknown[] = []
  for (let i = 0; i < safeCount; i++) {
    list.push(generateFromTemplate(template))
  }
  return list
}

/** 条件规则接口 */
export interface ConditionRule {
  field: string
  source: 'query' | 'header' | 'body'
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'exists'
  value: string
  status_code?: number
  response_body?: string
}

/** 条件匹配结果 */
export interface ConditionResult {
  statusCode: number
  responseBody: unknown
}

/**
 * 评估条件规则数组，返回第一个匹配的条件结果。
 *
 * @param conditions 条件规则数组。
 * @param req 请求上下文（query、headers、body）。
 * @return 匹配的条件结果，无匹配返回 null。
 */
export function evaluateConditions(
  conditions: ConditionRule[],
  req: { query: Record<string, unknown>; headers: Record<string, unknown>; body: Record<string, unknown> }
): ConditionResult | null {
  for (const cond of conditions) {
    const source = cond.source === 'query' ? req.query : cond.source === 'header' ? req.headers : req.body
    const fieldValue = source[cond.field]

    let matched = false
    switch (cond.operator) {
      case 'eq':
        matched = String(fieldValue) === cond.value
        break
      case 'neq':
        matched = String(fieldValue) !== cond.value
        break
      case 'gt':
        matched = Number(fieldValue) > Number(cond.value)
        break
      case 'lt':
        matched = Number(fieldValue) < Number(cond.value)
        break
      case 'contains':
        matched = String(fieldValue ?? '').includes(cond.value)
        break
      case 'exists':
        matched = fieldValue !== undefined && fieldValue !== null
        break
    }

    if (matched && cond.response_body) {
      try {
        const parsed = JSON.parse(cond.response_body)
        return {
          statusCode: cond.status_code ?? 200,
          responseBody: generateFromTemplate(parsed),
        }
      } catch {
        return {
          statusCode: cond.status_code ?? 200,
          responseBody: cond.response_body,
        }
      }
    }
  }
  return null
}
