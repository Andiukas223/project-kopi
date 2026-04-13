import { calendarEvents, customers, defectActs, documentTemplateBlueprints, documents, equipment, jobs, pipelineStages, quotations, templates, workActs } from "./data.js";
import { state } from "./state.js";

const statusByStage = {
  Draft: "Draft",
  Review: "Review",
  Customer: "Customer",
  Signature: "Signature",
  Approved: "Approved",
  Archived: "Archived",
  Rejected: "Rejected"
};

let renderAppCallback = null;

export function bindDocumentPipeline(renderApp) {
  renderAppCallback = renderApp;

  document.addEventListener("click", (event) => {
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

    const advanceButton = event.target.closest("[data-doc-advance]");
    if (advanceButton) {
      advanceDocument(advanceButton.dataset.docAdvance);
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
      state.documentUploadError = "";
      renderAppCallback();
      return;
    }

    const uploadCancelButton = event.target.closest("[data-doc-upload-cancel]");
    if (uploadCancelButton) {
      state.documentUploadOpen = false;
      state.documentUploadError = "";
      renderAppCallback();
      return;
    }

    const uploadSubmitButton = event.target.closest("[data-doc-upload-submit]");
    if (uploadSubmitButton) {
      uploadDocument();
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

function advanceDocument(id) {
  const doc = documents.find((item) => item.id === id);
  if (!doc) return;

  if (doc.pipelineStep === "Rejected") {
    doc.pipelineStep = "Draft";
    doc.status = statusByStage.Draft;
    doc.rejectionResolvedAt = new Date().toISOString();
    state.selectedDocumentId = doc.id;
    state.generationStatus = "Ready";
    state.generatedDocPreview = null;
    state.rejectingDocumentId = null;
    state.documentRejectError = "";
    renderAppCallback();
    return;
  }

  const currentIndex = pipelineStages.indexOf(doc.pipelineStep);
  if (currentIndex < 0 || currentIndex >= pipelineStages.length - 1) return;

  const nextStage = pipelineStages[currentIndex + 1];
  doc.pipelineStep = nextStage;
  doc.status = statusByStage[nextStage];
  state.selectedDocumentId = doc.id;
  state.generationStatus = "Ready";
  state.generatedDocPreview = null;
  state.rejectingDocumentId = null;
  state.documentRejectError = "";
  renderAppCallback();
}

function reviewNextDocument() {
  const nextDoc = documents.find((doc) => doc.pipelineStep !== "Archived") || documents[0];
  if (!nextDoc) return;
  state.selectedDocumentId = nextDoc.id;
  state.documentFilter = "All";
  state.generationStatus = "Ready";
  state.generatedDocPreview = null;
  state.rejectingDocumentId = null;
  state.documentRejectError = "";
  renderAppCallback();
}

function uploadDocument() {
  const type = getUploadValue("doc-upload-type");
  const jobId = getUploadValue("doc-upload-job");
  const customerInput = getUploadValue("doc-upload-customer");
  const signedBy = getUploadValue("doc-upload-signed-by");
  const description = getUploadValue("doc-upload-description");
  const due = getUploadValue("doc-upload-due") || dateAfterDays(7);
  const job = jobs.find((item) => item.id === jobId);
  const customer = customerInput || job?.customer || "";

  if (!type || !jobId || !customer) {
    state.documentUploadError = "Document type, job reference, and customer are required.";
    state.documentUploadOpen = true;
    renderAppCallback();
    return;
  }

  const docId = `DOC-${3108 + documents.length}`;
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
    signedBy: signedBy || "Not recorded",
    description: description || "Uploaded external document"
  };

  syncWarrantyFromAcceptanceUpload(doc, job);
  documents.unshift(doc);

  state.selectedDocumentId = docId;
  state.documentFilter = "All";
  state.documentUploadOpen = false;
  state.documentUploadError = "";
  state.generationStatus = "Ready";
  state.generatedDocPreview = null;
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

async function generateServiceDocument(id) {
  const doc = documents.find((item) => item.id === id);
  const template = templates.find((item) => item.id === state.selectedTemplateId);
  if (!doc || !template) return;

  state.selectedDocumentId = doc.id;
  state.generationStatus = "Document service working";
  state.generatedDocPreview = null;
  renderAppCallback();

  try {
    const response = await fetch("/api/documents/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(documentServicePayload(doc, template))
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Document service failed.");
    }

    state.generationStatus = `${state.documentOutputFormat.toUpperCase()} service file ready`;
    state.generatedDocPreview = {
      docId: doc.id,
      templateId: template.id,
      format: state.documentOutputFormat,
      generatedAt: new Date().toISOString(),
      serviceDownloadUrl: result.downloadUrl,
      serviceFileName: result.fileName
    };
  } catch (error) {
    state.generationStatus = "Document service unavailable";
    state.generatedDocPreview = {
      docId: doc.id,
      templateId: template.id,
      format: state.documentOutputFormat,
      generatedAt: new Date().toISOString(),
      serviceError: error.message || "Document service unavailable."
    };
  }

  renderAppCallback();
}

function documentServicePayload(doc, template) {
  const job = jobs.find((item) => item.id === doc.jobId);
  const eq = equipment.find((item) => item.name === job?.equipment || item.id === job?.equipmentId || item.serial === job?.serial);
  const customer = customers.find((item) => item.name === doc.customer || item.id === job?.customerId);
  const quotation = quotations.find((item) => (
    item.id === doc.quotationId ||
    item.handedOffJobId === doc.jobId ||
    (template.id === "tpl-quotation" && item.customer === doc.customer)
  ));
  const workAct = workActs.find((item) => item.id === doc.workActId);
  const defectAct = defectActs.find((item) => item.id === doc.defectActId);
  const workActEquipment = workAct?.equipmentItems?.length
    ? workAct.equipmentItems.map((item) => `${item.name} / SN ${item.serial || "-"}`).join("; ")
    : "";
  const workActRows = workAct?.workRows?.length
    ? workAct.workRows.map((row) => `${row.number}. ${row.description}${row.completed ? " [done]" : " [open]"}${row.comments ? ` - ${row.comments}` : ""}`).join("\n")
    : "";

  return {
    documentId: doc.id,
    documentType: doc.type,
    templateId: template.id,
    templateName: template.name,
    templateBody: template.body || "",
    templateSections: template.sections || [],
    format: state.documentOutputFormat,
    customer: doc.customer,
    jobId: doc.jobId,
    equipmentItems: workAct?.equipmentItems || [],
    workActRows: workAct?.workRows || [],
    equipment: workActEquipment || defectAct?.equipment || job?.equipment || eq?.name || "",
    serial: workAct?.equipmentItems?.map((item) => item.serial).filter(Boolean).join(", ") || defectAct?.serial || job?.serial || eq?.serial || "",
    owner: doc.owner,
    notes: workAct?.workText || defectAct?.defectDescription || doc.description || quotation?.notes || "",
    fieldsText: [
      customer?.address ? `Customer address: ${customer.address}` : "",
      customer ? `Contact: ${customer.contact} - ${customer.phone}` : "",
      quotation ? `Quotation amount: ${quotation.amount} ${quotation.currency}` : "",
      quotation?.due ? `Valid until: ${quotation.due}` : "",
      workAct ? `Work Act: ${workAct.number}` : "",
      workActEquipment ? `Equipment items: ${workActEquipment}` : "",
      workAct?.workText ? `Work text: ${workAct.workText}` : "",
      workActRows ? `Work rows:\n${workActRows}` : "",
      defectAct ? `Defect Act: ${defectAct.number}` : "",
      defectAct?.defectDescription ? `Defect: ${defectAct.defectDescription}` : "",
      defectAct?.engineerFindings ? `Findings: ${defectAct.engineerFindings}` : "",
      defectAct?.recommendedCorrection ? `Recommended correction: ${defectAct.recommendedCorrection}` : "",
      defectAct?.riskLevel ? `Risk level: ${defectAct.riskLevel}` : "",
      defectAct?.customerAcknowledgement ? `Customer acknowledgement: ${defectAct.customerAcknowledgement}` : "",
      `Pipeline step: ${doc.pipelineStep}`
    ].filter(Boolean).join("\n"),
    fields: {
      customerAddress: customer?.address || "",
      contact: customer ? `${customer.contact} - ${customer.phone}` : "",
      quotationAmount: quotation ? `${quotation.amount} ${quotation.currency}` : "",
      quotationDue: quotation?.due || "",
      defectDescription: defectAct?.defectDescription || doc.description || job?.stage || "",
      engineerFindings: defectAct?.engineerFindings || "",
      recommendedCorrection: defectAct?.recommendedCorrection || "",
      riskLevel: defectAct?.riskLevel || "",
      customerAcknowledgement: defectAct?.customerAcknowledgement || "",
      pipelineStep: doc.pipelineStep,
      workActNumber: workAct?.number || "",
      workActRows: workAct?.workRows || [],
      equipmentItems: workAct?.equipmentItems || []
    }
  };
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
