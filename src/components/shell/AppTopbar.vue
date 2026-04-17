<script setup>
import { t } from "../../js/i18n.js";

defineProps({
  activeRoleLabel: {
    type: String,
    required: true
  },
  isDarkTheme: {
    type: Boolean,
    required: true
  },
  languageButtonLabel: {
    type: String,
    required: true
  },
  themeButtonLabel: {
    type: String,
    required: true
  }
});

defineEmits(["toggle-language", "toggle-theme"]);
</script>

<template>
  <header class="topbar">
    <div class="wordmark" aria-label="Viva Medical">
      <span class="wordmark-main">Viva Medical</span>
      <span class="wordmark-divider" aria-hidden="true"></span>
      <span class="wordmark-sub">{{ t("app.serviceIs") }}</span>
    </div>
    <div class="user-pill" :aria-label="t('aria.currentUser')">
      <span class="avatar">VM</span>
      <span id="active-role-label">{{ activeRoleLabel }}</span>
    </div>
    <button
      class="language-toggle"
      type="button"
      data-language-toggle
      :aria-label="t('language.switchTo')"
      @click="$emit('toggle-language')"
    >
      {{ languageButtonLabel }}
    </button>
    <button
      class="theme-toggle"
      type="button"
      data-theme-toggle
      :aria-label="themeButtonLabel"
      :aria-pressed="String(isDarkTheme)"
      @click="$emit('toggle-theme')"
    >
      {{ themeButtonLabel }}
    </button>
  </header>
</template>
