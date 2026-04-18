import { computed, ref } from "vue";
import { isNavigationFailure } from "vue-router";
import { roles } from "../js/data.js";
import { t } from "../js/i18n.js";
import { saveDemoState } from "../js/persistence.js";
import { setLanguage, setPage, setRole, setTheme, state } from "../js/state.js";
import { normalizePageId, routePathForPage } from "../router/routes.js";

export const legacyRenderTick = ref(0);

let shellRouter = null;
let syncingRoute = false;

export function registerShellRouter(router) {
  shellRouter = router;
}

export function initializeShellRouteFromState() {
  if (!shellRouter || window.location.pathname !== "/") return;
  const page = normalizePageId(state.page);
  if (page !== "service") {
    shellRouter.replace(routePathForPage(page));
  }
}

export function rerenderLegacyApp(options = {}) {
  const { syncRoute = true } = options;
  legacyRenderTick.value += 1;
  applyThemeToDocument();
  saveDemoState();
  if (syncRoute) syncRouterToStatePage();
}

export function syncLegacyPageFromRoute(route) {
  const page = normalizePageId(route?.meta?.pageId || route?.name || "service");
  syncingRoute = true;
  setPage(page);
  rerenderLegacyApp({ syncRoute: false });
  syncingRoute = false;
}

function syncRouterToStatePage() {
  if (!shellRouter || syncingRoute) return;
  const page = normalizePageId(state.page);
  const currentRoute = shellRouter.currentRoute.value;
  const currentPage = normalizePageId(currentRoute.meta?.pageId || currentRoute.name || "service");
  if (currentPage === page) return;
  const nextPath = routePathForPage(page);
  if (currentRoute.path === nextPath) return;
  pushShellRoute(nextPath);
}

function pushShellRoute(path) {
  if (!shellRouter || shellRouter.currentRoute.value.path === path) return;
  shellRouter.push(path).catch((error) => {
    if (!isNavigationFailure(error)) console.warn(error);
  });
}

export function useShellStore() {
  const activePage = computed(() => {
    legacyRenderTick.value;
    return normalizePageId(state.page);
  });

  const activeRoleLabel = computed(() => {
    legacyRenderTick.value;
    const role = roles.find((item) => item.id === state.role);
    return t(role ? `role.${role.id}` : "role.default");
  });

  const themeButtonLabel = computed(() => {
    legacyRenderTick.value;
    return state.theme === "dark" ? t("theme.light") : t("theme.dark");
  });

  const isDarkTheme = computed(() => {
    legacyRenderTick.value;
    return state.theme === "dark";
  });

  const languageButtonLabel = computed(() => {
    legacyRenderTick.value;
    return state.language === "lt" ? "EN" : "LT";
  });

  const sidebarCollapsed = computed(() => {
    legacyRenderTick.value;
    return Boolean(state.sidebarCollapsed);
  });

  function goToPage(page) {
    const normalizedPage = normalizePageId(page);
    if (shellRouter) {
      pushShellRoute(routePathForPage(normalizedPage));
    } else {
      setPage(normalizedPage);
      rerenderLegacyApp({ syncRoute: false });
    }
    window.setTimeout(() => document.getElementById("app-main")?.focus(), 0);
  }

  function toggleTheme() {
    setTheme(state.theme === "dark" ? "light" : "dark");
    rerenderLegacyApp();
  }

  function toggleLanguage() {
    setLanguage(state.language === "lt" ? "en" : "lt");
    rerenderLegacyApp();
  }

  function toggleSidebarCollapsed() {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    rerenderLegacyApp();
  }

  function chooseRole(role) {
    setRole(role);
    rerenderLegacyApp();
  }

  return {
    activePage,
    activeRoleLabel,
    chooseRole,
    goToPage,
    isDarkTheme,
    languageButtonLabel,
    sidebarCollapsed,
    themeButtonLabel,
    toggleLanguage,
    toggleSidebarCollapsed,
    toggleTheme
  };
}

export function applyThemeToDocument() {
  document.documentElement.dataset.theme = state.theme === "dark" ? "dark" : "light";
  document.documentElement.lang = state.language === "lt" ? "lt" : "en";
}
