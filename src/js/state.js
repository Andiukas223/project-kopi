import { roles } from "./data.js";

const retiredPages = new Set(["command", "sales", "finance", "parts", "reports"]);

export const state = {
  // Navigation
  page: "service",
  role: "admin",
  theme: "light",
  language: "en",

  // Documents module
  documentSearchQuery: "",
  documentTypeFilter: "All",
  documentCustomerFilter: "All",
  documentDateQuery: "",
  selectedDocumentId: "DOC-3108",
  selectedTemplateId: "tpl-service-act",
  documentOutputFormat: "pdf",
  generationStatus: "Ready",
  generatedDocPreview: null,   // { docId, templateId, format, generatedAt } | null
  templateGenTab: "work-acts", // legacy source-flow hint; Templates landing uses the configurator
  rejectingDocumentId: null,
  documentRejectError: "",
  documentUploadOpen: false,
  documentUploadTargetId: null,
  documentUploadDefaultType: "",
  documentUploadError: "",
  jobCompletionConfirmDocId: null,
  printPreviewOpen: false,
  printPreviewDocumentId: null,
  printPreviewPage: 1,
  printPreviewZoom: 100,
  printPreviewExportOpen: false,
  printPreviewEmailOpen: false,
  printPreviewEmailStatus: "",

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
  adminNewUserOpen: false,
  adminNewUserError: "",
  adminNewUserName: "",
  adminNewUserRole: "service",
  selectedBugReportId: null,
  feedbackOpen: false,
  feedbackSelecting: false,
  feedbackAnnotating: false,
  feedbackCaptureDataUrl: "",
  feedbackScreenshotDataUrl: "",
  feedbackCommentDraft: "",
  feedbackError: "",
  feedbackSavedNotice: "",
  feedbackBackendStatus: "",
  feedbackStatusFilter: "All",
  feedbackAssigneeFilter: "All",

  // Calendar module
  calendarYear: 2026,
  calendarMonth: 3,   // 0-indexed: 3 = April

  // PM submodule
  selectedPmJobId: null,
  pmDateOverrides: {},
  pmRescheduleErrors: {},

  // Service module
  selectedServiceJobId: "VM-SV-1024",
  serviceJobSearchQuery: "",
  serviceJobStatusFilter: "All",
  serviceJobCustomerFilter: "All",
  serviceJobDateQuery: "",
  selectedWorkActId: null,
  templateGenWorkActJobId: "VM-SV-1024",
  workActSearchQuery: "",
  workActStatusFilter: "All",
  selectedDefectActId: null,
  templateGenDefectActJobId: "VM-SV-1024",
  workActError: "",
  workActEditorDocumentId: null,
  defectActError: "",
  selectedCommercialOfferDraftId: null,
  templateGenCommercialOfferQuotationId: "QTE-501",
  commercialOfferError: "",
  commercialOfferSearchQuery: "",
  commercialOfferStatusFilter: "active",
  commercialOfferEntryPersonFilter: "all",

  // Templates CRUD
  selectedWltId: null,
  wltEditMode: false,
  wltError: "",

  // Sales module
  selectedQuotationId: "QTE-501",
  salesTab: "offer",     // offer | approval | handoff
  newQuotationOpen: false,
  newQuotationError: "",

  // Contracts module
  selectedContractId: "CTR-101",
  contractEditMode: false,
  contractEditError: "",

  // Finance module
  selectedInvoiceId: "INV-9001"
};

export function setPage(page) {
  const normalizedPage = page === "templategen" ? "templates" : page;
  state.page = retiredPages.has(normalizedPage) ? "service" : normalizedPage;
}

export function setRole(role) {
  if (roles.some((item) => item.id === role)) {
    state.role = role;
  }
}

export function setTheme(theme) {
  state.theme = theme === "dark" ? "dark" : "light";
}

export function setLanguage(language) {
  state.language = language === "lt" ? "lt" : "en";
}
