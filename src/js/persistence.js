import {
  calendarEvents, commercialOfferDrafts, contracts, customers, defectActs, documents, equipment, invoices,
  jobs, partsRequests, quotations, templates, users, vendorReturns, workActs, workListTemplates
} from "./data.js";
import { state } from "./state.js";

const STORAGE_KEY = "vm-service-is-demo-state-v1";

const collections = {
  calendarEvents,
  commercialOfferDrafts,
  contracts,
  customers,
  defectActs,
  documents,
  equipment,
  invoices,
  jobs,
  partsRequests,
  quotations,
  templates,
  users,
  vendorReturns,
  workActs,
  workListTemplates
};

export function loadPersistedDemoState() {
  const storage = safeStorage();
  if (!storage) return;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return;

    const snapshot = JSON.parse(raw);
    if (snapshot?.state && typeof snapshot.state === "object") {
      Object.assign(state, snapshot.state);
      if (state.page === "templategen") {
        state.page = state.templateGenTab === "work-acts" ? "workacts" : "templates";
      }
      state.feedbackOpen = false;
      state.feedbackSelecting = false;
      state.feedbackAnnotating = false;
      state.feedbackCaptureDataUrl = "";
      state.feedbackScreenshotDataUrl = "";
      state.feedbackCommentDraft = "";
      state.feedbackError = "";
      state.feedbackSavedNotice = "";
      state.feedbackBackendStatus = "";
      state.documentUploadOpen = false;
      state.documentUploadTargetId = null;
      state.documentUploadDefaultType = "";
      state.documentUploadError = "";
      state.jobCompletionConfirmDocId = null;
      state.printPreviewOpen = false;
      state.printPreviewDocumentId = null;
      state.printPreviewPage = 1;
      state.printPreviewZoom = 100;
      state.printPreviewExportOpen = false;
      state.printPreviewEmailOpen = false;
      state.printPreviewEmailStatus = "";
    }

    if (snapshot?.collections && typeof snapshot.collections === "object") {
      Object.entries(collections).forEach(([key, collection]) => {
        if (Array.isArray(snapshot.collections[key])) {
          collection.splice(0, collection.length, ...mergeCollection(collection, snapshot.collections[key]));
        }
      });
    }
    normalizeRetiredModuleDemoLabels();
  } catch (error) {
    console.warn("Could not load persisted demo state.", error);
  }
}

export function saveDemoState() {
  const storage = safeStorage();
  if (!storage) return;

  try {
    const snapshot = {
      version: 1,
      savedAt: new Date().toISOString(),
      state: JSON.parse(JSON.stringify(state)),
      collections: Object.fromEntries(
        Object.entries(collections).map(([key, collection]) => [key, JSON.parse(JSON.stringify(collection))])
      )
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn("Could not persist demo state.", error);
  }
}

function mergeCollection(defaultItems, savedItems) {
  const allItemsHaveIds = [...defaultItems, ...savedItems].every((item) => item && typeof item === "object" && "id" in item);
  if (!allItemsHaveIds) return savedItems;

  const savedById = new Map(savedItems.map((item) => [item.id, item]));
  const defaultIds = new Set(defaultItems.map((item) => item.id));
  const mergedDefaults = defaultItems.map((item) => savedById.has(item.id) ? { ...item, ...savedById.get(item.id) } : item);
  const savedOnly = savedItems.filter((item) => !defaultIds.has(item.id));
  return [...mergedDefaults, ...savedOnly];
}

function normalizeRetiredModuleDemoLabels() {
  jobs.forEach((job) => {
    if (job.stage === "Waiting for quotation") job.stage = "Customer confirmation";
    if (job.stage === "Parts pending") job.stage = "Repair blocked";
  });
  documents.forEach((doc) => {
    if (doc.type === "Service act") doc.type = "Work Act";
  });
  templates.forEach((template) => {
    if (template.id === "tpl-service-act" && template.name === "Service act") {
      template.name = "Work Act";
    }
  });
}

function safeStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
