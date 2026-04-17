<script setup>
defineProps({
  error: {
    type: String,
    default: ""
  },
  forId: {
    type: String,
    default: ""
  },
  full: {
    type: Boolean,
    default: false
  },
  hint: {
    type: String,
    default: ""
  },
  label: {
    type: String,
    default: ""
  }
});
</script>

<template>
  <div class="field" :class="{ full }">
    <label v-if="label" :for="forId || undefined">{{ label }}</label>
    <slot />
    <div v-if="hint" class="filter-note">{{ hint }}</div>
    <div v-if="error" class="filter-note danger">{{ error }}</div>
  </div>
</template>
