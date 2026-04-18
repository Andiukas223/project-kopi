import { createRouter, createWebHistory } from "vue-router";
import AppShell from "../layouts/AppShell.vue";
import { state } from "../js/state.js";
import { activeModules, routePathForPage } from "./routes.js";
import { syncLegacyPageFromRoute } from "../stores/shellStore.js";

const routes = [
  { path: "/", redirect: () => routePathForPage(state.page) },
  { path: "/templategen", redirect: "/templates" },
  { path: "/workacts", redirect: "/work-acts" },
  ...activeModules.map((module) => ({
    path: module.path,
    name: module.id,
    component: AppShell,
    meta: {
      pageId: module.id,
      title: module.label
    }
  })),
  {
    path: "/templates/:templateId",
    name: "template-detail",
    component: AppShell,
    meta: {
      pageId: "templates",
      title: "Template"
    }
  },
  { path: "/:pathMatch(.*)*", redirect: "/service" }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.afterEach((to) => {
  syncLegacyPageFromRoute(to);
});

export default router;
