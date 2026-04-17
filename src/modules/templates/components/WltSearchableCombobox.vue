<script setup>
import { computed } from "vue";
import { wltArray } from "../templateViewModel.js";

const props = defineProps({
  dataAttr: {
    type: String,
    required: true
  },
  multiple: {
    type: Boolean,
    default: true
  },
  note: {
    type: String,
    default: ""
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: ""
  },
  selectedValues: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    required: true
  }
});

const normalizedOptions = computed(() => props.options.map((option) => ({
  value: option.value,
  label: option.label,
  detail: option.detail || ""
})));

const selectedSet = computed(() => new Set(wltArray(props.selectedValues)));

const selectedLabels = computed(() => normalizedOptions.value
  .filter((option) => selectedSet.value.has(option.value))
  .map((option) => option.label));

const selectedText = computed(() => {
  const labels = selectedLabels.value;
  if (labels.length === 1) return labels[0];
  if (!labels.length) return "";
  return `${labels.length} selected: ${labels.slice(0, 2).join(", ")}${labels.length > 2 ? ", ..." : ""}`;
});

const summaryText = computed(() => selectedText.value || "No specific link");

function optionSearch(option) {
  return [option.label, option.detail, option.value].join(" ").toLowerCase();
}

function dataAttribute() {
  return { [`data-${props.dataAttr}`]: "" };
}
</script>

<template>
  <div
    class="wlt-combo"
    data-wlt-combobox
    :data-wlt-combobox-data-attr="dataAttr"
    :data-wlt-combobox-multiple="multiple ? 'true' : 'false'"
  >
    <div class="wlt-combo-summary">
      <span>{{ title }}</span>
      <strong data-wlt-combobox-summary>{{ summaryText }}</strong>
    </div>
    <div class="wlt-combobox-control">
      <input
        class="wlt-combobox-input"
        type="search"
        data-wlt-combobox-search
        :value="selectedText"
        :data-selected-text="selectedText"
        :placeholder="placeholder || `Search ${title}`"
        autocomplete="off"
        role="combobox"
        aria-expanded="false"
        :aria-label="title"
      >
      <button class="wlt-combobox-toggle" type="button" data-wlt-combobox-toggle :aria-label="`Open ${title} options`">
        v
      </button>
    </div>
    <div v-if="note" class="filter-note">{{ note }}</div>
    <div class="wlt-combobox-menu" role="listbox" :aria-label="title">
      <button
        v-for="option in normalizedOptions"
        :key="option.value"
        class="wlt-combobox-option"
        :class="{ 'is-selected': selectedSet.has(option.value) }"
        type="button"
        data-wlt-combobox-option
        :data-value="option.value"
        :data-label="option.label"
        :data-search="optionSearch(option)"
        :aria-selected="selectedSet.has(option.value) ? 'true' : 'false'"
      >
        <span>
          <strong>{{ option.label }}</strong>
          <small v-if="option.detail">{{ option.detail }}</small>
        </span>
      </button>
      <div class="modal-placeholder" data-wlt-combobox-empty hidden>No matches.</div>
    </div>
    <div data-wlt-combobox-values>
      <input
        v-for="option in normalizedOptions.filter((item) => selectedSet.has(item.value))"
        :key="option.value"
        type="hidden"
        :value="option.value"
        data-wlt-combobox-value
        :data-wlt-label="option.label"
        v-bind="dataAttribute()"
      >
    </div>
  </div>
</template>
