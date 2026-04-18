<script setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { rerenderLegacyApp } from "../../stores/shellStore.js";
import { useTemplateStore } from "../../stores/templateStore.js";
import TemplateDetailPage from "./TemplateDetailPage.vue";
import TemplateListPage from "./TemplateListPage.vue";

const route = useRoute();
const templateStore = useTemplateStore();

const templateId = computed(() => String(route.params.templateId || ""));

onMounted(async () => {
  if (!templateStore.state.loadedAt && !templateStore.state.loading) {
    await templateStore.loadTemplates();
  }
  rerenderLegacyApp({ syncRoute: false });
});
</script>

<template>
  <TemplateDetailPage v-if="templateId" :template-id="templateId" />
  <TemplateListPage v-else />
</template>
