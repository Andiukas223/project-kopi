export const activeModules = [
  { id: "service", path: "/service", labelKey: "nav.service", label: "Service", group: "workspace" },
  { id: "workacts", path: "/work-acts", labelKey: "nav.workActs", label: "Work Acts", group: "workspace" },
  { id: "contracts", path: "/contracts", labelKey: "nav.contracts", label: "Contracts", group: "workspace" },
  { id: "documents", path: "/documents", labelKey: "nav.documents", label: "Documents", group: "workspace" },
  { id: "templates", path: "/templates", labelKey: "nav.templates", label: "Templates", group: "workspace" },
  { id: "customers", path: "/customers", labelKey: "nav.customers", label: "Customers", group: "registry" },
  { id: "equipment", path: "/equipment", labelKey: "nav.equipment", label: "Equipment", group: "registry" },
  { id: "calendar", path: "/calendar", labelKey: "nav.calendar", label: "Calendar", group: "control" },
  { id: "admin", path: "/admin", labelKey: "nav.admin", label: "Admin", group: "control" }
];

export const moduleGroups = [
  { id: "workspace", labelKey: "", label: "" },
  { id: "registry", labelKey: "nav.registry", label: "Registry" },
  { id: "control", labelKey: "nav.control", label: "Control" }
];

const moduleById = new Map(activeModules.map((module) => [module.id, module]));
const legacyPageAliases = new Map([
  ["templategen", "templates"],
  ["work-acts", "workacts"]
]);

export function normalizePageId(page) {
  const normalized = legacyPageAliases.get(page) || page;
  return moduleById.has(normalized) ? normalized : "service";
}

export function routePathForPage(page) {
  return moduleById.get(normalizePageId(page))?.path || "/service";
}
