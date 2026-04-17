<script setup>
defineProps({
  as: {
    type: String,
    default: "section"
  },
  slim: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <component :is="as" class="panel" :class="{ slim }">
    <slot />
  </component>
</template>
