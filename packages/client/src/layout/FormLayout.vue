<template>
  <div class="mFormLayout">
    <slot></slot>
  </div>
</template>

<style>
.mFormLayout {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  row-gap: 1rem;
  column-gap: 0.5rem;
  align-items: center;
}
</style>
