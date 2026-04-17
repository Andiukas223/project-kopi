<script setup>
import LegacyPage from "../components/LegacyPage.vue";
import LegacyOverlays from "../components/LegacyOverlays.vue";
import ServiceWizard from "../components/ServiceWizard.vue";
import AppTopbar from "../components/shell/AppTopbar.vue";
import SidebarNavigation from "../components/shell/SidebarNavigation.vue";
import DocumentsPage from "../modules/documents/DocumentsPage.vue";
import TemplatesPage from "../modules/templates/TemplatesPage.vue";
import WorkActsPage from "../modules/workActs/WorkActsPage.vue";
import { activeModules, moduleGroups } from "../router/routes.js";
import { useShellStore } from "../stores/shellStore.js";

const {
  activePage,
  activeRoleLabel,
  goToPage,
  isDarkTheme,
  languageButtonLabel,
  themeButtonLabel,
  toggleLanguage,
  toggleTheme
} = useShellStore();
</script>

<template>
  <div class="app-shell">
    <AppTopbar
      :active-role-label="activeRoleLabel"
      :is-dark-theme="isDarkTheme"
      :language-button-label="languageButtonLabel"
      :theme-button-label="themeButtonLabel"
      @toggle-language="toggleLanguage"
      @toggle-theme="toggleTheme"
    />

    <div class="app-body">
      <SidebarNavigation
        :active-modules="activeModules"
        :active-page="activePage"
        :module-groups="moduleGroups"
        @navigate="goToPage"
      />

      <DocumentsPage v-if="activePage === 'documents'" />
      <WorkActsPage v-else-if="activePage === 'workacts'" />
      <TemplatesPage v-else-if="activePage === 'templates'" />
      <LegacyPage v-else />
    </div>
  </div>

  <ServiceWizard />
  <LegacyOverlays v-if="['documents', 'templates', 'workacts'].includes(activePage)" />
</template>
