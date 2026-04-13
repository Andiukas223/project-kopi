import { roles } from "./data.js";

export const state = {
  // Navigation
  page: "command",
  role: "admin",

  // Documents module
  documentFilter: "All",
  documentSearchQuery: "",
  documentTypeFilter: "All",
  documentStatusFilter: "All",
  documentCustomerFilter: "All",
  documentDateFrom: "",
  documentDateTo: "",
  selectedDocumentId: "DOC-3108",
  selectedTemplateId: "tpl-service-act",
  documentOutputFormat: "pdf",
  generationStatus: "Ready",
  generatedDocPreview: null,   // { docId, templateId, format, generatedAt } | null
  templateEditorOpen: false,
  templateEditorError: "",
  templateEditorSavedAt: "",
  templateGenTab: "work-acts", // work-acts | defect-acts | commercial-offers | work-list-templates | output-templates
  rejectingDocumentId: null,
  documentRejectError: "",
  documentUploadOpen: false,
  documentUploadError: "",

  // Equipment module
  selectedEquipmentId: "EQ-501",
  equipmentTab: "system-info",     // system-info | installation | hospital-acceptance | support
  supportSubTab: "settings",       // settings | emails | web-links

  // Customers module
  selectedCustomerId: "CUST-01",

  // Parts module
  selectedPartsRequestId: "PR-201",
  selectedVendorReturnId: null,
  deliveryEditRequestId: null,
  deliveryEditError: "",

  // Admin module
  adminEditUserId: "u1",

  // Calendar module
  calendarYear: 2026,
  calendarMonth: 3,   // 0-indexed: 3 = April

  // PM submodule
  selectedPmJobId: null,
  pmDateOverrides: {},
  pmRescheduleErrors: {},

  // Service module
  selectedServiceJobId: "VM-SV-1024",
  selectedWorkActId: null,
  templateGenWorkActJobId: "VM-SV-1024",
  selectedDefectActId: null,
  templateGenDefectActJobId: "VM-SV-1024",
  workActError: "",
  defectActError: "",

  // Sales module
  selectedQuotationId: "QTE-501",
  salesTab: "offer",     // offer | contract | approval | handoff
  newQuotationOpen: false,
  newQuotationError: "",
  selectedContractId: "CTR-101",
  contractEditMode: false,
  contractEditError: "",

  // Finance module
  selectedInvoiceId: "INV-9001"
};

export function setPage(page) {
  state.page = page;
}

export function setRole(role) {
  if (roles.some((item) => item.id === role)) {
    state.role = role;
  }
}
