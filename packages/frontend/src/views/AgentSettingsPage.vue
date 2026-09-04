<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeftIcon, ArrowPathIcon, CheckCircleIcon, PlusIcon, ServerStackIcon, TrashIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const tab = ref<'runtime' | 'mcp' | 'codegraph'>('runtime')
const loading = ref(false)
const message = ref('')
const settings = reactive<Record<string, any>>({
  'model.name': '', 'search.primary': 'searxng', 'search.fallback': 'tavily',
  'search.searxngUrl': 'http://searxng:8080', 'search.tavilyKey': '', 'search.maxResults': 8,
  'search.allowedDomains': '', 'search.blockedDomains': '',
  'external.apiToken': '', 'external.allowedModes': 'auto,general,knowledge,agent',
  'search.timeoutSeconds': 15, 'agent.maxRounds': 30, 'agent.maxDurationSeconds': 600,
  'agent.contextWindow': 128000, 'sandbox.timeoutSeconds': 120, 'sandbox.memoryMb': 1024,
  'sandbox.cpus': 1, 'sandbox.pids': 256, 'sandbox.outputMb': 10,
  'codegraph.gitlabUrl': '', 'codegraph.gitlabToken': '', 'codegraph.projects': [], 'codegraph.branch': 'master',
})
const servers = ref<any[]>([])
const repositories = ref<any[]>([])
const metrics = ref<any>({})
const newServer = reactive({ name: '', title: '', url: '', token: '', purpose: '', toolAllowlistText: '' })

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: 'include', ...options, headers: options?.body ? { 'Content-Type': 'application/json' } : undefined })
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).detail || `请求失败：${response.status}`)
  return response.status === 204 ? undefined as T : response.json()
}

async function load() {
  loading.value = true
  try {
    const [configured, mcp, repos, metricSummary] = await Promise.all([
      request<Record<string, any>>('/api/admin/agent/settings'), request<any[]>('/api/admin/mcp/servers'), request<any[]>('/api/admin/codegraph/repositories'), request<any>('/api/admin/agent/metrics'),
    ])
    Object.assign(settings, configured); servers.value = mcp; repositories.value = repos; metrics.value = metricSummary
  } catch (error) { message.value = (error as Error).message }
  finally { loading.value = false }
}

async function saveSettings() {
  await request('/api/admin/agent/settings', { method: 'PUT', body: JSON.stringify({ values: settings }) })
  settings['search.tavilyKey'] = ''; settings['codegraph.gitlabToken'] = ''; message.value = '配置已保存'
}

async function addServer() {
  const payload = { ...newServer, toolAllowlist: newServer.toolAllowlistText.split(',').map((item) => item.trim()).filter(Boolean) }
  await request('/api/admin/mcp/servers', { method: 'POST', body: JSON.stringify(payload) })
  Object.assign(newServer, { name: '', title: '', url: '', token: '', purpose: '', toolAllowlistText: '' }); await load()
}

async function probe(id: string) { await request(`/api/admin/mcp/servers/${id}/probe`, { method: 'POST' }); await load() }
async function updateServer(server: any) {
  await request(`/api/admin/mcp/servers/${server.id}`, { method: 'PATCH', body: JSON.stringify({ enabled: server.enabled, toolAllowlist: server.toolAllowlist || [] }) })
  message.value = 'MCP 配置已更新'; await load()
}
function changeAllowlist(server: any, event: Event) {
  server.toolAllowlist = (event.target as HTMLInputElement).value.split(',').map((item) => item.trim()).filter(Boolean)
  void updateServer(server)
}
async function removeServer(id: string) { if (confirm('删除该 MCP 配置？')) { await request(`/api/admin/mcp/servers/${id}`, { method: 'DELETE' }); await load() } }
async function syncCodeGraph(projectId?: string) { await saveSettings(); await request('/api/admin/codegraph/sync', { method: 'POST', body: JSON.stringify(projectId ? { projectId } : {}) }); message.value = '已触发 Code Graph 同步'; setTimeout(load, 1200) }
function projectsText(): string { return Array.isArray(settings['codegraph.projects']) ? settings['codegraph.projects'].join(',') : String(settings['codegraph.projects'] || '') }
function updateProjects(value: string) { settings['codegraph.projects'] = value.split(',').map((item) => item.trim()).filter(Boolean) }
onMounted(load)
</script>

<template>
  <div class="min-h-screen bg-[#f2f0e9] px-6 py-8 text-stone-800">
    <div class="mx-auto max-w-5xl">
      <header class="mb-8 flex items-center justify-between">
        <div class="flex items-center gap-4"><button title="返回 Agent" class="rounded-xl bg-white p-2.5 text-stone-500 shadow-sm hover:text-stone-900" @click="router.push('/agent')"><ArrowLeftIcon class="h-5 w-5" /></button><div><p class="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Control plane</p><h1 class="font-serif text-3xl">Agent 系统设置</h1></div></div>
        <button class="rounded-xl bg-[#1e2925] px-5 py-2.5 text-sm font-medium text-[#d9ff62]" @click="saveSettings">保存配置</button>
      </header>
      <div class="mb-6 flex gap-1 rounded-xl bg-stone-200/70 p-1">
        <button v-for="item in [{k:'runtime',n:'运行参数'},{k:'mcp',n:'MCP 服务'},{k:'codegraph',n:'Code Graph'}]" :key="item.k" :class="['flex-1 rounded-lg px-4 py-2 text-sm', tab===item.k ? 'bg-white font-medium shadow-sm' : 'text-stone-500']" @click="tab=item.k as any">{{ item.n }}</button>
      </div>
      <p v-if="message" class="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{{ message }}</p>

      <section v-if="tab==='runtime'" class="grid gap-5 md:grid-cols-2">
        <div class="grid grid-cols-3 gap-3 md:col-span-2">
          <div v-for="item in [{n:'24h 运行',v:metrics.runs || 0},{n:'工具调用',v:metrics.toolCalls || 0},{n:'首字延迟',v:`${metrics.averageFirstTokenMs || 0} ms`}]" :key="item.n" class="rounded-2xl bg-[#1e2925] px-5 py-4 text-stone-100"><p class="text-[10px] uppercase tracking-[0.18em] text-emerald-300/70">{{ item.n }}</p><p class="mt-2 font-serif text-2xl">{{ item.v }}</p></div>
        </div>
        <div class="rounded-2xl bg-white p-6 shadow-sm"><h2 class="mb-5 font-serif text-xl">模型与搜索</h2><div class="space-y-4">
          <label class="block text-xs text-stone-500">Agent 模型<input v-model="settings['model.name']" class="mt-1.5 w-full rounded-xl bg-stone-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-600/20" placeholder="例如 gpt-5.4" /></label>
          <div class="grid grid-cols-2 gap-3"><label class="text-xs text-stone-500">主搜索<select v-model="settings['search.primary']" class="mt-1.5 w-full rounded-xl bg-stone-100 px-3 py-2.5 text-sm"><option>searxng</option><option>tavily</option></select></label><label class="text-xs text-stone-500">备用搜索<select v-model="settings['search.fallback']" class="mt-1.5 w-full rounded-xl bg-stone-100 px-3 py-2.5 text-sm"><option>tavily</option><option>searxng</option><option>none</option></select></label></div>
          <label class="block text-xs text-stone-500">SearXNG 地址<input v-model="settings['search.searxngUrl']" class="mt-1.5 w-full rounded-xl bg-stone-100 px-3 py-2.5 text-sm" /></label>
          <label class="block text-xs text-stone-500">Tavily Key<input v-model="settings['search.tavilyKey']" type="password" class="mt-1.5 w-full rounded-xl bg-stone-100 px-3 py-2.5 text-sm" placeholder="留空保持原值" /></label>
          <label class="block text-xs text-stone-500">开放 API Token<input v-model="settings['external.apiToken']" type="password" class="mt-1.5 w-full rounded-xl bg-stone-100 px-3 py-2.5 text-sm" placeholder="留空保持原值" /></label>
          <div class="grid grid-cols-2 gap-3"><label class="text-xs text-stone-500">域名白名单<input v-model="settings['search.allowedDomains']" class="mt-1.5 w-full rounded-xl bg-stone-100 px-3 py-2.5 text-sm" placeholder="留空不限制" /></label><label class="text-xs text-stone-500">域名黑名单<input v-model="settings['search.blockedDomains']" class="mt-1.5 w-full rounded-xl bg-stone-100 px-3 py-2.5 text-sm" placeholder="逗号分隔" /></label></div>
        </div></div>
        <div class="rounded-2xl bg-white p-6 shadow-sm"><h2 class="mb-5 font-serif text-xl">预算与沙盒</h2><div class="grid grid-cols-2 gap-4">
          <label v-for="field in [{k:'agent.maxRounds',n:'最大轮次'},{k:'agent.maxDurationSeconds',n:'Agent 秒数'},{k:'sandbox.timeoutSeconds',n:'脚本秒数'},{k:'sandbox.memoryMb',n:'内存 MB'},{k:'sandbox.cpus',n:'CPU'},{k:'sandbox.pids',n:'PID'}]" :key="field.k" class="text-xs text-stone-500">{{ field.n }}<input v-model.number="settings[field.k]" type="number" class="mt-1.5 w-full rounded-xl bg-stone-100 px-3 py-2.5 text-sm" /></label>
        </div><p class="mt-5 text-xs leading-5 text-stone-400">沙盒默认禁网、非特权、只读根文件系统。这里仅能在后端安全上限内调整。</p></div>
      </section>

      <section v-else-if="tab==='mcp'" class="space-y-5">
        <div class="rounded-2xl bg-white p-6 shadow-sm"><h2 class="mb-4 font-serif text-xl">接入领域 MCP</h2><div class="grid gap-3 md:grid-cols-2"><input v-model="newServer.name" class="rounded-xl bg-stone-100 px-3 py-2.5 text-sm" placeholder="唯一名称，例如 knowledge" /><input v-model="newServer.title" class="rounded-xl bg-stone-100 px-3 py-2.5 text-sm" placeholder="显示名称" /><input v-model="newServer.url" class="rounded-xl bg-stone-100 px-3 py-2.5 text-sm md:col-span-2" placeholder="Streamable HTTP 地址" /><input v-model="newServer.token" type="password" class="rounded-xl bg-stone-100 px-3 py-2.5 text-sm" placeholder="服务令牌" /><input v-model="newServer.purpose" class="rounded-xl bg-stone-100 px-3 py-2.5 text-sm" placeholder="用途说明" /><input v-model="newServer.toolAllowlistText" class="rounded-xl bg-stone-100 px-3 py-2.5 text-sm md:col-span-2" placeholder="工具白名单，逗号分隔；留空允许全部" /></div><button class="mt-4 flex items-center gap-2 rounded-xl bg-[#1e2925] px-4 py-2 text-sm text-white" @click="addServer"><PlusIcon class="h-4 w-4" />添加</button></div>
        <div class="grid gap-3 md:grid-cols-2"><div v-for="server in servers" :key="server.id" class="rounded-2xl bg-white p-5 shadow-sm"><div class="flex items-start gap-3"><span :class="['mt-1 h-2.5 w-2.5 rounded-full',server.status==='available'?'bg-emerald-500':'bg-amber-500']" /><div class="min-w-0 flex-1"><p class="font-medium">{{ server.title }}</p><p class="truncate text-xs text-stone-400">{{ server.url }}</p></div><label class="flex items-center gap-2 text-xs text-stone-500"><input v-model="server.enabled" type="checkbox" @change="updateServer(server)" />启用</label></div><p class="mt-4 text-xs text-stone-500">{{ server.tools?.length || 0 }} 个工具 · {{ server.latencyMs || '—' }} ms<span v-if="server.lastError" class="mt-1 block text-rose-500">{{ server.lastError }}</span></p><input :value="(server.toolAllowlist || []).join(',')" class="mt-3 w-full rounded-lg bg-stone-100 px-3 py-2 text-xs" placeholder="工具白名单（留空允许全部）" @change="changeAllowlist(server, $event)" /><div class="mt-4 flex gap-2"><button title="重新探测" class="rounded-lg bg-stone-100 p-2 hover:bg-stone-200" @click="probe(server.id)"><ArrowPathIcon class="h-4 w-4" /></button><button title="删除" class="rounded-lg bg-rose-50 p-2 text-rose-600" @click="removeServer(server.id)"><TrashIcon class="h-4 w-4" /></button></div></div></div>
      </section>

      <section v-else class="space-y-5">
        <div class="rounded-2xl bg-white p-6 shadow-sm"><div class="flex items-center justify-between"><div><h2 class="font-serif text-xl">独立 Code Graph</h2><p class="mt-1 text-xs text-stone-400">从 GitLab 创建不可变快照，图数据与知识图谱隔离。</p></div><button class="rounded-xl bg-[#1e2925] px-4 py-2 text-sm text-[#d9ff62]" @click="syncCodeGraph()">同步全部</button></div><div class="mt-5 grid gap-3 md:grid-cols-2"><input v-model="settings['codegraph.gitlabUrl']" class="rounded-xl bg-stone-100 px-3 py-2.5 text-sm" placeholder="GitLab URL" /><input v-model="settings['codegraph.gitlabToken']" type="password" class="rounded-xl bg-stone-100 px-3 py-2.5 text-sm" placeholder="Token（留空保持）" /><input :value="projectsText()" class="rounded-xl bg-stone-100 px-3 py-2.5 text-sm" placeholder="项目 ID，逗号分隔" @input="updateProjects(($event.target as HTMLInputElement).value)" /><input v-model="settings['codegraph.branch']" class="rounded-xl bg-stone-100 px-3 py-2.5 text-sm" placeholder="默认分支" /></div></div>
        <div class="rounded-2xl bg-white p-6 shadow-sm"><h2 class="mb-4 font-serif text-xl">同步状态</h2><div class="space-y-2"><div v-for="repo in repositories" :key="repo.projectId" class="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3"><CheckCircleIcon :class="['h-5 w-5',repo.status==='ready'?'text-emerald-600':'text-amber-500']" /><div class="min-w-0 flex-1"><p class="text-sm font-medium">{{ repo.name }}</p><p class="truncate text-xs text-stone-400">{{ repo.branch }}@{{ repo.commitSha || '等待同步' }} · {{ repo.nodeCount }} 节点</p></div><button title="同步此仓库" class="rounded-lg p-2 hover:bg-stone-200" @click="syncCodeGraph(repo.projectId)"><ArrowPathIcon class="h-4 w-4" /></button></div><p v-if="!repositories.length" class="py-8 text-center text-sm text-stone-400">尚未同步代码仓库</p></div></div>
      </section>
    </div>
  </div>
</template>
