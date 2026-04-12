// Interactions for Admin, Equipment, Customers, and Parts pages.
// Bound once on app init — delegates via data attributes on the document.

import { customers, documents, equipment, jobs, partsRequests, quotations, users } from "./data.js";
import { renderSupportPortalPreview } from "./render.js";
import { state } from "./state.js";

let renderAppCallback = null;

export function bindInteractions(renderApp) {
  renderAppCallback = renderApp;

  document.addEventListener("click", handleClick);
  document.addEventListener("change", handleChange);
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
  const prRow = event.target.closest("[data-pr-row]");
  if (prRow) {
    state.selectedPartsRequestId = prRow.dataset.prRow;
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
    specifyDelivery(prDeliver.dataset.prDeliver, "Deliver to site");
    return;
  }

  // Parts — pick up at warehouse
  const prPickup = event.target.closest("[data-pr-pickup]");
  if (prPickup) {
    specifyDelivery(prPickup.dataset.prPickup, "Pick up at warehouse");
    return;
  }

  // Sales — select quotation row
  const qteRow = event.target.closest("[data-qte-row]");
  if (qteRow) {
    state.selectedQuotationId = qteRow.dataset.qteRow;
    state.salesTab = "offer";
    renderAppCallback();
    return;
  }

  // Sales — switch detail tab
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
  if (method === "Deliver to site") {
    const eq   = equipment.find((e) => e.name === pr.equipment);
    const cust = customers.find((c) => c.id === eq?.customerId);
    pr.deliveryAddress = cust?.address || "Address to be confirmed";
    pr.deliveryContact = cust ? `${cust.contact} — ${cust.phone}` : "Contact to be confirmed";
  }
  pr.status = method === "Pick up at warehouse" ? "Delivered" : pr.status;
  state.selectedPartsRequestId = prId;
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
