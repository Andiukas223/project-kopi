<script setup>
const props = defineProps({
  columns: {
    type: Array,
    default: () => []
  },
  emptyText: {
    type: String,
    default: "No records."
  },
  rowKey: {
    type: String,
    default: "id"
  },
  rows: {
    type: Array,
    default: () => []
  },
  selectedKey: {
    type: [String, Number],
    default: ""
  },
  tableClass: {
    type: [String, Array, Object],
    default: ""
  },
  toolbarLabel: {
    type: String,
    default: ""
  }
});

defineEmits(["row-click"]);

function keyForRow(row, index) {
  return row?.[props.rowKey] ?? index;
}
</script>

<template>
  <div class="table-card">
    <div v-if="toolbarLabel || $slots.toolbar" class="table-toolbar">
      <span>{{ toolbarLabel }}</span>
      <slot name="toolbar" />
    </div>
    <div class="table-scroll">
      <table class="data-table" :class="tableClass">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key" :class="column.headerClass">
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!rows.length">
            <td :colspan="Math.max(columns.length, 1)">
              <slot name="empty">{{ emptyText }}</slot>
            </td>
          </tr>
          <tr
            v-for="(row, rowIndex) in rows"
            :key="keyForRow(row, rowIndex)"
            :class="{ selected: selectedKey && keyForRow(row, rowIndex) === selectedKey }"
            @click="$emit('row-click', row)"
          >
            <td v-for="column in columns" :key="column.key" :class="column.cellClass">
              <slot :name="`cell-${column.key}`" :column="column" :row="row" :value="row[column.key]">
                <slot name="cell" :column="column" :row="row" :value="row[column.key]">
                  {{ row[column.key] }}
                </slot>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
