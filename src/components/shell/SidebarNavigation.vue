<script setup>
import { t } from "../../js/i18n.js";

const props = defineProps({
  activeModules: {
    type: Array,
    required: true
  },
  activePage: {
    type: String,
    required: true
  },
  moduleGroups: {
    type: Array,
    required: true
  }
});

defineEmits(["navigate"]);

function modulesForGroup(groupId) {
  return props.activeModules.filter((module) => module.group === groupId);
}

function moduleLabel(module) {
  return t(module.labelKey) || module.label;
}
</script>

<template>
  <aside class="sidebar" :aria-label="t('aria.mainNavigation')">
    <div v-for="group in moduleGroups" :key="group.id" class="sb-section">
      <div v-if="group.labelKey" class="sb-label">{{ t(group.labelKey) }}</div>
      <button
        v-for="module in modulesForGroup(group.id)"
        :id="`sb-${module.id}`"
        :key="module.id"
        class="sb-item"
        :class="{ active: activePage === module.id }"
        :data-nav="module.id"
        :aria-current="activePage === module.id ? 'page' : undefined"
        type="button"
        @click="$emit('navigate', module.id)"
      >
        <span>{{ moduleLabel(module) }}</span>
      </button>
    </div>
  </aside>
</template>
