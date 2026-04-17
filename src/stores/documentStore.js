import { reactive } from "vue";
import { documents } from "../js/data.js";
import { saveDemoState } from "../js/persistence.js";
import { state } from "../js/state.js";
import { listGeneratedDocumentRecords } from "../services/documentService.js";

export const documentStoreState = reactive({
  loadingGenerated: false,
  generatedError: "",
  generatedLoadedAt: "",
  generatedSyncCount: 0
});

export function useDocumentStore() {
  return {
    state: documentStoreState,
    loadGeneratedDocuments,
    upsertGeneratedDocumentRecord,
    upsertGeneratedDocumentRecords
  };
}

export async function loadGeneratedDocuments(options = {}) {
  documentStoreState.loadingGenerated = true;
  documentStoreState.generatedError = "";

  try {
    const result = await listGeneratedDocumentRecords({ limit: options.limit || 1000 });
    const syncedCount = upsertGeneratedDocumentRecords(result.documents, { persist: false });
    documentStoreState.generatedLoadedAt = new Date().toISOString();
    documentStoreState.generatedSyncCount = syncedCount;
    saveDemoState();
    return result.documents;
  } catch (error) {
    documentStoreState.generatedError = error.message || "Generated documents could not be loaded.";
    return [];
  } finally {
    documentStoreState.loadingGenerated = false;
  }
}

export function upsertGeneratedDocumentRecords(records = [], options = {}) {
  const before = JSON.stringify(documents);
  records.forEach((record) => upsertGeneratedDocumentRecord(record, { persist: false, select: false }));
  const changed = before !== JSON.stringify(documents);
  if (changed && options.persist !== false) saveDemoState();
  return Array.isArray(records) ? records.length : 0;
}

export function upsertGeneratedDocumentRecord(record, options = {}) {
  const normalised = normaliseGeneratedDocumentRecord(record);
  if (!normalised) return null;

  const index = documents.findIndex((doc) => doc.id === normalised.id);
  if (index >= 0) {
    documents[index] = mergeDocumentRecord(documents[index], normalised);
  } else {
    documents.unshift(normalised);
  }

  if (options.select !== false) state.selectedDocumentId = normalised.id;
  if (options.persist !== false) saveDemoState();
  return documents.find((doc) => doc.id === normalised.id) || normalised;
}

function mergeDocumentRecord(existing = {}, incoming = {}) {
  const signedState = {
    signedFile: existing.signedFile,
    signedUploadedAt: existing.signedUploadedAt,
    signedBy: existing.signedBy,
    uploaded: existing.uploaded,
    uploadedAt: existing.uploadedAt,
    uploadedFile: existing.uploadedFile
  };
  const generatedFile = normaliseGeneratedFile(incoming.generatedFile || existing.generatedFile);
  const merged = {
    ...existing,
    ...incoming,
    generatedFile,
    generatedFileVersions: mergeGeneratedFileVersions(existing.generatedFileVersions, incoming.generatedFileVersions, generatedFile),
    deliveryAudit: mergeDeliveryAudit(existing.deliveryAudit, incoming.deliveryAudit),
    documentServiceSyncedAt: new Date().toISOString()
  };

  Object.entries(signedState).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") merged[key] = value;
  });

  return merged;
}

function normaliseGeneratedDocumentRecord(record = {}) {
  if (!record || typeof record !== "object" || !record.id) return null;
  const generatedFile = normaliseGeneratedFile(record.generatedFile);
  return {
    ...record,
    id: String(record.id),
    type: String(record.type || "Template document"),
    status: String(record.status || "Signature"),
    pipelineStep: String(record.pipelineStep || "Signature"),
    deliveryStatus: String(record.deliveryStatus || "Needs signed upload"),
    created: String(record.created || record.createdAt || new Date().toISOString()).slice(0, 10),
    createdAt: record.createdAt || new Date().toISOString(),
    generatedFile,
    generatedFileVersions: mergeGeneratedFileVersions([], record.generatedFileVersions, generatedFile),
    documentServiceSyncedAt: new Date().toISOString()
  };
}

function normaliseGeneratedFile(file = {}) {
  if (!file || typeof file !== "object") return null;
  const fileRecord = file.fileRecord && typeof file.fileRecord === "object" ? file.fileRecord : {};
  const fileId = file.fileId || file.id || fileRecord.id || "";
  return {
    ...file,
    id: fileId,
    fileId,
    fileRecord,
    downloadUrl: file.downloadUrl || fileRecord.downloadUrl || "",
    previewUrl: file.previewUrl || fileRecord.previewUrl || "",
    source: file.source || "document-service"
  };
}

function mergeGeneratedFileVersions(existingVersions = [], incomingVersions = [], generatedFile = null) {
  const byKey = new Map();
  [...normaliseArray(incomingVersions), ...normaliseArray(existingVersions)].forEach((file) => {
    const key = fileKey(file);
    if (key && !byKey.has(key)) byKey.set(key, file);
  });
  const generatedKey = fileKey(generatedFile);
  if (generatedKey) byKey.set(generatedKey, generatedFile);
  return Array.from(byKey.values()).slice(0, 12);
}

function mergeDeliveryAudit(existingAudit = [], incomingAudit = []) {
  const byKey = new Map();
  [...normaliseArray(incomingAudit), ...normaliseArray(existingAudit)].forEach((entry) => {
    const key = [
      entry.action || "",
      entry.at || "",
      entry.fileId || "",
      entry.fileName || ""
    ].join("|");
    if (!byKey.has(key)) byKey.set(key, entry);
  });
  return Array.from(byKey.values());
}

function normaliseArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function fileKey(file = {}) {
  return file?.fileId || file?.id || file?.fileName || "";
}
