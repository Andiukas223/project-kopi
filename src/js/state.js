import { roles } from "./data.js";

export const state = {
  // Navigation
  page: "command",
  role: "admin",

  // Documents module
  documentFilter: "All",
  selectedDocumentId: "DOC-3108",
  selectedTemplateId: "tpl-service-act",
  documentOutputFormat: "pdf",
  generationStatus: "Ready",

  // Equipment module
  selectedEquipmentId: "EQ-501",
  equipmentTab: "system-info",     // system-info | installation | hospital-acceptance | support
  supportSubTab: "settings",       // settings | emails | web-links

  // Customers module
  selectedCustomerId: "CUST-01",

  // Parts module
  selectedPartsRequestId: "PR-201",

  // Admin module
  adminEditUserId: "u1",

  // Calendar module
  calendarYear: 2026,
  calendarMonth: 3,   // 0-indexed: 3 = April

  // PM submodule
  selectedPmJobId: null,

  // Sales module
  selectedQuotationId: "QTE-501",
  salesTab: "offer"     // offer | contract | approval | handoff
};

export function setPage(page) {
  state.page = page;
}

export function setRole(role) {
  if (roles.some((item) => item.id === role)) {
    state.role = role;
  }
}
