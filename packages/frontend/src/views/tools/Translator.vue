<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '../../composables/useToast'
import ToolLayout from '../../components/ToolLayout.vue'
import {
  MagnifyingGlassIcon,
  ClipboardDocumentIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()

interface DictResult {
  word: string
  translation: string
  pron?: string
}

const searchTerm = ref('')
const results = ref<DictResult[]>([])
const loading = ref(false)
const error = ref('')

const search = async () => {
  const word = searchTerm.value.trim()
  if (!word) {
    toast.warning('请输入搜索词')
    return
  }
  loading.value = true
  error.value = ''
  results.value = []
  try {
    const res = await fetch(`/api/dictionary/search?word=${encodeURIComponent(word)}`)
    if (!res.ok) throw new Error('查询失败')
    results.value = await res.json()
    if (results.value.length === 0) {
      error.value = '未找到匹配的结果'
    }
  } catch (e: any) {
    error.value = e.message || '查询失败'
    toast.error('查询失败')
  } finally {
    loading.value = false
  }
}

const copyWord = (word: string, translation: string) => {
  navigator.clipboard.writeText(`${word}: ${translation}`).then(() => {
    toast.success('已复制')
  })
}
</script>

<template>
  <ToolLayout title="英汉词典">
    <div class="max-w-3xl mx-auto space-y-4">
      <div class="glass-card p-5">
        <div class="flex gap-3">
          <div class="relative flex-1">
            <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              v-model="searchTerm"
              @keyup.enter="search"
              type="text"
              placeholder="输入英文单词或中文..."
              class="w-full pl-12 pr-4 py-3 glass-input text-base"
            />
          </div>
          <button
            @click="search"
            :disabled="!searchTerm.trim() || loading"
            class="btn-primary px-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '查询中...' : '查询' }}
          </button>
        </div>
        <div v-if="error" class="mt-3 p-3 text-sm text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
          {{ error }}
        </div>
      </div>

      <div v-if="results.length > 0" class="glass-card p-5">
        <h3 class="text-sm font-semibold text-slate-300 mb-4">查询结果 ({{ results.length }} 条)</h3>
        <div class="space-y-3">
          <div
            v-for="(r, i) in results"
            :key="i"
            class="p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-colors"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <h4 class="text-lg font-bold text-accent mb-1">{{ r.word }}</h4>
                <p v-if="r.pron" class="text-sm text-slate-500 mb-2">{{ r.pron }}</p>
                <p class="text-sm text-slate-300">{{ r.translation }}</p>
              </div>
              <button
                @click="copyWord(r.word, r.translation)"
                class="p-2 text-slate-500 hover:text-accent transition-colors cursor-pointer"
              >
                <ClipboardDocumentIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
