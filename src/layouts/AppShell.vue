<script setup>
import LegacyPage from "../components/LegacyPage.vue";
import LegacyOverlays from "../components/LegacyOverlays.vue";
import ServiceWizard from "../components/ServiceWizard.vue";
import AppTopbar from "../components/shell/AppTopbar.vue";
import SidebarNavigation from "../components/shell/SidebarNavigation.vue";
import DocumentsPage from "../modules/documents/DocumentsPage.vue";
import EquipmentPage from "../modules/equipment/EquipmentPage.vue";
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
  sidebarCollapsed,
  themeButtonLabel,
  toggleLanguage,
  toggleSidebarCollapsed,
  toggleTheme
} = useShellStore();
</script>

<template>
  <div class="app-shell" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
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
        :is-collapsed="sidebarCollapsed"
        :module-groups="moduleGroups"
        @navigate="goToPage"
        @toggle-collapse="toggleSidebarCollapsed"
      />

      <DocumentsPage v-if="activePage === 'documents'" />
      <WorkActsPage v-else-if="activePage === 'workacts'" />
      <TemplatesPage v-else-if="activePage === 'templates'" />
      <EquipmentPage v-else-if="activePage === 'equipment'" />
      <LegacyPage v-else />
    </div>
  </div>

  <ServiceWizard />
  <LegacyOverlays v-if="['documents', 'templates', 'workacts'].includes(activePage)" />
</template>
