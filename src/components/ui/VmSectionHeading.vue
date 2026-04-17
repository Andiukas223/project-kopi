<script setup>
defineProps({
  title: {
    type: String,
    default: ""
  }
});
</script>

<template>
  <div class="section-heading">
    <div>
      <div v-if="title" class="section-title">{{ title }}</div>
      <slot name="title" />
    </div>
    <div>
      <slot name="actions" />
    </div>
  </div>
</template>
