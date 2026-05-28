<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = withDefaults(defineProps<{
  open: boolean
  title: string
  panelClass?: string
  closeOnBackdrop?: boolean
}>(), {
  panelClass: 'w-[92vw] sm:w-[672px]',
  closeOnBackdrop: false,
})

const emit = defineEmits<{
  close: []
}>()

const isDragging = ref(false)
const dragOffset = reactive({ x: 0, y: 0 })
const dragStart = reactive({ x: 0, y: 0 })

const panelStyle = computed(() => ({
  transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
}))

watch(() => props.open, open => {
  if (open) {
    dragOffset.x = 0
    dragOffset.y = 0
  } else {
    stopDrag()
  }
})

/**
 * 根据配置处理遮罩点击关闭。
 *
 * @return 无返回值。
 */
function closeFromBackdrop() {
  if (props.closeOnBackdrop) {
    emit('close')
  }
}

/**
 * 开始拖动弹框。
 *
 * @param event 鼠标或触控指针事件。
 * @return 无返回值。
 */
function startDrag(event: PointerEvent) {
  if (event.button !== 0) return
  event.preventDefault()
  isDragging.value = true
  dragStart.x = event.clientX - dragOffset.x
  dragStart.y = event.clientY - dragOffset.y
  window.addEventListener('pointermove', dragModal)
  window.addEventListener('pointerup', stopDrag)
}

/**
 * 拖动过程中更新弹框偏移。
 *
 * @param event 鼠标或触控指针事件。
 * @return 无返回值。
 */
function dragModal(event: PointerEvent) {
  if (!isDragging.value) return
  dragOffset.x = event.clientX - dragStart.x
  dragOffset.y = event.clientY - dragStart.y
}

/**
 * 停止拖动并清理监听器。
 *
 * @return 无返回值。
 */
function stopDrag() {
  isDragging.value = false
  window.removeEventListener('pointermove', dragModal)
  window.removeEventListener('pointerup', stopDrag)
}

onBeforeUnmount(stopDrag)
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4" @click.self="closeFromBackdrop">
    <div :class="['glass-card bg-white p-5 shadow-xl max-w-[calc(100vw-2rem)] max-h-[90vh] min-w-[320px] min-h-[220px] resize overflow-auto', panelClass]" :style="panelStyle">
      <div class="flex items-center justify-between mb-4 cursor-move select-none" @pointerdown="startDrag">
        <h3 class="font-semibold text-slate-800 flex items-center gap-2">
          <slot name="icon" />
          {{ title }}
        </h3>
        <button class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100" @pointerdown.stop @click="emit('close')">
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
      <slot />
      <div v-if="$slots.footer" class="flex items-center justify-end gap-2 mt-5">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
