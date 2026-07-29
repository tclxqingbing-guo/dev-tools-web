<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from '../../composables/useToast'
import { useClipboard } from '../../composables/useClipboard'
import ToolLayout from '../../components/ToolLayout.vue'
import ToolModal from '../../components/ToolModal.vue'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ClipboardDocumentIcon,
  CommandLineIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()
const { copyToClipboard } = useClipboard()

const BASE_URL = 'https://bx-tools.17usoft.com/api/mock/serve'

interface MockApi {
  id: number
  name: string
  method: string
  path: string
  headers: string
  status_code: number
  response_body: string
  response_config: string
  enabled: number
  delay_ms: number
  created_at: string
  updated_at: string
}

interface HeaderItem { key: string; value: string }
interface ConditionItem {
  field: string
  source: 'query' | 'header' | 'body'
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'exists'
  value: string
  status_code: number
  response_body: string
}

const list = ref<MockApi[]>([])
const searchQuery = ref('')
const loading = ref(false)

// 弹窗状态
const modalOpen = ref(false)
const modalMode = ref<'create' | 'edit' | 'view'>('create')
const saving = ref(false)

// 表单数据
const form = ref({
  id: 0,
  name: '',
  method: 'GET',
  path: '/',
  status_code: 200,
  delay_ms: 0,
  enabled: 1,
  response_body: '{\n  "code": 0,\n  "message": "success",\n  "data": {}\n}',
})
const headerItems = ref<HeaderItem[]>([])
const conditionItems = ref<ConditionItem[]>([])
const listCount = ref(0)

const filteredList = computed(() => {
  if (!searchQuery.value.trim()) return list.value
  const q = searchQuery.value.toLowerCase()
  return list.value.filter(
    item => item.name.toLowerCase().includes(q) || item.path.toLowerCase().includes(q)
  )
})

const methodColors: Record<string, string> = {
  GET: 'bg-emerald-100 text-emerald-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-amber-100 text-amber-700',
  DELETE: 'bg-red-100 text-red-700',
  PATCH: 'bg-purple-100 text-purple-700',
}

/** 获取完整 mock URL */
const getFullUrl = (item: MockApi) => `${BASE_URL}${item.path}`

/** 生成 cURL 命令 */
const getCurl = (item: MockApi) => {
  let cmd = `curl -X ${item.method} '${getFullUrl(item)}'`
  cmd += ` \\\n  -H 'Content-Type: application/json'`
  try {
    const headers = JSON.parse(item.headers)
    for (const [k, v] of Object.entries(headers)) {
      cmd += ` \\\n  -H '${k}: ${v}'`
    }
  } catch { /* ignore */ }
  if (item.method !== 'GET') {
    cmd += ` \\\n  -d '{}'`
  }
  return cmd
}

/** 加载列表 */
const fetchList = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/mock')
    list.value = await res.json()
  } catch {
    toast.error('加载 Mock 列表失败')
  } finally {
    loading.value = false
  }
}

/** 打开新建弹窗 */
const openCreate = () => {
  modalMode.value = 'create'
  form.value = { id: 0, name: '', method: 'GET', path: '/', status_code: 200, delay_ms: 0, enabled: 1, response_body: '{\n  "code": 0,\n  "message": "success",\n  "data": {}\n}' }
  headerItems.value = []
  conditionItems.value = []
  listCount.value = 0
  modalOpen.value = true
}

/** 打开编辑弹窗 */
const openEdit = (item: MockApi) => {
  modalMode.value = 'edit'
  form.value = {
    id: item.id,
    name: item.name,
    method: item.method,
    path: item.path,
    status_code: item.status_code,
    delay_ms: item.delay_ms,
    enabled: item.enabled,
    response_body: formatJson(item.response_body),
  }
  // 解析 headers
  try {
    const h = JSON.parse(item.headers)
    headerItems.value = Object.entries(h).map(([key, value]) => ({ key, value: String(value) }))
  } catch { headerItems.value = [] }
  // 解析 response_config
  try {
    const config = JSON.parse(item.response_config)
    conditionItems.value = config.conditions || []
    listCount.value = config.list_count || 0
  } catch { conditionItems.value = []; listCount.value = 0 }
  modalOpen.value = true
}

/** 打开查看弹窗 */
const openView = (item: MockApi) => {
  modalMode.value = 'view'
  form.value = {
    id: item.id,
    name: item.name,
    method: item.method,
    path: item.path,
    status_code: item.status_code,
    delay_ms: item.delay_ms,
    enabled: item.enabled,
    response_body: formatJson(item.response_body),
  }
  try {
    const h = JSON.parse(item.headers)
    headerItems.value = Object.entries(h).map(([key, value]) => ({ key, value: String(value) }))
  } catch { headerItems.value = [] }
  try {
    const config = JSON.parse(item.response_config)
    conditionItems.value = config.conditions || []
    listCount.value = config.list_count || 0
  } catch { conditionItems.value = []; listCount.value = 0 }
  modalOpen.value = true
}

/** 格式化 JSON 字符串 */
function formatJson(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    return str
  }
}

/** 保存（新建/编辑） */
const save = async () => {
  if (!form.value.path.trim()) {
    toast.error('路径不能为空')
    return
  }
  // 校验 JSON
  try {
    JSON.parse(form.value.response_body)
  } catch {
    toast.error('Response Body 不是有效的 JSON')
    return
  }
  saving.value = true
  try {
    const headers: Record<string, string> = {}
    headerItems.value.forEach(h => { if (h.key.trim()) headers[h.key.trim()] = h.value })
    const responseConfig: Record<string, unknown> = {}
    if (conditionItems.value.length > 0) responseConfig.conditions = conditionItems.value
    if (listCount.value > 0) responseConfig.list_count = listCount.value

    const payload = {
      name: form.value.name,
      method: form.value.method,
      path: form.value.path.startsWith('/') ? form.value.path : '/' + form.value.path,
      headers: JSON.stringify(headers),
      status_code: form.value.status_code,
      response_body: form.value.response_body,
      response_config: JSON.stringify(responseConfig),
      enabled: form.value.enabled,
      delay_ms: form.value.delay_ms,
    }

    const isEdit = modalMode.value === 'edit'
    const res = await fetch(isEdit ? `/api/mock/${form.value.id}` : '/api/mock', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error()
    toast.success(isEdit ? '更新成功' : '创建成功')
    modalOpen.value = false
    await fetchList()
  } catch {
    toast.error('保存失败')
  } finally {
    saving.value = false
  }
}

/** 删除 */
const remove = async (id: number) => {
  if (!confirm('确定删除该 Mock 规则？')) return
  try {
    await fetch(`/api/mock/${id}`, { method: 'DELETE' })
    list.value = list.value.filter(item => item.id !== id)
    toast.success('删除成功')
  } catch {
    toast.error('删除失败')
  }
}

/** 切换启用/禁用 */
const toggle = async (item: MockApi) => {
  try {
    const res = await fetch(`/api/mock/${item.id}/toggle`, { method: 'PATCH' })
    const updated = await res.json()
    const idx = list.value.findIndex(i => i.id === item.id)
    if (idx > -1) list.value[idx] = updated
    toast.success(updated.enabled ? '已启用' : '已禁用')
  } catch {
    toast.error('操作失败')
  }
}

/** 添加 header 行 */
const addHeader = () => headerItems.value.push({ key: '', value: '' })
/** 删除 header 行 */
const removeHeader = (idx: number) => headerItems.value.splice(idx, 1)
/** 添加条件行 */
const addCondition = () => conditionItems.value.push({ field: '', source: 'query', operator: 'eq', value: '', status_code: 200, response_body: '{}' })
/** 删除条件行 */
const removeCondition = (idx: number) => conditionItems.value.splice(idx, 1)

const formatTime = (t: string) => {
  try { return new Date(t).toLocaleString('zh-CN') } catch { return t }
}

onMounted(fetchList)
</script>

<template>
  <ToolLayout title="Mock API">
    <div class="space-y-4">
      <!-- 顶部操作栏 -->
      <div class="flex items-center justify-between gap-4">
        <div class="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input v-model="searchQuery" type="text" placeholder="搜索名称或路径..." class="w-full pl-9 pr-3 py-2 text-sm glass-input" />
        </div>
        <button @click="openCreate" class="btn-primary text-sm flex items-center gap-1.5">
          <PlusIcon class="w-4 h-4" /> 新建 Mock
        </button>
      </div>

      <!-- 列表 -->
      <div class="glass-card overflow-hidden">
        <div v-if="loading" class="p-8 text-center text-sm text-slate-400">加载中...</div>
        <div v-else-if="filteredList.length === 0" class="p-12 text-center">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <CommandLineIcon class="w-7 h-7 text-slate-300" />
          </div>
          <p class="text-slate-500 text-sm">{{ searchQuery ? '未找到匹配规则' : '暂无 Mock 规则，点击上方按钮创建' }}</p>
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50/80">
              <th class="text-left px-4 py-3 font-medium text-slate-500">方法</th>
              <th class="text-left px-4 py-3 font-medium text-slate-500">名称 / 路径</th>
              <th class="text-left px-4 py-3 font-medium text-slate-500">状态码</th>
              <th class="text-left px-4 py-3 font-medium text-slate-500">状态</th>
              <th class="text-left px-4 py-3 font-medium text-slate-500">更新时间</th>
              <th class="text-right px-4 py-3 font-medium text-slate-500">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredList" :key="item.id" class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
              <td class="px-4 py-3">
                <span :class="['px-2 py-0.5 rounded text-xs font-bold', methodColors[item.method] || 'bg-slate-100 text-slate-600']">
                  {{ item.method }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="font-medium text-slate-700">{{ item.name || '未命名' }}</div>
                <div class="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-[280px]">{{ item.path }}</div>
              </td>
              <td class="px-4 py-3">
                <span :class="['text-xs font-mono', item.status_code < 400 ? 'text-emerald-600' : 'text-red-500']">{{ item.status_code }}</span>
              </td>
              <td class="px-4 py-3">
                <button
                  @click="toggle(item)"
                  :class="['relative w-9 h-5 rounded-full transition-colors cursor-pointer', item.enabled ? 'bg-emerald-400' : 'bg-slate-300']"
                >
                  <span :class="['absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform', item.enabled ? 'left-[18px]' : 'left-0.5']" />
                </button>
              </td>
              <td class="px-4 py-3 text-xs text-slate-400">{{ formatTime(item.updated_at) }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button @click="copyToClipboard(getFullUrl(item), 'URL 已复制')" title="复制 URL" class="p-1.5 rounded-lg text-slate-400 hover:text-accent hover:bg-accent/10 cursor-pointer transition-colors">
                    <ClipboardDocumentIcon class="w-4 h-4" />
                  </button>
                  <button @click="copyToClipboard(getCurl(item), 'cURL 已复制')" title="复制 cURL" class="p-1.5 rounded-lg text-slate-400 hover:text-accent hover:bg-accent/10 cursor-pointer transition-colors">
                    <CommandLineIcon class="w-4 h-4" />
                  </button>
                  <button @click="openView(item)" title="查看" class="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button @click="openEdit(item)" title="编辑" class="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 cursor-pointer transition-colors">
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button @click="remove(item.id)" title="删除" class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer transition-colors">
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 新建/编辑/查看 弹窗 -->
    <ToolModal
      :open="modalOpen"
      :title="modalMode === 'create' ? '新建 Mock 规则' : modalMode === 'edit' ? '编辑 Mock 规则' : '查看 Mock 规则'"
      panel-class="w-[92vw] sm:w-[760px]"
      @close="modalOpen = false"
    >
      <div class="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        <!-- 基础信息 -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">名称</label>
            <input v-model="form.name" :disabled="modalMode === 'view'" placeholder="接口名称" class="w-full px-3 py-2 text-sm glass-input" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Method</label>
            <select v-model="form.method" :disabled="modalMode === 'view'" class="w-full px-3 py-2 text-sm glass-input">
              <option v-for="m in ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
        </div>

        <!-- 路径 -->
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">路径</label>
          <div class="flex items-center gap-0">
            <span class="px-3 py-2 text-xs bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-400 font-mono whitespace-nowrap">{{ BASE_URL }}</span>
            <input v-model="form.path" :disabled="modalMode === 'view'" placeholder="/user/list" class="flex-1 px-3 py-2 text-sm glass-input rounded-l-none font-mono" />
          </div>
        </div>

        <!-- 状态码 & 延迟 -->
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">状态码</label>
            <input v-model.number="form.status_code" :disabled="modalMode === 'view'" type="number" class="w-full px-3 py-2 text-sm glass-input" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">延迟 (ms)</label>
            <input v-model.number="form.delay_ms" :disabled="modalMode === 'view'" type="number" min="0" class="w-full px-3 py-2 text-sm glass-input" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">列表数量 (0=不生成列表)</label>
            <input v-model.number="listCount" :disabled="modalMode === 'view'" type="number" min="0" max="1000" class="w-full px-3 py-2 text-sm glass-input" />
          </div>
        </div>

        <!-- Headers -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-xs font-medium text-slate-500">响应 Headers</label>
            <button v-if="modalMode !== 'view'" @click="addHeader" class="text-xs text-accent hover:underline cursor-pointer">+ 添加</button>
          </div>
          <div v-if="headerItems.length === 0" class="text-xs text-slate-400 py-1">无自定义 Header</div>
          <div v-for="(h, idx) in headerItems" :key="idx" class="flex items-center gap-2 mb-1.5">
            <input v-model="h.key" :disabled="modalMode === 'view'" placeholder="Key" class="flex-1 px-2 py-1.5 text-xs glass-input font-mono" />
            <input v-model="h.value" :disabled="modalMode === 'view'" placeholder="Value" class="flex-1 px-2 py-1.5 text-xs glass-input font-mono" />
            <button v-if="modalMode !== 'view'" @click="removeHeader(idx)" class="p-1 text-slate-400 hover:text-red-500 cursor-pointer"><TrashIcon class="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <!-- Response Body -->
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">
            Response Body
            <span class="text-slate-400 font-normal ml-2">支持占位符: @string(min,max) @int(min,max) @uuid @timestamp @boolean @pick(a,b,c) @datetime(format)</span>
          </label>
          <textarea
            v-model="form.response_body"
            :disabled="modalMode === 'view'"
            rows="10"
            class="w-full px-3 py-2 text-xs glass-input font-mono resize-y leading-relaxed"
            placeholder='{"code": 0, "data": {"id": "@int(1,1000)", "name": "@string(3,8)"}}'
          />
        </div>

        <!-- 条件返回 -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-xs font-medium text-slate-500">条件返回</label>
            <button v-if="modalMode !== 'view'" @click="addCondition" class="text-xs text-accent hover:underline cursor-pointer">+ 添加条件</button>
          </div>
          <div v-if="conditionItems.length === 0" class="text-xs text-slate-400 py-1">无条件规则，将直接返回 Response Body</div>
          <div v-for="(cond, idx) in conditionItems" :key="idx" class="p-3 mb-2 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div class="flex items-center gap-2">
              <select v-model="cond.source" :disabled="modalMode === 'view'" class="px-2 py-1.5 text-xs glass-input">
                <option value="query">Query</option>
                <option value="header">Header</option>
                <option value="body">Body</option>
              </select>
              <input v-model="cond.field" :disabled="modalMode === 'view'" placeholder="字段名" class="flex-1 px-2 py-1.5 text-xs glass-input font-mono" />
              <select v-model="cond.operator" :disabled="modalMode === 'view'" class="px-2 py-1.5 text-xs glass-input">
                <option value="eq">等于</option>
                <option value="neq">不等于</option>
                <option value="gt">大于</option>
                <option value="lt">小于</option>
                <option value="contains">包含</option>
                <option value="exists">存在</option>
              </select>
              <input v-model="cond.value" :disabled="modalMode === 'view'" placeholder="值" class="flex-1 px-2 py-1.5 text-xs glass-input font-mono" />
              <input v-model.number="cond.status_code" :disabled="modalMode === 'view'" type="number" placeholder="状态码" class="w-16 px-2 py-1.5 text-xs glass-input" />
              <button v-if="modalMode !== 'view'" @click="removeCondition(idx)" class="p-1 text-slate-400 hover:text-red-500 cursor-pointer"><TrashIcon class="w-3.5 h-3.5" /></button>
            </div>
            <textarea
              v-model="cond.response_body"
              :disabled="modalMode === 'view'"
              rows="3"
              class="w-full px-2 py-1.5 text-xs glass-input font-mono resize-y"
              placeholder='条件匹配时返回的 JSON'
            />
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <template #footer>
        <button @click="modalOpen = false" class="btn-secondary text-sm">关闭</button>
        <button v-if="modalMode !== 'view'" @click="save" :disabled="saving" class="btn-primary text-sm disabled:opacity-50">
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </template>
    </ToolModal>
  </ToolLayout>
</template>
