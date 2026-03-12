<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import { useToast } from '../../composables/useToast'
import { useClipboard } from '../../composables/useClipboard'
import { ClipboardDocumentIcon } from '@heroicons/vue/24/outline'

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
    <div class="space-y-6">
      <div class="glass-card p-4">
        <label class="text-slate-500 text-sm font-medium block mb-2">Token</label>
        <textarea
          v-model="tokenInput"
          placeholder="请输入 JWT Token（支持 Bearer 前缀）..."
          class="glass-input w-full min-h-[120px] p-4 font-mono text-sm resize-none"
        />
      </div>

      <div v-if="tokenInfo" class="glass-card p-4">
        <h3 class="text-slate-100 font-medium mb-3">Token 信息</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <div class="text-slate-500">签发者 (iss)</div>
          <div class="text-slate-300 col-span-2">{{ tokenInfo.issuer }}</div>
          <div class="text-slate-500">主题 (sub)</div>
          <div class="text-slate-300 col-span-2">{{ tokenInfo.subject }}</div>
          <div class="text-slate-500">受众 (aud)</div>
          <div class="text-slate-300 col-span-2">{{ tokenInfo.audience }}</div>
          <div class="text-slate-500">签发时间 (iat)</div>
          <div class="text-slate-300 col-span-2">{{ tokenInfo.issuedAt }}</div>
          <div class="text-slate-500">过期时间 (exp)</div>
          <div class="text-slate-300 col-span-2">{{ tokenInfo.expiresAt }}</div>
          <div class="text-slate-500">算法 (alg)</div>
          <div class="text-slate-300 col-span-2">{{ tokenInfo.algorithm }}</div>
          <div class="text-slate-500">状态</div>
          <div :class="tokenInfo.isExpired ? 'text-red-400' : 'text-emerald-400'" class="col-span-2">
            {{ tokenInfo.status }}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="glass-card p-4 bg-surface-card">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-slate-100 text-sm font-medium">Header</h3>
            <button
              class="btn-secondary p-1.5 cursor-pointer"
              :disabled="!parts.header"
              @click="copySection('header')"
            >
              <ClipboardDocumentIcon class="w-4 h-4" />
            </button>
          </div>
          <pre
            class="text-xs text-slate-300 overflow-auto max-h-[200px] rounded-lg bg-black/20 p-3 font-mono"
          >{{ parts.header ? JSON.stringify(parts.header, null, 2) : '-' }}</pre>
        </div>
        <div class="glass-card p-4 bg-surface-card">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-slate-100 text-sm font-medium">Payload</h3>
            <button
              class="btn-secondary p-1.5 cursor-pointer"
              :disabled="!parts.payload"
              @click="copySection('payload')"
            >
              <ClipboardDocumentIcon class="w-4 h-4" />
            </button>
          </div>
          <pre
            class="text-xs text-slate-300 overflow-auto max-h-[200px] rounded-lg bg-black/20 p-3 font-mono"
          >{{ parts.payload ? JSON.stringify(parts.payload, null, 2) : '-' }}</pre>
        </div>
        <div class="glass-card p-4 bg-surface-card">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-slate-100 text-sm font-medium">Signature</h3>
            <button
              class="btn-secondary p-1.5 cursor-pointer"
              :disabled="!parts.signature"
              @click="copySection('signature')"
            >
              <ClipboardDocumentIcon class="w-4 h-4" />
            </button>
          </div>
          <pre
            class="text-xs text-slate-400 overflow-auto max-h-[200px] rounded-lg bg-black/20 p-3 font-mono break-all"
          >{{ parts.signature || '-' }}</pre>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
