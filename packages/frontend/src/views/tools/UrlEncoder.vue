<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import { useToast } from '../../composables/useToast'
import { useClipboard } from '../../composables/useClipboard'
import { ArrowsRightLeftIcon, ClipboardDocumentIcon, TrashIcon, ClipboardIcon, LinkIcon } from '@heroicons/vue/24/outline'

const toast = useToast()
const { copyToClipboard, readFromClipboard } = useClipboard()
const inputText = ref('')
const outputText = ref('')

function encodeUri() {
  try {
    if (!inputText.value) {
      toast.warning('请输入要编码的URI')
      return
    }
    outputText.value = encodeURI(inputText.value)
    toast.success('编码完成')
  } catch (e: any) {
    toast.error(e.message || '编码失败')
  }
}

function decodeUri() {
  try {
    if (!inputText.value) {
      toast.warning('请输入要解码的URI')
      return
    }
    outputText.value = decodeURI(inputText.value)
    toast.success('解码完成')
  } catch (e: any) {
    toast.error(e.message || '解码失败')
  }
}

function encodeComponent() {
  try {
    if (!inputText.value) {
      toast.warning('请输入要编码的组件')
      return
    }
    outputText.value = encodeURIComponent(inputText.value)
    toast.success('编码完成')
  } catch (e: any) {
    toast.error(e.message || '编码失败')
  }
}

function decodeComponent() {
  try {
    if (!inputText.value) {
      toast.warning('请输入要解码的组件')
      return
    }
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
    <div class="space-y-5">
      <div class="glass-card p-4">
        <div class="flex items-center gap-2 mb-3">
          <LinkIcon class="w-5 h-5 text-accent" />
          <h3 class="text-slate-800 font-semibold">编码 / 解码操作</h3>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button class="btn-primary flex items-center justify-center gap-2 cursor-pointer !py-2.5" @click="encodeUri">
            <ArrowsRightLeftIcon class="w-4 h-4" />
            编码 URI
          </button>
          <button class="btn-secondary flex items-center justify-center gap-2 cursor-pointer !py-2.5" @click="decodeUri">
            解码 URI
          </button>
          <button class="btn-primary flex items-center justify-center gap-2 cursor-pointer !py-2.5" @click="encodeComponent">
            编码组件
          </button>
          <button class="btn-secondary flex items-center justify-center gap-2 cursor-pointer !py-2.5" @click="decodeComponent">
            解码组件
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div class="glass-card p-5 flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-slate-700 text-sm font-semibold flex items-center gap-2">
              <span class="w-1 h-4 bg-accent rounded-full" />
              输入
            </h3>
            <button class="text-xs text-slate-500 hover:text-accent flex items-center gap-1 cursor-pointer" @click="pasteInput">
              <ClipboardIcon class="w-3.5 h-3.5" />
              粘贴
            </button>
          </div>
          <textarea
            v-model="inputText"
            placeholder="请输入要编码或解码的文本..."
            class="glass-input flex-1 min-h-[260px] p-4 font-mono text-sm resize-none"
          />
        </div>

        <div class="glass-card p-5 flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-slate-700 text-sm font-semibold flex items-center gap-2">
              <span class="w-1 h-4 bg-accent rounded-full" />
              输出
            </h3>
            <button class="text-xs text-slate-500 hover:text-accent flex items-center gap-1 cursor-pointer" @click="copyOutput">
              <ClipboardDocumentIcon class="w-3.5 h-3.5" />
              复制
            </button>
          </div>
          <textarea
            v-model="outputText"
            placeholder="结果将在这里显示..."
            readonly
            class="glass-input flex-1 min-h-[260px] p-4 font-mono text-sm resize-none bg-slate-50"
          />
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
