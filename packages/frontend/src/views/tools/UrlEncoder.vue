<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import { useToast } from '../../composables/useToast'
import { useClipboard } from '../../composables/useClipboard'
import { ArrowsRightLeftIcon, ClipboardDocumentIcon, TrashIcon } from '@heroicons/vue/24/outline'

const toast = useToast()
const { copyToClipboard, readFromClipboard } = useClipboard()
const inputText = ref('')
const outputText = ref('')

function encodeUri() {
  try {
    outputText.value = encodeURI(inputText.value)
    toast.success('编码完成')
  } catch (e: any) {
    toast.error(e.message || '编码失败')
  }
}

function decodeUri() {
  try {
    outputText.value = decodeURI(inputText.value)
    toast.success('解码完成')
  } catch (e: any) {
    toast.error(e.message || '解码失败')
  }
}

function encodeComponent() {
  try {
    outputText.value = encodeURIComponent(inputText.value)
    toast.success('编码完成')
  } catch (e: any) {
    toast.error(e.message || '编码失败')
  }
}

function decodeComponent() {
  try {
    outputText.value = decodeURIComponent(inputText.value)
    toast.success('解码完成')
  } catch (e: any) {
    toast.error(e.message || '解码失败')
  }
}

async function pasteInput() {
  const text = await readFromClipboard()
  if (text) {
    inputText.value = text
    toast.success('已粘贴')
  } else {
    toast.warning('无法读取剪贴板')
  }
}

function copyOutput() {
  if (outputText.value) {
    copyToClipboard(outputText.value)
  } else {
    toast.warning('暂无输出内容')
  }
}
</script>

<template>
  <ToolLayout title="URL 编码/解码">
    <div class="space-y-6">
      <div class="flex flex-wrap gap-2">
        <button class="btn-primary flex items-center gap-2 cursor-pointer" @click="encodeUri">
          <ArrowsRightLeftIcon class="w-4 h-4" />
          Encode URI
        </button>
        <button class="btn-secondary flex items-center gap-2 cursor-pointer" @click="decodeUri">
          Decode URI
        </button>
        <button class="btn-primary flex items-center gap-2 cursor-pointer" @click="encodeComponent">
          Encode Component
        </button>
        <button class="btn-secondary flex items-center gap-2 cursor-pointer" @click="decodeComponent">
          Decode Component
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="glass-card p-4 flex flex-col">
          <div class="flex items-center justify-between mb-2">
            <label class="text-slate-500 text-sm font-medium">输入</label>
            <button class="btn-secondary flex items-center gap-1.5 px-2 py-1 text-sm cursor-pointer" @click="pasteInput">
              <TrashIcon class="w-4 h-4" />
              粘贴
            </button>
          </div>
          <textarea
            v-model="inputText"
            placeholder="请输入要编码或解码的文本..."
            class="glass-input flex-1 min-h-[200px] p-4 font-mono text-sm resize-none"
          />
        </div>

        <div class="glass-card p-4 flex flex-col bg-surface-card">
          <div class="flex items-center justify-between mb-2">
            <label class="text-slate-500 text-sm font-medium">输出</label>
            <button class="btn-secondary flex items-center gap-1.5 px-2 py-1 text-sm cursor-pointer" @click="copyOutput">
              <ClipboardDocumentIcon class="w-4 h-4" />
              复制
            </button>
          </div>
          <textarea
            v-model="outputText"
            placeholder="结果将在这里显示..."
            readonly
            class="glass-input flex-1 min-h-[200px] p-4 font-mono text-sm resize-none bg-white/5"
          />
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
