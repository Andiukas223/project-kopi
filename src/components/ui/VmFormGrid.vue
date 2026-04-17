<script setup>
defineProps({
  spaced: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <div class="field-grid" :class="{ spaced }">
    <slot />
  </div>
</template>
