import { qs, qsa } from "./dom.js";
import { roles } from "./data.js";
import { applyStaticTranslations, t } from "./i18n.js";
import { saveDemoState } from "./persistence.js";
import { renderPage } from "./render.js";
import { setLanguage, setPage, setRole, setTheme, state } from "./state.js";

export function renderApp() {
  const main = qs("#app-main");
  setPage(state.page);
  applyTheme();
  main.innerHTML = renderPage();
  updateActiveNav();
  updateRoleLabel();
  applyStaticTranslations();
  saveDemoState();
}

export function bindNavigation() {
  qsa("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      setPage(button.dataset.nav);
      renderApp();
      qs("#app-main").focus();
    });
  });

  document.addEventListener("click", (event) => {
    const themeButton = event.target.closest("[data-theme-toggle]");
    if (themeButton) {
      setTheme(state.theme === "dark" ? "light" : "dark");
      renderApp();
      return;
    }

    const languageButton = event.target.closest("[data-language-toggle]");
    if (languageButton) {
      setLanguage(state.language === "lt" ? "en" : "lt");
      renderApp();
      return;
    }

    const roleButton = event.target.closest("[data-role]");
    if (!roleButton) return;
    setRole(roleButton.dataset.role);
    renderApp();
  });
}

function updateActiveNav() {
  const activePage = state.page === "templategen" ? "templates" : state.page;
  qsa(".sb-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.nav === activePage);
  });
}

function updateRoleLabel() {
  const role = roles.find((item) => item.id === state.role);
  qs("#active-role-label").textContent = t(role ? `role.${role.id}` : "role.default");
}

function applyTheme() {
  const theme = state.theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = theme;

  const toggle = qs("[data-theme-toggle]");
  if (toggle) {
    const dark = theme === "dark";
    toggle.textContent = dark ? `☀️ ${t("theme.light")}` : `🌙 ${t("theme.dark")}`;
    toggle.setAttribute("aria-pressed", String(dark));
    toggle.setAttribute("aria-label", toggle.textContent);
  }
}
