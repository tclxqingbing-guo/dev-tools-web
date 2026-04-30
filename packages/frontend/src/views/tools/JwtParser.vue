<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import { useToast } from '../../composables/useToast'
import { useClipboard } from '../../composables/useClipboard'
import { ClipboardDocumentIcon, KeyIcon, CheckBadgeIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

const toast = useToast()
const { copyToClipboard } = useClipboard()
const tokenInput = ref('')

interface JwtParts {
  header: Record<string, any> | null
  payload: Record<string, any> | null
  signature: string
  rawHeader: string
  rawPayload: string
}

const parts = ref<JwtParts>({
  header: null,
  payload: null,
  signature: '',
  rawHeader: '',
  rawPayload: '',
})

const tokenInfo = computed(() => {
  const p = parts.value.payload
  if (!p) return null
  const now = Math.floor(Date.now() / 1000)
  const exp = p.exp
  const iat = p.iat
  const isExpired = typeof exp === 'number' && exp < now
  const status = isExpired ? '已过期' : '有效'
  return {
    issuer: p.iss ?? '-',
    subject: p.sub ?? '-',
    audience: Array.isArray(p.aud) ? p.aud.join(', ') : (p.aud ?? '-'),
    issuedAt: iat ? new Date(iat * 1000).toISOString() : '-',
    expiresAt: exp ? new Date(exp * 1000).toISOString() : '-',
    algorithm: parts.value.header?.alg ?? '-',
    status,
    isExpired,
  }
})

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  if (pad) base64 += '='.repeat(4 - pad)
  try {
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
  } catch {
    return ''
  }
}

function parseToken() {
  const raw = tokenInput.value.trim().replace(/^Bearer\s+/i, '')
  if (!raw) {
    parts.value = { header: null, payload: null, signature: '', rawHeader: '', rawPayload: '' }
    return
  }
  const segs = raw.split('.')
  if (segs.length !== 3) {
    parts.value = { header: null, payload: null, signature: '', rawHeader: '', rawPayload: '' }
    return
  }
  try {
    const h = segs[0]
    const pl = segs[1]
    const sig = segs[2]
    if (!h || !pl || !sig) return
    const headerStr = base64UrlDecode(h)
    const payloadStr = base64UrlDecode(pl)
    parts.value = {
      header: JSON.parse(headerStr),
      payload: JSON.parse(payloadStr),
      signature: sig,
      rawHeader: headerStr,
      rawPayload: payloadStr,
    }
  } catch {
    parts.value = { header: null, payload: null, signature: '', rawHeader: '', rawPayload: '' }
  }
}

watch(tokenInput, () => parseToken(), { immediate: true })

function copySection(section: 'header' | 'payload' | 'signature') {
  if (section === 'header' && parts.value.rawHeader) {
    copyToClipboard(parts.value.rawHeader)
  } else if (section === 'payload' && parts.value.rawPayload) {
    copyToClipboard(parts.value.rawPayload)
  } else if (section === 'signature' && parts.value.signature) {
    copyToClipboard(parts.value.signature)
  } else {
    toast.warning('无内容可复制')
  }
}
</script>

<template>
  <ToolLayout title="JWT 解析">
    <div class="space-y-5">
      <div class="glass-card p-5">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-slate-800 font-semibold flex items-center gap-2">
            <KeyIcon class="w-5 h-5 text-accent" />
            JWT Token
          </h3>
          <span v-if="tokenInput" class="text-xs text-slate-400">{{ tokenInput.length }} 字符</span>
        </div>
        <textarea
          v-model="tokenInput"
          placeholder="请输入 JWT Token（支持 Bearer 前缀）..."
          class="glass-input w-full min-h-[140px] p-4 font-mono text-sm resize-none"
        />
      </div>

      <div v-if="tokenInfo" class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-slate-800 font-semibold flex items-center gap-2">
            <CheckBadgeIcon class="w-5 h-5 text-accent" />
            Token 信息
          </h3>
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            :class="tokenInfo.isExpired
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-emerald-50 text-emerald-600 border border-emerald-200'"
          >
            <ExclamationTriangleIcon v-if="tokenInfo.isExpired" class="w-3.5 h-3.5" />
            <CheckBadgeIcon v-else class="w-3.5 h-3.5" />
            {{ tokenInfo.status }}
          </span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div class="bg-slate-50 rounded-lg px-3 py-2">
            <div class="text-slate-400 text-xs">签发者 (iss)</div>
            <div class="text-slate-700 mt-0.5 truncate">{{ tokenInfo.issuer }}</div>
          </div>
          <div class="bg-slate-50 rounded-lg px-3 py-2">
            <div class="text-slate-400 text-xs">主题 (sub)</div>
            <div class="text-slate-700 mt-0.5 truncate">{{ tokenInfo.subject }}</div>
          </div>
          <div class="bg-slate-50 rounded-lg px-3 py-2">
            <div class="text-slate-400 text-xs">受众 (aud)</div>
            <div class="text-slate-700 mt-0.5 truncate">{{ tokenInfo.audience }}</div>
          </div>
          <div class="bg-slate-50 rounded-lg px-3 py-2">
            <div class="text-slate-400 text-xs">签发时间 (iat)</div>
            <div class="text-slate-700 mt-0.5 text-xs font-mono">{{ tokenInfo.issuedAt }}</div>
          </div>
          <div class="bg-slate-50 rounded-lg px-3 py-2">
            <div class="text-slate-400 text-xs">过期时间 (exp)</div>
            <div class="text-slate-700 mt-0.5 text-xs font-mono">{{ tokenInfo.expiresAt }}</div>
          </div>
          <div class="bg-slate-50 rounded-lg px-3 py-2">
            <div class="text-slate-400 text-xs">算法 (alg)</div>
            <div class="text-slate-700 mt-0.5">{{ tokenInfo.algorithm }}</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="glass-card p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-slate-800 text-sm font-semibold flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-rose-400" />
              Header
            </h3>
            <button
              class="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="!parts.header"
              @click="copySection('header')"
            >
              <ClipboardDocumentIcon class="w-4 h-4" />
            </button>
          </div>
          <pre
            class="text-xs text-slate-700 overflow-auto max-h-[260px] rounded-lg bg-slate-50 border border-slate-200 p-3 font-mono"
          >{{ parts.header ? JSON.stringify(parts.header, null, 2) : '-' }}</pre>
        </div>
        <div class="glass-card p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-slate-800 text-sm font-semibold flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-violet-400" />
              Payload
            </h3>
            <button
              class="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="!parts.payload"
              @click="copySection('payload')"
            >
              <ClipboardDocumentIcon class="w-4 h-4" />
            </button>
          </div>
          <pre
            class="text-xs text-slate-700 overflow-auto max-h-[260px] rounded-lg bg-slate-50 border border-slate-200 p-3 font-mono"
          >{{ parts.payload ? JSON.stringify(parts.payload, null, 2) : '-' }}</pre>
        </div>
        <div class="glass-card p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-slate-800 text-sm font-semibold flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-sky-400" />
              Signature
            </h3>
            <button
              class="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="!parts.signature"
              @click="copySection('signature')"
            >
              <ClipboardDocumentIcon class="w-4 h-4" />
            </button>
          </div>
          <pre
            class="text-xs text-slate-500 overflow-auto max-h-[260px] rounded-lg bg-slate-50 border border-slate-200 p-3 font-mono break-all"
          >{{ parts.signature || '-' }}</pre>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
