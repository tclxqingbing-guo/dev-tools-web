<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { marked } from 'marked'
import { useToast } from '../../composables/useToast'
import ToolLayout from '../../components/ToolLayout.vue'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ClipboardDocumentIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()

interface Note {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
}

const notes = ref<Note[]>([])
const currentNote = ref<Note | null>(null)
const searchQuery = ref('')
const editMode = ref(true)
const saving = ref(false)

const filteredNotes = computed(() => {
  if (!searchQuery.value.trim()) return notes.value
  const q = searchQuery.value.toLowerCase()
  return notes.value.filter(
    n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
  )
})

const renderedContent = computed(() => {
  if (!currentNote.value?.content) return ''
  return marked(currentNote.value.content) as string
})

const fetchNotes = async () => {
  try {
    const res = await fetch('/api/notes')
    notes.value = await res.json()
  } catch {
    toast.error('加载笔记失败')
  }
}

const selectNote = (note: Note) => {
  currentNote.value = { ...note }
  editMode.value = true
}

const createNewNote = async () => {
  try {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '无标题', content: '' }),
    })
    const note = await res.json()
    notes.value.unshift(note)
    currentNote.value = { ...note }
    editMode.value = true
    toast.success('新建成功')
  } catch {
    toast.error('新建失败')
  }
}

const saveNote = async () => {
  if (!currentNote.value) return
  saving.value = true
  try {
    const res = await fetch(`/api/notes/${currentNote.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: currentNote.value.title,
        content: currentNote.value.content,
      }),
    })
    const updated = await res.json()
    const idx = notes.value.findIndex(n => n.id === updated.id)
    if (idx > -1) notes.value[idx] = updated
    toast.success('保存成功')
  } catch {
    toast.error('保存失败')
  } finally {
    saving.value = false
  }
}

const deleteNote = async (id: number) => {
  try {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    notes.value = notes.value.filter(n => n.id !== id)
    if (currentNote.value?.id === id) currentNote.value = null
    toast.success('删除成功')
  } catch {
    toast.error('删除失败')
  }
}

const formatTime = (t: string) => {
  try {
    return new Date(t).toLocaleString('zh-CN')
  } catch {
    return t
  }
}

const getPreview = (content: string) => {
  return content.replace(/[#*`\[\]]/g, '').substring(0, 80) || '空笔记'
}

onMounted(fetchNotes)
</script>

<template>
  <ToolLayout title="笔记本">
    <div class="flex h-[calc(100vh-7rem)] gap-4">
      <div class="w-72 flex flex-col glass-card p-0 overflow-hidden flex-shrink-0">
        <div class="p-3 border-b border-slate-200 bg-slate-50/50">
          <div class="relative mb-2">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索笔记..."
              class="w-full pl-9 pr-3 py-2 text-sm glass-input"
            />
          </div>
          <button @click="createNewNote" class="w-full btn-primary text-sm flex items-center justify-center gap-1.5 cursor-pointer">
            <PlusIcon class="w-4 h-4" /> 新建笔记
          </button>
        </div>
        <div class="flex-1 overflow-y-auto">
          <div v-if="filteredNotes.length === 0" class="p-8 text-sm text-center">
            <div class="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-2">
              <PencilIcon class="w-6 h-6 text-slate-300" />
            </div>
            <p class="text-slate-500">{{ searchQuery ? '未找到匹配笔记' : '暂无笔记' }}</p>
          </div>
          <div
            v-for="note in filteredNotes"
            :key="note.id"
            @click="selectNote(note)"
            :class="[
              'p-3 border-b border-slate-100 cursor-pointer transition-all group relative',
              currentNote?.id === note.id
                ? 'bg-accent/10 border-l-2 border-l-accent'
                : 'hover:bg-slate-50 border-l-2 border-l-transparent'
            ]"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-slate-800 truncate">{{ note.title || '无标题' }}</div>
                <div class="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{{ getPreview(note.content) }}</div>
                <div class="text-[10px] text-slate-400 mt-1.5">{{ formatTime(note.updated_at) }}</div>
              </div>
              <button
                @click.stop="deleteNote(note.id)"
                class="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 cursor-pointer transition-colors opacity-0 group-hover:opacity-100"
              >
                <TrashIcon class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 glass-card p-0 overflow-hidden flex flex-col">
        <template v-if="currentNote">
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/50">
            <input
              v-model="currentNote.title"
              class="text-lg font-semibold bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 flex-1"
              placeholder="笔记标题..."
            />
            <div class="flex items-center gap-2">
              <div class="inline-flex p-0.5 bg-slate-100 rounded-lg">
                <button
                  @click="editMode = true"
                  :class="['text-xs px-3 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-all', editMode ? 'bg-white text-accent shadow-sm' : 'text-slate-500']"
                >
                  <PencilIcon class="w-3.5 h-3.5" /> 编辑
                </button>
                <button
                  @click="editMode = false"
                  :class="['text-xs px-3 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-all', !editMode ? 'bg-white text-accent shadow-sm' : 'text-slate-500']"
                >
                  <EyeIcon class="w-3.5 h-3.5" /> 预览
                </button>
              </div>
              <button @click="saveNote" :disabled="saving" class="btn-primary text-xs px-3 py-1.5 cursor-pointer disabled:opacity-50">
                {{ saving ? '保存中...' : '保存' }}
              </button>
            </div>
          </div>
          <div class="flex-1 overflow-auto">
            <textarea
              v-if="editMode"
              v-model="currentNote.content"
              class="w-full h-full p-5 bg-transparent border-none outline-none resize-none text-sm font-mono text-slate-700 placeholder:text-slate-400"
              placeholder="开始写笔记... (支持 Markdown 语法)"
            />
            <div
              v-else
              class="p-5 prose prose-sm max-w-none text-slate-700"
              v-html="renderedContent"
            />
          </div>
        </template>
        <div v-else class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <PencilIcon class="w-8 h-8 text-slate-300" />
            </div>
            <p class="text-slate-500">选择或新建一个笔记</p>
            <p class="text-slate-400 text-xs mt-1">支持 Markdown 语法</p>
          </div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
