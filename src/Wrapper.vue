<script setup lang="ts">
import App from './App.vue'
</script>

<template>
  <Suspense>
    <template #default>
      <App></App>
    </template>
    <template #fallback> loading... </template>
  </Suspense>
</template>
