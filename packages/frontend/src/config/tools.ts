export interface Tool {
  name: string
  icon: string
  description: string
  route: string
  component: string
  keywords: string[]
  category: string
  usageScore: number
}

export const categories = ['全部', 'AI 工具', '开发工具', '测试工具', '实用工具', '媒体工具'] as const
export type Category = (typeof categories)[number]

export const categoryIcons: Record<Category, string> = {
  '全部': 'Squares2X2Icon',
  'AI 工具': 'SparklesIcon',
  '开发工具': 'CodeBracketIcon',
  '测试工具': 'BeakerIcon',
  '实用工具': 'WrenchScrewdriverIcon',
  '媒体工具': 'PhotoIcon',
}

export const tools: Tool[] = [
  {
    name: 'AI 助手',
    icon: 'CpuChipIcon',
    description: 'AI 对话聊天 & 图片生成',
    route: '/tool/ai-assistants',
    component: 'AiAssistants',
    keywords: ['ai', '对话', '聊天', 'chat', '图片', '生成', 'image'],
    category: 'AI 工具',
    usageScore: 50,
  },
  {
    name: 'JSON 格式化',
    icon: 'CodeBracketSquareIcon',
    description: 'JSON 数据格式化、高亮、折叠、复制节点',
    route: '/tool/json-formatter',
    component: 'JsonFormatter',
    keywords: ['json', '格式化', 'format', '{}', 'object'],
    category: '开发工具',
    usageScore: 10,
  },
  {
    name: 'XML 格式化',
    icon: 'DocumentTextIcon',
    description: 'XML 数据格式化、验证、压缩、转 JSON',
    route: '/tool/xml-formatter',
    component: 'XmlFormatter',
    keywords: ['xml', '格式化', 'format', '<>', 'tag'],
    category: '开发工具',
    usageScore: 5,
  },
  {
    name: 'AI 变量命名',
    icon: 'TagIcon',
    description: 'AI 辅助生成规范的变量名',
    route: '/tool/variable-namer',
    component: 'VariableNamer',
    keywords: ['变量', 'variable', '命名', 'name', 'ai', 'camel', 'snake'],
    category: 'AI 工具',
    usageScore: 8,
  },
  {
    name: 'AI 翻译',
    icon: 'LanguageIcon',
    description: '基于大模型的智能翻译',
    route: '/tool/ai-translator',
    component: 'AiTranslator',
    keywords: ['翻译', 'translate', 'ai', '英文', '中文'],
    category: 'AI 工具',
    usageScore: 9,
  },
  {
    name: 'TTS 语音合成',
    icon: 'SpeakerWaveIcon',
    description: '文字转语音，支持多种语言和音色',
    route: '/tool/tts-generator',
    component: 'TtsGenerator',
    keywords: ['tts', '语音', 'speech', 'voice', '文字转语音'],
    category: 'AI 工具',
    usageScore: 8,
  },
  {
    name: 'OCR 识别',
    icon: 'EyeIcon',
    description: '图片文字识别，支持多种图片格式',
    route: '/tool/ocr-tool',
    component: 'OcrTool',
    keywords: ['ocr', '识别', '图片', 'image', '文字'],
    category: 'AI 工具',
    usageScore: 7,
  },
  {
    name: '身份证生成器',
    icon: 'IdentificationIcon',
    description: '根据省市县、性别、年龄随机生成合法身份证号',
    route: '/tool/id-card-generator',
    component: 'IdCardGenerator',
    keywords: ['身份证', 'id', 'card', '生成', '测试'],
    category: '测试工具',
    usageScore: 6,
  },
  {
    name: 'URL 编码/解码',
    icon: 'LinkIcon',
    description: 'URL 编码和解码工具',
    route: '/tool/url-encoder',
    component: 'UrlEncoder',
    keywords: ['url', '编码', 'encode', 'decode', '解码', 'uri'],
    category: '开发工具',
    usageScore: 7,
  },
  {
    name: 'JWT 解析',
    icon: 'LockClosedIcon',
    description: '解析和查看 JWT Token 的内容',
    route: '/tool/jwt-parser',
    component: 'JwtParser',
    keywords: ['jwt', 'token', '解析', 'parse', 'bearer'],
    category: '开发工具',
    usageScore: 6,
  },
  {
    name: '正则表达式测试',
    icon: 'MagnifyingGlassIcon',
    description: '正则表达式验证器和常用正则卡片',
    route: '/tool/regex-tester',
    component: 'RegexTester',
    keywords: ['正则', 'regex', 'regexp', '匹配', 'match'],
    category: '开发工具',
    usageScore: 8,
  },
  {
    name: '企业信用代码',
    icon: 'BuildingOfficeIcon',
    description: '统一社会信用代码验证和批量生成',
    route: '/tool/company-code-generator',
    component: 'CompanyCodeGenerator',
    keywords: ['企业', 'company', '信用代码', '生成'],
    category: '测试工具',
    usageScore: 3,
  },
  {
    name: '护照号生成验证',
    icon: 'GlobeAltIcon',
    description: '国内护照号验证和批量生成',
    route: '/tool/passport-generator',
    component: 'PassportGenerator',
    keywords: ['护照', 'passport', '生成', '验证'],
    category: '测试工具',
    usageScore: 2,
  },
  {
    name: 'Base64 编解码',
    icon: 'ArrowsRightLeftIcon',
    description: '文本和图片的 Base64 编码/解码工具',
    route: '/tool/base64-tool',
    component: 'Base64Tool',
    keywords: ['base64', '编码', 'encode', 'decode', '解码'],
    category: '开发工具',
    usageScore: 7,
  },
  {
    name: 'AI 图表生成',
    icon: 'ChartBarIcon',
    description: 'AI 根据数据自动生成可视化图表',
    route: '/tool/chart-generator',
    component: 'ChartGenerator',
    keywords: ['图表', 'chart', 'ai', '可视化', '数据'],
    category: 'AI 工具',
    usageScore: 5,
  },
  {
    name: '代码对比',
    icon: 'DocumentDuplicateIcon',
    description: '对比两段代码的差异，支持语法高亮',
    route: '/tool/code-diff',
    component: 'CodeDiff',
    keywords: ['代码', 'code', '对比', 'diff', 'compare'],
    category: '开发工具',
    usageScore: 6,
  },
  {
    name: '图片压缩与转换',
    icon: 'PhotoIcon',
    description: '图片无损压缩、尺寸限制与 PNG/JPG/WebP 互转',
    route: '/tool/image-compressor',
    component: 'ImageCompressor',
    keywords: ['图片', 'image', '压缩', 'compress', 'png', 'jpg', 'webp'],
    category: '媒体工具',
    usageScore: 6,
  },
  {
    name: 'AI Tailwind CSS',
    icon: 'SwatchIcon',
    description: 'AI 生成 Tailwind CSS 类名及速查手册',
    route: '/tool/tailwind-generator',
    component: 'TailwindGenerator',
    keywords: ['tailwind', 'css', 'ai', '样式', 'style'],
    category: 'AI 工具',
    usageScore: 7,
  },
  {
    name: '二维码工具',
    icon: 'QrCodeIcon',
    description: '二维码生成与解码，支持自定义样式',
    route: '/tool/qrcode-tool',
    component: 'QrCodeTool',
    keywords: ['二维码', 'qrcode', 'qr', '扫码', '生成'],
    category: '实用工具',
    usageScore: 7,
  },
  {
    name: '笔记本',
    icon: 'PencilSquareIcon',
    description: '支持 Markdown 语法的笔记本',
    route: '/tool/note-tool',
    component: 'NoteTool',
    keywords: ['笔记', 'note', 'markdown', '记录', '编辑器'],
    category: '实用工具',
    usageScore: 8,
  },
]

export function getFrequentTools(): Tool[] {
  return [...tools].sort((a, b) => b.usageScore - a.usageScore).slice(0, 12)
}

export function searchTools(query: string): Tool[] {
  if (!query.trim()) return getFrequentTools()
  const q = query.toLowerCase()
  const exact = tools.filter(t => t.keywords.some(k => k.toLowerCase() === q))
  const partial = tools.filter(
    t => !exact.includes(t) && (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.keywords.some(k => k.toLowerCase().includes(q))
    )
  )
  const smart = getSmartRecommendations(query).filter(t => !exact.includes(t) && !partial.includes(t))
  const rest = tools.filter(t => !exact.includes(t) && !partial.includes(t) && !smart.includes(t))
  return [...exact, ...partial, ...smart, ...rest]
}

function getSmartRecommendations(input: string): Tool[] {
  const r: Tool[] = []
  const trimmed = input.trim()
  if (trimmed.startsWith('{') || trimmed.startsWith('['))
    r.push(tools.find(t => t.component === 'JsonFormatter')!)
  if (trimmed.startsWith('<'))
    r.push(tools.find(t => t.component === 'XmlFormatter')!)
  if (/^[A-Za-z0-9+/=]{20,}$/.test(trimmed))
    r.push(tools.find(t => t.component === 'Base64Tool')!)
  if (/^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(trimmed))
    r.push(tools.find(t => t.component === 'JwtParser')!)
  if (/^https?:\/\//.test(trimmed))
    r.push(tools.find(t => t.component === 'UrlEncoder')!)
  return r.filter(Boolean)
}
