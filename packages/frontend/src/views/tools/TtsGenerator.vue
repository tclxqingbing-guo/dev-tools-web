<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import { useToast } from '../../composables/useToast'
import {
  SpeakerWaveIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()

const VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const
const MODELS = ['tts-1', 'tts-1-hd'] as const

const text = ref('')
const voice = ref<(typeof VOICES)[number]>('nova')
const speed = ref(1.0)
const model = ref<(typeof MODELS)[number]>('tts-1')
const loading = ref(false)
const audioUrl = ref<string | null>(null)
const isPlaying = ref(false)

let audioElement: HTMLAudioElement | null = null

function revokePreviousUrl() {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = null
  }
}

async function generate() {
  const inputText = text.value.trim()
  if (!inputText) {
    toast.warning('请输入要转换的文字')
    return
  }

  loading.value = true
  revokePreviousUrl()

  try {
    const res = await fetch('/api/ai/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model.value,
        voice: voice.value,
        input: inputText,
        speed: speed.value,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(err.message || '生成失败')
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    audioUrl.value = url
    toast.success('语音合成成功')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '生成失败'
    toast.error(msg)
  } finally {
    loading.value = false
  }
}

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
        <h3 class="text-slate-100 font-medium mb-4">语音配置</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-slate-500 text-sm font-medium block mb-2">音色</label>
            <select
              v-model="voice"
              class="glass-input w-full px-4 py-2 cursor-pointer"
            >
              <option v-for="v in VOICES" :key="v" :value="v">{{ v }}</option>
            </select>
          </div>
          <div>
            <label class="text-slate-500 text-sm font-medium block mb-2">模型</label>
            <select
              v-model="model"
              class="glass-input w-full px-4 py-2 cursor-pointer"
            >
              <option v-for="m in MODELS" :key="m" :value="m">{{ m }}</option>
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
              class="w-full h-2 rounded-lg appearance-none cursor-pointer bg-white/10 accent-accent"
            />
          </div>
        </div>
      </div>

      <div class="glass-card p-5">
        <label class="text-slate-500 text-sm font-medium block mb-2">输入文本</label>
        <textarea
          v-model="text"
          placeholder="输入要转换为语音的文字..."
          class="glass-input w-full min-h-[160px] p-4 text-slate-100 placeholder:text-slate-500 resize-y"
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
        <h3 class="text-slate-100 font-medium mb-4">播放与下载</h3>
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
