<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import {
  ArrowLeftIcon, ArrowUpIcon, Bars3BottomLeftIcon, BoltIcon, BookOpenIcon, ChevronDownIcon, CpuChipIcon,
  ArrowPathIcon, Cog6ToothIcon, DocumentPlusIcon, GlobeAltIcon, PaperClipIcon, PlusIcon, ServerStackIcon, StopIcon, TrashIcon,
  WrenchScrewdriverIcon, XMarkIcon,
} from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'
import AgentActivityTimeline from '../components/AgentActivityTimeline.vue'
import MarkdownRender from 'markstream-vue'
import { agentApi, streamAgent, type AgentEvent, type AgentMode, type Attachment, type ChatMessage, type Conversation } from '../api/agent'

const router = useRouter()
const conversations = ref<Conversation[]>([])
const activeId = ref('')
const messages = ref<ChatMessage[]>([])
const attachments = ref<Attachment[]>([])
const activities = ref<AgentEvent[]>([])
const prompt = ref('')
const mode = ref<AgentMode>('auto')
const streaming = ref(false)
const activeMessageId = ref('')
const stopStream = ref<null | (() => void)>(null)
const scrollEl = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const mcpOpen = ref(false)
const capabilities = ref<any>({ mcpServers: [] })
const error = ref('')

const modeOptions: Array<{ value: AgentMode; label: string; tip: string; icon: any }> = [
  { value: 'auto', label: '自动', tip: '由 Agent 选择最合适的能力', icon: BoltIcon },
  { value: 'general', label: '通识', tip: '通识问答、联网、附件与脚本', icon: GlobeAltIcon },
  { value: 'knowledge', label: '知识检索', tip: '只执行一次确定性知识库检索', icon: BookOpenIcon },
  { value: 'agent', label: 'Agent 增强', tip: '多轮编排知识库、监控和代码图谱', icon: CpuChipIcon },
]

const activeConversation = computed(() => conversations.value.find((item) => item.id === activeId.value))

async function scrollBottom(behavior: ScrollBehavior = 'auto') { await nextTick(); scrollEl.value?.scrollTo({ top: scrollEl.value.scrollHeight, behavior }) }

async function loadConversations() {
  conversations.value = await agentApi.listConversations()
  const first = conversations.value[0]
  if (!activeId.value && first) await openConversation(first.id)
}

async function createConversation() {
  const conversation = await agentApi.createConversation(mode.value)
  conversations.value.unshift(conversation); activeId.value = conversation.id
  messages.value = []; attachments.value = []; activities.value = []
}

async function openConversation(id: string) {
  if (streaming.value) return
  const conversation = await agentApi.getConversation(id)
  activeId.value = id; messages.value = conversation.messages || []; attachments.value = conversation.attachments || []
  mode.value = conversation.mode; activities.value = messages.value.flatMap((item) => item.trace || [])
  await scrollBottom()
}

async function removeConversation(id: string) {
  if (!confirm('删除该会话及附件？此操作不可恢复。')) return
  await agentApi.deleteConversation(id); conversations.value = conversations.value.filter((item) => item.id !== id)
  if (activeId.value === id) { activeId.value = ''; messages.value = []; attachments.value = []; await loadConversations() }
}

async function changeMode(value: AgentMode) {
  mode.value = value
  if (activeId.value) await agentApi.updateConversation(activeId.value, { mode: value })
}

async function uploadFiles(event: Event) {
  const files = Array.from((event.target as HTMLInputElement).files || [])
  if (!files.length) return
  if (!activeId.value) await createConversation()
  try { attachments.value.push(...await agentApi.upload(activeId.value, files)) } catch (cause) { error.value = (cause as Error).message }
  if (fileInput.value) fileInput.value.value = ''
}

async function send() {
  const text = prompt.value.trim()
  await runPrompt(text)
}

/** 发送指定问题，供正常发送和重新生成共用。 */
async function runPrompt(text: string) {
  if (!text || streaming.value) return
  if (!activeId.value) await createConversation()
  prompt.value = ''; error.value = ''; activities.value = []; streaming.value = true
  messages.value.push({ id: `local-user-${Date.now()}`, role: 'user', content: text, status: 'completed' })
  // 必须使用响应式对象承接 SSE 增量，否则 Vue 会延迟到下一次状态变化才刷新正文。
  const assistant = reactive<ChatMessage>({ id: `local-agent-${Date.now()}`, role: 'assistant', content: '', status: 'streaming', trace: [] })
  messages.value.push(assistant); await scrollBottom()
  stopStream.value = streamAgent(activeId.value, text, mode.value, async (event) => {
    if (event.type === 'message_started') { activeMessageId.value = String(event.messageId || ''); assistant.id = activeMessageId.value }
    else if (event.type === 'delta') assistant.content += event.content || ''
    else if (event.type.startsWith('tool_') || event.type === 'progress') { activities.value.push(event); assistant.trace = [...activities.value] }
    else if (event.type === 'artifact' && event.attachmentId) attachments.value.push({ id: String(event.attachmentId), filename: String(event.filename || 'artifact'), mimeType: String(event.mimeType || 'application/octet-stream'), sizeBytes: Number(event.sizeBytes || 0), status: 'generated' })
    else if (event.type === 'error') { error.value = event.message || '生成失败'; assistant.status = 'failed'; streaming.value = false }
    else if (event.type === 'done') { assistant.status = 'completed'; streaming.value = false; await loadConversations() }
    await scrollBottom(event.type === 'done' ? 'smooth' : 'auto')
  })
}

/** 使用当前回答前的用户问题重新生成。 */
async function regenerate(index: number) {
  const previous = [...messages.value.slice(0, index)].reverse().find((item) => item.role === 'user')
  if (previous) await runPrompt(previous.content)
}

async function cancel() {
  if (activeId.value && activeMessageId.value) await agentApi.cancel(activeId.value, activeMessageId.value).catch(() => undefined)
  stopStream.value?.(); streaming.value = false
}

onMounted(async () => {
  try { await Promise.all([loadConversations(), agentApi.capabilities().then((value) => { capabilities.value = value })]) }
  catch (cause) { error.value = (cause as Error).message }
})
</script>

<template>
  <div class="h-[100dvh] min-h-0 overflow-hidden bg-[#f6f6f4] text-[#2f3437]">
    <div class="grid h-full grid-cols-[260px_minmax(0,1fr)]">
      <aside class="flex min-h-0 flex-col border-r border-[#e3e3df] bg-[#f1f2ef] px-3 py-4 text-[#2f3437]">
        <div class="mb-5 flex items-center gap-3 px-2">
          <button title="返回工具箱" class="rounded-lg p-1.5 text-[#8c938e] hover:bg-white hover:text-[#2f3437]" @click="router.push('/')"><ArrowLeftIcon class="h-4 w-4" /></button>
          <div class="min-w-0"><p class="font-serif text-lg tracking-wide">BX Agent</p><p class="text-[10px] uppercase tracking-[0.22em] text-[#829486]">Unified intelligence</p></div>
        </div>
        <button class="mb-4 flex items-center justify-center gap-2 rounded-xl bg-[#66796d] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#56685e]" @click="createConversation"><PlusIcon class="h-4 w-4" />新建会话</button>
        <div class="min-h-0 flex-1 space-y-1 overflow-y-auto">
          <div v-for="item in conversations" :key="item.id" :class="['group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition', activeId === item.id ? 'bg-white text-[#2f3437] shadow-sm' : 'text-[#7b837d] hover:bg-white/70 hover:text-[#2f3437]']">
            <button class="min-w-0 flex-1 truncate text-left" @click="openConversation(item.id)">{{ item.title }}</button>
            <button class="invisible rounded p-1 text-stone-500 hover:text-rose-300 group-hover:visible" @click="removeConversation(item.id)"><TrashIcon class="h-3.5 w-3.5" /></button>
          </div>
        </div>
        <button class="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#7b837d] hover:bg-white/70 hover:text-[#2f3437]" @click="mcpOpen = true"><ServerStackIcon class="h-4 w-4" />MCP 能力状态<span class="ml-auto h-2 w-2 rounded-full bg-[#7fa084]" /></button>
        <button v-if="capabilities.user?.admin" class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#7b837d] hover:bg-white/70 hover:text-[#2f3437]" @click="router.push('/agent/settings')"><Cog6ToothIcon class="h-4 w-4" />系统设置</button>
      </aside>

      <main class="relative flex min-w-0 flex-col">
        <header class="flex h-16 shrink-0 items-center justify-between border-b border-stone-300/70 px-6">
          <div class="min-w-0"><h1 class="truncate font-serif text-lg">{{ activeConversation?.title || '新的分析任务' }}</h1><p class="text-[11px] text-[#8a918c]">回答、检索、执行，所有证据汇集在一个会话</p></div>
          <div class="flex rounded-xl bg-stone-200/70 p-1">
            <button v-for="item in modeOptions" :key="item.value" :title="item.tip" :class="['flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition', mode === item.value ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800']" @click="changeMode(item.value)"><component :is="item.icon" class="h-3.5 w-3.5" />{{ item.label }}</button>
          </div>
        </header>

        <section ref="scrollEl" class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-8">
          <div class="mx-auto max-w-3xl space-y-7">
            <div v-if="!messages.length" class="py-[12vh] text-center">
              <div class="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-[26px] bg-[#e7eee8] text-[#66836d] shadow-sm"><CpuChipIcon class="h-9 w-9" /></div>
              <h2 class="font-serif text-3xl text-stone-800">从一个问题开始</h2>
              <p class="mx-auto mt-3 max-w-lg text-sm leading-6 text-stone-500">我会按问题选择联网搜索、知识库、监控数据、Code Graph 或隔离沙盒，并把调用过程展示给你。</p>
              <div class="mx-auto mt-8 grid max-w-xl grid-cols-2 gap-3 text-left text-xs text-stone-600">
                <button class="rounded-xl bg-white/70 p-4 hover:bg-white" @click="prompt='分析最近的服务异常，并结合代码调用关系定位原因'">跨系统排障<span class="mt-1 block text-stone-400">监控 + Code Graph</span></button>
                <button class="rounded-xl bg-white/70 p-4 hover:bg-white" @click="prompt='总结附件内容，并列出需要确认的关键问题'">文档分析<span class="mt-1 block text-stone-400">上传、摘要与提取</span></button>
              </div>
            </div>
            <article v-for="(message, messageIndex) in messages" :key="message.id" :class="['flex', message.role === 'user' ? 'justify-end' : 'justify-start']">
              <div v-if="message.role === 'user'" class="max-w-[78%] rounded-2xl rounded-br-md bg-[#3d4943] px-4 py-3 text-sm leading-6 text-white">{{ message.content }}</div>
              <div v-else class="w-full min-w-0">
                <div class="mb-2 flex items-center gap-2 text-xs font-semibold text-[#737b76]"><span class="grid h-6 w-6 place-items-center rounded-lg bg-[#e7eee8] text-[#66836d]"><CpuChipIcon class="h-3.5 w-3.5" /></span>BX Agent</div>
                <AgentActivityTimeline :events="message.trace || []" :running="message.status === 'streaming'" />
                <MarkdownRender v-if="message.content" mode="chat" :content="message.content" :final="message.status !== 'streaming'" :smooth-streaming="false" :show-tooltips="false" :render-code-blocks-as-pre="true" class="markdown-body prose prose-stone mt-3 max-w-none text-sm leading-7 prose-a:text-[#5d7865]" />
                <div v-else-if="message.status === 'streaming'" class="mt-4 flex items-center gap-1.5 text-xs text-stone-400"><span class="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-600" /><span class="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-600 [animation-delay:120ms]" /><span class="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-600 [animation-delay:240ms]" /></div>
                <button v-if="message.status !== 'streaming'" title="重新生成" class="mt-2 rounded-lg p-1.5 text-stone-400 hover:bg-white hover:text-stone-700" @click="regenerate(messageIndex)"><ArrowPathIcon class="h-4 w-4" /></button>
              </div>
            </article>
          </div>
        </section>

        <footer class="shrink-0 px-6 pb-5">
          <div class="mx-auto max-w-3xl">
            <div v-if="attachments.length" class="mb-2 flex gap-2 overflow-x-auto">
              <a v-for="file in attachments" :key="file.id" :href="`/api/agent/attachments/${file.id}`" class="flex shrink-0 items-center gap-1.5 rounded-lg bg-white/80 px-2.5 py-1.5 text-xs text-stone-600 hover:bg-white" :title="`下载 ${file.filename}`"><DocumentPlusIcon class="h-3.5 w-3.5 text-emerald-700" />{{ file.filename }}</a>
            </div>
            <p v-if="error" class="mb-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{{ error }}</p>
            <div class="rounded-2xl bg-white p-2 shadow-[0_14px_40px_rgba(38,42,36,0.12)] ring-1 ring-stone-200">
              <textarea v-model="prompt" rows="2" class="max-h-40 min-h-[64px] w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 outline-none placeholder:text-stone-400" placeholder="描述问题，或附上文档后告诉我需要完成什么…" :disabled="streaming" @keydown.enter.exact.prevent="send" />
              <div class="flex items-center justify-between px-1 pb-1">
                <div><input ref="fileInput" type="file" multiple class="hidden" accept=".pdf,.docx,.pptx,.txt,.md,.html,.png,.jpg,.jpeg,.webp,.tif,.tiff" @change="uploadFiles" /><button title="添加会话附件" class="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700" @click="fileInput?.click()"><PaperClipIcon class="h-4 w-4" /></button></div>
                <button v-if="streaming" title="停止生成" class="grid h-9 w-9 place-items-center rounded-xl bg-stone-800 text-white hover:bg-stone-700" @click="cancel"><StopIcon class="h-4 w-4" /></button>
                <button v-else title="发送" :disabled="!prompt.trim()" class="grid h-9 w-9 place-items-center rounded-xl bg-[#66796d] text-white disabled:opacity-30" @click="send"><ArrowUpIcon class="h-4 w-4" /></button>
              </div>
            </div>
            <p class="mt-2 text-center text-[10px] tracking-wide text-stone-400">工具执行在隔离环境中进行 · 重要结论请结合来源复核</p>
          </div>
        </footer>
      </main>
    </div>

    <div v-if="mcpOpen" class="fixed inset-0 z-50 flex justify-end bg-[#27302b]/15 backdrop-blur-[2px]" @click.self="mcpOpen=false">
      <aside class="h-full w-[min(520px,100vw)] overflow-y-auto border-l border-[#e2e3df] bg-[#fbfbf9] p-6 shadow-2xl">
        <div class="mb-6 flex items-start justify-between"><div><p class="text-[10px] uppercase tracking-[0.24em] text-[#758b7a]">Capability registry</p><h2 class="mt-1 font-serif text-2xl">MCP 能力</h2><p class="mt-1 text-xs text-[#929993]">服务状态、工具说明和输入输出 Schema</p></div><button class="rounded-lg p-2 hover:bg-[#eef0ed]" @click="mcpOpen=false"><XMarkIcon class="h-5 w-5" /></button></div>
        <div class="space-y-3">
          <details v-for="server in capabilities.mcpServers" :key="server.name" class="group rounded-xl border border-[#e5e6e2] bg-white p-4 open:shadow-sm" open>
            <summary class="flex cursor-pointer list-none items-center gap-3"><span :class="['h-2 w-2 rounded-full', server.status === 'available' ? 'bg-[#7fa084]' : 'bg-[#b7965f]']" /><div class="min-w-0 flex-1"><p class="font-medium text-[#3d4541]">{{ server.title || server.name }}</p><p class="mt-0.5 text-xs text-[#929993]">{{ server.tools?.length || 0 }} 个工具 · {{ server.latency_ms || '—' }} ms<span v-if="server.last_error"> · {{ server.last_error }}</span></p></div><ChevronDownIcon class="h-4 w-4 text-[#a3aaa4] transition group-open:rotate-180" /></summary>
            <div class="mt-3 space-y-2 border-t border-[#eff0ed] pt-3">
              <details v-for="tool in server.tools || []" :key="tool.name" class="rounded-lg border border-[#eceeea] bg-[#fafbf9] px-3 py-2">
                <summary class="flex cursor-pointer list-none items-start gap-2"><WrenchScrewdriverIcon class="mt-0.5 h-4 w-4 shrink-0 text-[#78917e]" /><span class="min-w-0 flex-1"><span class="block font-mono text-xs text-[#3d4541]">{{ tool.name }}</span><span class="mt-1 block text-[11px] leading-5 text-[#858d87]">{{ tool.description || '暂无工具说明' }}</span></span><ChevronDownIcon class="h-3.5 w-3.5 text-[#a3aaa4]" /></summary>
                <div class="mt-3 space-y-2 border-t border-[#eceeea] pt-2 text-[11px] text-[#727a74]"><p class="font-medium text-[#59635d]">输入参数</p><pre class="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-md bg-[#f1f3f0] p-2 font-mono text-[10px] leading-4">{{ JSON.stringify(tool.inputSchema || tool.input_schema || {}, null, 2) }}</pre><p class="font-medium text-[#59635d]">返回信息</p><pre class="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-md bg-[#f1f3f0] p-2 font-mono text-[10px] leading-4">{{ (tool.outputSchema || tool.output_schema) ? JSON.stringify(tool.outputSchema || tool.output_schema, null, 2) : '由工具动态返回，当前 MCP 未声明 outputSchema' }}</pre></div>
              </details>
              <p v-if="!server.tools?.length" class="py-3 text-center text-xs text-[#9a9f9a]">暂无可用工具</p>
            </div>
          </details>
          <div v-if="!capabilities.mcpServers?.length" class="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-400"><WrenchScrewdriverIcon class="mx-auto mb-3 h-7 w-7" />尚未配置领域 MCP</div>
        </div>
      </aside>
    </div>
  </div>
</template>
