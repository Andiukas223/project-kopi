<script setup>
import { computed } from "vue";

defineOptions({ inheritAttrs: false });

const props = defineProps({
  compact: {
    type: Boolean,
    default: false
  },
  danger: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  href: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    default: "button"
  },
  variant: {
    type: String,
    default: "ghost"
  }
});

const emit = defineEmits(["click"]);

const buttonClass = computed(() => [
  "btn",
  props.variant,
  {
    compact: props.compact,
    danger: props.danger
  }
]);

function handleClick(event) {
  if (props.disabled) {
    event.preventDefault();
    return;
  }
  emit("click", event);
}
</script>

<template>
  <a
    v-if="href"
    :class="buttonClass"
    :href="disabled ? undefined : href"
    :aria-disabled="disabled ? 'true' : undefined"
    :tabindex="disabled ? -1 : undefined"
    v-bind="$attrs"
    @click="handleClick"
  >
    <slot />
  </a>
  <button
    v-else
    :class="buttonClass"
    :disabled="disabled"
    :type="type"
    v-bind="$attrs"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
