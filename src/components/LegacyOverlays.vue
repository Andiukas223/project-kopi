<script setup>
import { computed } from "vue";
import { renderDocumentRouteOverlays } from "../js/render.js";
import { legacyRenderTick } from "../stores/shellStore.js";

const overlayHtml = computed(() => {
  legacyRenderTick.value;
  return renderDocumentRouteOverlays();
});
</script>

<template>
  <div v-html="overlayHtml" />
</template>
