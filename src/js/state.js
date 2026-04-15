import { roles } from "./data.js";

export const state = {
  // Navigation
  page: "command",
  role: "admin",
  theme: "light",

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
  templateFileStatus: "",
  templateFileError: "",
  templateGenTab: "work-acts", // work-acts | defect-acts | commercial-offers | work-list-templates | output-templates
  rejectingDocumentId: null,
  documentRejectError: "",
  documentUploadOpen: false,
  documentUploadTargetId: null,
  documentUploadError: "",
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
  selectedWorkActId: null,
  templateGenWorkActJobId: "VM-SV-1024",
  workActSearchQuery: "",
  workActStatusFilter: "All",
  selectedDefectActId: null,
  templateGenDefectActJobId: "VM-SV-1024",
  workActError: "",
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
  wltNewOpen: false,
  wltError: "",
  wltNewError: "",
  wltSearchQuery: "",
  wltStatusFilter: "all",
  wltEntryPersonFilter: "all",

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

export function setTheme(theme) {
  state.theme = theme === "dark" ? "dark" : "light";
}
