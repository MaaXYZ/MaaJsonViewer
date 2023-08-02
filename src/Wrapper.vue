<script setup lang="ts">
import { NConfigProvider } from 'naive-ui'
import App from './App.vue'
import hljs from 'highlight.js/lib/core'
import hljs_json from 'highlight.js/lib/languages/json'

hljs.registerLanguage('json', hljs_json)
</script>

<template>
  <Suspense>
    <template #default>
      <NConfigProvider :hljs="hljs" class="flex flex-col flex-1 min-h-0">
        <App></App>
      </NConfigProvider>
    </template>
    <template #fallback> loading... </template>
  </Suspense>
</template>
