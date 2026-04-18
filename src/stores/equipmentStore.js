import { reactive } from "vue";
import { customers, equipment, jobs } from "../js/data.js";
import { saveDemoState } from "../js/persistence.js";
import { state } from "../js/state.js";
import { rerenderLegacyApp } from "./shellStore.js";

const EQUIPMENT_TABS = new Set(["system-info", "installation", "hospital-acceptance", "support"]);
const SUPPORT_TABS = new Set(["settings", "emails", "web-links"]);

let copiedLinkTimer = null;
let supportToastTimer = null;

function emptyEditDraft() {
  return {
    manufacturer: "",
    name: "",
    customer: "",
    location: "",
    serial: "",
    partNumber: "",
    idGE: "",
    category: "",
    sellerInvoice: "",
    installedDate: "",
    yearOfManufacture: "",
    warrantyEndManufacturer: "",
    acceptanceDate: "",
    acceptanceInvoice: "",
    warrantyEndHospital: "",
    customWarrantyEnd: "",
    acceptanceCertificateRef: "",
    isDemo: false,
    isOutdated: false,
    supportGroupName: "",
    supportBrandVariant: "none",
    supportEmails: {
      company: "",
      manufacturer: "",
      hospital: ""
    }
  };
}

export const equipmentStoreState = reactive({
  copiedLinkKey: "",
  supportToastMessage: "",
  editDraftEquipmentId: "",
  pendingCreateEquipmentId: "",
  editDraft: emptyEditDraft(),
  draftDirty: false,
  listFilterDraft: {
    query: "",
    customer: "All",
    status: "All",
    support: "All"
  },
  listFilters: {
    query: "",
    customer: "All",
    status: "All",
    support: "All"
  }
});

export function useEquipmentStore() {
  return {
    state: equipmentStoreState,
    applyListFilters,
    cancelEquipmentDraft,
    clearListFilters,
    createEquipment,
    copySupportLink,
    deleteSelectedEquipment,
    ensureEditDraft,
    filteredEquipmentRows,
    hasActiveListFilters,
    saveEquipmentDraft,
    selectEquipment,
    setDraftField,
    setDraftSupportEmail,
    setEquipmentTab,
    setListFilterDraft,
    setSupportTab,
    toggleSupportEnabled
  };
}

function selectedEquipmentById(equipmentId) {
  return equipment.find((item) => item.id === equipmentId) || null;
}

function normalizeSearchText(value) {
  return String(value || "").trim().toLowerCase();
}

function triggerRender() {
  rerenderLegacyApp({ syncRoute: false });
}

function showSupportToast(message, durationMs = 3000) {
  equipmentStoreState.supportToastMessage = message;
  if (supportToastTimer) clearTimeout(supportToastTimer);
  supportToastTimer = window.setTimeout(() => {
    equipmentStoreState.supportToastMessage = "";
    supportToastTimer = null;
  }, durationMs);
}

function draftFromEquipment(record) {
  return {
    manufacturer: record.manufacturer || "",
    name: record.name || "",
    customer: record.customer || "",
    location: record.location || "",
    serial: record.serial || "",
    partNumber: record.partNumber || "",
    idGE: record.idGE || "",
    category: record.category || "",
    sellerInvoice: record.sellerInvoice || "",
    installedDate: record.installedDate || "",
    yearOfManufacture: record.yearOfManufacture || "",
    warrantyEndManufacturer: record.warrantyEndManufacturer || "",
    acceptanceDate: record.acceptanceDate || "",
    acceptanceInvoice: record.acceptanceInvoice || "",
    warrantyEndHospital: record.warrantyEndHospital || "",
    customWarrantyEnd: record.customWarrantyEnd || "",
    acceptanceCertificateRef: record.acceptanceCertificateRef || "",
    isDemo: Boolean(record.isDemo),
    isOutdated: Boolean(record.isOutdated),
    supportGroupName: record.supportGroupName || "",
    supportBrandVariant: record.supportBrandVariant || "none",
    supportEmails: {
      company: record.supportEmails?.company || "",
      manufacturer: record.supportEmails?.manufacturer || "",
      hospital: record.supportEmails?.hospital || ""
    }
  };
}

function loadEditDraft(record) {
  equipmentStoreState.editDraftEquipmentId = record.id;
  equipmentStoreState.editDraft = draftFromEquipment(record);
  equipmentStoreState.draftDirty = false;
}

export function ensureEditDraft(equipmentId = state.selectedEquipmentId) {
  if (!equipmentId) return;
  if (equipmentStoreState.editDraftEquipmentId === equipmentId) return;
  const record = selectedEquipmentById(equipmentId);
  if (!record) return;
  loadEditDraft(record);
}

export function selectEquipment(equipmentId) {
  if (!selectedEquipmentById(equipmentId)) return;
  state.selectedEquipmentId = equipmentId;
  state.equipmentTab = "system-info";
  ensureEditDraft(equipmentId);
  triggerRender();
}

export function setEquipmentTab(tabId) {
  if (!EQUIPMENT_TABS.has(tabId)) return;
  state.equipmentTab = tabId;
  triggerRender();
}

export function setSupportTab(tabId) {
  if (!SUPPORT_TABS.has(tabId)) return;
  state.supportSubTab = tabId;
  triggerRender();
}

export function toggleSupportEnabled(equipmentId, enabled) {
  const record = selectedEquipmentById(equipmentId);
  if (!record) return;
  record.supportEnabled = Boolean(enabled);
  saveDemoState();
  triggerRender();
}

export async function copySupportLink(linkKey, url) {
  if (!url) return;
  try {
    await navigator.clipboard.writeText(url);
    equipmentStoreState.copiedLinkKey = linkKey;
    if (copiedLinkTimer) clearTimeout(copiedLinkTimer);
    copiedLinkTimer = window.setTimeout(() => {
      equipmentStoreState.copiedLinkKey = "";
      copiedLinkTimer = null;
    }, 1500);
  } catch {
    showSupportToast("Could not copy support URL.", 2200);
  }
}

function nextEquipmentId() {
  const maxId = equipment.reduce((maxValue, item) => {
    const match = String(item.id || "").match(/^EQ-(\d+)$/);
    if (!match) return maxValue;
    return Math.max(maxValue, Number(match[1]));
  }, 500);
  return `EQ-${maxId + 1}`;
}

function matchesJobToEquipmentSnapshot(job, snapshot) {
  const snapshotId = String(snapshot.id || "").trim();
  const snapshotSerial = normalizeSearchText(snapshot.serial);
  const snapshotName = normalizeSearchText(snapshot.name);
  const snapshotCustomer = normalizeSearchText(snapshot.customer);
  const snapshotCustomerId = String(snapshot.customerId || "").trim();
  const jobCustomer = normalizeSearchText(job.customer);
  const customerMatches = (
    (snapshotCustomerId && String(job.customerId || "").trim() === snapshotCustomerId)
    || (!snapshotCustomerId && snapshotCustomer && jobCustomer === snapshotCustomer)
    || (!snapshotCustomer && !snapshotCustomerId)
  );

  if (snapshotId && String(job.equipmentId || "").trim() === snapshotId) return true;
  if (!customerMatches) return false;
  if (snapshotSerial && normalizeSearchText(job.serial) === snapshotSerial) return true;
  if (snapshotName && normalizeSearchText(job.equipment) === snapshotName) return true;
  return false;
}

function syncLinkedJobs(record, previousSnapshot) {
  jobs.forEach((job) => {
    const alreadyLinked = String(job.equipmentId || "").trim() === record.id;
    if (!alreadyLinked && !matchesJobToEquipmentSnapshot(job, previousSnapshot)) return;
    job.equipmentId = record.id;
    if (record.name) job.equipment = record.name;
    if (record.serial) job.serial = record.serial;
    if (record.customer) job.customer = record.customer;
    if (record.customerId) job.customerId = record.customerId;
  });
}

export function createEquipment() {
  const selectedRecord = selectedEquipmentById(state.selectedEquipmentId);
  const equipmentId = nextEquipmentId();
  const today = new Date().toISOString().slice(0, 10);
  const created = {
    id: equipmentId,
    name: "New system",
    manufacturer: "",
    category: "",
    customer: selectedRecord?.customer || "",
    customerId: selectedRecord?.customerId || "",
    serial: "",
    partNumber: "",
    idGE: "",
    location: "",
    installedDate: today,
    yearOfManufacture: String(new Date().getFullYear()),
    sellerInvoice: "",
    warrantyEndManufacturer: "",
    warrantyEndHospital: "",
    acceptanceDate: "",
    acceptanceInvoice: "",
    customWarrantyEnd: "",
    acceptanceCertificateRef: "",
    status: "Active",
    isDemo: false,
    isOutdated: false,
    supportEnabled: false,
    supportGroupName: "",
    supportBrandVariant: "none",
    supportEmails: {
      company: "service@vivamedical.lt",
      manufacturer: "",
      hospital: ""
    },
    webLinks: {
      system: "",
      hospital: "",
      group: ""
    }
  };

  equipment.unshift(created);
  state.selectedEquipmentId = equipmentId;
  state.equipmentTab = "system-info";
  state.supportSubTab = "settings";
  equipmentStoreState.pendingCreateEquipmentId = equipmentId;
  clearListFilters();
  loadEditDraft(created);
  equipmentStoreState.draftDirty = true;
  showSupportToast(`Created ${equipmentId}. Fill in details and click Save.`);
  triggerRender();
}

function clearDraftState() {
  equipmentStoreState.editDraftEquipmentId = "";
  equipmentStoreState.editDraft = emptyEditDraft();
  equipmentStoreState.draftDirty = false;
}

function discardPendingCreatedEquipment() {
  const pendingId = equipmentStoreState.pendingCreateEquipmentId;
  if (!pendingId) return false;
  const index = equipment.findIndex((item) => item.id === pendingId);
  if (index < 0) {
    equipmentStoreState.pendingCreateEquipmentId = "";
    return false;
  }

  equipment.splice(index, 1);
  equipmentStoreState.pendingCreateEquipmentId = "";
  return true;
}

function selectFallbackEquipment(preferredIndex = 0) {
  if (!equipment.length) {
    state.selectedEquipmentId = "";
    clearDraftState();
    return;
  }

  const safeIndex = Math.min(Math.max(preferredIndex, 0), equipment.length - 1);
  const nextRecord = equipment[safeIndex];
  state.selectedEquipmentId = nextRecord.id;
  state.equipmentTab = "system-info";
  state.supportSubTab = "settings";
  loadEditDraft(nextRecord);
}

export function cancelEquipmentDraft() {
  const pendingId = equipmentStoreState.pendingCreateEquipmentId;
  if (pendingId && equipmentStoreState.editDraftEquipmentId === pendingId) {
    const pendingIndex = equipment.findIndex((item) => item.id === pendingId);
    const discarded = discardPendingCreatedEquipment();
    if (discarded) {
      selectFallbackEquipment(pendingIndex);
      saveDemoState();
      showSupportToast("New system creation cancelled.");
      triggerRender();
    }
    return;
  }

  const record = selectedEquipmentById(state.selectedEquipmentId);
  if (!record) {
    clearDraftState();
    triggerRender();
    return;
  }

  loadEditDraft(record);
  showSupportToast(`Changes for ${record.id} discarded.`, 2000);
  triggerRender();
}

export function deleteSelectedEquipment() {
  const record = selectedEquipmentById(state.selectedEquipmentId);
  if (!record) return;

  const shouldDelete = window.confirm(`Delete equipment ${record.id}?`);
  if (!shouldDelete) return;

  const index = equipment.findIndex((item) => item.id === record.id);
  if (index < 0) return;

  equipment.splice(index, 1);
  if (equipmentStoreState.pendingCreateEquipmentId === record.id) {
    equipmentStoreState.pendingCreateEquipmentId = "";
  }

  selectFallbackEquipment(index);
  syncSelectedEquipmentToFilters();
  saveDemoState();
  showSupportToast(`Equipment ${record.id} deleted.`);
  triggerRender();
}

export function setListFilterDraft(key, value) {
  if (!Object.prototype.hasOwnProperty.call(equipmentStoreState.listFilterDraft, key)) return;
  equipmentStoreState.listFilterDraft[key] = value;
}

export function applyListFilters() {
  equipmentStoreState.listFilters = {
    ...equipmentStoreState.listFilterDraft
  };
  syncSelectedEquipmentToFilters();
  triggerRender();
}

export function clearListFilters() {
  equipmentStoreState.listFilterDraft = {
    query: "",
    customer: "All",
    status: "All",
    support: "All"
  };
  equipmentStoreState.listFilters = {
    ...equipmentStoreState.listFilterDraft
  };
  syncSelectedEquipmentToFilters();
  triggerRender();
}

export function hasActiveListFilters() {
  const filters = equipmentStoreState.listFilters;
  return Boolean(
    normalizeSearchText(filters.query)
    || (filters.customer && filters.customer !== "All")
    || (filters.status && filters.status !== "All")
    || (filters.support && filters.support !== "All")
  );
}

export function filteredEquipmentRows() {
  const filters = equipmentStoreState.listFilters;
  const query = normalizeSearchText(filters.query);
  const queryTokens = query.split(/\s+/).filter(Boolean);
  const customer = filters.customer || "All";
  const status = filters.status || "All";
  const support = filters.support || "All";

  return equipment.filter((record) => {
    if (customer !== "All" && record.customer !== customer) return false;
    if (status !== "All" && record.status !== status) return false;
    if (support === "Enabled" && !record.supportEnabled) return false;
    if (support === "Disabled" && record.supportEnabled) return false;
    if (!queryTokens.length) return true;

    const haystack = [
      record.id,
      record.name,
      record.manufacturer,
      record.customer,
      record.customerId,
      record.serial,
      record.partNumber,
      record.idGE,
      record.location,
      record.category,
      record.status,
      record.supportGroupName,
      record.isDemo ? "demo demo-system wrench" : "",
      record.isOutdated ? "outdated unused uninstalled legacy" : ""
    ].map((value) => normalizeSearchText(value)).join(" ");

    return queryTokens.every((token) => haystack.includes(token));
  });
}

function syncSelectedEquipmentToFilters() {
  const rows = filteredEquipmentRows();
  if (!rows.length) return;
  if (rows.some((row) => row.id === state.selectedEquipmentId)) return;
  state.selectedEquipmentId = rows[0].id;
  ensureEditDraft(rows[0].id);
}

export function setDraftField(fieldName, value) {
  ensureEditDraft();
  if (!Object.prototype.hasOwnProperty.call(equipmentStoreState.editDraft, fieldName)) return;
  equipmentStoreState.editDraft[fieldName] = value;
  equipmentStoreState.draftDirty = true;
}

export function setDraftSupportEmail(fieldName, value) {
  ensureEditDraft();
  if (!Object.prototype.hasOwnProperty.call(equipmentStoreState.editDraft.supportEmails, fieldName)) return;
  equipmentStoreState.editDraft.supportEmails[fieldName] = value;
  equipmentStoreState.draftDirty = true;
}

export function saveEquipmentDraft() {
  const equipmentId = equipmentStoreState.editDraftEquipmentId || state.selectedEquipmentId;
  const record = selectedEquipmentById(equipmentId);
  if (!record) return;

  const draft = equipmentStoreState.editDraft;
  const normalize = (value) => String(value || "").trim();
  const previousSnapshot = {
    id: record.id,
    name: record.name,
    serial: record.serial,
    customer: record.customer,
    customerId: record.customerId
  };
  const customerName = normalize(draft.customer);
  const matchedCustomer = customers.find((item) => String(item.name || "").toLowerCase() === customerName.toLowerCase());

  record.manufacturer = normalize(draft.manufacturer);
  record.name = normalize(draft.name);
  record.customer = customerName;
  record.customerId = matchedCustomer?.id || "";
  record.location = normalize(draft.location);
  record.serial = normalize(draft.serial);
  record.partNumber = normalize(draft.partNumber);
  record.idGE = normalize(draft.idGE);
  record.category = normalize(draft.category);
  record.sellerInvoice = normalize(draft.sellerInvoice);
  record.installedDate = normalize(draft.installedDate);
  record.yearOfManufacture = normalize(draft.yearOfManufacture);
  record.warrantyEndManufacturer = normalize(draft.warrantyEndManufacturer);
  record.acceptanceDate = normalize(draft.acceptanceDate);
  record.acceptanceInvoice = normalize(draft.acceptanceInvoice);
  record.warrantyEndHospital = normalize(draft.warrantyEndHospital);
  record.customWarrantyEnd = normalize(draft.customWarrantyEnd);
  record.acceptanceCertificateRef = normalize(draft.acceptanceCertificateRef);
  record.isDemo = Boolean(draft.isDemo);
  record.isOutdated = Boolean(draft.isOutdated);
  record.supportGroupName = normalize(draft.supportGroupName);
  record.supportBrandVariant = normalize(draft.supportBrandVariant) || "none";
  record.supportEmails = {
    company: normalize(draft.supportEmails.company),
    manufacturer: normalize(draft.supportEmails.manufacturer),
    hospital: normalize(draft.supportEmails.hospital)
  };
  syncLinkedJobs(record, previousSnapshot);

  equipmentStoreState.pendingCreateEquipmentId = "";
  equipmentStoreState.draftDirty = false;
  saveDemoState();
  showSupportToast(`System ${record.id} saved.`);
  triggerRender();
}
