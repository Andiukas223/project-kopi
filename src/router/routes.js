export const activeModules = [
  { id: "service", path: "/service", labelKey: "nav.service", label: "Service", group: "workspace", icon: "service" },
  { id: "workacts", path: "/work-acts", labelKey: "nav.workActs", label: "Work Acts", group: "workspace", icon: "workacts" },
  { id: "contracts", path: "/contracts", labelKey: "nav.contracts", label: "Contracts", group: "workspace", icon: "contracts" },
  { id: "documents", path: "/documents", labelKey: "nav.documents", label: "Documents", group: "workspace", icon: "documents" },
  { id: "templates", path: "/templates", labelKey: "nav.templates", label: "Templates", group: "workspace", icon: "templates" },
  { id: "customers", path: "/customers", labelKey: "nav.customers", label: "Customers", group: "registry", icon: "customers" },
  { id: "equipment", path: "/equipment", labelKey: "nav.equipment", label: "Equipment", group: "registry", icon: "equipment" },
  { id: "calendar", path: "/calendar", labelKey: "nav.calendar", label: "Calendar", group: "control", icon: "calendar" },
  { id: "admin", path: "/admin", labelKey: "nav.admin", label: "Admin", group: "control", icon: "admin" }
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
