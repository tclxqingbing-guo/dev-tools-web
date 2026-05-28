<script setup lang="ts">
withDefaults(defineProps<{
  minWidthClass?: string
  ellipsis?: boolean
}>(), {
  minWidthClass: 'min-w-[960px]',
  ellipsis: false,
})
</script>

<template>
  <div class="rounded-xl border border-slate-200 overflow-hidden">
    <div class="overflow-x-auto">
      <table :class="['w-full text-sm', minWidthClass, ellipsis ? 'table-fixed tool-horizontal-table-ellipsis' : '']">
        <slot />
      </table>
      <slot name="empty" />
    </div>
    <slot name="footer" />
  </div>
</template>

<style>
.tool-horizontal-table-ellipsis td:not(.tool-table-action-cell) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-horizontal-table-ellipsis td:not(.tool-table-action-cell) > * {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
