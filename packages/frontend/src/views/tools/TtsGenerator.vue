<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import { useToast } from '../../composables/useToast'
import {
  SpeakerWaveIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'

const TTS_BASE = 'https://bx-tts.17usoft.com/api/v1/tts'
const TTS_ORIGIN = 'https://bx-tts.17usoft.com'

const toast = useToast()

const LANGUAGE_LABELS: Record<string, string> = {
  'zh-CN': '中文 (简体)',
  'zh-CN-liaoning': '中文 (辽宁)',
  'zh-CN-shaanxi': '中文 (陕西)',
  'zh-HK': '中文 (香港)',
  'zh-TW': '中文 (台湾)',
  'en-US': 'English (US)',
  'en-GB': 'English (UK)',
  'en-AU': 'English (AU)',
  'en-CA': 'English (CA)',
  'en-IN': 'English (IN)',
  'en-IE': 'English (IE)',
  'en-NZ': 'English (NZ)',
  'en-SG': 'English (SG)',
  'en-HK': 'English (HK)',
  'en-PH': 'English (PH)',
  'en-ZA': 'English (ZA)',
  'en-KE': 'English (KE)',
  'en-NG': 'English (NG)',
  'en-TZ': 'English (TZ)',
}

const ZH_CN_VOICE_NAMES: Record<string, string> = {
  XiaoxiaoNeural: '晓晓',
  XiaoyiNeural: '晓伊',
  YunjianNeural: '云健',
  YunxiNeural: '云希',
  YunxiaNeural: '云夏',
  YunyangNeural: '云扬',
  XiaobeiNeural: '晓北',
  XiaoniNeural: '晓妮',
}

interface VoiceItem {
  value: string
  name: string
}

interface VoiceListRow {
  Name: string
  Gender: string
}

function getLanguageFromName(name: string): string {
  const parts = name.split('-')
  if (parts.length <= 2) return name
  const last = parts[parts.length - 1]
  if (!last?.endsWith('Neural')) return name
  return parts.slice(0, -1).join('-')
}

function getVoiceDisplayName(item: VoiceListRow, langCode: string): string {
  const name = item.Name
  if (langCode.startsWith('zh-CN')) {
    const parts = name.split('-')
    const lastPart = parts[parts.length - 1]
    const zh = ZH_CN_VOICE_NAMES[lastPart as keyof typeof ZH_CN_VOICE_NAMES]
    if (zh) return `${langCode}-${zh}`
  }
  const match = name.match(/([A-Za-z]+)Neural$/)
  return match ? `${langCode}-${match[1]}` : name
}

const voiceListRaw = ref<VoiceListRow[]>([])
const text = ref('')
const selectedLanguage = ref('zh-CN')
const selectedGender = ref<'all' | 'Male' | 'Female'>('Female')
const voice = ref('zh-CN-XiaoxiaoNeural')
const speed = ref(1.0)
const loading = ref(false)
const audioUrl = ref<string | null>(null)
const isPlaying = ref(false)

const languageOptions = computed(() => {
  const set = new Set(voiceListRaw.value.map((r) => getLanguageFromName(r.Name)))
  const list = Array.from(set).sort().map((code) => ({
    value: code,
    label: LANGUAGE_LABELS[code] ?? code,
  }))
  return [{ value: '', label: '全部' }, ...list]
})

const filteredVoiceList = computed(() => {
  let list = voiceListRaw.value
  if (selectedLanguage.value) {
    list = list.filter((r) => getLanguageFromName(r.Name) === selectedLanguage.value)
  }
  if (selectedGender.value !== 'all') {
    list = list.filter((r) => r.Gender === selectedGender.value)
  }
  const lang = selectedLanguage.value || 'en-US'
  return list.map((r) => ({
    value: r.Name,
    name: getVoiceDisplayName(r, getLanguageFromName(r.Name)),
  }))
})

let audioElement: HTMLAudioElement | null = null

function revokePreviousUrl() {
  if (audioUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(audioUrl.value)
  }
  audioUrl.value = null
}

function formatRate(): string {
  const n = Math.round((speed.value - 1) * 100)
  return `${n}%`
}

async function loadVoiceList() {
  try {
    const res = await fetch(`${TTS_BASE}/voiceList`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error('获取音色列表失败')
    const json = await res.json()
    voiceListRaw.value = json?.data ?? []
    const hasXiaoxiao = voiceListRaw.value.some((r) => r.Name === 'zh-CN-XiaoxiaoNeural')
    if (voiceListRaw.value.length && hasXiaoxiao) {
      selectedLanguage.value = 'zh-CN'
      selectedGender.value = 'Female'
      voice.value = 'zh-CN-XiaoxiaoNeural'
    } else if (filteredVoiceList.value.length && !filteredVoiceList.value.some((v) => v.value === voice.value)) {
      const first = filteredVoiceList.value[0]
      if (first) voice.value = first.value
    }
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '获取音色列表失败')
  }
}

watch([selectedLanguage, selectedGender], () => {
  const list = filteredVoiceList.value
  const currentInList = list.some((v) => v.value === voice.value)
  const first = list[0]
  if (list.length && !currentInList && first) voice.value = first.value
})

async function generate() {
  const inputText = text.value.trim()
  if (!inputText) {
    toast.warning('请输入要转换的文字')
    return
  }
  if (!voice.value) {
    toast.warning('请选择音色')
    return
  }

  loading.value = true
  revokePreviousUrl()

  try {
    const res = await fetch(`${TTS_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/plain, */*' },
      body: JSON.stringify({
        text: inputText,
        voice: voice.value,
        rate: formatRate(),
        pitch: '0Hz',
        volume: '0%',
      }),
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error((json as { message?: string }).message || '生成失败')
    }
    if (!json?.success || !json?.data?.audio) {
      throw new Error(json?.message || '生成失败')
    }
    const path = (json.data.audio as string).replace(/^\//, '')
    audioUrl.value = `${TTS_ORIGIN}/${path}`
    toast.success('语音合成成功')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '生成失败'
    toast.error(msg)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadVoiceList()
})

function onAudioPlay() {
  isPlaying.value = true
}

function onAudioPause() {
  isPlaying.value = false
}

function onAudioEnded() {
  isPlaying.value = false
}

function togglePlayPause() {
  if (!audioUrl.value) return
  if (!audioElement) {
    audioElement = document.getElementById('tts-audio') as HTMLAudioElement
  }
  if (!audioElement) return
  if (isPlaying.value) {
    audioElement.pause()
  } else {
    audioElement.play().catch(() => toast.error('播放失败'))
  }
}

function downloadAudio() {
  if (!audioUrl.value) {
    toast.warning('请先生成语音')
    return
  }
  const a = document.createElement('a')
  a.href = audioUrl.value
  a.download = `tts-${Date.now()}.mp3`
  a.click()
  toast.success('已开始下载')
}

onUnmounted(() => {
  revokePreviousUrl()
})
</script>

<template>
  <ToolLayout title="TTS 语音合成">
    <div class="space-y-6">
      <div class="glass-card p-5">
        <h3 class="text-slate-800 font-medium mb-4">语音配置</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-slate-500 text-sm font-medium block mb-2">语言</label>
            <select
              v-model="selectedLanguage"
              class="glass-input w-full px-4 py-2 cursor-pointer"
              :disabled="!languageOptions.length"
            >
              <option v-for="opt in languageOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="text-slate-500 text-sm font-medium block mb-2">性别</label>
            <select
              v-model="selectedGender"
              class="glass-input w-full px-4 py-2 cursor-pointer"
            >
              <option value="all">全部</option>
              <option value="Male">男</option>
              <option value="Female">女</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="text-slate-500 text-sm font-medium block mb-2">语音</label>
            <select
              v-model="voice"
              class="glass-input w-full px-4 py-2 cursor-pointer"
              :disabled="!filteredVoiceList.length"
            >
              <option v-for="v in filteredVoiceList" :key="v.value" :value="v.value">{{ v.name }}</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="text-slate-500 text-sm font-medium block mb-2">
              语速: {{ speed.toFixed(2) }}
            </label>
            <input
              v-model.number="speed"
              type="range"
              min="0.25"
              max="4"
              step="0.05"
              class="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-accent"
            />
          </div>
        </div>
      </div>

      <div class="glass-card p-5">
        <label class="text-slate-500 text-sm font-medium block mb-2">输入文本</label>
        <textarea
          v-model="text"
          placeholder="输入要转换为语音的文字..."
          class="glass-input w-full min-h-[160px] p-4 text-slate-800 placeholder:text-slate-500 resize-y"
        />
      </div>

      <div class="flex flex-wrap gap-3">
        <button
          class="btn-primary flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading"
          @click="generate"
        >
          <ArrowPathIcon
            v-if="loading"
            class="w-4 h-4 animate-spin"
          />
          <SpeakerWaveIcon v-else class="w-4 h-4" />
          {{ loading ? '生成中...' : '生成语音' }}
        </button>
      </div>

      <div v-if="audioUrl" class="glass-card p-5">
        <h3 class="text-slate-800 font-medium mb-4">播放与下载</h3>
        <audio
          id="tts-audio"
          :src="audioUrl"
          class="hidden"
          @play="onAudioPlay"
          @pause="onAudioPause"
          @ended="onAudioEnded"
        />
        <div class="flex flex-wrap items-center gap-3">
          <button
            class="btn-primary flex items-center gap-2 cursor-pointer"
            @click="togglePlayPause"
          >
            <PlayIcon v-if="!isPlaying" class="w-4 h-4" />
            <StopIcon v-else class="w-4 h-4" />
            {{ isPlaying ? '暂停' : '播放' }}
          </button>
          <button
            class="btn-secondary flex items-center gap-2 cursor-pointer"
            @click="downloadAudio"
          >
            <ArrowDownTrayIcon class="w-4 h-4" />
            下载音频
          </button>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
