<script setup lang="ts">
import { NCard, NModal } from 'naive-ui'
import { ref } from 'vue'

import { validateResult } from '@/data'

import SingleNavigateEdit from './SingleNavigateEdit.vue'

const show = ref(false)

defineExpose({
  show
})
</script>

<template>
  <NModal v-model:show="show">
    <NCard style="width: 60vw">
      <div class="flex flex-col gap-2">
        <div v-for="(m, i) in validateResult" :key="i">
          <div class="flex gap-2 items-center">
            <div>
              <SingleNavigateEdit :value="m[0]" readonly></SingleNavigateEdit>
            </div>
            <span> {{ m[1] }} </span>
            <span> {{ m[2] }} </span>
          </div>
        </div>
      </div>
    </NCard>
  </NModal>
</template>
