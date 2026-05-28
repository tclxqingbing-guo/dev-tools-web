<script setup lang="ts">
defineProps<{
  start: number
  end: number
  total: number
  currentPage: number
  totalPages: number
  pageSize: number
  pageSizeOptions: number[]
}>()

const emit = defineEmits<{
  'update:pageSize': [value: number]
  'page-size-change': []
  previous: []
  next: []
}>()

/**
 * 更新分页条数并通知父组件持久化。
 *
 * @param event 下拉框变更事件。
 * @return 无返回值。
 */
function updatePageSize(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:pageSize', Number(target.value))
  emit('page-size-change')
}
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 py-3 bg-white border-t border-slate-100 text-xs text-slate-500">
    <div>
      第 {{ start }}-{{ end }} 条，共 {{ total }} 条
    </div>
    <div class="flex items-center gap-2">
      <select :value="pageSize" class="glass-input px-2 py-1.5 text-xs cursor-pointer" @change="updatePageSize">
        <option v-for="option in pageSizeOptions" :key="option" :value="option">
          {{ option }} 条/页
        </option>
      </select>
      <button class="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50" :disabled="currentPage <= 1" @click="emit('previous')">
        上一页
      </button>
      <span class="text-slate-400">{{ currentPage }} / {{ totalPages }}</span>
      <button class="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50" :disabled="currentPage >= totalPages" @click="emit('next')">
        下一页
      </button>
    </div>
  </div>
</template>
