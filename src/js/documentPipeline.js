import { calendarEvents, commercialOfferDrafts, companyProfiles, contracts, customers, defectActs, documentTemplateBlueprints, documents, equipment, invoices, jobs, partsRequests, quotations, templates, workActs } from "./data.js";
import { saveDemoState } from "./persistence.js";
import { state } from "./state.js";

const statusByStage = {
  Draft: "Draft",
  Review: "Review",
  Customer: "Customer",
  Signature: "Signature",
  Approved: "Approved",
  Rejected: "Rejected"
};

let renderAppCallback = null;

export function bindDocumentPipeline(renderApp) {
  renderAppCallback = renderApp;

  document.addEventListener("click", (event) => {
    const docViewButton = event.target.closest("[data-doc-view]");
    if (docViewButton) {
      openDocumentPrintPreview(docViewButton.dataset.docView);
      return;
    }

    const docEditButton = event.target.closest("[data-doc-edit]");
    if (docEditButton) {
      routeDocumentEdit(docEditButton.dataset.docEdit);
      return;
    }

    const selectButton = event.target.closest("[data-doc-select]");
    if (selectButton) {
      selectDocument(selectButton.dataset.docSelect);
      return;
    }

    const row = event.target.closest("[data-doc-row]");
    if (row && !event.target.closest("button")) {
      selectDocument(row.dataset.docRow);
      return;
    }

    const backToDraftButton = event.target.closest("[data-doc-back-draft]");
    if (backToDraftButton) {
      returnRejectedDocumentToDraft(backToDraftButton.dataset.docBackDraft);
      return;
    }

    const signedUploadOpenButton = event.target.closest("[data-doc-upload-signed-open]");
    if (signedUploadOpenButton) {
      openSignedDocumentUpload(signedUploadOpenButton.dataset.docUploadSignedOpen);
      return;
    }

    const finishButton = event.target.closest("[data-doc-finish]");
    if (finishButton) {
      finishDocument(finishButton.dataset.docFinish);
      return;
    }

    const invoiceButton = event.target.closest("[data-doc-generate-invoice]");
    if (invoiceButton) {
      generateInvoiceFromDocument(invoiceButton.dataset.docGenerateInvoice);
      return;
    }

    const reviewNextButton = event.target.closest("[data-doc-review-next]");
    if (reviewNextButton) {
      reviewNextDocument();
      return;
    }

    const uploadOpenButton = event.target.closest("[data-doc-upload-open]");
    if (uploadOpenButton) {
      state.documentUploadOpen = true;
      state.documentUploadTargetId = null;
      state.documentUploadError = "";
      renderAppCallback();
      return;
    }

    const uploadCancelButton = event.target.closest("[data-doc-upload-cancel]");
    if (uploadCancelButton) {
      state.documentUploadOpen = false;
      state.documentUploadTargetId = null;
      state.documentUploadError = "";
      renderAppCallback();
      return;
    }

    const uploadSubmitButton = event.target.closest("[data-doc-upload-submit]");
    if (uploadSubmitButton) {
      void uploadDocument();
      return;
    }

    const searchApplyButton = event.target.closest("[data-doc-search-apply]");
    if (searchApplyButton) {
      applyDocumentSearch();
      return;
    }

    const searchClearButton = event.target.closest("[data-doc-search-clear]");
    if (searchClearButton) {
      clearDocumentSearch();
      return;
    }

    const rejectStartButton = event.target.closest("[data-doc-reject-start]");
    if (rejectStartButton) {
      startRejectDocument(rejectStartButton.dataset.docRejectStart);
      return;
    }

    const rejectCancelButton = event.target.closest("[data-doc-reject-cancel]");
    if (rejectCancelButton) {
      state.rejectingDocumentId = null;
      state.documentRejectError = "";
      renderAppCallback();
      return;
    }

    const rejectConfirmButton = event.target.closest("[data-doc-reject-confirm]");
    if (rejectConfirmButton) {
      rejectDocument(rejectConfirmButton.dataset.docRejectConfirm);
      return;
    }

    const templateButton = event.target.closest("[data-template-pick]");
    if (templateButton) {
      state.selectedTemplateId = templateButton.dataset.templatePick;
      state.generationStatus = "Ready";
      state.generatedDocPreview = null;
      state.templateEditorError = "";
      state.templateFileStatus = "";
      state.templateFileError = "";
      renderAppCallback();
      return;
    }

    const templateEditButton = event.target.closest("[data-template-editor-open]");
    if (templateEditButton) {
      state.templateEditorOpen = true;
      state.templateEditorError = "";
      renderAppCallback();
      return;
    }

    const templateEditCancelButton = event.target.closest("[data-template-editor-cancel]");
    if (templateEditCancelButton) {
      state.templateEditorOpen = false;
      state.templateEditorError = "";
      renderAppCallback();
      return;
    }

    const templateSaveButton = event.target.closest("[data-template-editor-save]");
    if (templateSaveButton) {
      saveTemplateEdits();
      return;
    }

    const templateResetButton = event.target.closest("[data-template-editor-reset]");
    if (templateResetButton) {
      resetTemplateBody();
      return;
    }

    const templateFodtExportButton = event.target.closest("[data-template-fodt-export]");
    if (templateFodtExportButton) {
      exportTemplateSectionsAsFodt(templateFodtExportButton.dataset.templateFodtExport);
      return;
    }

    const generateButton = event.target.closest("[data-generate-document]");
    if (generateButton) {
      generateMockDocument(generateButton.dataset.generateDocument);
      return;
    }

    const serviceGenerateButton = event.target.closest("[data-generate-service-document]");
    if (serviceGenerateButton) {
      generateServiceDocument(serviceGenerateButton.dataset.generateServiceDocument);
      return;
    }

    const previewOpenButton = event.target.closest("[data-doc-preview-open]");
    if (previewOpenButton) {
      openDocumentPrintPreview(previewOpenButton.dataset.docPreviewOpen);
      return;
    }

    const previewCloseButton = event.target.closest("[data-doc-preview-close]");
    if (previewCloseButton) {
      closeDocumentPrintPreview();
      return;
    }

    const previewPageButton = event.target.closest("[data-doc-preview-page]");
    if (previewPageButton) {
      moveDocumentPrintPreviewPage(previewPageButton.dataset.docPreviewPage);
      return;
    }

    const previewZoomButton = event.target.closest("[data-doc-preview-zoom]");
    if (previewZoomButton) {
      zoomDocumentPrintPreview(previewZoomButton.dataset.docPreviewZoom);
      return;
    }

    const previewExportButton = event.target.closest("[data-doc-preview-export]");
    if (previewExportButton) {
      state.printPreviewExportOpen = !state.printPreviewExportOpen;
      state.printPreviewEmailOpen = false;
      renderAppCallback();
      return;
    }

    const previewEmailButton = event.target.closest("[data-doc-preview-email]");
    if (previewEmailButton) {
      state.printPreviewEmailOpen = !state.printPreviewEmailOpen;
      state.printPreviewExportOpen = false;
      state.printPreviewEmailStatus = "";
      renderAppCallback();
      return;
    }

    const previewDeliveryButton = event.target.closest("[data-doc-delivery-action]");
    if (previewDeliveryButton) {
      handleDocumentDeliveryAction(previewDeliveryButton.dataset.docDeliveryAction);
      return;
    }

    const previewEmailSendButton = event.target.closest("[data-doc-preview-email-send]");
    if (previewEmailSendButton) {
      queueDocumentEmail(previewEmailSendButton.dataset.docPreviewEmailSend);
      return;
    }

    const resetPreview = event.target.closest("[data-reset-preview]");
    if (resetPreview) {
      state.generatedDocPreview = null;
      state.generationStatus = "Ready";
      renderAppCallback();
      return;
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-doc-filter]")) {
      state.documentFilter = event.target.value;
      renderAppCallback();
      return;
    }

    if (event.target.matches("[data-template-select]")) {
      state.selectedTemplateId = event.target.value;
      state.generationStatus = "Ready";
      state.generatedDocPreview = null;
      state.templateEditorError = "";
      state.templateFileStatus = "";
      state.templateFileError = "";
      renderAppCallback();
      return;
    }

    if (event.target.matches("[data-output-format]")) {
      state.documentOutputFormat = event.target.value;
      state.generationStatus = "Ready";
      state.generatedDocPreview = null;
      renderAppCallback();
      return;
    }

    if (event.target.matches("[data-template-fodt-upload]")) {
      uploadFodtTemplate(event.target.dataset.templateFodtUpload, event.target.files?.[0]);
      event.target.value = "";
      return;
    }
  });
}

function selectDocument(id) {
  if (!documents.some((doc) => doc.id === id)) return;
  state.selectedDocumentId = id;
  state.generationStatus = "Ready";
  state.generatedDocPreview = null;
  state.rejectingDocumentId = null;
  state.documentRejectError = "";
  renderAppCallback();
}

function routeDocumentEdit(id) {
  const doc = documents.find((item) => item.id === id);
  if (!doc) return;

  state.selectedDocumentId = doc.id;
  state.generationStatus = "Ready";
  state.generatedDocPreview = null;
  state.rejectingDocumentId = null;
  state.documentRejectError = "";
  state.printPreviewOpen = false;

  const type = String(doc.type || "").toLowerCase();

  if (type.includes("defect")) {
    routeToDefectAct(doc);
  } else if (type.includes("quotation") || type.includes("commercial offer")) {
    routeToCommercialOffer(doc);
  } else if (type.includes("invoice")) {
    routeToInvoice(doc);
  } else if (type.includes("parts") || type.includes("vendor return")) {
    routeToParts(doc);
  } else if (type.includes("acceptance")) {
    routeToServiceJob(doc);
  } else {
    routeToWorkAct(doc);
  }

  renderAppCallback();
}

function routeToWorkAct(doc) {
  const act = workActs.find((item) =>
    item.id === doc.workActId ||
    item.generatedDocumentId === doc.id ||
    item.jobId === doc.jobId
  );
  state.page = "templategen";
  state.templateGenTab = "work-acts";
  state.selectedTemplateId = "tpl-service-act";
  state.selectedWorkActId = act?.id || null;
  state.templateGenWorkActJobId = act?.jobId || doc.jobId || state.templateGenWorkActJobId;
  state.selectedServiceJobId = doc.jobId || state.selectedServiceJobId;
}

function routeToDefectAct(doc) {
  const act = defectActs.find((item) =>
    item.id === doc.defectActId ||
    item.generatedDocumentId === doc.id ||
    item.jobId === doc.jobId
  );
  state.page = "templategen";
  state.templateGenTab = "defect-acts";
  state.selectedTemplateId = "tpl-defect-act";
  state.selectedDefectActId = act?.id || null;
  state.templateGenDefectActJobId = act?.jobId || doc.jobId || state.templateGenDefectActJobId;
  state.selectedServiceJobId = doc.jobId || state.selectedServiceJobId;
}

function routeToCommercialOffer(doc) {
  const draft = commercialOfferDrafts.find((item) =>
    item.id === doc.commercialOfferDraftId ||
    item.generatedDocumentId === doc.id ||
    item.quotationId === doc.jobId
  );
  const quotation = quotations.find((item) =>
    item.id === doc.jobId ||
    item.id === draft?.quotationId ||
    item.customer === doc.customer
  );
  state.page = "templategen";
  state.templateGenTab = "commercial-offers";
  state.selectedTemplateId = "tpl-quotation";
  state.selectedCommercialOfferDraftId = draft?.id || null;
  state.templateGenCommercialOfferQuotationId = draft?.quotationId || quotation?.id || state.templateGenCommercialOfferQuotationId;
  if (quotation?.id) state.selectedQuotationId = quotation.id;
}

function routeToInvoice(doc) {
  const invoice = invoices.find((item) => item.documentId === doc.id || item.jobId === doc.jobId || item.customer === doc.customer);
  state.page = "finance";
  if (invoice?.id) state.selectedInvoiceId = invoice.id;
}

function routeToParts(doc) {
  const partRequest = partsRequests.find((item) => item.id === doc.partsRequestId || item.jobId === doc.jobId || item.description === doc.description);
  state.page = "parts";
  if (partRequest?.id) state.selectedPartsRequestId = partRequest.id;
}

function routeToServiceJob(doc) {
  state.page = "service";
  if (doc.jobId) state.selectedServiceJobId = doc.jobId;
}

function returnRejectedDocumentToDraft(id) {
  const doc = documents.find((item) => item.id === id);
  if (!doc || doc.pipelineStep !== "Rejected") return;

  doc.pipelineStep = "Draft";
  doc.status = statusByStage.Draft;
  doc.rejectionResolvedAt = new Date().toISOString();
  state.selectedDocumentId = doc.id;
  state.generationStatus = "Ready";
  state.generatedDocPreview = null;
  state.rejectingDocumentId = null;
  state.documentRejectError = "";
  renderAppCallback();
}

function reviewNextDocument() {
  const nextDoc = documents.find((doc) => !["Approved", "Archived"].includes(doc.pipelineStep)) || documents[0];
  if (!nextDoc) return;
  state.selectedDocumentId = nextDoc.id;
  state.documentFilter = "All";
  state.generationStatus = "Ready";
  state.generatedDocPreview = null;
  state.rejectingDocumentId = null;
  state.documentRejectError = "";
  renderAppCallback();
}

function openSignedDocumentUpload(id) {
  const doc = documents.find((item) => item.id === id);
  if (!doc) return;

  state.selectedDocumentId = doc.id;
  state.documentUploadOpen = true;
  state.documentUploadTargetId = doc.id;
  state.documentUploadError = "";
  renderAppCallback();
}

async function uploadDocument() {
  if (state.documentUploadTargetId) {
    await uploadSignedDocument(state.documentUploadTargetId);
    return;
  }

  const type = getUploadValue("doc-upload-type");
  const jobId = getUploadValue("doc-upload-job");
  const customerInput = getUploadValue("doc-upload-customer");
  const signedBy = getUploadValue("doc-upload-signed-by");
  const description = getUploadValue("doc-upload-description");
  const due = getUploadValue("doc-upload-due") || dateAfterDays(7);
  const file = document.getElementById("doc-upload-file")?.files?.[0] || null;
  const job = jobs.find((item) => item.id === jobId);
  const customer = customerInput || job?.customer || "";

  if (!type || !jobId || !customer || !file) {
    state.documentUploadError = "Document type, job reference, customer, and file are required.";
    state.documentUploadOpen = true;
    renderAppCallback();
    return;
  }

  const docId = `DOC-${3108 + documents.length}`;
  let uploadedFile;
  try {
    const contentBase64 = await readFileAsBase64(file);
    uploadedFile = await uploadDocumentFile({
      docId,
      type,
      jobId,
      customer,
      file,
      contentBase64,
      kind: "uploaded-document"
    });
  } catch (error) {
    state.documentUploadError = error.message || "Document file upload failed.";
    state.documentUploadOpen = true;
    renderAppCallback();
    return;
  }

  const doc = {
    id: docId,
    type,
    jobId,
    customer,
    owner: ownerForDocumentType(type),
    status: "Draft",
    due,
    pipelineStep: "Draft",
    uploaded: true,
    uploadedAt: new Date().toISOString(),
    uploadedFile,
    signedBy: signedBy || "Not recorded",
    description: description || "Uploaded external document"
  };

  syncWarrantyFromAcceptanceUpload(doc, job);
  documents.unshift(doc);

  state.selectedDocumentId = docId;
  state.documentFilter = "All";
  state.documentUploadOpen = false;
  state.documentUploadTargetId = null;
  state.documentUploadError = "";
  state.generationStatus = "Ready";
  state.generatedDocPreview = null;
  saveDemoState();
  renderAppCallback();
}

async function uploadSignedDocument(docId) {
  const doc = documents.find((item) => item.id === docId);
  if (!doc) return;

  const file = document.getElementById("doc-upload-file")?.files?.[0] || null;
  const signedBy = getUploadValue("doc-upload-signed-by") || "Customer representative";
  const description = getUploadValue("doc-upload-description") || "Signed document uploaded back to the original record.";

  if (!file) {
    state.documentUploadError = "Signed PDF or image file is required.";
    state.documentUploadOpen = true;
    renderAppCallback();
    return;
  }

  try {
    const contentBase64 = await readFileAsBase64(file);
    const uploadedFile = await uploadDocumentFile({
      docId: doc.id,
      type: doc.type,
      jobId: doc.jobId,
      customer: doc.customer,
      file,
      contentBase64,
      kind: "signed-document"
    });
    const uploadedAt = new Date().toISOString();
    doc.signedFile = uploadedFile;
    doc.signedUploadedAt = uploadedAt;
    doc.signedBy = signedBy;
    doc.uploaded = true;
    doc.uploadedAt = uploadedAt;
    doc.uploadedFile = uploadedFile;
    doc.description = description;
    doc.pipelineStep = "Signature";
    doc.status = "Signature";
    doc.deliveryStatus = "Signed copy uploaded";
    addDocumentDeliveryAudit(doc, "Signed upload", `${signedBy}; ${documentFileAuditNote(uploadedFile, file.name)}`, uploadedFile);
    syncWarrantyFromAcceptanceUpload(doc, jobs.find((item) => item.id === doc.jobId));

    state.selectedDocumentId = doc.id;
    state.documentUploadOpen = false;
    state.documentUploadTargetId = null;
    state.documentUploadError = "";
    state.generationStatus = "Signed copy uploaded. Finish the document to close the case/ticket.";
    state.generatedDocPreview = null;
    saveDemoState();
    renderAppCallback();
  } catch (error) {
    state.documentUploadError = error.message || "Signed document upload failed.";
    state.documentUploadOpen = true;
    renderAppCallback();
  }
}

async function uploadDocumentFile({ docId, type, jobId, customer, file, contentBase64, kind = "uploaded-document" }) {
  const response = await fetch("/api/documents/files/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-VM-Role": state.role
    },
    body: JSON.stringify({
      kind,
      ownerType: "document",
      ownerId: docId,
      fileName: file.name,
      mimeType: file.type || "",
      contentBase64,
      meta: {
        documentType: type,
        jobId,
        customer,
        signedCopy: kind === "signed-document"
      }
    })
  });
  const result = await readJsonResponse(response, "File upload failed");
  if (!response.ok || !result.ok) {
    throw new Error(result.error || "File upload failed.");
  }
  return result.fileRecord;
}

async function readJsonResponse(response, fallbackMessage) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    const compactText = text.replace(/\s+/g, " ").trim().slice(0, 180);
    const status = [response.status, response.statusText].filter(Boolean).join(" ");
    throw new Error(`${fallbackMessage}. Server returned ${status || "a non-JSON response"}${compactText ? `: ${compactText}` : "."}`);
  }
}

function finishDocument(id) {
  const doc = documents.find((item) => item.id === id);
  if (!doc) return;

  if (!doc.signedUploadedAt && !doc.signedFile) {
    state.selectedDocumentId = doc.id;
    state.documentUploadOpen = true;
    state.documentUploadTargetId = doc.id;
    state.documentUploadError = "Upload the signed copy before finishing this document.";
    renderAppCallback();
    return;
  }

  const finishedAt = new Date().toISOString();
  doc.pipelineStep = "Approved";
  doc.status = "Done";
  doc.finishedAt = finishedAt;
  doc.caseClosed = true;
  doc.deliveryStatus = "Case/ticket closed";
  addDocumentDeliveryAudit(doc, "Finished", "Signed document accepted. Case/ticket closed.", doc.signedFile || doc.uploadedFile || doc.generatedFile);

  const job = jobs.find((item) => item.id === doc.jobId);
  if (job) {
    job.status = "Closed";
    job.stage = "Finished";
    job.documentStatus = "Approved";
    job.closedAt = finishedAt;
    job.closedByDocumentId = doc.id;
  }

  state.selectedDocumentId = doc.id;
  state.documentUploadOpen = false;
  state.documentUploadTargetId = null;
  state.documentUploadError = "";
  state.generationStatus = "DONE. Signed document uploaded and case/ticket closed.";
  saveDemoState();
  renderAppCallback();
}

function generateInvoiceFromDocument(id) {
  const doc = documents.find((item) => item.id === id);
  if (!doc) return;

  let invoice = invoices.find((item) => item.documentId === doc.id || item.jobId === doc.jobId || item.customer === doc.customer);
  if (!invoice) {
    invoice = {
      id: `INV-${9001 + invoices.length}`,
      jobId: doc.jobId,
      documentId: doc.id,
      customer: doc.customer,
      owner: "V. Klimaite",
      amount: 0,
      currency: "EUR",
      invoiceNo: null,
      status: "Draft",
      paymentStatus: "Pending",
      due: dateAfterDays(14),
      generatedAt: null,
      notes: `Generated from ${doc.id}.`
    };
    invoices.unshift(invoice);
  }

  invoice.documentId = invoice.documentId || doc.id;
  invoice.status = "Generated";
  invoice.invoiceNo = invoice.invoiceNo || `VM-${new Date().getFullYear()}-${String(invoices.indexOf(invoice) + 1).padStart(4, "0")}`;
  invoice.generatedAt = new Date().toISOString().slice(0, 10);
  doc.invoiceId = invoice.id;
  addDocumentDeliveryAudit(doc, "Invoice generated", invoice.invoiceNo);
  state.selectedInvoiceId = invoice.id;
  state.generationStatus = `Invoice ${invoice.invoiceNo} generated from ${doc.id}.`;
  saveDemoState();
  renderAppCallback();
}

function getUploadValue(id) {
  return document.getElementById(id)?.value.trim() || "";
}

function syncWarrantyFromAcceptanceUpload(doc, job) {
  if (doc.type !== "Acceptance report" || !job) return;

  const eq = equipment.find((item) =>
    item.id === job.equipmentId ||
    item.name === job.equipment ||
    item.serial === job.serial
  );
  if (!eq) return;

  const uploadDate = doc.uploadedAt.slice(0, 10);
  const warrantyExpiry = addMonths(uploadDate, 24, -1);
  const eventId = `EV-WARRANTY-${eq.id}`;
  const event = {
    id: eventId,
    date: warrantyExpiry,
    title: `Warranty expiry — ${eq.customer}`,
    type: "contract",
    userId: "u5",
    equipmentId: eq.id,
    documentId: doc.id
  };
  const existing = calendarEvents.find((item) => item.id === eventId);

  eq.acceptanceDate = uploadDate;
  eq.warrantyEndHospital = warrantyExpiry;
  eq.acceptanceInvoice = doc.id;
  eq.status = "Active";

  if (existing) {
    Object.assign(existing, event);
  } else {
    calendarEvents.push(event);
  }

  doc.warrantySynced = true;
  doc.warrantyEquipmentId = eq.id;
  doc.warrantyExpiryDate = warrantyExpiry;
  doc.calendarEventId = eventId;
}

function addMonths(dateValue, months, dayOffset = 0) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setMonth(date.getMonth() + months);
  date.setDate(date.getDate() + dayOffset);
  return formatLocalDate(date);
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function applyDocumentSearch() {
  state.documentSearchQuery = getControlValue("doc-search-query");
  state.documentTypeFilter = getControlValue("doc-type-filter") || "All";
  state.documentStatusFilter = getControlValue("doc-status-filter") || "All";
  state.documentCustomerFilter = getControlValue("doc-customer-filter") || "All";
  state.documentDateFrom = getControlValue("doc-date-from");
  state.documentDateTo = getControlValue("doc-date-to");
  renderAppCallback();
}

function clearDocumentSearch() {
  state.documentSearchQuery = "";
  state.documentTypeFilter = "All";
  state.documentStatusFilter = "All";
  state.documentCustomerFilter = "All";
  state.documentDateFrom = "";
  state.documentDateTo = "";
  renderAppCallback();
}

function getControlValue(id) {
  return document.getElementById(id)?.value.trim() || "";
}

function dateAfterDays(days) {
  return new Date(Date.now() + days * 864e5).toISOString().slice(0, 10);
}

function ownerForDocumentType(type) {
  if (["Quotation", "Contract annex"].includes(type)) return "Sales";
  if (type === "Invoice") return "Finance";
  if (["Acceptance report", "Warranty confirmation"].includes(type)) return "Admin";
  return "Service";
}

function generateMockDocument(id) {
  const doc = documents.find((item) => item.id === id);
  const template = templates.find((item) => item.id === state.selectedTemplateId);
  if (!doc || !template) return;

  state.selectedDocumentId = doc.id;
  state.generationStatus = `${state.documentOutputFormat.toUpperCase()} mock ready`;
  state.generatedDocPreview = {
    docId:       doc.id,
    templateId:  template.id,
    format:      state.documentOutputFormat,
    generatedAt: new Date().toISOString()
  };
  doc.generatedFile = {
    fileName: `${doc.id}-mock.${state.documentOutputFormat}`,
    format: state.documentOutputFormat,
    generatedAt: state.generatedDocPreview.generatedAt,
    templateId: template.id,
    source: "mock"
  };
  doc.pipelineStep = "Signature";
  doc.status = "Signature";
  doc.deliveryStatus = "Needs signed upload";
  addDocumentDeliveryAudit(doc, "Mock generated", `${state.documentOutputFormat.toUpperCase()} mock preview generated`);
  saveDemoState();
  renderAppCallback();
}

function saveTemplateEdits() {
  const template = templates.find((item) => item.id === state.selectedTemplateId);
  if (!template) return;

  const blueprint = documentTemplateBlueprints[template.id];
  const name = getControlValue("tpl-editor-name");
  const owner = getControlValue("tpl-editor-owner");
  const format = getControlValue("tpl-editor-format");
  const sections = blueprint ? readTemplateSections(blueprint) : [];
  const body = blueprint ? composeTemplateBody(sections) : getControlValue("tpl-editor-body");

  if (!name || !owner || !format || !body || (blueprint && sections.some((section) => !section.value))) {
    state.templateEditorError = blueprint
      ? "Template name, owner, output format, and all section text are required."
      : "Template name, owner, output format, and body are required.";
    state.templateEditorOpen = true;
    renderAppCallback();
    return;
  }

  template.name = name;
  template.owner = owner;
  template.format = format;
  template.body = body;
  if (blueprint) template.sections = sections;
  template.updatedAt = new Date().toISOString();

  state.templateEditorError = "";
  state.templateEditorSavedAt = template.updatedAt;
  state.generatedDocPreview = null;
  state.generationStatus = "Ready";
  saveDemoState();
  renderAppCallback();
}

function resetTemplateBody() {
  const template = templates.find((item) => item.id === state.selectedTemplateId);
  if (!template) return;

  const blueprint = documentTemplateBlueprints[template.id];
  if (blueprint) {
    template.sections = blueprint.sections.map((section) => ({ ...section }));
    template.body = composeTemplateBody(template.sections);
  } else {
    template.body = template.defaultBody || defaultTemplateBody(template);
  }
  template.updatedAt = new Date().toISOString();
  state.templateEditorError = "";
  state.templateEditorSavedAt = template.updatedAt;
  state.generatedDocPreview = null;
  state.generationStatus = "Ready";
  saveDemoState();
  renderAppCallback();
}

function defaultTemplateBody(template) {
  return `${template.name} template for ${template.owner} documents. Include document number, customer, job, equipment, owner, notes, and signatures.`;
}

function readTemplateSections(blueprint) {
  return blueprint.sections.map((section) => ({
    id: section.id,
    label: section.label,
    value: getControlValue(`tpl-section-${section.id}`)
  }));
}

function composeTemplateBody(sections) {
  return sections
    .map((section) => `${section.label}\n${section.value}`)
    .join("\n\n")
    .trim();
}

async function exportTemplateSectionsAsFodt(templateId) {
  const template = templates.find((item) => item.id === templateId);
  if (!template) return;

  const blueprint = documentTemplateBlueprints[template.id];
  const sections = blueprint ? readTemplateSections(blueprint) : [];
  const body = blueprint ? composeTemplateBody(sections) : template.body || "";

  if (blueprint && sections.some((section) => !section.value)) {
    state.templateFileError = "All template sections must have text before FODT export.";
    state.templateEditorOpen = true;
    renderAppCallback();
    return;
  }

  await saveFodtTemplateToService({
    template,
    payload: {
      templateId: template.id,
      templateName: template.name,
      templateBody: body,
      templateSections: sections,
      fileName: `${template.id}-sections.fodt`
    },
    successPrefix: "Exported sections"
  });
}

async function uploadFodtTemplate(templateId, file) {
  const template = templates.find((item) => item.id === templateId);
  if (!template || !file) return;

  if (!file.name.toLowerCase().endsWith(".fodt")) {
    state.templateFileError = "Only .fodt template files are supported in this prototype step.";
    state.templateEditorOpen = true;
    renderAppCallback();
    return;
  }

  try {
    const contentBase64 = await readFileAsBase64(file);
    await saveFodtTemplateToService({
      template,
      payload: {
        templateId: template.id,
        templateName: template.name,
        fileName: file.name,
        contentBase64
      },
      successPrefix: "Uploaded FODT"
    });
  } catch (error) {
    state.templateFileStatus = "";
    state.templateFileError = error.message || "Could not read template file.";
    state.templateEditorOpen = true;
    renderAppCallback();
  }
}

async function saveFodtTemplateToService({ template, payload, successPrefix }) {
  state.templateFileStatus = "Document service template sync working";
  state.templateFileError = "";
  state.templateEditorOpen = true;
  renderAppCallback();

  try {
    const response = await fetch("/api/documents/template/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await readJsonResponse(response, "Template upload failed");
    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Template upload failed.");
    }

    template.fodtFileName = result.fileName;
    template.fodtDownloadUrl = result.downloadUrl;
    template.fodtFileRecord = result.fileRecord || null;
    template.updatedAt = new Date().toISOString();
    state.templateFileStatus = `${successPrefix}: ${result.fileName}`;
    state.templateFileError = "";
    state.generatedDocPreview = null;
    state.generationStatus = "Ready";
    saveDemoState();
  } catch (error) {
    state.templateFileStatus = "";
    state.templateFileError = error.message || "Template upload failed.";
  }

  renderAppCallback();
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      resolve(value.includes(",") ? value.split(",").pop() : value);
    };
    reader.onerror = () => reject(reader.error || new Error("Could not read template file."));
    reader.readAsDataURL(file);
  });
}

function generationTemplateForDocument(doc) {
  if (!doc) return null;
  const selectedTemplate = templates.find((item) => item.id === state.selectedTemplateId);
  const preferredTemplateId = preferredTemplateIdForDocument(doc);
  const preferredTemplate = preferredTemplateId ? templates.find((item) => item.id === preferredTemplateId) : null;
  if (selectedTemplate && (!preferredTemplateId || selectedTemplate.id === preferredTemplateId)) return selectedTemplate;
  return preferredTemplate || selectedTemplate || templates[0] || null;
}

function preferredTemplateIdForDocument(doc) {
  const type = String(doc?.type || "").toLowerCase();
  if (doc?.workActId || type.includes("service act") || type.includes("work act")) return "tpl-service-act";
  if (doc?.defectActId || type.includes("defect")) return "tpl-defect-act";
  if (doc?.commercialOfferDraftId || type.includes("quotation") || type.includes("commercial")) return "tpl-quotation";
  if (type.includes("diagnostic")) return "tpl-diagnostic";
  if (type.includes("acceptance")) return "tpl-acceptance";
  if (type.includes("vendor")) return "tpl-vendor-return";
  return "";
}

function generationSourceForDoc(doc) {
  if (doc?.workActId) {
    return { type: "work-act", id: doc.workActId, workActId: doc.workActId, defectActId: "", commercialOfferDraftId: "" };
  }
  if (doc?.defectActId) {
    return { type: "defect-act", id: doc.defectActId, workActId: "", defectActId: doc.defectActId, commercialOfferDraftId: "" };
  }
  if (doc?.commercialOfferDraftId) {
    return { type: "commercial-offer", id: doc.commercialOfferDraftId, workActId: "", defectActId: "", commercialOfferDraftId: doc.commercialOfferDraftId };
  }
  return { type: "document", id: doc?.id || "", workActId: "", defectActId: "", commercialOfferDraftId: "" };
}

function buildGeneratedFile(doc, template, result, generatedAt) {
  const fileRecord = result.fileRecord || null;
  const source = generationSourceForDoc(doc);
  const fileId = fileRecord?.id || result.fileId || "";
  return {
    id: fileId,
    fileId,
    fileName: fileRecord?.fileName || result.fileName || `${doc.id}.${state.documentOutputFormat}`,
    format: result.format || state.documentOutputFormat,
    generatedAt,
    templateId: template.id,
    downloadUrl: fileRecord?.downloadUrl || result.downloadUrl || "",
    previewUrl: fileRecord?.previewUrl || result.previewUrl || "",
    version: fileRecord?.version || result.version || null,
    versionLabel: fileRecord?.versionLabel || result.versionLabel || "",
    fileRecord,
    source: "document-service",
    sourceType: fileRecord?.sourceType || source.type,
    sourceId: fileRecord?.sourceId || source.id
  };
}

function upsertGeneratedFileVersion(existingVersions, generatedFile) {
  const fileKey = generatedFile.fileId || generatedFile.id || generatedFile.fileName;
  const versions = Array.isArray(existingVersions) ? existingVersions : [];
  return [
    generatedFile,
    ...versions.filter((item) => (item.fileId || item.id || item.fileName) !== fileKey)
  ].slice(0, 12);
}

function syncGeneratedFileToSource(doc, generatedFile) {
  const source = generationSourceForDoc(doc);
  const sourceCollections = {
    "work-act": workActs,
    "defect-act": defectActs,
    "commercial-offer": commercialOfferDrafts
  };
  const sourceRecord = sourceCollections[source.type]?.find((item) => item.id === source.id);
  if (!sourceRecord) return;

  sourceRecord.generatedDocumentId = doc.id;
  sourceRecord.generatedFile = generatedFile;
  sourceRecord.generatedFileVersions = upsertGeneratedFileVersion(sourceRecord.generatedFileVersions, generatedFile);
  sourceRecord.generatedFileId = generatedFile.fileId || generatedFile.id || "";
  sourceRecord.generatedFileVersion = generatedFile.version || null;
  sourceRecord.generatedAt = generatedFile.generatedAt;
  sourceRecord.status = "Generated";
  sourceRecord.updatedAt = new Date().toISOString();
}

function documentFileAuditNote(file, fallback = "") {
  if (!file?.fileName) return fallback;
  return [file.versionLabel, file.fileName].filter(Boolean).join(" / ");
}

async function generateServiceDocument(id) {
  const doc = documents.find((item) => item.id === id);
  const template = generationTemplateForDocument(doc);
  if (!doc || !template) return;

  state.selectedDocumentId = doc.id;
  state.selectedTemplateId = template.id;
  state.generationStatus = "Document service working";
  state.generatedDocPreview = null;
  renderAppCallback();

  try {
    const response = await fetch("/api/documents/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(documentServicePayload(doc, template))
    });
    const result = await readJsonResponse(response, "Document generation failed");
    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Document service failed.");
    }

    const generatedAt = new Date().toISOString();
    const generatedFile = buildGeneratedFile(doc, template, result, generatedAt);
    state.generationStatus = `${state.documentOutputFormat.toUpperCase()} service file ready${generatedFile.versionLabel ? ` (${generatedFile.versionLabel})` : ""}`;
    state.generatedDocPreview = {
      docId: doc.id,
      templateId: template.id,
      format: state.documentOutputFormat,
      generatedAt,
      serviceDownloadUrl: generatedFile.downloadUrl,
      servicePreviewUrl: generatedFile.previewUrl || "",
      serviceFileName: generatedFile.fileName,
      fileId: generatedFile.fileId,
      version: generatedFile.version,
      versionLabel: generatedFile.versionLabel,
      fileRecord: generatedFile.fileRecord
    };
    doc.generatedFile = generatedFile;
    doc.generatedFileVersions = upsertGeneratedFileVersion(doc.generatedFileVersions, generatedFile);
    doc.pipelineStep = "Signature";
    doc.status = "Signature";
    doc.deliveryStatus = "Needs signed upload";
    syncGeneratedFileToSource(doc, generatedFile);
    addDocumentDeliveryAudit(doc, "Generated", `${state.documentOutputFormat.toUpperCase()} file generated: ${documentFileAuditNote(generatedFile, generatedFile.fileName)}`, generatedFile);
  } catch (error) {
    state.generationStatus = "Document service unavailable";
    state.generatedDocPreview = {
      docId: doc.id,
      templateId: template.id,
      format: state.documentOutputFormat,
      generatedAt: new Date().toISOString(),
      serviceError: error.message || "Document service unavailable."
    };
    doc.deliveryStatus = "Generation failed";
    addDocumentDeliveryAudit(doc, "Generation failed", state.generatedDocPreview.serviceError);
  }

  saveDemoState();
  renderAppCallback();
}

function openDocumentPrintPreview(id) {
  const doc = documents.find((item) => item.id === id);
  if (!doc) return;
  const generatedFile = doc.generatedFile || null;

  state.selectedDocumentId = doc.id;
  state.printPreviewOpen = true;
  state.printPreviewDocumentId = doc.id;
  state.printPreviewPage = 1;
  state.printPreviewZoom = 100;
  state.printPreviewExportOpen = false;
  state.printPreviewEmailOpen = false;
  state.printPreviewEmailStatus = "";
  doc.deliveryStatus = generatedFile ? "Preview opened" : (doc.deliveryStatus || "Preview draft");
  addDocumentDeliveryAudit(doc, "Preview opened", documentFileAuditNote(generatedFile, "Preview opened before service file generation"), generatedFile);
  saveDemoState();
  renderAppCallback();
}

function closeDocumentPrintPreview() {
  state.printPreviewOpen = false;
  state.printPreviewExportOpen = false;
  state.printPreviewEmailOpen = false;
  state.printPreviewEmailStatus = "";
  renderAppCallback();
}

function moveDocumentPrintPreviewPage(direction) {
  const current = Number(state.printPreviewPage || 1);
  const next = direction === "next" ? current + 1 : current - 1;
  state.printPreviewPage = Math.max(1, Math.min(2, next));
  renderAppCallback();
}

function zoomDocumentPrintPreview(direction) {
  const current = Number(state.printPreviewZoom || 100);
  const next = direction === "in" ? current + 10 : current - 10;
  state.printPreviewZoom = Math.max(70, Math.min(140, next));
  renderAppCallback();
}

function handleDocumentDeliveryAction(action) {
  const doc = documents.find((item) => item.id === state.printPreviewDocumentId);
  if (!doc) return;
  const generatedFile = doc.generatedFile || null;

  if (action === "download") {
    doc.deliveryStatus = "Downloaded";
    addDocumentDeliveryAudit(doc, "Downloaded", documentFileAuditNote(generatedFile, "Downloaded local copy"), generatedFile);
    if (generatedFile?.downloadUrl) {
      window.open(generatedFile.downloadUrl, "_blank", "noopener");
    }
  }

  if (action === "print") {
    doc.deliveryStatus = "Print opened";
    addDocumentDeliveryAudit(doc, "Print opened", documentFileAuditNote(generatedFile, "Browser print dialog opened"), generatedFile);
    window.print();
  }

  if (action === "quick-print") {
    doc.deliveryStatus = "Quick print queued";
    addDocumentDeliveryAudit(doc, "Quick print queued", documentFileAuditNote(generatedFile, "Demo quick print action recorded"), generatedFile);
  }

  if (action === "export-pdf") {
    doc.deliveryStatus = "PDF exported";
    addDocumentDeliveryAudit(doc, "PDF exported", documentFileAuditNote(generatedFile, "PDF export recorded"), generatedFile);
    if (generatedFile?.downloadUrl) {
      window.open(generatedFile.downloadUrl, "_blank", "noopener");
    }
  }

  state.printPreviewExportOpen = false;
  saveDemoState();
  renderAppCallback();
}

function queueDocumentEmail(id) {
  const doc = documents.find((item) => item.id === id);
  if (!doc) return;
  const generatedFile = doc.generatedFile || null;

  const to = getControlValue("doc-preview-email-to");
  const subject = getControlValue("doc-preview-email-subject");
  const message = getControlValue("doc-preview-email-message");

  if (!to || !subject) {
    state.printPreviewEmailStatus = "Recipient and subject are required.";
    renderAppCallback();
    return;
  }

  doc.deliveryStatus = "Email queued";
  doc.lastEmail = {
    to,
    subject,
    message,
    attachment: generatedFile?.fileName || `${doc.id}.pdf`,
    fileId: generatedFile?.fileId || generatedFile?.id || "",
    fileVersion: generatedFile?.version || null,
    fileVersionLabel: generatedFile?.versionLabel || "",
    downloadUrl: generatedFile?.downloadUrl || "",
    previewUrl: generatedFile?.previewUrl || "",
    queuedAt: new Date().toISOString()
  };
  addDocumentDeliveryAudit(doc, "Email queued", `To: ${to}; attachment: ${documentFileAuditNote(generatedFile, doc.lastEmail.attachment)}`, generatedFile);
  state.printPreviewEmailStatus = "Email queued in demo audit trail.";
  state.printPreviewEmailOpen = false;
  saveDemoState();
  renderAppCallback();
}

function addDocumentDeliveryAudit(doc, action, note = "", fileContext = doc.generatedFile || null) {
  const file = fileContext || {};
  doc.deliveryAudit = doc.deliveryAudit || [];
  const auditEntry = {
    action,
    note,
    at: new Date().toISOString()
  };
  const fileId = file.fileId || file.id || file.fileRecord?.id || "";
  if (fileId || file.fileName) {
    auditEntry.fileId = fileId;
    auditEntry.fileName = file.fileName || "";
    auditEntry.fileVersion = file.version || null;
    auditEntry.fileVersionLabel = file.versionLabel || "";
    auditEntry.sourceType = file.sourceType || "";
    auditEntry.sourceId = file.sourceId || "";
  }
  doc.deliveryAudit.unshift(auditEntry);
  doc.deliveryAudit = doc.deliveryAudit.slice(0, 8);
}

function documentServicePayload(doc, template) {
  const job = jobs.find((item) => item.id === doc.jobId);
  const eq = equipment.find((item) => item.name === job?.equipment || item.id === job?.equipmentId || item.serial === job?.serial);
  const customer = customers.find((item) => item.name === doc.customer || item.id === job?.customerId);
  const sellerProfile = companyProfiles.find((item) => item.id === "seller-viva-medical") || companyProfiles[0] || {};
  const quotation = quotations.find((item) => (
    item.id === doc.quotationId ||
    item.handedOffJobId === doc.jobId ||
    (template.id === "tpl-quotation" && item.customer === doc.customer)
  ));
  const commercialOffer = commercialOfferDrafts.find((item) => item.id === doc.commercialOfferDraftId);
  const workAct = workActs.find((item) => item.id === doc.workActId);
  const defectAct = defectActs.find((item) => item.id === doc.defectActId);
  const source = generationSourceForDoc(doc);
  const relatedContract = contracts.find((item) =>
    item.id === commercialOffer?.contract ||
    item.id === quotation?.contractId ||
    item.equipmentId === eq?.id ||
    item.customerId === customer?.id ||
    item.customer === doc.customer
  );
  const contractNumber = commercialOffer?.contract || quotation?.contractId || relatedContract?.id || "";
  const buyerName = customer?.legalName || doc.customer || "";
  const buyerAddress = customer?.documentAddress || customer?.address || "";
  const buyerRequisitesText = [
    buyerName,
    customer?.companyCode ? `Im. kodas: ${customer.companyCode}` : "",
    customer?.vatCode ? `PVM kodas: ${customer.vatCode}` : "",
    buyerAddress ? `Adresas: ${buyerAddress}` : "",
    customer?.bankName ? `Bankas: ${customer.bankName}` : "",
    customer?.bankAccount ? `A.s.: ${customer.bankAccount}` : ""
  ].filter(Boolean).join("\n");
  const sellerRequisitesText = [
    sellerProfile.name || sellerProfile.displayName || "",
    sellerProfile.address || "",
    sellerProfile.phone ? `Tel.: ${sellerProfile.phone}` : "",
    sellerProfile.website ? `Web: ${sellerProfile.website}` : "",
    sellerProfile.registrationCode ? `Imones kodas: ${sellerProfile.registrationCode}` : "",
    sellerProfile.vatCode ? `PVM moketojo kodas: ${sellerProfile.vatCode}` : "",
    sellerProfile.bankAccount ? `A.s.: ${sellerProfile.bankAccount}` : "",
    sellerProfile.bankName ? `Bankas: ${sellerProfile.bankName}` : ""
  ].filter(Boolean).join("\n");
  const workActEquipment = workAct?.equipmentItems?.length
    ? workAct.equipmentItems.map((item) => `${item.name} / SN ${item.serial || "-"}`).join("; ")
    : "";
  const workActRows = workAct?.workRows?.length
    ? workAct.workRows.map((row) => `${row.number}. ${row.description}${row.completed ? " [done]" : " [open]"}${row.comments ? ` - ${row.comments}` : ""}`).join("\n")
    : "";
  const deprecatedReportOptions = new Set(["useSwissProgramLogo", "useTradintekAsContractor"]);
  const reportOptions = Object.fromEntries(
    Object.entries(workAct?.reportOptions || {}).filter(([key]) => !deprecatedReportOptions.has(key))
  );
  const reportOptionsText = Object.entries(reportOptions)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
  const defectActVisits = defectAct?.actualVisits || [];
  const defectActVisitsText = defectActVisits.length
    ? defectActVisits.map((visit) => [
      visit.da ? "DA" : "",
      visit.wa ? "WA" : "",
      visit.plannedStart ? `Planned: ${visit.plannedStart}` : "",
      visit.workHours !== "" && visit.workHours != null ? `Work: ${visit.workHours} h` : "",
      visit.travelHours !== "" && visit.travelHours != null ? `Travel: ${visit.travelHours} h` : "",
      visit.completed ? "Completed" : "Open",
      visit.comments || ""
    ].filter(Boolean).join(" / ")).join("\n")
    : "";

  return {
    documentId: doc.id,
    documentType: doc.type,
    sourceType: source.type,
    sourceId: source.id,
    workActId: source.workActId,
    defectActId: source.defectActId,
    commercialOfferDraftId: source.commercialOfferDraftId,
    templateId: template.id,
    templateName: template.name,
    templateBody: template.body || "",
    templateSections: template.sections || [],
    format: state.documentOutputFormat,
    customer: doc.customer,
    sellerName: sellerProfile.name || sellerProfile.displayName || "",
    sellerDisplayName: sellerProfile.displayName || sellerProfile.name || "",
    sellerAddress: sellerProfile.address || "",
    sellerPhone: sellerProfile.phone || "",
    sellerWebsite: sellerProfile.website || "",
    sellerCompanyCode: sellerProfile.registrationCode || "",
    sellerVatCode: sellerProfile.vatCode || "",
    sellerBankName: sellerProfile.bankName || "",
    sellerBankAccount: sellerProfile.bankAccount || "",
    sellerRequisitesText,
    buyerName,
    buyerCompanyCode: customer?.companyCode || "",
    buyerVatCode: customer?.vatCode || "",
    buyerAddress,
    buyerBankName: customer?.bankName || "",
    buyerBankAccount: customer?.bankAccount || "",
    buyerRequisitesText,
    contractNumber,
    workLocation: buyerAddress,
    jobId: doc.jobId,
    equipmentItems: workAct?.equipmentItems || [],
    workActRows: workAct?.workRows || [],
    reportOptions,
    equipment: workActEquipment || defectAct?.equipment || job?.equipment || eq?.name || "",
    serial: workAct?.equipmentItems?.map((item) => item.serial).filter(Boolean).join(", ") || defectAct?.serial || job?.serial || eq?.serial || "",
    owner: doc.owner,
    notes: workAct?.workText || defectAct?.defectDescription || doc.description || quotation?.notes || "",
    fieldsText: [
      sellerRequisitesText ? `Seller requisites:\n${sellerRequisitesText}` : "",
      buyerRequisitesText ? `Buyer requisites:\n${buyerRequisitesText}` : "",
      contractNumber ? `Contract: ${contractNumber}` : "",
      buyerAddress ? `Work location: ${buyerAddress}` : "",
      customer?.address ? `Customer address: ${customer.address}` : "",
      customer ? `Contact: ${customer.contact} - ${customer.phone}` : "",
      commercialOffer?.number ? `Commercial offer: ${commercialOffer.number}` : "",
      commercialOffer?.profile ? `Profile: ${commercialOffer.profile}` : "",
      commercialOffer?.recipient ? `Recipient: ${commercialOffer.recipient}` : "",
      commercialOffer?.headerText ? `Offer header:\n${commercialOffer.headerText}` : "",
      commercialOffer?.scopeText ? `Offer scope:\n${commercialOffer.scopeText}` : "",
      commercialOffer?.footerText ? `Offer footer:\n${commercialOffer.footerText}` : "",
      commercialOffer ? `Offer total: ${commercialOfferTotal(commercialOffer)} ${commercialOffer.currency || commercialOffer.lineItems?.[0]?.currency || "EUR"}` : "",
      quotation && !commercialOffer ? `Quotation amount: ${quotation.amount} ${quotation.currency}` : "",
      (commercialOffer?.validityDate || quotation?.due) ? `Valid until: ${commercialOffer?.validityDate || quotation?.due}` : "",
      workAct ? `Work Act: ${workAct.number}` : "",
      workActEquipment ? `Equipment items: ${workActEquipment}` : "",
      workAct?.workText ? `Work text: ${workAct.workText}` : "",
      workActRows ? `Work rows:\n${workActRows}` : "",
      reportOptionsText ? `Report options:\n${reportOptionsText}` : "",
      defectAct ? `Defect Act: ${defectAct.number}` : "",
      defectAct?.defectDescription ? `Defect: ${defectAct.defectDescription}` : "",
      defectAct?.engineerFindings ? `Findings: ${defectAct.engineerFindings}` : "",
      defectAct?.recommendedCorrection ? `Recommended correction: ${defectAct.recommendedCorrection}` : "",
      defectAct?.riskLevel ? `Risk level: ${defectAct.riskLevel}` : "",
      defectAct?.customerAcknowledgement ? `Customer acknowledgement: ${defectAct.customerAcknowledgement}` : "",
      defectActVisitsText ? `Actual visits:\n${defectActVisitsText}` : "",
      `Pipeline step: ${doc.pipelineStep}`
    ].filter(Boolean).join("\n"),
    fields: {
      customerAddress: customer?.address || "",
      contact: customer ? `${customer.contact} - ${customer.phone}` : "",
      sellerName: sellerProfile.name || sellerProfile.displayName || "",
      sellerDisplayName: sellerProfile.displayName || sellerProfile.name || "",
      sellerAddress: sellerProfile.address || "",
      sellerPhone: sellerProfile.phone || "",
      sellerWebsite: sellerProfile.website || "",
      sellerCompanyCode: sellerProfile.registrationCode || "",
      sellerVatCode: sellerProfile.vatCode || "",
      sellerBankName: sellerProfile.bankName || "",
      sellerBankAccount: sellerProfile.bankAccount || "",
      sellerRequisitesText,
      buyerName,
      buyerCompanyCode: customer?.companyCode || "",
      buyerVatCode: customer?.vatCode || "",
      buyerAddress,
      buyerBankName: customer?.bankName || "",
      buyerBankAccount: customer?.bankAccount || "",
      buyerRequisitesText,
      contractNumber,
      workLocation: buyerAddress,
      quotationAmount: commercialOffer ? `${commercialOfferTotal(commercialOffer)} ${commercialOffer.currency || commercialOffer.lineItems?.[0]?.currency || "EUR"}` : quotation ? `${quotation.amount} ${quotation.currency}` : "",
      quotationDue: commercialOffer?.validityDate || quotation?.due || "",
      commercialOffer,
      commercialOfferNumber: commercialOffer?.number || "",
      commercialOfferHeaderText: commercialOffer?.headerText || "",
      commercialOfferFooterText: commercialOffer?.footerText || "",
      commercialOfferScopeText: commercialOffer?.scopeText || "",
      commercialOfferLineItems: commercialOffer?.lineItems || [],
      commercialOfferRecipient: commercialOffer?.recipient || "",
      commercialOfferContract: commercialOffer?.contract || "",
      commercialOfferInvoiceId: commercialOffer?.invoiceId || "",
      defectDescription: defectAct?.defectDescription || doc.description || job?.stage || "",
      engineerFindings: defectAct?.engineerFindings || "",
      recommendedCorrection: defectAct?.recommendedCorrection || "",
      riskLevel: defectAct?.riskLevel || "",
      customerAcknowledgement: defectAct?.customerAcknowledgement || "",
      defectActVisits,
      defectActVisitsText,
      pipelineStep: doc.pipelineStep,
      workActNumber: workAct?.number || "",
      workActRows: workAct?.workRows || [],
      equipmentItems: workAct?.equipmentItems || [],
      reportOptions,
      reportOptionsText,
      sourceType: source.type,
      sourceId: source.id,
      workActId: source.workActId,
      defectActId: source.defectActId,
      commercialOfferDraftId: source.commercialOfferDraftId
    }
  };
}

function commercialOfferTotal(draft) {
  return (draft?.lineItems || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

function canRejectDocument(doc) {
  return ["Review", "Customer", "Signature"].includes(doc?.pipelineStep);
}

function startRejectDocument(id) {
  const doc = documents.find((item) => item.id === id);
  if (!doc || !canRejectDocument(doc)) return;

  state.selectedDocumentId = doc.id;
  state.rejectingDocumentId = doc.id;
  state.documentRejectError = "";
  state.generationStatus = "Ready";
  state.generatedDocPreview = null;
  renderAppCallback();
}

function rejectDocument(id) {
  const doc = documents.find((item) => item.id === id);
  if (!doc || !canRejectDocument(doc)) return;

  const input = Array.from(document.querySelectorAll("[data-doc-reject-comment]"))
    .find((item) => item.dataset.docRejectComment === id);
  const comment = input?.value.trim() || "";
  if (!comment) {
    state.rejectingDocumentId = doc.id;
    state.documentRejectError = "Rejection comment is required.";
    renderAppCallback();
    return;
  }

  doc.rejectionHistory = doc.rejectionHistory || [];
  doc.rejectionHistory.unshift({
    comment,
    fromStage: doc.pipelineStep,
    rejectedAt: new Date().toISOString()
  });
  doc.rejectionComment = comment;
  doc.pipelineStep = "Rejected";
  doc.status = statusByStage.Rejected;
  state.selectedDocumentId = doc.id;
  state.rejectingDocumentId = null;
  state.documentRejectError = "";
  state.generationStatus = "Ready";
  state.generatedDocPreview = null;
  renderAppCallback();
}
