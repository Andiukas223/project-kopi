<script setup>
import { computed } from "vue";
import { renderPage } from "../js/render.js";
import { legacyRenderTick } from "../stores/shellStore.js";

const pageHtml = computed(() => {
  legacyRenderTick.value;
  return renderPage();
});
</script>

<template>
  <main id="app-main" class="main" tabindex="-1" v-html="pageHtml"></main>
</template>
