<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import { useToast } from '../../composables/useToast'
import { useApi } from '../../composables/useApi'
import { useAiModels } from '../../composables/useAiModels'
import { VariableIcon, ClipboardDocumentIcon } from '@heroicons/vue/24/outline'

const toast = useToast()
const api = useApi()
const { chatModels: models } = useAiModels()

const description = ref('')
const suggestions = ref<{ camel: string[]; snake: string[]; pascal: string[] }>({
  camel: [],
  snake: [],
  pascal: [],
})
const isLoading = ref(false)
const selectedModel = ref('deepseek-v3.2')

const SYSTEM_PROMPT = `You are a variable naming assistant. Given a description, output variable names in exactly 3 lines:
Line 1: camelCase names, comma-separated (e.g. userName, itemCount)
Line 2: snake_case names, comma-separated (e.g. user_name, item_count)
Line 3: PascalCase names, comma-separated (e.g. UserName, ItemCount)

Output ONLY these 3 lines, no other text. Provide 3-6 suggestions per style.`

function parseResponse(
  text: string
): { camel: string[]; snake: string[]; pascal: string[] } {
  const lines = text.trim().split('\n').filter(Boolean)
  const camel = lines[0]
    ? lines[0].split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const snake = lines[1]
    ? lines[1].split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const pascal = lines[2]
    ? lines[2].split(',').map((s) => s.trim()).filter(Boolean)
    : []
  return { camel, snake, pascal }
}

async function generate() {
  const desc = description.value.trim()
  if (!desc || isLoading.value) return

  isLoading.value = true
  suggestions.value = { camel: [], snake: [], pascal: [] }
  try {
    const res = await api.request<{
      choices?: Array<{ message?: { content?: string } }>
    }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: desc },
        ],
        model: selectedModel.value,
        stream: false,
        max_tokens: 512,
      }),
    })
    const content = res?.choices?.[0]?.message?.content ?? ''
    suggestions.value = parseResponse(content)
    if (
      !suggestions.value.camel.length &&
      !suggestions.value.snake.length &&
      !suggestions.value.pascal.length
    ) {
      toast.warning('未能解析到变量名建议')
    } else {
      toast.success('生成完成')
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '生成失败'
    toast.error(message)
  } finally {
    isLoading.value = false
  }
}

async function copyName(name: string) {
  try {
    await navigator.clipboard.writeText(name)
    toast.success('已复制')
  } catch {
    toast.error('复制失败')
  }
}
</script>

<template>
  <ToolLayout title="变量命名助手">
    <div class="space-y-6">
      <div class="glass-card p-4 flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="text-slate-500 text-sm block mb-2">变量描述</label>
          <textarea
            v-model="description"
            placeholder="描述变量用途，例如：用户的全名、商品的数量、是否已登录..."
            class="glass-input w-full min-h-[100px] p-3 resize-none cursor-text"
          />
        </div>
        <div class="flex gap-3 items-end">
          <div>
            <label class="text-slate-500 text-sm block mb-1">模型</label>
            <select
              v-model="selectedModel"
              class="glass-input px-3 py-2 cursor-pointer"
            >
              <option
                v-for="m in models"
                :key="m.value"
                :value="m.value"
              >
                {{ m.label }}
              </option>
            </select>
          </div>
          <button
            class="btn-primary flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isLoading || !description.trim()"
            @click="generate"
          >
            <VariableIcon class="w-4 h-4" />
            {{ isLoading ? '生成中...' : '生成命名' }}
          </button>
        </div>
      </div>

      <div
        v-if="isLoading"
        class="glass-card p-8 flex justify-center"
      >
        <div
          class="animate-spin w-10 h-10 border-2 border-accent border-t-transparent rounded-full"
          role="status"
        />
      </div>

      <div
        v-else-if="
          suggestions.camel.length ||
          suggestions.snake.length ||
          suggestions.pascal.length
        "
        class="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div class="glass-card p-4">
          <h3 class="text-slate-800 font-medium mb-3">camelCase</h3>
          <ul class="space-y-2">
            <li
              v-for="(name, i) in suggestions.camel"
              :key="i"
              class="flex items-center justify-between gap-2 group"
            >
              <code class="text-slate-300 text-sm flex-1 truncate">{{ name }}</code>
              <button
                class="btn-secondary px-2 py-1 text-xs cursor-pointer shrink-0 flex items-center gap-1"
                @click="copyName(name)"
              >
                <ClipboardDocumentIcon class="w-3.5 h-3.5" />
                复制
              </button>
            </li>
          </ul>
        </div>
        <div class="glass-card p-4">
          <h3 class="text-slate-800 font-medium mb-3">snake_case</h3>
          <ul class="space-y-2">
            <li
              v-for="(name, i) in suggestions.snake"
              :key="i"
              class="flex items-center justify-between gap-2 group"
            >
              <code class="text-slate-300 text-sm flex-1 truncate">{{ name }}</code>
              <button
                class="btn-secondary px-2 py-1 text-xs cursor-pointer shrink-0 flex items-center gap-1"
                @click="copyName(name)"
              >
                <ClipboardDocumentIcon class="w-3.5 h-3.5" />
                复制
              </button>
            </li>
          </ul>
        </div>
        <div class="glass-card p-4">
          <h3 class="text-slate-800 font-medium mb-3">PascalCase</h3>
          <ul class="space-y-2">
            <li
              v-for="(name, i) in suggestions.pascal"
              :key="i"
              class="flex items-center justify-between gap-2 group"
            >
              <code class="text-slate-300 text-sm flex-1 truncate">{{ name }}</code>
              <button
                class="btn-secondary px-2 py-1 text-xs cursor-pointer shrink-0 flex items-center gap-1"
                @click="copyName(name)"
              >
                <ClipboardDocumentIcon class="w-3.5 h-3.5" />
                复制
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
