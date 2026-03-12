<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

defineProps<{
  title: string
}>()

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-surface">
    <header class="sticky top-0 z-40 backdrop-blur-xl bg-surface/80 border-b border-white/5">
      <div class="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
        <button
          @click="router.push('/')"
          class="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeftIcon class="w-5 h-5" />
          <span class="text-sm font-medium hidden sm:inline">返回</span>
        </button>
        <div class="h-5 w-px bg-white/10" />
        <h1 class="text-base font-semibold text-slate-100 truncate">{{ title }}</h1>
      </div>
    </header>
    <main class="max-w-7xl mx-auto px-6 py-6">
      <slot />
    </main>
  </div>
</template>
