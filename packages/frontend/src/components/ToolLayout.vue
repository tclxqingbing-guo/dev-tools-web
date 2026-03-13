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
    <header class="sticky top-0 z-40 backdrop-blur-xl bg-surface/80 border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <div class="flex items-center gap-4 min-w-0">
          <button
            @click="router.push('/')"
            class="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer flex-shrink-0"
          >
            <ArrowLeftIcon class="w-5 h-5" />
            <span class="text-sm font-medium hidden sm:inline">返回</span>
          </button>
          <div class="h-5 w-px bg-slate-200 flex-shrink-0" />
          <h1 class="text-base font-semibold text-slate-800 truncate">{{ title }}</h1>
        </div>
        <router-link
          to="/wishes"
          class="flex-shrink-0 text-sm text-slate-500 hover:text-accent transition-colors cursor-pointer"
        >
          许愿池 | 意见箱
        </router-link>
      </div>
    </header>
    <main class="max-w-7xl mx-auto px-6 py-6">
      <slot />
    </main>
  </div>
</template>
