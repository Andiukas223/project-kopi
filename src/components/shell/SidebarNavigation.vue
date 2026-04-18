<script setup>
import { t } from "../../js/i18n.js";

const outlineIcons = Object.freeze({
  service: [
    { type: "rect", attrs: { x: "4.5", y: "9", width: "15", height: "9", rx: "1.5" } },
    { type: "path", attrs: { d: "M9 9V7.5A1.5 1.5 0 0 1 10.5 6h3A1.5 1.5 0 0 1 15 7.5V9" } },
    { type: "line", attrs: { x1: "10", y1: "13.5", x2: "14", y2: "13.5" } }
  ],
  workacts: [
    { type: "rect", attrs: { x: "6", y: "5", width: "12", height: "15", rx: "2" } },
    { type: "path", attrs: { d: "M9 5.5h6V8H9z" } },
    { type: "line", attrs: { x1: "9", y1: "11", x2: "15", y2: "11" } },
    { type: "line", attrs: { x1: "9", y1: "14", x2: "15", y2: "14" } }
  ],
  contracts: [
    { type: "path", attrs: { d: "M8 4.5h6l3.5 3.5v11.5H8z" } },
    { type: "path", attrs: { d: "M14 4.5V8h3.5" } },
    { type: "line", attrs: { x1: "10", y1: "12", x2: "16", y2: "12" } },
    { type: "line", attrs: { x1: "10", y1: "15", x2: "16", y2: "15" } }
  ],
  documents: [
    {
      type: "path",
      attrs: {
        d: "M3.5 8.5A1.5 1.5 0 0 1 5 7h4l1.8 1.8c.2.2.5.2.7.2H19A1.5 1.5 0 0 1 20.5 10.5v7A1.5 1.5 0 0 1 19 19H5A1.5 1.5 0 0 1 3.5 17.5z"
      }
    },
    { type: "line", attrs: { x1: "3.5", y1: "10.5", x2: "20.5", y2: "10.5" } }
  ],
  templates: [
    { type: "rect", attrs: { x: "4.5", y: "5.5", width: "15", height: "13", rx: "1.5" } },
    { type: "line", attrs: { x1: "4.5", y1: "10", x2: "19.5", y2: "10" } },
    { type: "line", attrs: { x1: "10", y1: "10", x2: "10", y2: "18.5" } }
  ],
  customers: [
    { type: "circle", attrs: { cx: "9", cy: "10", r: "2.5" } },
    { type: "circle", attrs: { cx: "15.5", cy: "9", r: "2" } },
    { type: "path", attrs: { d: "M5.5 17c.7-1.8 2-2.8 3.5-2.8s2.8 1 3.5 2.8" } },
    { type: "path", attrs: { d: "M13.2 17c.5-1.2 1.3-1.9 2.3-1.9.9 0 1.8.7 2.3 1.9" } }
  ],
  equipment: [
    { type: "rect", attrs: { x: "4.5", y: "5.5", width: "15", height: "10", rx: "1.5" } },
    { type: "line", attrs: { x1: "12", y1: "15.5", x2: "12", y2: "18.5" } },
    { type: "line", attrs: { x1: "9.5", y1: "18.5", x2: "14.5", y2: "18.5" } }
  ],
  calendar: [
    { type: "rect", attrs: { x: "4.5", y: "6.5", width: "15", height: "12", rx: "1.5" } },
    { type: "line", attrs: { x1: "8", y1: "4.5", x2: "8", y2: "8.5" } },
    { type: "line", attrs: { x1: "16", y1: "4.5", x2: "16", y2: "8.5" } },
    { type: "line", attrs: { x1: "4.5", y1: "10", x2: "19.5", y2: "10" } },
    { type: "rect", attrs: { x: "8.5", y: "12.5", width: "3", height: "3", rx: "0.5" } }
  ],
  admin: [
    { type: "line", attrs: { x1: "5", y1: "7", x2: "19", y2: "7" } },
    { type: "circle", attrs: { cx: "10", cy: "7", r: "1.5" } },
    { type: "line", attrs: { x1: "5", y1: "12", x2: "19", y2: "12" } },
    { type: "circle", attrs: { cx: "14", cy: "12", r: "1.5" } },
    { type: "line", attrs: { x1: "5", y1: "17", x2: "19", y2: "17" } },
    { type: "circle", attrs: { cx: "8", cy: "17", r: "1.5" } }
  ],
  default: [{ type: "rect", attrs: { x: "6", y: "6", width: "12", height: "12", rx: "2" } }]
});

const props = defineProps({
  activeModules: {
    type: Array,
    required: true
  },
  activePage: {
    type: String,
    required: true
  },
  isCollapsed: {
    type: Boolean,
    required: true
  },
  moduleGroups: {
    type: Array,
    required: true
  }
});

defineEmits(["navigate", "toggle-collapse"]);

function modulesForGroup(groupId) {
  return props.activeModules.filter((module) => module.group === groupId);
}

function moduleLabel(module) {
  return t(module.labelKey) || module.label;
}

function iconShapes(module) {
  return outlineIcons[module.icon] || outlineIcons.default;
}

function collapseButtonSymbol() {
  return props.isCollapsed ? ">" : "<";
}

function collapseButtonAriaLabel() {
  return props.isCollapsed ? "Expand sidebar" : "Collapse sidebar";
}
</script>

<template>
  <aside class="sidebar" :aria-label="t('aria.mainNavigation')">
    <div class="sb-top">
      <button
        class="sb-collapse-toggle"
        type="button"
        :aria-pressed="String(isCollapsed)"
        :aria-label="collapseButtonAriaLabel()"
        :title="collapseButtonAriaLabel()"
        @click="$emit('toggle-collapse')"
      >
        <span class="sb-collapse-symbol" aria-hidden="true">{{ collapseButtonSymbol() }}</span>
      </button>
    </div>

    <div v-for="group in moduleGroups" :key="group.id" class="sb-section">
      <div v-if="group.labelKey" class="sb-label">{{ t(group.labelKey) }}</div>
      <button
        v-for="module in modulesForGroup(group.id)"
        :id="`sb-${module.id}`"
        :key="module.id"
        class="sb-item"
        :class="{ active: activePage === module.id }"
        :data-nav="module.id"
        :title="isCollapsed ? moduleLabel(module) : undefined"
        :aria-label="isCollapsed ? moduleLabel(module) : undefined"
        :aria-current="activePage === module.id ? 'page' : undefined"
        type="button"
        @click="$emit('navigate', module.id)"
      >
        <span class="sb-item-icon" aria-hidden="true">
          <svg class="sb-item-icon-svg" viewBox="0 0 24 24" fill="none" focusable="false">
            <component
              :is="shape.type"
              v-for="(shape, index) in iconShapes(module)"
              :key="`${module.id}-${shape.type}-${index}`"
              v-bind="shape.attrs"
            />
          </svg>
        </span>
        <span class="sb-item-label">{{ moduleLabel(module) }}</span>
      </button>
    </div>
  </aside>
</template>
