<script setup>
defineOptions({ inheritAttrs: false });

defineProps({
  modelValue: {
    type: [String, Number],
    default: ""
  },
  options: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(["change", "update:modelValue"]);

function optionValue(option) {
  return typeof option === "object" ? option.value : option;
}

function optionLabel(option) {
  return typeof option === "object" ? option.label : option;
}

function updateValue(event) {
  emit("update:modelValue", event.target.value);
  emit("change", event);
}
</script>

<template>
  <select :value="modelValue" v-bind="$attrs" @change="updateValue">
    <option
      v-for="option in options"
      :key="optionValue(option)"
      :disabled="typeof option === 'object' && option.disabled"
      :value="optionValue(option)"
    >
      {{ optionLabel(option) }}
    </option>
    <slot />
  </select>
</template>
