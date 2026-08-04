<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import { useToast } from '../../composables/useToast'
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  NoSymbolIcon,
  PlusIcon,
  QrCodeIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'

interface MiniProgramQrCode {
  id: number
  code: string
  title: string
  targetUrl: string
  envVersion: 'develop' | 'trial' | 'release'
  enabled: boolean
  expiresAt: string
  createdAt: string
  updatedAt: string
}

const toast = useToast()
const records = ref<MiniProgramQrCode[]>([])
const loading = ref(true)
const generating = ref(false)
const selected = ref<MiniProgramQrCode | null>(null)
const allowedDomains = ref<string[]>([])
const form = reactive({
  title: '',
  targetUrl: '',
  envVersion: 'trial',
  expiresAt: '',
})

const selectedImageUrl = computed(() =>
  selected.value ? `/api/mini-program-qrcode/${selected.value.id}/image` : ''
)

/**
 * 加载小程序码历史记录。
 *
 * @return 无返回值。
 */
async function fetchRecords() {
  loading.value = true
  try {
    const response = await fetch('/api/mini-program-qrcode')
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || '加载失败')
    records.value = data
    if (selected.value) {
      selected.value = records.value.find(item => item.id === selected.value?.id) || null
    }
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '加载失败')
  } finally {
    loading.value = false
  }
}

/**
 * 加载小程序码生成默认配置。
 *
 * @return 无返回值。
 */
async function fetchConfig() {
  try {
    const response = await fetch('/api/mini-program-qrcode/config')
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || '配置加载失败')
    if (['develop', 'trial', 'release'].includes(data.defaultEnvVersion)) {
      form.envVersion = data.defaultEnvVersion
    }
    allowedDomains.value = Array.isArray(data.allowedDomains) ? data.allowedDomains : []
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '配置加载失败')
  }
}

/**
 * 创建微信无限小程序码。
 *
 * @return 无返回值。
 */
async function createQrCode() {
  if (!form.title.trim() || !form.targetUrl.trim()) {
    toast.warning('请填写名称和 WebView 地址')
    return
  }
  generating.value = true
  try {
    const response = await fetch('/api/mini-program-qrcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : '',
      }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || '生成失败')
    records.value.unshift(data)
    selected.value = data
    form.title = ''
    form.targetUrl = ''
    form.expiresAt = ''
    toast.success('小程序码生成成功')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '生成失败')
  } finally {
    generating.value = false
  }
}

/**
 * 启用或停用小程序码。
 *
 * @param record 需要切换状态的记录。
 * @return 无返回值。
 */
async function toggleStatus(record: MiniProgramQrCode) {
  try {
    const response = await fetch(`/api/mini-program-qrcode/${record.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !record.enabled }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || '状态更新失败')
    record.enabled = !record.enabled
    toast.success(record.enabled ? '小程序码已启用' : '小程序码已停用')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '状态更新失败')
  }
}

/**
 * 删除小程序码记录。
 *
 * @param record 待删除记录。
 * @return 无返回值。
 */
async function deleteRecord(record: MiniProgramQrCode) {
  if (!window.confirm(`确定删除“${record.title}”吗？`)) return
  try {
    const response = await fetch(`/api/mini-program-qrcode/${record.id}`, {
      method: 'DELETE',
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || '删除失败')
    records.value = records.value.filter(item => item.id !== record.id)
    if (selected.value?.id === record.id) selected.value = null
    toast.success('记录已删除')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '删除失败')
  }
}

/**
 * 格式化服务端时间。
 *
 * @param value ISO 或 SQLite 时间字符串。
 * @return 本地时间文本。
 */
function formatTime(value: string) {
  if (!value) return '永久'
  const normalized = value.includes('T') ? value : `${value.replace(' ', 'T')}Z`
  return new Date(normalized).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchRecords()
  fetchConfig()
})
</script>

<template>
  <ToolLayout title="小程序码平台">
    <div class="grid gap-5 xl:grid-cols-[390px_1fr]">
      <aside class="space-y-5">
        <section class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 text-white">
          <div class="border-b border-white/10 p-5">
            <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15">
              <DevicePhoneMobileIcon class="h-5 w-5 text-emerald-300" />
            </div>
            <h2 class="text-lg font-semibold">WebView → 小程序码</h2>
            <p class="mt-1 text-xs leading-5 text-slate-400">
              URL 存入短码数据库，二维码只携带短码，可随时停用。
            </p>
          </div>
          <div class="space-y-4 p-5">
            <label class="block">
              <span class="mb-1.5 block text-xs font-medium text-slate-300">名称</span>
              <input
                v-model="form.title"
                maxlength="100"
                class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/60"
                placeholder="例如：酒店险 QA 验收"
              />
            </label>
            <label class="block">
              <span class="mb-1.5 block text-xs font-medium text-slate-300">WebView 地址</span>
              <textarea
                v-model="form.targetUrl"
                rows="5"
                class="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-xs leading-5 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/60"
                placeholder="http://www.qa.baoxianzj.com/yf/..."
              />
              <span class="mt-1.5 block text-[11px] text-slate-500">
                支持 HTTP QA 地址，生成后会自动通过 bx-tools HTTPS 网关转发；需要模拟永丰小程序环境时，请在地址中加入 from=yfSelf。
              </span>
              <span v-if="allowedDomains.length" class="mt-1 block text-[11px] text-slate-500">
                允许域名：{{ allowedDomains.join('、') }}
              </span>
            </label>
            <div class="grid grid-cols-2 gap-3">
              <label>
                <span class="mb-1.5 block text-xs font-medium text-slate-300">小程序版本</span>
                <select
                  v-model="form.envVersion"
                  class="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none"
                >
                  <option value="develop">开发版</option>
                  <option value="trial">体验版</option>
                  <option value="release">正式版</option>
                </select>
              </label>
              <label>
                <span class="mb-1.5 block text-xs font-medium text-slate-300">过期时间</span>
                <input
                  v-model="form.expiresAt"
                  type="datetime-local"
                  class="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-xs text-white outline-none"
                />
              </label>
            </div>
            <button
              :disabled="generating"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
              @click="createQrCode"
            >
              <PlusIcon class="h-4 w-4" />
              {{ generating ? '正在请求微信生成…' : '生成小程序码' }}
            </button>
          </div>
        </section>

        <section v-if="selected" class="glass-card p-5 text-center">
          <div class="mx-auto mb-3 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
            <img :src="selectedImageUrl" :alt="selected.title" class="block h-auto w-full" />
          </div>
          <h3 class="font-semibold text-slate-800">{{ selected.title }}</h3>
          <p class="mt-1 font-mono text-xs text-slate-400">scene=q={{ selected.code }}</p>
          <a
            :href="selectedImageUrl"
            download
            class="btn-secondary mt-4 inline-flex items-center gap-2 text-sm"
          >
            <ArrowDownTrayIcon class="h-4 w-4" />
            下载图片
          </a>
        </section>
      </aside>

      <section class="glass-card overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 class="font-semibold text-slate-800">历史小程序码</h2>
            <p class="mt-0.5 text-xs text-slate-500">最多展示最近 200 条</p>
          </div>
          <div class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {{ records.length }} 条
          </div>
        </div>

        <div v-if="loading" class="py-20 text-center text-sm text-slate-500">正在加载…</div>
        <div v-else-if="records.length === 0" class="py-24 text-center">
          <QrCodeIcon class="mx-auto h-12 w-12 text-slate-200" />
          <p class="mt-3 text-sm text-slate-500">还没有生成过小程序码</p>
        </div>
        <div v-else class="divide-y divide-slate-100">
          <article
            v-for="record in records"
            :key="record.id"
            class="group cursor-pointer px-5 py-4 transition-colors hover:bg-slate-50"
            :class="{ 'bg-blue-50/50': selected?.id === record.id }"
            @click="selected = record"
          >
            <div class="flex items-start gap-4">
              <div
                class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                :class="record.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'"
              >
                <QrCodeIcon class="h-5 w-5" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="truncate text-sm font-semibold text-slate-800">{{ record.title }}</h3>
                  <span
                    class="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                    :class="record.envVersion === 'release'
                      ? 'bg-blue-50 text-blue-600'
                      : record.envVersion === 'trial'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-600'"
                  >
                    {{ record.envVersion }}
                  </span>
                  <span
                    class="inline-flex items-center gap-1 text-[11px]"
                    :class="record.enabled ? 'text-emerald-600' : 'text-slate-400'"
                  >
                    <CheckCircleIcon v-if="record.enabled" class="h-3.5 w-3.5" />
                    <NoSymbolIcon v-else class="h-3.5 w-3.5" />
                    {{ record.enabled ? '启用' : '停用' }}
                  </span>
                </div>
                <p class="mt-1 truncate font-mono text-xs text-slate-500">{{ record.targetUrl }}</p>
                <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
                  <span>短码 {{ record.code }}</span>
                  <span>创建 {{ formatTime(record.createdAt) }}</span>
                  <span>过期 {{ formatTime(record.expiresAt) }}</span>
                </div>
              </div>
              <div class="flex flex-shrink-0 items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                <button
                  class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  :title="record.enabled ? '停用' : '启用'"
                  @click.stop="toggleStatus(record)"
                >
                  <NoSymbolIcon v-if="record.enabled" class="h-4 w-4" />
                  <CheckCircleIcon v-else class="h-4 w-4" />
                </button>
                <button
                  class="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  title="删除"
                  @click.stop="deleteRecord(record)"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </ToolLayout>
</template>
