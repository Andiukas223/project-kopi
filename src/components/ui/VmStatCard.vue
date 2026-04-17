<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  note: {
    type: String,
    default: ""
  },
  tone: {
    type: String,
    default: ""
  },
  value: {
    type: [String, Number],
    required: true
  }
});
</script>

<template>
  <article class="stat-card" :class="tone">
    <div class="stat-label">{{ label }}</div>
    <div class="stat-value">{{ value }}</div>
    <div v-if="note" class="stat-note">{{ note }}</div>
    <slot />
  </article>
</template>
