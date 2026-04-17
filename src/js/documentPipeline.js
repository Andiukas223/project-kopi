import { calendarEvents, commercialOfferDrafts, companyProfiles, contracts, customers, defectActs, documents, equipment, invoices, jobs, partsRequests, quotations, templates, workActs } from "./data.js";
import { saveDemoState } from "./persistence.js";
import { state } from "./state.js";
import { creatorMeta, currentUserName } from "./userIdentity.js";

const statusByStage = {
  Draft: "Draft",
  Review: "Review",
  Customer: "Customer",
  Signature: "Signature",
  Approved: "Approved",
  Rejected: "Rejected"
};

const AUTO_GENERATION_STALE_MS = 2 * 60 * 1000;
const queuedAutoGenerationIds = new Set();

let renderAppCallback = null;

export function bindDocumentPipeline(renderApp) {
  renderAppCallback = renderApp;
  if (normalizeDocumentWorkflowStates({ resetAutoGeneration: true })) {
    saveDemoState();
    window.setTimeout(renderAppCallback, 0);
  }
  window.setTimeout(autoGenerateMissingDocumentFiles, 250);

  document.addEventListener("click", (event) => {
    const docViewButton = event.target.closest("[data-doc-view]");
    if (docViewButton) {
      void viewGeneratedDocument(docViewButton.dataset.docView);
      return;
    }

    const docEditButton = event.target.closest("[data-doc-edit]");
    if (docEditButton) {
      void routeDocumentEdit(docEditButton.dataset.docEdit);
      return;
    }

    const selectButton = event.target.closest("[data-doc-select]");
    if (selectButton) {
      selectDocument(selectButton.dataset.docSelect);
      return;
    }

    const row = event.target.closest("[data-doc-row]");
    if (row && !event.target.closest("button, a, input, select, textarea") && !hasActiveTextSelection()) {
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
      state.documentUploadDefaultType = uploadOpenButton.dataset.docUploadType || "";
      state.documentUploadError = "";
      renderAppCallback();
      return;
    }

    const uploadCancelButton = event.target.closest("[data-doc-upload-cancel]");
    if (uploadCancelButton) {
      state.documentUploadOpen = false;
      state.documentUploadTargetId = null;
      state.documentUploadDefaultType = "";
      state.documentUploadError = "";
      renderAppCallback();
      return;
    }

    const uploadSubmitButton = event.target.closest("[data-doc-upload-submit]");
    if (uploadSubmitButton) {
      void uploadDocument();
      return;
    }

    const confirmJobDoneButton = event.target.closest("[data-doc-confirm-job-done]");
    if (confirmJobDoneButton) {
      confirmSignedWorkActCompletion(confirmJobDoneButton.dataset.docConfirmJobDone, true);
      return;
    }

    const keepJobOpenButton = event.target.closest("[data-doc-confirm-job-keep]");
    if (keepJobOpenButton) {
      confirmSignedWorkActCompletion(keepJobOpenButton.dataset.docConfirmJobKeep, false);
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

  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (state.printPreviewOpen) {
        event.preventDefault();
        closeDocumentPrintPreview();
        return;
      }

      if (state.documentUploadOpen) {
        event.preventDefault();
        closeDocumentUploadDialog();
        return;
      }
    }

    if (event.key !== "Enter" || !isDocumentSearchEnterTarget(event.target)) return;
    event.preventDefault();
    applyDocumentSearch();
  });

  document.addEventListener("dragover", (event) => {
    const dropzone = event.target.closest("[data-doc-upload-dropzone]");
    if (!dropzone) return;
    event.preventDefault();
    dropzone.classList.add("dragging");
  });

  document.addEventListener("dragleave", (event) => {
    const dropzone = event.target.closest("[data-doc-upload-dropzone]");
    if (!dropzone || (event.relatedTarget instanceof Node && dropzone.contains(event.relatedTarget))) return;
    dropzone.classList.remove("dragging");
  });

  document.addEventListener("drop", (event) => {
    const dropzone = event.target.closest("[data-doc-upload-dropzone]");
    if (!dropzone) return;
    event.preventDefault();
    dropzone.classList.remove("dragging");
    setDocumentUploadFile(event.dataTransfer?.files?.[0] || null);
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-doc-date-picker]")) {
      state.documentDateQuery = event.target.value || "";
      const textInput = document.getElementById("doc-date-query");
      if (textInput) textInput.value = state.documentDateQuery;
      applyDocumentSearch();
      return;
    }

    if (event.target.matches("#doc-upload-file")) {
      updateDocumentUploadFileName(event.target.files?.[0] || null);
      return;
    }

  });
}

function isDocumentSearchEnterTarget(target) {
  return target instanceof HTMLElement && (
    target.matches("#doc-search-query") ||
    target.matches("#doc-date-query") ||
    target.matches("[data-doc-date-picker]")
  );
}

function setDocumentUploadFile(file) {
  const input = document.getElementById("doc-upload-file");
  if (!input || !file) return;
  const transfer = new DataTransfer();
  transfer.items.add(file);
  input.files = transfer.files;
  updateDocumentUploadFileName(file);
}

function updateDocumentUploadFileName(file) {
  const label = document.querySelector("[data-doc-upload-file-name]");
  if (!label) return;
  label.textContent = file ? file.name : "No file selected";
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

async function routeDocumentEdit(id) {
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
    keepDocumentInRepository(doc);
  } else if (type.includes("quotation") || type.includes("commercial offer")) {
    keepDocumentInRepository(doc);
  } else if (type.includes("invoice")) {
    keepDocumentInRepository(doc);
  } else if (type.includes("parts") || type.includes("vendor return")) {
    keepDocumentInRepository(doc);
  } else if (type.includes("acceptance")) {
    routeToServiceJob(doc);
  } else {
    routeToWorkAct(doc);
  }

  renderAppCallback();
}

function keepDocumentInRepository(doc) {
  state.page = "documents";
  state.selectedDocumentId = doc.id;
  state.generationStatus = "This document type does not have an active source editor yet.";
}

function routeToWorkAct(doc) {
  const act = workActs.find((item) =>
    item.id === doc.workActId ||
    item.generatedDocumentId === doc.id ||
    item.jobId === doc.jobId
  ) || createWorkActDraftForDocument(doc);
  state.page = "workacts";
  state.templateGenTab = "work-acts";
  state.selectedTemplateId = "tpl-service-act";
  state.selectedWorkActId = act?.id || null;
  state.templateGenWorkActJobId = act?.jobId || doc.jobId || state.templateGenWorkActJobId;
  state.selectedServiceJobId = doc.jobId || state.selectedServiceJobId;
  state.workActEditorDocumentId = doc.id;
  return act || null;
}

function createWorkActDraftForDocument(doc) {
  const job = jobs.find((item) => item.id === doc.jobId || item.customer === doc.customer) || null;
  const jobEquipment = equipment.find((item) =>
    item.id === job?.equipmentId ||
    item.name === job?.equipment ||
    item.serial === job?.serial
  );
  const createdAt = new Date().toISOString();
  const actId = `WA-${260412 + workActs.length}`;
  const workDescription = job?.problemDescription || job?.sourceDescription || doc.description || "Service work";
  const act = {
    id: actId,
    number: `VM-WA-${String(workActs.length + 1).padStart(4, "0")}`,
    date: doc.created || createdAt.slice(0, 10),
    jobId: doc.jobId || job?.id || "",
    company: "Viva Medical",
    companyProfile: "Default",
    customer: doc.customer || job?.customer || "",
    type: serviceTypeFromDocumentJob(job, doc),
    status: "Document draft",
    source: `Document ${doc.id}`,
    workDescription,
    equipmentItems: jobEquipment ? [documentEquipmentSnapshot(jobEquipment)] : [],
    workTemplateId: "",
    workText: workDescription,
    workRows: [
      {
        id: `${actId}-WR-1`,
        number: 1,
        description: workDescription,
        completed: true,
        comments: ""
      }
    ],
    reportOptions: {
      entryPerson: currentUserName(),
      includePersonName: true,
      includeSignature: true,
      includeWorkingHours: true,
      includeSystemIdentity: true,
      includeSystemName: true,
      equipmentWorking: true,
      readyForUse: false,
      oldPartReturned: false,
      hygieneStandard: false,
      showTravelHours: false,
      showStartedCompletedTime: false,
      useThreeSideTemplate: false
    },
    generatedDocumentId: doc.id,
    ...creatorMeta(),
    updatedAt: createdAt
  };

  workActs.unshift(act);
  doc.workActId = act.id;
  doc.status = doc.status || "Draft";
  doc.pipelineStep = doc.pipelineStep || doc.status;
  saveDemoState();
  return act;
}

function serviceTypeFromDocumentJob(job, doc = {}) {
  const stage = String(job?.stage || doc.type || "").toLowerCase();
  if (stage.includes("pm") || stage.includes("maintenance")) return "PM";
  if (stage.includes("install")) return "Installation";
  if (stage.includes("diagnostic")) return "Diagnostic";
  if (stage.includes("repair")) return "Repair";
  return job?.type || doc.type || "Service";
}

function documentEquipmentSnapshot(eq) {
  return {
    equipmentId: eq.id,
    name: eq.name,
    serial: eq.serial,
    category: eq.category,
    location: eq.location,
    customer: eq.customer
  };
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
  state.documentUploadDefaultType = "";
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
  const created = getUploadValue("doc-upload-created") || new Date().toISOString().slice(0, 10);
  const due = dateAfterDays(7);
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
    ...creatorMeta(),
    created,
    createdAt: new Date(`${created}T00:00:00`).toISOString(),
    status: "Draft",
    due,
    pipelineStep: "Draft",
    uploaded: true,
    uploadedAt: new Date().toISOString(),
    uploadedFile,
    signedBy: signedBy || "Not recorded",
    description: description || "Uploaded external document"
  };

  if (type === "Invoice") {
    const invoice = {
      id: `INV-${9001 + invoices.length}`,
      jobId,
      documentId: docId,
      customer,
      owner: currentUserName(),
      ...creatorMeta(),
      created,
      createdAt: new Date(`${created}T00:00:00`).toISOString(),
      amount: 0,
      currency: "EUR",
      invoiceNo: file.name.replace(/\.[^.]+$/, "") || null,
      status: "Uploaded",
      paymentStatus: "Pending",
      due,
      generatedAt: new Date().toISOString().slice(0, 10),
      notes: description || "Uploaded invoice file."
    };
    invoices.unshift(invoice);
    state.selectedInvoiceId = invoice.id;
  }

  syncWarrantyFromAcceptanceUpload(doc, job);
  documents.unshift(doc);

  state.selectedDocumentId = docId;
  state.documentUploadOpen = false;
  state.documentUploadTargetId = null;
  state.documentUploadDefaultType = "";
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
    state.documentUploadDefaultType = "";
    state.documentUploadError = "";
    const needsWorkActCompletion = isWorkActCompletionDocument(doc);
    state.jobCompletionConfirmDocId = needsWorkActCompletion ? doc.id : null;
    if (needsWorkActCompletion) markLinkedJobWaitingSignature(doc);
    state.generationStatus = needsWorkActCompletion
      ? "Signed Work Act uploaded. Confirm whether the linked job is done."
      : "Signed copy uploaded.";
    state.generatedDocPreview = null;
    saveDemoState();
    renderAppCallback();
  } catch (error) {
    state.documentUploadError = error.message || "Signed document upload failed.";
    state.documentUploadOpen = true;
    renderAppCallback();
  }
}

function isWorkActCompletionDocument(doc) {
  const type = String(doc?.type || "").toLowerCase();
  return Boolean(doc?.workActId || type.includes("work act") || type.includes("service act"));
}

function markLinkedJobWaitingSignature(doc) {
  const job = jobs.find((item) => item.id === doc?.jobId);
  if (!job || ["Done", "Cancelled"].includes(job.status)) return;
  job.status = "Waiting signature";
  job.stage = "Waiting signature";
  job.documentStatus = "Waiting signature";
}

function confirmSignedWorkActCompletion(docId, markDone) {
  const doc = documents.find((item) => item.id === docId);
  if (!doc) {
    state.jobCompletionConfirmDocId = null;
    renderAppCallback();
    return;
  }

  if (markDone) {
    markSignedWorkActJobDone(doc);
    state.generationStatus = "Job marked Done from signed Work Act upload.";
  } else {
    markLinkedJobWaitingSignature(doc);
    state.generationStatus = "Signed Work Act uploaded. Job left Waiting signature.";
  }

  state.selectedDocumentId = doc.id;
  state.jobCompletionConfirmDocId = null;
  saveDemoState();
  renderAppCallback();
}

function markSignedWorkActJobDone(doc) {
  const finishedAt = new Date().toISOString();
  doc.pipelineStep = "Approved";
  doc.status = "Done";
  doc.finishedAt = finishedAt;
  doc.caseClosed = true;
  doc.deliveryStatus = "Signed Work Act uploaded";
  addDocumentDeliveryAudit(doc, "Job marked Done", "Signed Work Act uploaded and confirmed as final job proof.", doc.signedFile || doc.uploadedFile || doc.generatedFile);

  const job = jobs.find((item) => item.id === doc.jobId);
  if (!job) return;
  job.status = "Done";
  job.stage = "Done";
  job.documentStatus = "Done";
  job.finishedAt = finishedAt;
  job.closedAt = finishedAt;
  job.closedByDocumentId = doc.id;
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
    job.status = "Done";
    job.stage = "Done";
    job.documentStatus = "Done";
    job.closedAt = finishedAt;
    job.closedByDocumentId = doc.id;
  }

  state.selectedDocumentId = doc.id;
  state.documentUploadOpen = false;
  state.documentUploadTargetId = null;
  state.documentUploadDefaultType = "";
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
      owner: currentUserName(),
      ...creatorMeta(),
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
  state.documentCustomerFilter = getControlValue("doc-customer-filter") || "All";
  state.documentDateQuery = getControlValue("doc-date-query");
  renderAppCallback();
}

function clearDocumentSearch() {
  state.documentSearchQuery = "";
  state.documentTypeFilter = "All";
  state.documentCustomerFilter = "All";
  state.documentDateQuery = "";
  renderAppCallback();
}

function getControlValue(id) {
  return document.getElementById(id)?.value.trim() || "";
}

function dateAfterDays(days) {
  return new Date(Date.now() + days * 864e5).toISOString().slice(0, 10);
}

function ownerForDocumentType(type) {
  if (type === "Quotation") return "Sales";
  if (["Contract", "Contract annex"].includes(type)) return "Contracts";
  if (type === "Invoice") return "Finance";
  if (["Acceptance report", "Warranty confirmation"].includes(type)) return "Admin";
  return "Service";
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
  return "tpl-generic-document";
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

function buildGeneratedFile(doc, template, result, generatedAt, outputFormat = state.documentOutputFormat) {
  const fileRecord = result.fileRecord || null;
  const source = generationSourceForDoc(doc);
  const fileId = fileRecord?.id || result.fileId || "";
  return {
    id: fileId,
    fileId,
    fileName: fileRecord?.fileName || result.fileName || `${doc.id}.${outputFormat}`,
    format: result.format || outputFormat,
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

function syncGeneratedFileToSource(doc, generatedFile, options = {}) {
  const source = generationSourceForDoc(doc);
  const sourceRecord = sourceRecordForDocument(doc);
  if (!sourceRecord) return false;

  let changed = false;
  changed = assignIfChanged(sourceRecord, "generatedDocumentId", doc.id) || changed;
  if (JSON.stringify(sourceRecord.generatedFile || null) !== JSON.stringify(generatedFile || null)) {
    sourceRecord.generatedFile = generatedFile;
    changed = true;
  }
  const nextVersions = upsertGeneratedFileVersion(sourceRecord.generatedFileVersions, generatedFile);
  if (JSON.stringify(sourceRecord.generatedFileVersions || []) !== JSON.stringify(nextVersions)) {
    sourceRecord.generatedFileVersions = nextVersions;
    changed = true;
  }
  changed = assignIfChanged(sourceRecord, "generatedFileId", generatedFile.fileId || generatedFile.id || "") || changed;
  changed = assignIfChanged(sourceRecord, "generatedFileVersion", generatedFile.version || null) || changed;
  changed = assignIfChanged(sourceRecord, "generatedAt", generatedFile.generatedAt) || changed;
  changed = assignIfChanged(sourceRecord, "status", "Generated") || changed;
  if (source.type === "work-act") {
    changed = markWorkActJobWaitingSignature(sourceRecord, doc) || changed;
  }
  if (changed && options.touch !== false) {
    sourceRecord.updatedAt = new Date().toISOString();
  }
  return changed;
}

function markWorkActJobWaitingSignature(workAct, doc) {
  const job = jobs.find((item) => item.id === (workAct?.jobId || doc?.jobId));
  if (!job || ["Done", "Cancelled"].includes(job.status)) return false;

  let changed = false;
  changed = assignIfChanged(job, "status", "Waiting signature") || changed;
  changed = assignIfChanged(job, "stage", "Waiting signature") || changed;
  changed = assignIfChanged(job, "documentStatus", "Waiting signature") || changed;
  changed = assignIfChanged(job, "generatedWorkActDocumentId", doc.id) || changed;
  return changed;
}

function sourceRecordForDocument(doc) {
  const source = generationSourceForDoc(doc);
  const sourceCollections = {
    "work-act": workActs,
    "defect-act": defectActs,
    "commercial-offer": commercialOfferDrafts
  };
  return sourceCollections[source.type]?.find((item) => item.id === source.id) || null;
}

function documentFileAuditNote(file, fallback = "") {
  if (!file?.fileName) return fallback;
  return [file.versionLabel, file.fileName].filter(Boolean).join(" / ");
}

function assignIfChanged(target, key, value) {
  if (!target || target[key] === value) return false;
  target[key] = value;
  return true;
}

function fileRecordHasFile(file) {
  return Boolean(file?.downloadUrl || file?.previewUrl || file?.fileName || file?.id || file?.fileId);
}

function fileRecordIsUsable(file) {
  return Boolean(file?.downloadUrl || file?.previewUrl);
}

function documentHasGeneratedFile(doc) {
  return fileRecordIsUsable(doc?.generatedFile) && doc.generatedFile.source !== "mock";
}

function documentHasUploadedFile(doc) {
  return fileRecordIsUsable(doc?.uploadedFile);
}

function documentHasSignedFile(doc) {
  return Boolean(doc?.signedUploadedAt || fileRecordHasFile(doc?.signedFile));
}

function hasActiveTextSelection() {
  return Boolean(window.getSelection?.().toString().trim());
}

function documentIsWorkflowDone(doc) {
  return Boolean(doc?.finishedAt || doc?.caseClosed || doc?.status === "Done");
}

function autoGenerationIsStale(doc, now = Date.now()) {
  const queuedAt = Date.parse(doc?.autoGenerationQueuedAt || "");
  return !queuedAt || now - queuedAt > AUTO_GENERATION_STALE_MS;
}

function normalizeDocumentWorkflowStates(options = {}) {
  return documents.reduce((changed, doc) => normalizeDocumentWorkflowState(doc, options) || changed, false);
}

function normalizeDocumentWorkflowState(doc, options = {}) {
  if (!doc) return false;

  const now = options.now || Date.now();
  const hasGeneratedFile = documentHasGeneratedFile(doc);
  const hasSignedFile = documentHasSignedFile(doc);
  const hasUploadedFile = documentHasUploadedFile(doc);
  const isDone = documentIsWorkflowDone(doc);
  const isRejected = doc.pipelineStep === "Rejected" || doc.status === "Rejected";
  let changed = false;

  if (
    options.resetAutoGeneration &&
    doc.deliveryStatus === "Auto generating" &&
    !hasGeneratedFile &&
    !hasSignedFile
  ) {
    changed = assignIfChanged(doc, "deliveryStatus", "Generation pending") || changed;
    if (doc.autoGenerationQueuedAt) {
      delete doc.autoGenerationQueuedAt;
      changed = true;
    }
  } else if (
    doc.deliveryStatus === "Auto generating" &&
    !hasGeneratedFile &&
    !hasSignedFile &&
    autoGenerationIsStale(doc, now)
  ) {
    changed = assignIfChanged(doc, "deliveryStatus", "Generation pending") || changed;
    delete doc.autoGenerationQueuedAt;
    changed = true;
  }

  if (isDone) {
    changed = assignIfChanged(doc, "pipelineStep", "Approved") || changed;
    changed = assignIfChanged(doc, "status", "Done") || changed;
    if (!doc.deliveryStatus) {
      changed = assignIfChanged(doc, "deliveryStatus", "Case/ticket closed") || changed;
    }
    return changed;
  }

  if (isRejected) {
    changed = assignIfChanged(doc, "pipelineStep", "Rejected") || changed;
    changed = assignIfChanged(doc, "status", statusByStage.Rejected) || changed;
    return changed;
  }

  if (hasSignedFile) {
    changed = assignIfChanged(doc, "pipelineStep", "Signature") || changed;
    changed = assignIfChanged(doc, "status", statusByStage.Signature) || changed;
    changed = assignIfChanged(doc, "deliveryStatus", "Signed copy uploaded") || changed;
    return changed;
  }

  if (hasGeneratedFile) {
    changed = assignIfChanged(doc, "pipelineStep", "Signature") || changed;
    changed = assignIfChanged(doc, "status", statusByStage.Signature) || changed;
    if (!doc.deliveryStatus || ["Auto generating", "Generation pending", "Generation failed", "Generated", "Not generated"].includes(doc.deliveryStatus)) {
      changed = assignIfChanged(doc, "deliveryStatus", "Needs signed upload") || changed;
    }
    changed = syncGeneratedFileToSource(doc, doc.generatedFile, { touch: false }) || changed;
    return changed;
  }

  if (hasUploadedFile && !doc.deliveryStatus) {
    changed = assignIfChanged(doc, "deliveryStatus", "Uploaded") || changed;
  }

  if (doc.pipelineStep && statusByStage[doc.pipelineStep]) {
    changed = assignIfChanged(doc, "status", statusByStage[doc.pipelineStep]) || changed;
  }

  return changed;
}

export function queueAutoGenerateDocument(id, options = {}) {
  const doc = documents.find((item) => item.id === id);
  if (!doc || queuedAutoGenerationIds.has(id) || !shouldAutoGenerateDocument(doc)) return;

  queuedAutoGenerationIds.add(id);
  doc.deliveryStatus = "Auto generating";
  doc.autoGenerationQueuedAt = new Date().toISOString();
  saveDemoState();
  if (renderAppCallback) renderAppCallback();

  window.setTimeout(() => {
    void generateServiceDocument(id, {
      format: options.format || "pdf",
      silent: true,
      reason: options.reason || "Auto generated"
    }).finally(() => {
      queuedAutoGenerationIds.delete(id);
    });
  }, options.delayMs || 0);
}

function autoGenerateMissingDocumentFiles() {
  documents
    .filter(shouldAutoGenerateDocument)
    .forEach((doc, index) => {
      queueAutoGenerateDocument(doc.id, {
        delayMs: 300 + index * 600,
        reason: "Auto backfilled"
      });
    });
}

function shouldAutoGenerateDocument(doc) {
  if (!doc) return false;
  if (documentHasGeneratedFile(doc) || documentHasUploadedFile(doc) || documentHasSignedFile(doc)) return false;
  if (doc.status === "Done" || doc.pipelineStep === "Rejected" || doc.status === "Rejected") return false;
  if (
    doc.autoGenerationQueuedAt &&
    doc.deliveryStatus === "Auto generating" &&
    !autoGenerationIsStale(doc)
  ) {
    return false;
  }
  return true;
}

async function viewGeneratedDocument(id) {
  const doc = documents.find((item) => item.id === id);
  if (!doc) return;

  const hasReachableGeneratedFile = await documentGeneratedFileIsReachable(doc);
  if (!hasReachableGeneratedFile) {
    if (doc.generatedFile) {
      doc.generatedFile = null;
      state.generatedDocPreview = null;
    }
    await generateServiceDocument(id, {
      format: "pdf",
      reason: "Generated for preview"
    });
  }

  openDocumentPrintPreview(id);
}

async function documentGeneratedFileIsReachable(doc) {
  if (!documentHasGeneratedFile(doc)) return false;
  const fileId = doc.generatedFile.fileId || doc.generatedFile.id || doc.generatedFile.fileRecord?.id || "";
  if (!fileId) return false;

  try {
    const response = await fetch("/api/documents/files", {
      cache: "no-store",
      headers: { "X-VM-Role": state.role }
    });
    const result = await readJsonResponse(response, "File registry check failed");
    if (!response.ok || !result.ok || !Array.isArray(result.files)) return false;
    return result.files.some((file) => file.id === fileId);
  } catch {
    return false;
  }
}

async function generateServiceDocument(id, options = {}) {
  const doc = documents.find((item) => item.id === id);
  const template = generationTemplateForDocument(doc);
  if (!doc || !template) return;

  const outputFormat = options.format || state.documentOutputFormat;
  state.selectedDocumentId = doc.id;
  state.selectedTemplateId = template.id;
  state.generationStatus = options.silent ? "Auto generating document" : "Document service working";
  state.generatedDocPreview = null;
  if (!options.silent) renderAppCallback();

  try {
    const response = await fetch("/api/documents/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(documentServicePayload(doc, template, outputFormat))
    });
    const result = await readJsonResponse(response, "Document generation failed");
    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Document service failed.");
    }

    const generatedAt = new Date().toISOString();
    const generatedFile = buildGeneratedFile(doc, template, result, generatedAt, outputFormat);
    state.generationStatus = `${outputFormat.toUpperCase()} service file ready${generatedFile.versionLabel ? ` (${generatedFile.versionLabel})` : ""}`;
    state.generatedDocPreview = {
      docId: doc.id,
      templateId: template.id,
      format: outputFormat,
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
    delete doc.autoGenerationQueuedAt;
    syncGeneratedFileToSource(doc, generatedFile);
    addDocumentDeliveryAudit(doc, options.reason || "Generated", `${outputFormat.toUpperCase()} file generated: ${documentFileAuditNote(generatedFile, generatedFile.fileName)}`, generatedFile);
  } catch (error) {
    state.generationStatus = "Document service unavailable";
    state.generatedDocPreview = {
      docId: doc.id,
      templateId: template.id,
      format: outputFormat,
      generatedAt: new Date().toISOString(),
      serviceError: error.message || "Document service unavailable."
    };
    doc.deliveryStatus = "Generation failed";
    delete doc.autoGenerationQueuedAt;
    addDocumentDeliveryAudit(doc, "Generation failed", state.generatedDocPreview.serviceError);
  }

  saveDemoState();
  renderAppCallback();
}

function openDocumentPrintPreview(id) {
  const doc = documents.find((item) => item.id === id);
  if (!doc) return;
  const generatedFile = documentHasGeneratedFile(doc) ? doc.generatedFile : null;

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
  window.setTimeout(() => {
    document.querySelector("[data-doc-preview-close]")?.focus();
  }, 0);
}

function closeDocumentPrintPreview() {
  const previousDocId = state.printPreviewDocumentId;
  state.printPreviewOpen = false;
  state.printPreviewExportOpen = false;
  state.printPreviewEmailOpen = false;
  state.printPreviewEmailStatus = "";
  renderAppCallback();
  window.setTimeout(() => {
    if (previousDocId) document.querySelector(`[data-doc-view="${escapeCssValue(previousDocId)}"]`)?.focus();
  }, 0);
}

function closeDocumentUploadDialog() {
  state.documentUploadOpen = false;
  state.documentUploadTargetId = null;
  state.documentUploadDefaultType = "";
  state.documentUploadError = "";
  renderAppCallback();
  window.setTimeout(() => {
    document.querySelector("[data-doc-upload-open]")?.focus();
  }, 0);
}

function escapeCssValue(value = "") {
  if (window.CSS?.escape) return window.CSS.escape(String(value));
  return String(value).replace(/["\\]/g, "\\$&");
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
  const generatedFile = documentHasGeneratedFile(doc) ? doc.generatedFile : null;

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
  const generatedFile = documentHasGeneratedFile(doc) ? doc.generatedFile : null;

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

  const sourceRecord = sourceRecordForDocument(doc);
  if (sourceRecord) {
    sourceRecord.deliveryAudit = sourceRecord.deliveryAudit || [];
    sourceRecord.deliveryAudit.unshift({ ...auditEntry, documentId: doc.id });
    sourceRecord.deliveryAudit = sourceRecord.deliveryAudit.slice(0, 8);
    sourceRecord.deliveryStatus = doc.deliveryStatus || action;
    sourceRecord.updatedAt = new Date().toISOString();
  }
}

function documentServicePayload(doc, template, outputFormat = state.documentOutputFormat) {
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
    format: outputFormat,
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
    owner: doc.createdByInitials || doc.createdBy || doc.owner,
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
