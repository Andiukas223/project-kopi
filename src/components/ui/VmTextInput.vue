<script setup>
defineOptions({ inheritAttrs: false });

defineProps({
  modelValue: {
    type: [String, Number],
    default: ""
  },
  multiline: {
    type: Boolean,
    default: false
  },
  rows: {
    type: [String, Number],
    default: 3
  },
  type: {
    type: String,
    default: "text"
  }
});

const emit = defineEmits(["change", "input", "update:modelValue"]);

function updateValue(event) {
  emit("update:modelValue", event.target.value);
  emit("input", event);
}
</script>

<template>
  <textarea
    v-if="multiline"
    :rows="rows"
    :value="modelValue"
    v-bind="$attrs"
    @change="$emit('change', $event)"
    @input="updateValue"
  />
  <input
    v-else
    :type="type"
    :value="modelValue"
    v-bind="$attrs"
    @change="$emit('change', $event)"
    @input="updateValue"
  >
</template>
