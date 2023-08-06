<script setup lang="ts">
import hljs from 'highlight.js/lib/core'
import hljs_json from 'highlight.js/lib/languages/json'
import { NConfigProvider, NDialogProvider } from 'naive-ui'

import App from './App.vue'

hljs.registerLanguage('json', hljs_json)
</script>

<template>
  <NDialogProvider>
    <NConfigProvider :hljs="hljs" class="flex flex-col flex-1 min-h-0">
      <App></App>
    </NConfigProvider>
  </NDialogProvider>
</template>
