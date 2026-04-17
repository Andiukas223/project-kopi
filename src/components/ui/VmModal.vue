<script setup>
defineOptions({ inheritAttrs: false });

defineProps({
  ariaLabel: {
    type: String,
    default: ""
  },
  ariaLabelledby: {
    type: String,
    default: ""
  },
  dialogClass: {
    type: [String, Array, Object],
    default: ""
  },
  open: {
    type: Boolean,
    default: false
  },
  overlayClass: {
    type: [String, Array, Object],
    default: ""
  }
});
</script>

<template>
  <div v-if="open" :class="overlayClass" v-bind="$attrs">
    <section
      :class="dialogClass"
      role="dialog"
      aria-modal="true"
      :aria-label="ariaLabel || undefined"
      :aria-labelledby="ariaLabelledby || undefined"
    >
      <slot />
    </section>
  </div>
</template>
