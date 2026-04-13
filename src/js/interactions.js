// Interactions for Admin, Equipment, Customers, and Parts pages.
// Bound once on app init — delegates via data attributes on the document.

import {
  contracts, customers, defectActs, documents, equipment, invoices, jobs, partsRequests, quotations,
  users, vendorReturns, workActs, workListTemplates
} from "./data.js";
import { saveDemoState } from "./persistence.js";
import { renderSupportPortalPreview } from "./render.js";
import { state } from "./state.js";

let renderAppCallback = null;

export function bindInteractions(renderApp) {
  renderAppCallback = renderApp;

  document.addEventListener("click", handleClick);
  document.addEventListener("change", handleChange);
  document.addEventListener("input", handleInput);
}

// ---------------------------------------------------------------------------
// Central click dispatcher
// ---------------------------------------------------------------------------
function handleClick(event) {
  // Admin — select user for permission edit
  const adminUser = event.target.closest("[data-admin-user]");
  if (adminUser) {
    state.adminEditUserId = adminUser.dataset.adminUser;
    renderAppCallback();
    return;
  }

  // Admin — save permission changes (already updated live via change handler)
  const adminSave = event.target.closest("[data-admin-save]");
  if (adminSave) {
    // Changes are applied live; this just gives visual confirmation.
    renderAppCallback();
    return;
  }

  // Equipment — select row
  const eqRow = event.target.closest("[data-eq-row]");
  if (eqRow) {
    state.selectedEquipmentId = eqRow.dataset.eqRow;
    state.equipmentTab = "system-info";
    renderAppCallback();
    return;
  }

  // Equipment — switch main tab
  const eqTab = event.target.closest("[data-eq-tab]");
  if (eqTab) {
    state.equipmentTab = eqTab.dataset.eqTab;
    renderAppCallback();
    return;
  }

  // Equipment — switch support sub-tab
  const supportTab = event.target.closest("[data-support-tab]");
  if (supportTab) {
    state.supportSubTab = supportTab.dataset.supportTab;
    renderAppCallback();
    return;
  }

  // Equipment — copy URL to clipboard
  const templateGenTab = event.target.closest("[data-template-gen-tab]");
  if (templateGenTab) {
    state.templateGenTab = templateGenTab.dataset.templateGenTab;
    renderAppCallback();
    return;
  }

  const outputTemplateRoute = event.target.closest("[data-output-template-route]");
  if (outputTemplateRoute) {
    state.selectedTemplateId = outputTemplateRoute.dataset.outputTemplateRoute;
    state.templateGenTab = "output-templates";
    state.generationStatus = "Ready";
    state.generatedDocPreview = null;
    state.templateEditorError = "";
    renderAppCallback();
    return;
  }

  const copyUrl = event.target.closest("[data-copy-url]");
  if (copyUrl) {
    const [eqId, type] = copyUrl.dataset.copyUrl.split(":");
    const eq = equipment.find((e) => e.id === eqId);
    if (eq && eq.webLinks[type]) {
      navigator.clipboard.writeText(eq.webLinks[type]).catch(() => {});
      copyUrl.textContent = "Copied";
      setTimeout(() => { copyUrl.textContent = "Copy"; }, 1500);
    }
    return;
  }

  // Equipment — open support portal preview modal
  const supportPreview = event.target.closest("[data-support-preview]");
  if (supportPreview) {
    openSupportPreview(supportPreview.dataset.supportPreview);
    return;
  }

  // Support portal preview — close
  const closePreview = event.target.closest("[data-close-support-preview]");
  if (closePreview) {
    closeSupportPreview();
    return;
  }

  // Support portal preview — submit mock case
  const submitCase = event.target.closest("[data-submit-support-case]");
  if (submitCase) {
    submitSupportCase(submitCase.dataset.submitSupportCase);
    return;
  }

  // Customers — select row
  const customerRow = event.target.closest("[data-customer-row]");
  if (customerRow) {
    state.selectedCustomerId = customerRow.dataset.customerRow;
    renderAppCallback();
    return;
  }

  // Parts — select row
  const serviceJobRow = event.target.closest("[data-service-job-row]");
  if (serviceJobRow) {
    state.selectedServiceJobId = serviceJobRow.dataset.serviceJobRow;
    state.workActError = "";
    renderAppCallback();
    return;
  }

  const workActCreate = event.target.closest("[data-work-act-create]");
  if (workActCreate) {
    createWorkActDraft(workActCreate.dataset.workActCreate);
    return;
  }

  const workActApplyTemplate = event.target.closest("[data-work-act-apply-template]");
  if (workActApplyTemplate) {
    applyWorkListTemplate(workActApplyTemplate.dataset.workActApplyTemplate);
    return;
  }

  const workActAddRow = event.target.closest("[data-work-act-add-row]");
  if (workActAddRow) {
    addWorkActRow(workActAddRow.dataset.workActAddRow);
    return;
  }

  const workActEquipmentAdd = event.target.closest("[data-work-act-equipment-add]");
  if (workActEquipmentAdd) {
    addWorkActEquipmentFromSearch(workActEquipmentAdd.dataset.workActEquipmentAdd);
    return;
  }

  const workActEquipmentRemove = event.target.closest("[data-work-act-equipment-remove]");
  if (workActEquipmentRemove) {
    const [actId, eqId] = workActEquipmentRemove.dataset.workActEquipmentRemove.split(":");
    toggleWorkActEquipment(actId, eqId, false);
    return;
  }

  const workActGenerate = event.target.closest("[data-work-act-generate]");
  if (workActGenerate) {
    createWorkActDocumentDraft(workActGenerate.dataset.workActGenerate);
    return;
  }

  const defectActCreate = event.target.closest("[data-defect-act-create]");
  if (defectActCreate) {
    createDefectActDraft(defectActCreate.dataset.defectActCreate);
    return;
  }

  const defectActGenerate = event.target.closest("[data-defect-act-generate]");
  if (defectActGenerate) {
    createDefectActDocumentDraft(defectActGenerate.dataset.defectActGenerate);
    return;
  }

  const prRow = event.target.closest("[data-pr-row]");
  if (prRow) {
    state.selectedPartsRequestId = prRow.dataset.prRow;
    renderAppCallback();
    return;
  }

  const vendorReturnRow = event.target.closest("[data-vendor-return-row]");
  if (vendorReturnRow) {
    state.selectedVendorReturnId = vendorReturnRow.dataset.vendorReturnRow;
    renderAppCallback();
    return;
  }

  // Parts — approve request
  const prApprove = event.target.closest("[data-pr-approve]");
  if (prApprove) {
    updatePartsStatus(prApprove.dataset.prApprove, "Approved", "M. Vaitkus");
    return;
  }

  // Parts — reject request
  const prReject = event.target.closest("[data-pr-reject]");
  if (prReject) {
    updatePartsStatus(prReject.dataset.prReject, "Cancelled");
    return;
  }

  // Parts — mark in transit
  const prTransit = event.target.closest("[data-pr-transit]");
  if (prTransit) {
    updatePartsStatus(prTransit.dataset.prTransit, "In transit");
    return;
  }

  // Parts — mark arrived at warehouse
  const prArrived = event.target.closest("[data-pr-arrived]");
  if (prArrived) {
    updatePartsStatus(prArrived.dataset.prArrived, "Arrived at warehouse");
    return;
  }

  // Parts — specify delivery to site
  const prDeliver = event.target.closest("[data-pr-deliver]");
  if (prDeliver) {
    startDeliveryEdit(prDeliver.dataset.prDeliver);
    return;
  }

  const prDeliverySave = event.target.closest("[data-pr-delivery-save]");
  if (prDeliverySave) {
    saveDelivery(prDeliverySave.dataset.prDeliverySave);
    return;
  }

  if (event.target.closest("[data-pr-delivery-cancel]")) {
    state.deliveryEditRequestId = null;
    state.deliveryEditError = "";
    renderAppCallback();
    return;
  }

  // Parts — pick up at warehouse
  const prPickup = event.target.closest("[data-pr-pickup]");
  if (prPickup) {
    specifyDelivery(prPickup.dataset.prPickup, "Pick up at warehouse");
    return;
  }

  const vendorReturnCreate = event.target.closest("[data-vendor-return-create]");
  if (vendorReturnCreate) {
    createVendorReturn(vendorReturnCreate.dataset.vendorReturnCreate);
    return;
  }

  // Sales — select quotation row
  const qteRow = event.target.closest("[data-qte-row]");
  if (qteRow) {
    state.selectedQuotationId = qteRow.dataset.qteRow;
    state.salesTab = "offer";
    state.newQuotationOpen = false;
    state.newQuotationError = "";
    renderAppCallback();
    return;
  }

  // Sales — switch detail tab
  if (event.target.closest("[data-qte-new]")) {
    state.newQuotationOpen = true;
    state.newQuotationError = "";
    renderAppCallback();
    return;
  }

  if (event.target.closest("[data-qte-create-cancel]")) {
    state.newQuotationOpen = false;
    state.newQuotationError = "";
    renderAppCallback();
    return;
  }

  if (event.target.closest("[data-qte-create]")) {
    createQuotation();
    return;
  }

  const contractRow = event.target.closest("[data-contract-row]");
  if (contractRow) {
    state.selectedContractId = contractRow.dataset.contractRow;
    state.contractEditMode = false;
    state.contractEditError = "";
    renderAppCallback();
    return;
  }

  const contractEdit = event.target.closest("[data-contract-edit]");
  if (contractEdit) {
    state.selectedContractId = contractEdit.dataset.contractEdit;
    state.contractEditMode = true;
    state.contractEditError = "";
    renderAppCallback();
    return;
  }

  if (event.target.closest("[data-contract-cancel]")) {
    state.contractEditMode = false;
    state.contractEditError = "";
    renderAppCallback();
    return;
  }

  const contractSave = event.target.closest("[data-contract-save]");
  if (contractSave) {
    saveContract(contractSave.dataset.contractSave);
    return;
  }

  const salesTab = event.target.closest("[data-sales-tab]");
  if (salesTab) {
    state.salesTab = salesTab.dataset.salesTab;
    renderAppCallback();
    return;
  }

  // Sales — mark sent to customer
  const qteSend = event.target.closest("[data-qte-send]");
  if (qteSend) {
    updateQuotationStatus(qteSend.dataset.qteSend, "Sent");
    return;
  }

  // Sales — mark customer approved
  const qteApprove = event.target.closest("[data-qte-approve]");
  if (qteApprove) {
    const q = quotations.find((x) => x.id === qteApprove.dataset.qteApprove);
    if (q) {
      q.status = "Approved";
      q.approvalDate = new Date().toISOString().slice(0, 10);
      state.salesTab = "handoff";
    }
    renderAppCallback();
    return;
  }

  // Sales — mark rejected
  const qteReject = event.target.closest("[data-qte-reject]");
  if (qteReject) {
    updateQuotationStatus(qteReject.dataset.qteReject, "Rejected");
    return;
  }

  // Sales — hand off to service (creates new job)
  const qteHandoff = event.target.closest("[data-qte-handoff]");
  if (qteHandoff) {
    handoffToService(qteHandoff.dataset.qteHandoff);
    return;
  }

  // Calendar — previous month
  const invRow = event.target.closest("[data-inv-row]");
  if (invRow) {
    state.selectedInvoiceId = invRow.dataset.invRow;
    renderAppCallback();
    return;
  }

  const invGenerate = event.target.closest("[data-inv-generate]");
  if (invGenerate) {
    generateInvoice(invGenerate.dataset.invGenerate);
    return;
  }

  const invPaid = event.target.closest("[data-inv-paid]");
  if (invPaid) {
    updateInvoicePayment(invPaid.dataset.invPaid, "Paid");
    return;
  }

  const invCancelled = event.target.closest("[data-inv-cancelled]");
  if (invCancelled) {
    updateInvoicePayment(invCancelled.dataset.invCancelled, "Cancelled");
    return;
  }

  if (event.target.closest("[data-cal-prev]")) {
    if (state.calendarMonth === 0) {
      state.calendarMonth = 11;
      state.calendarYear -= 1;
    } else {
      state.calendarMonth -= 1;
    }
    renderAppCallback();
    return;
  }

  // Calendar — next month
  if (event.target.closest("[data-cal-next]")) {
    if (state.calendarMonth === 11) {
      state.calendarMonth = 0;
      state.calendarYear += 1;
    } else {
      state.calendarMonth += 1;
    }
    renderAppCallback();
    return;
  }
}

// ---------------------------------------------------------------------------
// Central change dispatcher
// ---------------------------------------------------------------------------
function handleChange(event) {
  // Admin — toggle permission checkbox
  if (event.target.matches("[data-perm]")) {
    const userId = event.target.dataset.user;
    const permId = event.target.dataset.perm;
    const user = users.find((u) => u.id === userId);
    if (user) {
      user.permissions[permId] = event.target.checked;
    }
    return;
  }

  // Admin — toggle role checkbox
  if (event.target.matches("[data-perm-role]")) {
    const roleId = event.target.dataset.permRole;
    const user = users.find((u) => u.id === state.adminEditUserId);
    if (!user) return;
    if (event.target.checked && !user.roles.includes(roleId)) {
      user.roles.push(roleId);
    } else if (!event.target.checked) {
      user.roles = user.roles.filter((r) => r !== roleId);
    }
    renderAppCallback();
    return;
  }

  // Equipment — toggle support enabled
  if (event.target.matches("[data-support-enabled]")) {
    const eqId = event.target.dataset.supportEnabled;
    const eq = equipment.find((e) => e.id === eqId);
    if (eq) {
      eq.supportEnabled = event.target.checked;
      renderAppCallback();
    }
    return;
  }

  // PM schedule — reschedule within the original visit month.
  if (event.target.matches("[data-pm-date]")) {
    reschedulePmVisit(event.target.dataset.pmDate, event.target.dataset.pmOriginal, event.target.value);
    return;
  }

  if (event.target.matches("[data-work-act-equipment]")) {
    const [actId, eqId] = event.target.dataset.workActEquipment.split(":");
    toggleWorkActEquipment(actId, eqId, event.target.checked);
    return;
  }

  if (event.target.matches("[data-work-act-template]")) {
    const act = workActs.find((item) => item.id === event.target.dataset.workActTemplate);
    if (act) {
      act.workTemplateId = event.target.value;
      state.selectedWorkActId = act.id;
      state.workActError = "";
      renderAppCallback();
    }
    return;
  }

  if (event.target.matches("[data-template-work-act-job]")) {
    state.templateGenWorkActJobId = event.target.value;
    state.selectedServiceJobId = event.target.value;
    state.workActError = "";
    renderAppCallback();
    return;
  }

  if (event.target.matches("[data-template-defect-act-job]")) {
    state.templateGenDefectActJobId = event.target.value;
    state.selectedServiceJobId = event.target.value;
    state.defectActError = "";
    renderAppCallback();
    return;
  }

  if (event.target.matches("[data-defect-act-risk]")) {
    updateDefectActField(event.target.dataset.defectActRisk, "riskLevel", event.target.value);
    return;
  }

  if (event.target.matches("[data-work-act-row-completed]")) {
    const [actId, rowId] = event.target.dataset.workActRowCompleted.split(":");
    updateWorkActRow(actId, rowId, { completed: event.target.checked });
    return;
  }
}

function handleInput(event) {
  if (event.target.matches("[data-pm-date]")) {
    reschedulePmVisit(event.target.dataset.pmDate, event.target.dataset.pmOriginal, event.target.value);
    return;
  }

  if (event.target.matches("[data-work-act-text]")) {
    const act = workActs.find((item) => item.id === event.target.dataset.workActText);
    if (act) {
      act.workText = event.target.value;
      state.selectedWorkActId = act.id;
      state.workActError = "";
      saveDemoState();
    }
    return;
  }

  if (event.target.matches("[data-work-act-row-comment]")) {
    const [actId, rowId] = event.target.dataset.workActRowComment.split(":");
    updateWorkActRow(actId, rowId, { comments: event.target.value }, false);
    saveDemoState();
    return;
  }

  if (event.target.matches("[data-work-act-row-description]")) {
    const [actId, rowId] = event.target.dataset.workActRowDescription.split(":");
    updateWorkActRow(actId, rowId, { description: event.target.value }, false);
    saveDemoState();
    return;
  }

  if (event.target.matches("[data-defect-act-field]")) {
    const [actId, field] = event.target.dataset.defectActField.split(":");
    updateDefectActField(actId, field, event.target.value, false);
    saveDemoState();
  }
}

// ---------------------------------------------------------------------------
// Support portal preview helpers
// ---------------------------------------------------------------------------
function openSupportPreview(eqId) {
  // Remove any existing preview
  closeSupportPreview();
  const html = renderSupportPortalPreview(eqId);
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper.firstElementChild);
}

function closeSupportPreview() {
  const existing = document.getElementById("support-preview");
  if (existing) existing.remove();
}

function submitSupportCase(eqId) {
  const eq = equipment.find((e) => e.id === eqId);
  if (!eq) return;

  const contact = document.getElementById("sp-contact")?.value || "Unknown";
  const desc    = document.getElementById("sp-description")?.value || "Fault reported via support portal";

  // Create a new job in memory
  const id = `VM-SV-${1024 + jobs.length}`;
  jobs.unshift({
    id,
    customer: eq.customer,
    equipment: eq.name,
    serial: eq.serial,
    owner: "Unassigned",
    priority: "Normal",
    stage: "New request",
    status: "Open",
    due: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
    documentStatus: "—",
    source: "Support portal",
    sourceContact: contact,
    sourceDescription: desc
  });

  closeSupportPreview();

  // Show brief confirmation, then re-render
  const toast = document.createElement("div");
  toast.className = "support-toast";
  toast.textContent = `Case ${id} created — pending engineer assignment`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);

  state.page = "service";
  renderAppCallback();
}

// ---------------------------------------------------------------------------
// Work Act draft helpers
// ---------------------------------------------------------------------------
function createWorkActDraft(jobId) {
  const job = jobs.find((item) => item.id === jobId);
  if (!job) return;

  const existing = workActs.find((item) => item.jobId === jobId);
  if (existing) {
    state.selectedWorkActId = existing.id;
    state.templateGenWorkActJobId = jobId;
    state.workActError = "";
    renderAppCallback();
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const jobEquipment = equipment.find((item) => item.name === job.equipment || item.serial === job.serial || item.id === job.equipmentId);
  const actId = `WA-${260412 + workActs.length}`;
  workActs.unshift({
    id: actId,
    number: `VM-WA-${String(workActs.length + 1).padStart(4, "0")}`,
    date: today,
    jobId: job.id,
    company: "Viva Medical",
    companyProfile: "Default",
    customer: job.customer,
    type: job.stage?.includes("PM") ? "PM" : "Service",
    status: "Draft",
    source: `Service job ${job.id}`,
    workDescription: job.stage || "Service work",
    equipmentItems: jobEquipment ? [equipmentSnapshot(jobEquipment)] : [],
    workTemplateId: "",
    workText: "",
    workRows: [],
    reportOptions: {
      includePersonName: true,
      includeSignature: true,
      includeWorkingHours: true,
      includeSystemIdentity: true,
      includeSystemName: true,
      equipmentWorking: true,
      readyForUse: false
    },
    generatedDocumentId: null,
    updatedAt: new Date().toISOString()
  });

  state.selectedWorkActId = actId;
  state.templateGenWorkActJobId = jobId;
  state.workActError = "";
  renderAppCallback();
}

function toggleWorkActEquipment(actId, eqId, checked) {
  const act = workActs.find((item) => item.id === actId);
  const eq = equipment.find((item) => item.id === eqId);
  if (!act || !eq) return;

  act.equipmentItems = act.equipmentItems || [];
  if (checked && !act.equipmentItems.some((item) => item.equipmentId === eq.id)) {
    act.equipmentItems.push(equipmentSnapshot(eq));
  }
  if (!checked) {
    act.equipmentItems = act.equipmentItems.filter((item) => item.equipmentId !== eq.id);
  }
  act.updatedAt = new Date().toISOString();
  state.selectedWorkActId = act.id;
  state.workActError = "";
  renderAppCallback();
}

function applyWorkListTemplate(actId) {
  const act = workActs.find((item) => item.id === actId);
  if (!act) return;
  const template = workListTemplates.find((item) => item.id === act.workTemplateId);
  if (!template) {
    state.selectedWorkActId = act.id;
    state.workActError = "Select a Work List Template first.";
    renderAppCallback();
    return;
  }

  act.workText = template.bodyText || act.workText || "";
  act.workRows = template.workRows.map((description, index) => ({
    id: `${act.id}-WR-${index + 1}`,
    number: index + 1,
    description,
    completed: true,
    comments: ""
  }));
  act.updatedAt = new Date().toISOString();
  state.selectedWorkActId = act.id;
  state.workActError = "";
  renderAppCallback();
}

function addWorkActRow(actId) {
  const act = workActs.find((item) => item.id === actId);
  if (!act) return;
  act.workRows = act.workRows || [];
  const nextNumber = act.workRows.length + 1;
  act.workRows.push({
    id: `${act.id}-WR-${Date.now()}`,
    number: nextNumber,
    description: "New work row",
    completed: false,
    comments: ""
  });
  act.updatedAt = new Date().toISOString();
  state.selectedWorkActId = act.id;
  state.workActError = "";
  renderAppCallback();
}

function addWorkActEquipmentFromSearch(actId) {
  const act = workActs.find((item) => item.id === actId);
  if (!act) return;

  const input = Array.from(document.querySelectorAll("[data-work-act-equipment-search]"))
    .find((item) => item.dataset.workActEquipmentSearch === actId);
  const query = input?.value.trim() || "";
  if (!query) {
    state.selectedWorkActId = act.id;
    state.workActError = "Start typing equipment name or serial number first.";
    renderAppCallback();
    return;
  }

  const job = jobs.find((item) => item.id === act.jobId);
  const candidates = job ? workActCandidateEquipment(job) : equipment;
  const normalizedQuery = normalizeSearchText(query);
  const eq = candidates.find((item) =>
    normalizeSearchText(workActEquipmentOptionLabel(item)) === normalizedQuery ||
    normalizeSearchText(item.name) === normalizedQuery ||
    normalizeSearchText(item.serial) === normalizedQuery
  ) || candidates.find((item) => normalizeSearchText(workActEquipmentOptionLabel(item)).includes(normalizedQuery));

  if (!eq) {
    state.selectedWorkActId = act.id;
    state.workActError = "No matching equipment found for this customer/job.";
    renderAppCallback();
    return;
  }

  toggleWorkActEquipment(act.id, eq.id, true);
}

function updateWorkActRow(actId, rowId, patch, shouldRender = true) {
  const act = workActs.find((item) => item.id === actId);
  const row = act?.workRows?.find((item) => item.id === rowId);
  if (!act || !row) return;
  Object.assign(row, patch);
  act.updatedAt = new Date().toISOString();
  state.selectedWorkActId = act.id;
  state.workActError = "";
  if (shouldRender) renderAppCallback();
}

function createWorkActDocumentDraft(actId) {
  const act = workActs.find((item) => item.id === actId);
  if (!act) return;
  if (!act.equipmentItems?.length) {
    state.selectedWorkActId = act.id;
    state.workActError = "Select at least one equipment item.";
    renderAppCallback();
    return;
  }
  if (!act.workRows?.length && !act.workText) {
    state.selectedWorkActId = act.id;
    state.workActError = "Apply a template or add work text / rows before creating the document draft.";
    renderAppCallback();
    return;
  }

  if (!act.generatedDocumentId) {
    const docId = `DOC-${3108 + documents.length}`;
    documents.unshift({
      id: docId,
      type: "Service act",
      jobId: act.jobId,
      customer: act.customer,
      owner: "Service",
      status: "Draft",
      due: act.date,
      pipelineStep: "Draft",
      workActId: act.id
    });
    act.generatedDocumentId = docId;
  }
  act.status = "Document draft";
  act.updatedAt = new Date().toISOString();
  state.selectedDocumentId = act.generatedDocumentId;
  state.selectedWorkActId = act.id;
  state.workActError = "";
  renderAppCallback();
}

function equipmentSnapshot(eq) {
  return {
    equipmentId: eq.id,
    name: eq.name,
    serial: eq.serial,
    category: eq.category,
    location: eq.location,
    customer: eq.customer
  };
}

function workActCandidateEquipment(job) {
  const byCustomer = equipment.filter((eq) => eq.customer === job.customer || eq.customerId === job.customerId);
  const fromJob = equipment.find((eq) => eq.name === job.equipment || eq.serial === job.serial || eq.id === job.equipmentId);
  const merged = [...(fromJob ? [fromJob] : []), ...byCustomer];
  return merged.filter((eq, index, list) => list.findIndex((item) => item.id === eq.id) === index);
}

function workActEquipmentOptionLabel(eq) {
  return `${eq.name} / ${eq.serial || "No serial"} / ${eq.location || eq.category || "Equipment"}`;
}

function normalizeSearchText(value = "") {
  return String(value).trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// Defect Act draft helpers
// ---------------------------------------------------------------------------
function createDefectActDraft(jobId) {
  const job = jobs.find((item) => item.id === jobId);
  if (!job) return;

  const existing = defectActs.find((item) => item.jobId === jobId);
  if (existing) {
    state.selectedDefectActId = existing.id;
    state.templateGenDefectActJobId = jobId;
    state.defectActError = "";
    renderAppCallback();
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const defectId = `DA-${260412 + defectActs.length}`;
  defectActs.unshift({
    id: defectId,
    number: `VM-DA-${String(defectActs.length + 1).padStart(4, "0")}`,
    date: today,
    jobId: job.id,
    customer: job.customer,
    equipment: job.equipment,
    serial: job.serial || "Pending",
    owner: job.owner || "Service",
    status: "Draft",
    source: `Service job ${job.id}`,
    defectDescription: job.stage || "Registered equipment defect.",
    engineerFindings: "",
    recommendedCorrection: "",
    riskLevel: "Medium",
    customerAcknowledgement: "",
    generatedDocumentId: null,
    updatedAt: new Date().toISOString()
  });

  state.selectedDefectActId = defectId;
  state.templateGenDefectActJobId = jobId;
  state.defectActError = "";
  renderAppCallback();
}

function updateDefectActField(actId, field, value, shouldRender = true) {
  const act = defectActs.find((item) => item.id === actId);
  if (!act || !["defectDescription", "engineerFindings", "recommendedCorrection", "riskLevel", "customerAcknowledgement"].includes(field)) return;
  act[field] = value;
  act.updatedAt = new Date().toISOString();
  state.selectedDefectActId = act.id;
  state.defectActError = "";
  if (shouldRender) renderAppCallback();
}

function createDefectActDocumentDraft(actId) {
  const act = defectActs.find((item) => item.id === actId);
  if (!act) return;
  if (!act.defectDescription?.trim()) {
    state.selectedDefectActId = act.id;
    state.defectActError = "Defect description is required.";
    renderAppCallback();
    return;
  }
  if (!act.engineerFindings?.trim() && !act.recommendedCorrection?.trim()) {
    state.selectedDefectActId = act.id;
    state.defectActError = "Add engineer findings or recommended correction before creating the document draft.";
    renderAppCallback();
    return;
  }

  if (!act.generatedDocumentId) {
    const docId = `DOC-${3108 + documents.length}`;
    documents.unshift({
      id: docId,
      type: "Defect act",
      jobId: act.jobId,
      customer: act.customer,
      owner: "Service",
      status: "Draft",
      due: act.date,
      pipelineStep: "Draft",
      defectActId: act.id,
      description: defectActDescription(act)
    });
    act.generatedDocumentId = docId;
  } else {
    const doc = documents.find((item) => item.id === act.generatedDocumentId);
    if (doc) doc.description = defectActDescription(act);
  }

  act.status = "Document draft";
  act.updatedAt = new Date().toISOString();
  state.selectedDocumentId = act.generatedDocumentId;
  state.selectedTemplateId = "tpl-defect-act";
  state.selectedDefectActId = act.id;
  state.defectActError = "";
  renderAppCallback();
}

function defectActDescription(act) {
  return [
    `Defect: ${act.defectDescription || "-"}`,
    `Findings: ${act.engineerFindings || "-"}`,
    `Recommended correction: ${act.recommendedCorrection || "-"}`,
    `Risk: ${act.riskLevel || "-"}`,
    act.customerAcknowledgement ? `Customer acknowledgement: ${act.customerAcknowledgement}` : ""
  ].filter(Boolean).join("\n");
}

// ---------------------------------------------------------------------------
// Parts workflow helpers
// ---------------------------------------------------------------------------
function updatePartsStatus(prId, newStatus, approvedBy = null) {
  const pr = partsRequests.find((r) => r.id === prId);
  if (!pr) return;
  pr.status = newStatus;
  if (approvedBy) pr.approvedBy = approvedBy;
  state.selectedPartsRequestId = prId;
  renderAppCallback();
}

function specifyDelivery(prId, method) {
  const pr = partsRequests.find((r) => r.id === prId);
  if (!pr) return;
  pr.delivery = method;
  if (method === "Deliver to site" && !pr.deliveryAddress) applyRegistryDeliveryDefaults(pr);
  pr.status = method === "Pick up at warehouse" ? "Delivered" : pr.status;
  state.deliveryEditRequestId = null;
  state.deliveryEditError = "";
  state.selectedPartsRequestId = prId;
  renderAppCallback();
}

function startDeliveryEdit(prId) {
  const pr = partsRequests.find((r) => r.id === prId);
  if (!pr) return;
  state.selectedPartsRequestId = prId;
  state.deliveryEditRequestId = prId;
  state.deliveryEditError = "";
  renderAppCallback();
}

function saveDelivery(prId) {
  const pr = partsRequests.find((r) => r.id === prId);
  if (!pr) return;

  const address = document.getElementById(`pr-delivery-address-${prId}`)?.value.trim() || "";
  const contact = document.getElementById(`pr-delivery-contact-${prId}`)?.value.trim() || "";

  if (!address || !contact) {
    state.deliveryEditRequestId = prId;
    state.deliveryEditError = "Delivery address and contact are required.";
    renderAppCallback();
    return;
  }

  pr.delivery = "Deliver to site";
  pr.deliveryAddress = address;
  pr.deliveryContact = contact;
  state.selectedPartsRequestId = prId;
  state.deliveryEditRequestId = null;
  state.deliveryEditError = "";
  renderAppCallback();
}

function applyRegistryDeliveryDefaults(pr) {
  const cust = customerForPartsRequest(pr);
  pr.deliveryAddress = cust?.address || "Address to be confirmed";
  pr.deliveryContact = cust ? `${cust.contact} - ${cust.phone}` : "Contact to be confirmed";
}

function customerForPartsRequest(pr) {
  const job = jobs.find((item) => item.id === pr.jobId);
  const eq = equipment.find((item) => item.name === pr.equipment || item.id === job?.equipmentId || item.serial === job?.serial);
  return customers.find((customer) =>
    customer.id === eq?.customerId ||
    customer.name === job?.customer ||
    customer.name === eq?.customer
  );
}

function createVendorReturn(prId) {
  const pr = partsRequests.find((r) => r.id === prId);
  if (!pr) return;

  const existing = vendorReturns.find((vr) => vr.partsRequestId === prId);
  if (existing) {
    state.selectedVendorReturnId = existing.id;
    renderAppCallback();
    return;
  }

  const job = jobs.find((item) => item.id === pr.jobId);
  const id = `VR-${301 + vendorReturns.length}`;
  vendorReturns.unshift({
    id,
    partsRequestId: pr.id,
    jobId: pr.jobId,
    customer: job?.customer || "Customer to confirm",
    equipment: pr.equipment,
    part: pr.part,
    partNumber: pr.partNumber,
    status: "Open",
    owner: "T. Gruodis",
    destination: "Bad-parts collection",
    created: new Date().toISOString().slice(0, 10),
    notes: `Repair exchange return created from ${pr.id}.`
  });

  pr.vendorReturnId = id;
  state.selectedPartsRequestId = prId;
  state.selectedVendorReturnId = id;
  renderAppCallback();
}

// ---------------------------------------------------------------------------
// Sales workflow helpers
// ---------------------------------------------------------------------------
function updateQuotationStatus(qteId, newStatus) {
  const q = quotations.find((x) => x.id === qteId);
  if (!q) return;
  q.status = newStatus;
  renderAppCallback();
}

function createQuotation() {
  const customer = document.getElementById("qte-new-customer")?.value.trim() || "";
  const equipment = document.getElementById("qte-new-equipment")?.value.trim() || "";
  const type = document.getElementById("qte-new-type")?.value || "Repair";
  const amountRaw = document.getElementById("qte-new-amount")?.value || "";
  const amount = Number(amountRaw);
  const due = document.getElementById("qte-new-due")?.value || new Date(Date.now() + 10 * 864e5).toISOString().slice(0, 10);
  const notes = document.getElementById("qte-new-notes")?.value.trim() || "New quotation draft.";

  if (!customer || !equipment || !Number.isFinite(amount) || amount <= 0) {
    state.newQuotationError = "Customer, equipment, and positive amount are required.";
    state.newQuotationOpen = true;
    renderAppCallback();
    return;
  }

  const id = `QTE-${501 + quotations.length}`;
  quotations.unshift({
    id,
    customer,
    customerId: null,
    equipment,
    equipmentId: null,
    type,
    amount,
    currency: "EUR",
    status: "Draft",
    created: new Date().toISOString().slice(0, 10),
    due,
    owner: "V. Klimaite",
    notes,
    approvalDate: null,
    approvalContact: "Pending contact",
    contractScope: type === "PM Contract" ? notes : "",
    warrantyStart: "",
    warrantyEnd: "",
    pmPerYear: type === "PM Contract" ? 2 : 0,
    contractId: null,
    handedOffJobId: null
  });

  state.selectedQuotationId = id;
  state.salesTab = "offer";
  state.newQuotationOpen = false;
  state.newQuotationError = "";
  renderAppCallback();
}

function saveContract(contractId) {
  const ct = contracts.find((item) => item.id === contractId);
  if (!ct) return;

  const type = document.getElementById("ct-edit-type")?.value || ct.type;
  const status = document.getElementById("ct-edit-status")?.value || ct.status;
  const value = Number(document.getElementById("ct-edit-value")?.value || "");
  const consumed = Number(document.getElementById("ct-edit-consumed")?.value || "");
  const start = document.getElementById("ct-edit-start")?.value || "";
  const end = document.getElementById("ct-edit-end")?.value || "";
  const pmPerYear = Number(document.getElementById("ct-edit-pm")?.value || "0");
  const notes = document.getElementById("ct-edit-notes")?.value.trim() || "";

  if (!Number.isFinite(value) || value <= 0 || !Number.isFinite(consumed) || consumed < 0 || !Number.isFinite(pmPerYear) || pmPerYear < 0 || !start || !end) {
    state.contractEditError = "Value, consumed amount, PM visits, start and end dates are required.";
    state.contractEditMode = true;
    renderAppCallback();
    return;
  }

  if (consumed > value) {
    state.contractEditError = "Consumed amount cannot exceed contract value.";
    state.contractEditMode = true;
    renderAppCallback();
    return;
  }

  if (end < start) {
    state.contractEditError = "Contract end date must be after the start date.";
    state.contractEditMode = true;
    renderAppCallback();
    return;
  }

  ct.type = type;
  ct.status = status;
  ct.value = value;
  ct.consumed = consumed;
  ct.remaining = value - consumed;
  ct.start = start;
  ct.end = end;
  ct.pmPerYear = Math.floor(pmPerYear);
  ct.notes = notes || "No notes yet.";

  state.selectedContractId = contractId;
  state.contractEditMode = false;
  state.contractEditError = "";
  renderAppCallback();
}

function handoffToService(qteId) {
  const q = quotations.find((x) => x.id === qteId);
  if (!q || q.status !== "Approved") return;

  const jobId = `VM-SV-${1024 + jobs.length}`;
  jobs.unshift({
    id:             jobId,
    customer:       q.customer,
    equipment:      q.equipment,
    serial:         "Pending",
    owner:          "Unassigned",
    priority:       "Normal",
    stage:          q.type === "Installation" ? "New installation" : "New request",
    status:         "Open",
    due:            q.due,
    documentStatus: "—",
    source:         `Quotation ${q.id}`
  });

  documents.unshift({
    id:           `DOC-${3108 + documents.length}`,
    type:         q.type === "PM Contract" ? "PM contract"
                : q.type === "Installation" ? "Acceptance report"
                : "Service act",
    jobId,
    customer:     q.customer,
    owner:        "Service",
    status:       "Draft",
    due:          q.due,
    pipelineStep: "Draft"
  });

  q.status         = "Handed off";
  q.handedOffJobId = jobId;
  state.salesTab   = "handoff";
  renderAppCallback();
}

function generateInvoice(invoiceId) {
  const inv = invoices.find((item) => item.id === invoiceId);
  if (!inv) return;

  ensureInvoiceDocument(inv);
  inv.status = "Generated";
  inv.paymentStatus = inv.paymentStatus === "Cancelled" ? "Pending" : inv.paymentStatus;
  inv.generatedAt = new Date().toISOString().slice(0, 10);
  inv.invoiceNo = inv.invoiceNo || `VM-${new Date().getFullYear()}-${String(invoices.indexOf(inv) + 1).padStart(4, "0")}`;
  state.selectedInvoiceId = inv.id;
  renderAppCallback();
}

function updateInvoicePayment(invoiceId, paymentStatus) {
  const inv = invoices.find((item) => item.id === invoiceId);
  if (!inv) return;
  inv.paymentStatus = paymentStatus;
  if (paymentStatus === "Cancelled") {
    inv.status = "Cancelled";
  } else if (paymentStatus === "Paid" && inv.status !== "Generated") {
    ensureInvoiceDocument(inv);
    inv.status = "Generated";
    inv.generatedAt = inv.generatedAt || new Date().toISOString().slice(0, 10);
    inv.invoiceNo = inv.invoiceNo || `VM-${new Date().getFullYear()}-${String(invoices.indexOf(inv) + 1).padStart(4, "0")}`;
  }
  state.selectedInvoiceId = inv.id;
  renderAppCallback();
}

function ensureInvoiceDocument(inv) {
  if (inv.documentId) return;
  const docId = `DOC-${3108 + documents.length}`;
  documents.unshift({
    id:           docId,
    type:         "Invoice",
    jobId:        inv.jobId,
    customer:     inv.customer,
    owner:        "Finance",
    status:       "Draft",
    due:          inv.due,
    pipelineStep: "Draft"
  });
  inv.documentId = docId;
}

function reschedulePmVisit(pmId, originalDate, newDate) {
  if (!pmId || !originalDate || !newDate) return;
  if (newDate.slice(0, 7) !== originalDate.slice(0, 7)) {
    state.pmRescheduleErrors[pmId] = "Move within the same month only.";
    renderAppCallback();
    return;
  }
  state.pmDateOverrides[pmId] = newDate;
  delete state.pmRescheduleErrors[pmId];
  renderAppCallback();
}
