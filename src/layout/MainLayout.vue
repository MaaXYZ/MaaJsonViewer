<template>
  <div class="flex flex-col gap-2 flex-1 min-h-0">
    <div class="flex gap-2">
      <slot name="action"></slot>
    </div>
    <div class="flex gap-2 flex-1 min-h-0">
      <slot></slot>
    </div>
  </div>
</template>
