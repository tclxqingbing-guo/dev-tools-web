<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ChevronLeftIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'

defineProps<{
  title: string
}>()

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-surface">
    <header class="sticky top-0 z-40 border-b backdrop-blur-xl bg-surface/80 border-slate-200">
      <div class="flex items-center justify-between gap-4 px-6 mx-auto max-w-7xl h-14">
        <div class="flex items-center min-w-0 gap-4">
          <button
            @click="router.push('/')"
            class="flex items-center flex-shrink-0 gap-2 transition-colors cursor-pointer text-slate-500 hover:text-slate-700"
          >
            <ChevronLeftIcon class="w-5 h-5" />
            <!-- <span class="hidden text-sm font-medium sm:inline"></span> -->
          </button>
          <!-- <div class="flex-shrink-0 w-px h-5 bg-slate-200" /> -->
          <h1 class="text-base font-semibold truncate text-slate-800">{{ title }}</h1>
        </div>
        <div class="flex items-center gap-4">
          <router-link
            to="/settings"
            class="inline-flex items-center gap-1 flex-shrink-0 text-sm transition-colors cursor-pointer text-slate-500 hover:text-accent"
          >
            <Cog6ToothIcon class="w-4 h-4" />
            设置
          </router-link>
          <router-link
            to="/wishes"
            class="flex-shrink-0 text-sm transition-colors cursor-pointer text-slate-500 hover:text-accent"
          >
            许愿池 | 意见箱
          </router-link>
        </div>
      </div>
    </header>
    <main class="px-6 py-6 mx-auto max-w-7xl">
      <slot />
    </main>
  </div>
</template>
