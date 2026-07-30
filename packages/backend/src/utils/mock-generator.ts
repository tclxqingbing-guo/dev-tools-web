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

/**
 * 在对象的指定路径处生成列表。
 * 例如 path="data.list" 会在 obj.data.list 处生成 N 条数据。
 *
 * @param obj 原始响应对象。
 * @param path 点分隔路径，如 "data.list"。
 * @param count 生成数量。
 * @return 修改后的对象。
 */
export function generateListAtPath(obj: unknown, path: string, count: number): unknown {
  if (!path || typeof obj !== 'object' || obj === null) {
    return generateList(obj, count)
  }
  const keys = path.split('.')
  const result = JSON.parse(JSON.stringify(obj)) as Record<string, unknown>
  let current: Record<string, unknown> = result
  // 沿路径深入到父级
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (current[key] === undefined || current[key] === null || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }
  const lastKey = keys[keys.length - 1]
  // 获取该路径处的模板（如果是数组取第一个元素，否则用整个值）
  const existing = current[lastKey]
  let itemTemplate: unknown
  if (Array.isArray(existing) && existing.length > 0) {
    itemTemplate = existing[0]
  } else if (Array.isArray(existing)) {
    itemTemplate = {}
  } else {
    itemTemplate = existing ?? {}
  }
  current[lastKey] = generateList(itemTemplate, count)
  return result
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

/** 条件组接口：多个条件通过 logic 组合，共同对应一个结果 */
export interface ConditionGroup {
  logic: 'AND' | 'OR'
  conditions: Omit<ConditionRule, 'status_code' | 'response_body'>[]
  status_code?: number
  response_body?: string
}

/** 条件匹配结果 */
export interface ConditionResult {
  statusCode: number
  responseBody: unknown
}

/**
 * 评估单个条件是否匹配。
 *
 * @param cond 条件规则。
 * @param req 请求上下文。
 * @return 是否匹配。
 */
function evalSingleCondition(
  cond: Omit<ConditionRule, 'status_code' | 'response_body'>,
  req: { query: Record<string, unknown>; headers: Record<string, unknown>; body: Record<string, unknown> }
): boolean {
  const source = cond.source === 'query' ? req.query : cond.source === 'header' ? req.headers : req.body
  const fieldValue = source[cond.field]
  switch (cond.operator) {
    case 'eq': return String(fieldValue) === cond.value
    case 'neq': return String(fieldValue) !== cond.value
    case 'gt': return Number(fieldValue) > Number(cond.value)
    case 'lt': return Number(fieldValue) < Number(cond.value)
    case 'contains': return String(fieldValue ?? '').includes(cond.value)
    case 'exists': return fieldValue !== undefined && fieldValue !== null
    default: return false
  }
}

/**
 * 评估条件组数组，支持 AND/OR 多条件组合。
 * 兼容旧版单条件格式（ConditionRule[]）和新版条件组格式（ConditionGroup[]）。
 *
 * @param groups 条件组数组（或旧版条件数组）。
 * @param req 请求上下文。
 * @return 匹配的条件结果，无匹配返回 null。
 */
export function evaluateConditionGroups(
  groups: (ConditionGroup | ConditionRule)[],
  req: { query: Record<string, unknown>; headers: Record<string, unknown>; body: Record<string, unknown> }
): ConditionResult | null {
  for (const group of groups) {
    // 兼容旧版：如果有 field 字段，说明是旧版单条件格式
    if ('field' in group) {
      const cond = group as ConditionRule
      if (evalSingleCondition(cond, req) && cond.response_body) {
        return buildResult(cond.status_code ?? 200, cond.response_body)
      }
      continue
    }
    // 新版条件组
    const g = group as ConditionGroup
    if (!g.conditions || g.conditions.length === 0) continue
    const results = g.conditions.map(c => evalSingleCondition(c, req))
    const matched = g.logic === 'AND' ? results.every(Boolean) : results.some(Boolean)
    if (matched && g.response_body) {
      return buildResult(g.status_code ?? 200, g.response_body)
    }
  }
  return null
}

/**
 * 构建条件匹配结果。
 *
 * @param statusCode 状态码。
 * @param responseBodyStr 响应体 JSON 字符串。
 * @return 条件结果对象。
 */
function buildResult(statusCode: number, responseBodyStr: string): ConditionResult {
  try {
    const parsed = JSON.parse(responseBodyStr)
    return { statusCode, responseBody: generateFromTemplate(parsed) }
  } catch {
    return { statusCode, responseBody: responseBodyStr }
  }
}

/** @deprecated 使用 evaluateConditionGroups 代替 */
export function evaluateConditions(
  conditions: ConditionRule[],
  req: { query: Record<string, unknown>; headers: Record<string, unknown>; body: Record<string, unknown> }
): ConditionResult | null {
  return evaluateConditionGroups(conditions, req)
}
