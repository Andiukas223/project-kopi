import { state } from "./state.js";

const translations = {
  en: {
    "app.serviceIs": "Service IS",
    "aria.currentUser": "Current user",
    "aria.mainNavigation": "Main navigation",
    "theme.dark": "Dark mode",
    "theme.light": "Light mode",
    "language.switchTo": "Switch language",
    "nav.workspace": "Workspace",
    "nav.command": "Command Center",
    "nav.service": "Service",
    "nav.sales": "Sales",
    "nav.contracts": "Contracts",
    "nav.documents": "Documents",
    "nav.templateGeneration": "Template Generation",
    "nav.finance": "Finance",
    "nav.registry": "Registry",
    "nav.customers": "Customers",
    "nav.equipment": "Equipment",
    "nav.parts": "Parts",
    "nav.control": "Control",
    "nav.calendar": "Calendar",
    "nav.reports": "Reports",
    "nav.admin": "Admin",
    "nav.reminders": "Reminders",
    "role.service": "Service workspace",
    "role.svcmgr": "Service Mgr workspace",
    "role.sales": "Sales workspace",
    "role.finance": "Finance workspace",
    "role.office": "Office Mgr workspace",
    "role.logistics": "Logistics workspace",
    "role.warehouse": "Warehouse workspace",
    "role.manager": "Manager workspace",
    "role.admin": "Admin workspace",
    "role.default": "Workspace"
  },
  lt: {
    "app.serviceIs": "Serviso IS",
    "aria.currentUser": "Aktyvus naudotojas",
    "aria.mainNavigation": "Pagrindine navigacija",
    "theme.dark": "Tamsus rezimas",
    "theme.light": "Sviesus rezimas",
    "language.switchTo": "Keisti kalba",
    "nav.workspace": "Darbo vieta",
    "nav.command": "Valdymo centras",
    "nav.service": "Servisas",
    "nav.sales": "Pardavimai",
    "nav.contracts": "Sutartys",
    "nav.documents": "Dokumentai",
    "nav.templateGeneration": "Sablonai",
    "nav.finance": "Finansai",
    "nav.registry": "Registrai",
    "nav.customers": "Klientai",
    "nav.equipment": "Iranga",
    "nav.parts": "Dalys",
    "nav.control": "Kontrole",
    "nav.calendar": "Kalendorius",
    "nav.reports": "Ataskaitos",
    "nav.admin": "Admin",
    "nav.reminders": "Priminimai",
    "role.service": "Serviso darbo vieta",
    "role.svcmgr": "Serviso vadovo darbo vieta",
    "role.sales": "Pardavimu darbo vieta",
    "role.finance": "Finansu darbo vieta",
    "role.office": "Biuro vadovo darbo vieta",
    "role.logistics": "Logistikos darbo vieta",
    "role.warehouse": "Sandelys",
    "role.manager": "Vadovo darbo vieta",
    "role.admin": "Admin darbo vieta",
    "role.default": "Darbo vieta"
  }
};

export function currentLanguage() {
  return state.language === "lt" ? "lt" : "en";
}

export function t(key) {
  const language = currentLanguage();
  return translations[language][key] || translations.en[key] || key;
}

export function applyStaticTranslations() {
  const language = currentLanguage();
  document.documentElement.lang = language;

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAria));
  });

  const languageToggle = document.querySelector("[data-language-toggle]");
  if (languageToggle) {
    languageToggle.textContent = language === "lt" ? "EN" : "LT";
    languageToggle.setAttribute("aria-label", t("language.switchTo"));
    languageToggle.setAttribute("aria-pressed", String(language === "lt"));
  }
}
