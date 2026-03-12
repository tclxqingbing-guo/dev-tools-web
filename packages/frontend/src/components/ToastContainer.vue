<script setup lang="ts">
import { useToast } from '../composables/useToast'
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/solid'

const { toasts } = useToast()

const iconMap = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
}

const colorMap: Record<string, string> = {
  success: 'bg-emerald-500/90',
  error: 'bg-red-500/90',
  warning: 'bg-amber-500/90',
  info: 'bg-blue-500/90',
}
</script>

<template>
  <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        :class="[colorMap[t.type], 'flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm text-white']"
      >
        <component :is="iconMap[t.type]" class="w-5 h-5 flex-shrink-0" />
        <span class="text-sm font-medium">{{ t.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
