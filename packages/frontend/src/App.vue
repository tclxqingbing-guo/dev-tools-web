<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastContainer from './components/ToastContainer.vue'
</script>

<template>
  <div class="min-h-screen">
    <RouterView />
    <ToastContainer />
  </div>
</template>
