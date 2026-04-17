<script setup>
import { computed } from "vue";

const props = defineProps({
  label: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    required: true
  }
});

const statusClass = computed(() => String(props.status)
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, ""));
</script>

<template>
  <span class="chip" :class="statusClass">
    <slot>{{ label || status }}</slot>
  </span>
</template>
