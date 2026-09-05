<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import ToolLayout from '../components/ToolLayout.vue'
import { useToast } from '../composables/useToast'
import {
  CheckCircleIcon,
  CpuChipIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  SignalIcon,
  TrashIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  SpeakerWaveIcon,
  GlobeAltIcon,
} from '@heroicons/vue/24/outline'

interface SettingsResponse {
  values: Record<string, string>
  secrets: Record<string, boolean>
}

const toast = useToast()
const loading = ref(true)
const saving = ref(false)
const testingAi = ref(false)
const testingWechat = ref(false)
const accessDenied = ref(false)
const values = reactive<Record<string, string>>({})
const secrets = reactive<Record<string, boolean>>({})
const clearKeys = ref<string[]>([])
const visibleSecrets = reactive<Record<string, boolean>>({})

const secretFields = [
  { key: 'ai.sharedApiKey', label: '通用 API Key', placeholder: '所有模型默认使用' },
  { key: 'ai.chatApiKey', label: '聊天模型 Key', placeholder: '留空时使用通用 Key' },
  { key: 'ai.imageApiKey', label: '图片模型 Key', placeholder: '留空时使用通用 Key' },
]

const authSecretFields = [
  { key: 'sso.clientSecret', label: 'Client Secret', placeholder: 'SSO 平台分配的密钥' },
  { key: 'sso.sessionSecret', label: 'Session Secret', placeholder: '用于签名会话的随机长密钥' },
  { key: 'authority.labradorToken', label: 'Labrador Token', placeholder: '统一权限服务令牌' },
]

/**
 * 加载全部运行期设置。
 *
 * @return 无返回值。
 */
async function fetchSettings() {
  loading.value = true
  accessDenied.value = false
  try {
    const response = await fetch('/api/settings')
    if (!response.ok) {
      accessDenied.value = response.status === 401 || response.status === 403
      const data = await response.json().catch(() => ({}))
      throw new Error(data.message || data.detail || '设置加载失败')
    }
    const data = (await response.json()) as SettingsResponse
    Object.assign(values, data.values)
    Object.assign(secrets, data.secrets)
    clearKeys.value = []
  } catch (error) {
    toast.error(accessDenied.value ? '请使用管理员账号登录后访问设置中心' : error instanceof Error ? error.message : '设置加载失败')
  } finally {
    loading.value = false
  }
}

/**
 * 保存全部运行期设置。
 *
 * @return 无返回值。
 */
async function saveSettings() {
  saving.value = true
  try {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values, clearKeys: clearKeys.value }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || '保存失败')
    toast.success('设置已保存')
    await fetchSettings()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '保存失败')
  } finally {
    saving.value = false
  }
}

/**
 * 标记敏感设置为待清除状态。
 *
 * @param key 敏感设置键。
 * @return 无返回值。
 */
function clearSecret(key: string) {
  if (!clearKeys.value.includes(key)) clearKeys.value.push(key)
  values[key] = ''
  secrets[key] = false
}

/**
 * 测试指定外部服务连接。
 *
 * @param type 服务类型。
 * @return 无返回值。
 */
async function testConnection(type: 'ai' | 'wechat') {
  const state = type === 'ai' ? testingAi : testingWechat
  state.value = true
  try {
    const response = await fetch(`/api/settings/test-${type}`, { method: 'POST' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || '连接失败')
    toast.success(type === 'ai' ? '大模型连接正常' : '微信接口连接正常')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '连接失败')
  } finally {
    state.value = false
  }
}

onMounted(fetchSettings)
</script>

<template>
  <ToolLayout title="设置中心">
    <div v-if="loading" class="glass-card py-20 text-center text-sm text-slate-500">
      正在读取运行期设置…
    </div>

    <div v-else-if="accessDenied" class="glass-card p-8 text-center">
      <ShieldCheckIcon class="mx-auto h-10 w-10 text-slate-400" />
      <h2 class="mt-4 text-lg font-semibold text-slate-800">需要管理员权限</h2>
      <p class="mt-2 text-sm text-slate-500">设置中心包含模型密钥、SSO 凭据和统一权限配置。</p>
      <a href="/api/auth/sso/login?return_uri=/settings" class="mt-5 inline-flex rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700">管理员登录</a>
    </div>

    <div v-else class="space-y-5">
      <section class="rounded-2xl border border-slate-800 bg-slate-900 text-white overflow-hidden">
        <div class="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div class="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs text-slate-300">
              <ShieldCheckIcon class="h-4 w-4 text-emerald-400" />
              加密持久化
            </div>
            <h2 class="text-2xl font-semibold tracking-tight">运行期配置，不再依赖改 .env</h2>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              密钥写入服务器数据目录并使用 AES-256-GCM 加密。页面不会回显已经保存的密钥。
            </p>
          </div>
          <button
            :disabled="saving"
            class="rounded-xl bg-amber-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            @click="saveSettings"
          >
            {{ saving ? '保存中…' : '保存全部设置' }}
          </button>
        </div>
      </section>

      <div class="grid gap-5 xl:grid-cols-2">
        <section class="glass-card p-5 xl:col-span-2">
          <div class="mb-5 flex items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                <GlobeAltIcon class="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 class="font-semibold text-slate-800">企业登录与统一权限</h3>
                <p class="text-xs text-slate-500">参考 bx-monitor OAuth 流程，回调地址需要在 SSO 平台登记</p>
              </div>
            </div>
            <label class="flex items-center gap-2 text-xs font-medium text-slate-600">
              <input :checked="values['sso.enabled'] === 'true'" type="checkbox" class="h-4 w-4 accent-indigo-600" @change="values['sso.enabled'] = ($event.target as HTMLInputElement).checked ? 'true' : 'false'" />
              启用 SSO
            </label>
          </div>

          <div class="grid gap-6 xl:grid-cols-2">
            <div class="space-y-4">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">企业 SSO</p>
              <label class="block"><span class="mb-1.5 block text-xs font-medium text-slate-600">SSO 服务地址</span><input v-model="values['sso.baseUrl']" class="glass-input w-full px-3 py-2.5 text-sm" placeholder="https://tccommon.17usoft.com" /></label>
              <label class="block"><span class="mb-1.5 block text-xs font-medium text-slate-600">Client ID</span><input v-model="values['sso.clientId']" class="glass-input w-full px-3 py-2.5 text-sm" placeholder="bx.commom.tools" /></label>
              <label v-for="field in authSecretFields.slice(0, 2)" :key="field.key" class="block"><span class="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-600"><span>{{ field.label }}</span><span v-if="secrets[field.key]" class="inline-flex items-center gap-1 text-emerald-600"><CheckCircleIcon class="h-3.5 w-3.5" />已配置</span></span><div class="flex gap-2"><div class="relative flex-1"><KeyIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input v-model="values[field.key]" :type="visibleSecrets[field.key] ? 'text' : 'password'" class="glass-input w-full py-2.5 pl-9 pr-10 text-sm" :placeholder="secrets[field.key] ? '已保存，留空不修改' : field.placeholder" /><button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" @click="visibleSecrets[field.key] = !visibleSecrets[field.key]"><EyeSlashIcon v-if="visibleSecrets[field.key]" class="h-4 w-4" /><EyeIcon v-else class="h-4 w-4" /></button></div><button v-if="secrets[field.key]" class="rounded-xl border border-red-100 px-3 text-red-500 hover:bg-red-50" title="清除密钥" @click="clearSecret(field.key)"><TrashIcon class="h-4 w-4" /></button></div></label>
              <label class="block"><span class="mb-1.5 block text-xs font-medium text-slate-600">对外访问地址</span><input v-model="values['sso.publicOrigin']" class="glass-input w-full px-3 py-2.5 text-sm" placeholder="https://bx-tools.17usoft.com" /></label>
              <label class="block"><span class="mb-1.5 block text-xs font-medium text-slate-600">回调地址</span><input v-model="values['sso.redirectUri']" class="glass-input w-full px-3 py-2.5 text-sm" placeholder="留空则使用对外地址 + 回调路径" /></label>
              <div class="grid gap-4 sm:grid-cols-2"><label class="block"><span class="mb-1.5 block text-xs font-medium text-slate-600">回调路径</span><input v-model="values['sso.callbackPath']" class="glass-input w-full px-3 py-2.5 text-sm" placeholder="/api/auth/sso/callback" /></label><label class="block"><span class="mb-1.5 block text-xs font-medium text-slate-600">OAuth Scope</span><input v-model="values['sso.scope']" class="glass-input w-full px-3 py-2.5 text-sm" placeholder="read" /></label></div>
              <div class="grid gap-4 sm:grid-cols-3"><label class="block"><span class="mb-1.5 block text-xs font-medium text-slate-600">Cookie 名称</span><input v-model="values['sso.cookieName']" class="glass-input w-full px-3 py-2.5 text-sm" /></label><label class="block"><span class="mb-1.5 block text-xs font-medium text-slate-600">有效秒数</span><input v-model="values['sso.sessionMaxAge']" type="number" class="glass-input w-full px-3 py-2.5 text-sm" /></label><label class="flex items-end"><span class="flex h-[42px] w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-600"><input :checked="values['sso.cookieSecure'] === 'true'" type="checkbox" class="h-4 w-4 accent-indigo-600" @change="values['sso.cookieSecure'] = ($event.target as HTMLInputElement).checked ? 'true' : 'false'" />HTTPS Cookie</span></label></div>
              <div class="grid gap-4 sm:grid-cols-2"><label class="block"><span class="mb-1.5 block text-xs font-medium text-slate-600">SameSite</span><input v-model="values['sso.sameSite']" class="glass-input w-full px-3 py-2.5 text-sm" placeholder="Lax" /></label><label class="block"><span class="mb-1.5 block text-xs font-medium text-slate-600">请求超时秒数</span><input v-model="values['sso.timeoutSeconds']" type="number" class="glass-input w-full px-3 py-2.5 text-sm" /></label></div>
            </div>

            <div class="space-y-4">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">统一权限</p>
              <label class="flex items-center gap-2 text-xs font-medium text-slate-600"><input :checked="values['authority.enabled'] === 'true'" type="checkbox" class="h-4 w-4 accent-indigo-600" @change="values['authority.enabled'] = ($event.target as HTMLInputElement).checked ? 'true' : 'false'" />启用角色校验</label>
              <label class="block"><span class="mb-1.5 block text-xs font-medium text-slate-600">权限服务地址</span><input v-model="values['authority.baseUrl']" class="glass-input w-full px-3 py-2.5 text-sm" placeholder="http://servicegw.ly.com/gateway/authority/interface" /></label>
              <div class="grid gap-4 sm:grid-cols-2"><label class="block"><span class="mb-1.5 block text-xs font-medium text-slate-600">AppKey</span><input v-model="values['authority.appKey']" class="glass-input w-full px-3 py-2.5 text-sm" /></label><label class="block"><span class="mb-1.5 block text-xs font-medium text-slate-600">AppCode</span><input v-model="values['authority.appCode']" class="glass-input w-full px-3 py-2.5 text-sm" /></label></div>
              <label v-for="field in authSecretFields.slice(2)" :key="field.key" class="block"><span class="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-600"><span>{{ field.label }}</span><span v-if="secrets[field.key]" class="inline-flex items-center gap-1 text-emerald-600"><CheckCircleIcon class="h-3.5 w-3.5" />已配置</span></span><div class="flex gap-2"><div class="relative flex-1"><KeyIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input v-model="values[field.key]" :type="visibleSecrets[field.key] ? 'text' : 'password'" class="glass-input w-full py-2.5 pl-9 pr-10 text-sm" :placeholder="secrets[field.key] ? '已保存，留空不修改' : field.placeholder" /><button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" @click="visibleSecrets[field.key] = !visibleSecrets[field.key]"><EyeSlashIcon v-if="visibleSecrets[field.key]" class="h-4 w-4" /><EyeIcon v-else class="h-4 w-4" /></button></div><button v-if="secrets[field.key]" class="rounded-xl border border-red-100 px-3 text-red-500 hover:bg-red-50" title="清除密钥" @click="clearSecret(field.key)"><TrashIcon class="h-4 w-4" /></button></div></label>
              <label class="block"><span class="mb-1.5 block text-xs font-medium text-slate-600">TID（可选）</span><input v-model="values['authority.tid']" class="glass-input w-full px-3 py-2.5 text-sm" /></label>
              <label class="block"><span class="mb-1.5 block text-xs font-medium text-slate-600">管理员角色名称</span><input v-model="values['authority.allowedAdminRoleNames']" class="glass-input w-full px-3 py-2.5 text-sm" placeholder="多个角色用英文逗号分隔，例如 admin" /></label>
              <label class="block"><span class="mb-1.5 block text-xs font-medium text-slate-600">管理员角色 ID</span><input v-model="values['authority.allowedAdminRoleIds']" class="glass-input w-full px-3 py-2.5 text-sm" placeholder="多个 ID 用英文逗号分隔" /></label>
              <label class="block"><span class="mb-1.5 block text-xs font-medium text-slate-600">直接放行的用户 ID</span><input v-model="values['authority.adminUserIds']" class="glass-input w-full px-3 py-2.5 text-sm" placeholder="多个用户 ID 用英文逗号分隔" /></label>
            </div>
          </div>
        </section>

        <section class="glass-card p-5">
          <div class="mb-5 flex items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <CpuChipIcon class="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 class="font-semibold text-slate-800">大模型服务</h3>
                <p class="text-xs text-slate-500">OpenAI 兼容接口</p>
              </div>
            </div>
            <button
              :disabled="testingAi"
              class="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
              @click="testConnection('ai')"
            >
              {{ testingAi ? '检测中…' : '测试连接' }}
            </button>
          </div>

          <label class="mb-4 block">
            <span class="mb-1.5 block text-xs font-medium text-slate-600">API Base URL</span>
            <input
              v-model="values['ai.baseUrl']"
              class="glass-input w-full px-3 py-2.5 text-sm"
              placeholder="https://api.openai.com"
            />
          </label>

          <div class="space-y-4">
            <label v-for="field in secretFields" :key="field.key" class="block">
              <span class="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-600">
                <span>{{ field.label }}</span>
                <span v-if="secrets[field.key]" class="inline-flex items-center gap-1 text-emerald-600">
                  <CheckCircleIcon class="h-3.5 w-3.5" />
                  已配置
                </span>
              </span>
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <KeyIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    v-model="values[field.key]"
                    :type="visibleSecrets[field.key] ? 'text' : 'password'"
                    class="glass-input w-full py-2.5 pl-9 pr-10 text-sm"
                    :placeholder="secrets[field.key] ? '已保存，留空不修改' : field.placeholder"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    @click="visibleSecrets[field.key] = !visibleSecrets[field.key]"
                  >
                    <EyeSlashIcon v-if="visibleSecrets[field.key]" class="h-4 w-4" />
                    <EyeIcon v-else class="h-4 w-4" />
                  </button>
                </div>
                <button
                  v-if="secrets[field.key]"
                  class="rounded-xl border border-red-100 px-3 text-red-500 hover:bg-red-50"
                  title="清除密钥"
                  @click="clearSecret(field.key)"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
            </label>
          </div>
        </section>

        <section class="glass-card p-5">
          <div class="mb-5 flex items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <DevicePhoneMobileIcon class="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 class="font-semibold text-slate-800">微信小程序</h3>
                <p class="text-xs text-slate-500">无限小程序码与 WebView 白名单</p>
              </div>
            </div>
            <button
              :disabled="testingWechat"
              class="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
              @click="testConnection('wechat')"
            >
              {{ testingWechat ? '检测中…' : '测试连接' }}
            </button>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block">
              <span class="mb-1.5 block text-xs font-medium text-slate-600">AppID</span>
              <input v-model="values['wechat.appId']" class="glass-input w-full px-3 py-2.5 text-sm" />
            </label>
            <label class="block">
              <span class="mb-1.5 block text-xs font-medium text-slate-600">默认版本</span>
              <select v-model="values['wechat.defaultEnvVersion']" class="glass-input w-full px-3 py-2.5 text-sm">
                <option value="develop">开发版 develop</option>
                <option value="trial">体验版 trial</option>
                <option value="release">正式版 release</option>
              </select>
            </label>
          </div>

          <label class="mt-4 block">
            <span class="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-600">
              <span>AppSecret</span>
              <span v-if="secrets['wechat.appSecret']" class="inline-flex items-center gap-1 text-emerald-600">
                <CheckCircleIcon class="h-3.5 w-3.5" />
                已配置
              </span>
            </span>
            <div class="flex gap-2">
              <input
                v-model="values['wechat.appSecret']"
                :type="visibleSecrets['wechat.appSecret'] ? 'text' : 'password'"
                class="glass-input flex-1 px-3 py-2.5 text-sm"
                :placeholder="secrets['wechat.appSecret'] ? '已保存，留空不修改' : '输入小程序 AppSecret'"
              />
              <button
                class="btn-secondary px-3"
                @click="visibleSecrets['wechat.appSecret'] = !visibleSecrets['wechat.appSecret']"
              >
                <EyeSlashIcon v-if="visibleSecrets['wechat.appSecret']" class="h-4 w-4" />
                <EyeIcon v-else class="h-4 w-4" />
              </button>
              <button
                v-if="secrets['wechat.appSecret']"
                class="rounded-xl border border-red-100 px-3 text-red-500 hover:bg-red-50"
                @click="clearSecret('wechat.appSecret')"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </label>

          <label class="mt-4 block">
            <span class="mb-1.5 block text-xs font-medium text-slate-600">WebView 允许域名</span>
            <textarea
              v-model="values['wechat.allowedWebviewDomains']"
              rows="3"
              class="glass-input w-full resize-none px-3 py-2.5 text-sm"
              placeholder="每行一个域名，或使用英文逗号分隔"
            />
          </label>

          <label class="mt-4 block">
            <span class="mb-1.5 block text-xs font-medium text-slate-600">二维码落地页面</span>
            <input
              v-model="values['wechat.qrPage']"
              class="glass-input w-full px-3 py-2.5 font-mono text-sm"
              placeholder="pages/index/index"
            />
          </label>

          <label class="mt-4 block">
            <span class="mb-1.5 block text-xs font-medium text-slate-600">HTTPS WebView 网关地址</span>
            <input
              v-model="values['wechat.proxyBaseUrl']"
              class="glass-input w-full px-3 py-2.5 text-sm"
              placeholder="https://bx-tools.17usoft.com"
            />
            <span class="mt-1.5 block text-[11px] leading-5 text-slate-500">
              小程序打开 HTTP QA 页面时，会通过此 HTTPS 域名转发。
            </span>
          </label>
        </section>

        <section class="glass-card p-5">
          <div class="mb-5 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <SignalIcon class="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 class="font-semibold text-slate-800">Sentry 监控</h3>
              <p class="text-xs text-slate-500">保存后刷新页面生效</p>
            </div>
          </div>
          <label class="block">
            <span class="mb-1.5 block text-xs font-medium text-slate-600">DSN</span>
            <input v-model="values['sentry.dsn']" class="glass-input w-full px-3 py-2.5 text-sm" />
          </label>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span class="mb-1.5 block text-xs font-medium text-slate-600">Tracing 采样率</span>
              <input
                v-model="values['sentry.tracesSampleRate']"
                type="number"
                min="0"
                max="1"
                step="0.1"
                class="glass-input w-full px-3 py-2.5 text-sm"
              />
            </label>
            <label class="flex items-end">
              <span class="flex h-[42px] w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                初始化测试事件
                <input
                  type="checkbox"
                  :checked="values['sentry.testEvent'] === 'true'"
                  class="h-4 w-4 accent-blue-600"
                  @change="values['sentry.testEvent'] = ($event.target as HTMLInputElement).checked ? 'true' : 'false'"
                />
              </span>
            </label>
          </div>
        </section>

        <section class="glass-card p-5">
          <div class="mb-5 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
              <SpeakerWaveIcon class="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <h3 class="font-semibold text-slate-800">语音服务</h3>
              <p class="text-xs text-slate-500">限制音频代理只访问指定主机</p>
            </div>
          </div>
          <label class="block">
            <span class="mb-1.5 block text-xs font-medium text-slate-600">TTS Origin</span>
            <input
              v-model="values['tts.origin']"
              class="glass-input w-full px-3 py-2.5 text-sm"
              placeholder="https://bx-tts.17usoft.com"
            />
          </label>
        </section>
      </div>
    </div>
  </ToolLayout>
</template>
