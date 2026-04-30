<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../composables/useToast'
import {
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  PaperAirplaneIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const toast = useToast()

type WishType = 'problem' | 'wish'

interface Wish {
  id: number
  type: WishType
  content: string
  created_at: string
}

interface WishDetail extends Wish {
  comments: { id: number; content: string; created_at: string }[]
}

const filterType = ref<'all' | WishType>('all')
const list = ref<Wish[]>([])
const detail = ref<WishDetail | null>(null)
const formType = ref<WishType>('wish')
const formContent = ref('')
const commentContent = ref('')
const submitting = ref(false)
const commentSubmitting = ref(false)

const filteredList = computed(() => {
  if (filterType.value === 'all') return list.value
  return list.value.filter((w) => w.type === filterType.value)
})

async function fetchList() {
  try {
    const res = await fetch('/api/wishes')
    list.value = await res.json()
  } catch {
    toast.error('加载列表失败')
  }
}

async function fetchDetail(id: number) {
  try {
    const res = await fetch(`/api/wishes/${id}`)
    detail.value = await res.json()
  } catch {
    toast.error('加载详情失败')
  }
}

function openDetail(w: Wish) {
  detail.value = null
  commentContent.value = ''
  fetchDetail(w.id)
}


async function submitWish() {
  const content = formContent.value.trim()
  if (!content) {
    toast.warning('请填写诉求内容')
    return
  }
  submitting.value = true
  try {
    const res = await fetch('/api/wishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: formType.value, content }),
    })
    const created = await res.json()
    list.value = [created, ...list.value]
    formContent.value = ''
    toast.success('提交成功')
  } catch {
    toast.error('提交失败')
  } finally {
    submitting.value = false
  }
}

async function submitComment() {
  if (!detail.value) return
  const content = commentContent.value.trim()
  if (!content) {
    toast.warning('请填写留言内容')
    return
  }
  commentSubmitting.value = true
  try {
    const res = await fetch(`/api/wishes/${detail.value.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    const created = await res.json()
    detail.value.comments = [...(detail.value.comments || []), created]
    commentContent.value = ''
    toast.success('留言成功')
  } catch {
    toast.error('留言失败')
  } finally {
    commentSubmitting.value = false
  }
}

function formatDate(s: string) {
  if (!s) return ''
  const d = new Date(s)
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => fetchList())
</script>

<template>
  <div class="min-h-screen bg-surface">
    <header class="sticky top-0 z-40 backdrop-blur-xl bg-surface/80 border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <button
          @click="router.push('/')"
          class="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeftIcon class="w-5 h-5" />
          <span class="text-sm font-medium hidden sm:inline">返回</span>
        </button>
        <h1 class="text-base font-semibold text-slate-800 truncate flex items-center gap-2">
          <SparklesIcon class="w-5 h-5 text-accent" />
          许愿池 · 意见箱
        </h1>
        <div class="w-16" />
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <aside class="lg:col-span-1 space-y-5">
          <div class="glass-card p-5">
            <h3 class="text-slate-800 font-semibold mb-4 flex items-center gap-2">
              <PaperAirplaneIcon class="w-5 h-5 text-accent" />
              提交诉求
            </h3>
            <div class="space-y-3">
              <div>
                <label class="text-slate-500 text-xs block mb-1.5">类型</label>
                <div class="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    :class="[
                      'flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm cursor-pointer transition-all',
                      formType === 'wish'
                        ? 'bg-white text-amber-600 shadow-sm font-medium'
                        : 'text-slate-500 hover:text-slate-700'
                    ]"
                    @click="formType = 'wish'"
                  >
                    <SparklesIcon class="w-4 h-4" />
                    许愿
                  </button>
                  <button
                    type="button"
                    :class="[
                      'flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm cursor-pointer transition-all',
                      formType === 'problem'
                        ? 'bg-white text-rose-600 shadow-sm font-medium'
                        : 'text-slate-500 hover:text-slate-700'
                    ]"
                    @click="formType = 'problem'"
                  >
                    <ExclamationCircleIcon class="w-4 h-4" />
                    问题
                  </button>
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="text-slate-500 text-xs">内容</label>
                  <span class="text-xs text-slate-400">{{ formContent.length }}</span>
                </div>
                <textarea
                  v-model="formContent"
                  placeholder="描述你的需求或反馈..."
                  class="glass-input w-full min-h-[120px] p-3 resize-y text-sm"
                />
              </div>
              <button
                type="button"
                class="btn-primary w-full flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 !py-2.5"
                :disabled="submitting"
                @click="submitWish"
              >
                <PaperAirplaneIcon class="w-4 h-4" />
                {{ submitting ? '提交中...' : '提交诉求' }}
              </button>
            </div>
          </div>

          <div class="glass-card p-3">
            <div class="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                v-for="f in [
                  { v: 'all', label: '全部' },
                  { v: 'wish', label: '许愿' },
                  { v: 'problem', label: '问题' },
                ]" :key="f.v"
                :class="[
                  'py-1.5 rounded-lg text-sm cursor-pointer transition-all',
                  filterType === f.v ? 'bg-white text-accent shadow-sm font-medium' : 'text-slate-500 hover:text-slate-700'
                ]"
                @click="filterType = f.v as 'all' | WishType"
              >{{ f.label }}</button>
            </div>
          </div>
        </aside>

        <div class="lg:col-span-2 flex flex-col gap-5">
          <div class="glass-card p-5 flex-1 min-h-0">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-slate-800 font-semibold flex items-center gap-2">
                <span class="w-1 h-4 bg-accent rounded-full" />
                诉求列表
                <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">{{ filteredList.length }}</span>
              </h3>
            </div>
            <div v-if="filteredList.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
              <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <SparklesIcon class="w-8 h-8 text-slate-300" />
              </div>
              <p class="text-slate-500 text-sm">暂无内容，去提交一条吧</p>
            </div>
            <ul v-else class="space-y-2 max-h-[420px] overflow-y-auto scrollbar-thin pr-1">
              <li
                v-for="w in filteredList"
                :key="w.id"
                @click="openDetail(w)"
                :class="[
                  'p-4 rounded-xl cursor-pointer transition-all text-left border',
                  detail?.id === w.id
                    ? 'bg-accent/5 border-accent/40 shadow-sm'
                    : 'bg-slate-50 hover:bg-white hover:border-accent/30 border-slate-200'
                ]"
              >
                <div class="flex items-center gap-2 mb-2">
                  <span
                    :class="[
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
                      w.type === 'wish'
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : 'bg-rose-50 text-rose-600 border-rose-200'
                    ]"
                  >
                    <SparklesIcon v-if="w.type === 'wish'" class="w-3 h-3" />
                    <ExclamationCircleIcon v-else class="w-3 h-3" />
                    {{ w.type === 'wish' ? '许愿' : '问题' }}
                  </span>
                  <span class="text-xs text-slate-400 ml-auto">{{ formatDate(w.created_at) }}</span>
                </div>
                <p class="text-slate-700 text-sm line-clamp-2 leading-relaxed">{{ w.content }}</p>
              </li>
            </ul>
          </div>

          <div v-if="detail" class="glass-card p-5">
            <h3 class="text-slate-800 font-semibold mb-3 flex items-center gap-2">
              <ChatBubbleLeftIcon class="w-5 h-5 text-accent" />
              详情与留言
            </h3>
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4">
              <p class="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{{ detail.content }}</p>
              <p class="text-slate-400 text-xs mt-2">{{ formatDate(detail.created_at) }}</p>
            </div>
            <div class="space-y-3">
              <div v-if="detail.comments?.length" class="space-y-2">
                <div
                  v-for="c in detail.comments"
                  :key="c.id"
                  class="py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm"
                >
                  <p class="whitespace-pre-wrap leading-relaxed">{{ c.content }}</p>
                  <p class="text-slate-400 text-xs mt-1">{{ formatDate(c.created_at) }}</p>
                </div>
              </div>
              <div v-else class="text-center py-4 text-slate-400 text-sm">还没有留言，来说点什么吧</div>
              <div class="flex gap-2">
                <input
                  v-model="commentContent"
                  type="text"
                  placeholder="写一条留言..."
                  class="glass-input flex-1 px-3 py-2 text-sm"
                  @keydown.enter.prevent="submitComment"
                />
                <button
                  type="button"
                  class="btn-primary flex items-center gap-1.5 px-4 cursor-pointer disabled:opacity-50 text-sm"
                  :disabled="commentSubmitting"
                  @click="submitComment"
                >
                  <PaperAirplaneIcon class="w-4 h-4" />
                  留言
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
