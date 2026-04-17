import { reactive } from "vue";
import { workListTemplates } from "../js/data.js";
import { saveDemoState } from "../js/persistence.js";
import { state } from "../js/state.js";
import {
  archiveTemplateRecord,
  createTemplateRecord,
  generateTemplateDocument,
  listTemplateRecords,
  updateTemplateRecord
} from "../services/templateService.js";
import {
  defaultTemplateHtml,
  normaliseMergeFields,
  syncTemplateRecordsToWorkListTemplates,
  templateRecordToWorkListTemplate,
  workListTemplateToTemplateRecord
} from "../modules/templates/templateRecordAdapter.js";
import { upsertGeneratedDocumentRecord } from "./documentStore.js";

export const templateStoreState = reactive({
  records: [],
  loading: false,
  saving: false,
  error: "",
  generationError: "",
  generating: false,
  lastGeneratedDocument: null,
  lastSavedAt: "",
  loadedAt: ""
});

export function useTemplateStore() {
  return {
    state: templateStoreState,
    archiveTemplate,
    createTemplate,
    generateDocumentFromTemplate,
    loadTemplates,
    saveTemplate
  };
}

export async function loadTemplates() {
  templateStoreState.loading = true;
  templateStoreState.error = "";
  state.wltError = "";

  try {
    const result = await listTemplateRecords({ includeArchived: true });
    const records = Array.isArray(result.templates) ? result.templates : [];
    templateStoreState.records = records;
    syncTemplateRecordsToWorkListTemplates(records, workListTemplates);
    ensureSelectedTemplate();
    templateStoreState.loadedAt = new Date().toISOString();
    saveDemoState();
    return records;
  } catch (error) {
    const message = error.message || "Templates could not be loaded.";
    templateStoreState.error = message;
    state.wltError = message;
    return [];
  } finally {
    templateStoreState.loading = false;
  }
}

export async function saveTemplate(template, overrides = {}) {
  if (!template) return null;

  templateStoreState.saving = true;
  templateStoreState.error = "";
  state.wltError = "";

  try {
    const payload = workListTemplateToTemplateRecord(template, overrides);
    const exists = templateStoreState.records.some((record) => record.id === payload.id);
    const result = exists
      ? await updateTemplateRecord(payload.id, payload)
      : await createTemplateRecord(payload);
    const record = result.template;
    upsertTemplateRecord(record);
    upsertWorkListTemplate(record);
    state.selectedWltId = record.id;
    templateStoreState.lastSavedAt = new Date().toISOString();
    saveDemoState();
    return record;
  } catch (error) {
    const message = error.message || "Template could not be saved.";
    templateStoreState.error = message;
    state.wltError = message;
    return null;
  } finally {
    templateStoreState.saving = false;
  }
}

export async function createTemplate() {
  const createdAt = new Date().toISOString();
  const id = `wlt-custom-${Date.now()}`;
  const payload = {
    id,
    kind: "procedure-template",
    metadata: {
      name: "New reusable template",
      company: "Viva Medical, UAB",
      equipmentCategory: "General",
      serviceType: "Service",
      language: "lt",
      description: "Describe when this reusable template should be used.",
      entryPerson: "",
      entryDate: createdAt.slice(0, 10),
      status: "Active",
      applicability: {
        serviceTypes: ["Service"],
        equipmentIds: [],
        hospitalIds: [],
        workEquipmentIds: []
      }
    },
    editorContent: {
      format: "umo-html",
      html: defaultTemplateHtml("New reusable template", "Describe when this reusable template should be used."),
      text: "Describe when this reusable template should be used.",
      json: null,
      updatedAt: createdAt
    },
    mergeFields: normaliseMergeFields(),
    output: {
      defaultFormat: "pdf",
      outputTemplateId: "tpl-service-act"
    },
    audit: {
      createdAt,
      updatedAt: createdAt,
      version: 1
    }
  };

  templateStoreState.saving = true;
  templateStoreState.error = "";
  state.wltError = "";

  try {
    const result = await createTemplateRecord(payload);
    const record = result.template;
    upsertTemplateRecord(record);
    upsertWorkListTemplate(record);
    state.selectedWltId = record.id;
    templateStoreState.lastSavedAt = new Date().toISOString();
    saveDemoState();
    return record;
  } catch (error) {
    const message = error.message || "Template could not be created.";
    templateStoreState.error = message;
    state.wltError = message;
    return null;
  } finally {
    templateStoreState.saving = false;
  }
}

export async function archiveTemplate(templateId) {
  if (!templateId) return null;

  templateStoreState.saving = true;
  templateStoreState.error = "";
  state.wltError = "";

  try {
    const result = await archiveTemplateRecord(templateId);
    const record = result.template;
    upsertTemplateRecord(record);
    const localIndex = workListTemplates.findIndex((template) => template.id === templateId || template.backendTemplateId === templateId);
    if (localIndex >= 0) {
      workListTemplates.splice(localIndex, 1);
    }
    ensureSelectedTemplate();
    saveDemoState();
    return record;
  } catch (error) {
    const message = error.message || "Template could not be archived.";
    templateStoreState.error = message;
    state.wltError = message;
    return null;
  } finally {
    templateStoreState.saving = false;
  }
}

export async function generateDocumentFromTemplate(templateId, payload = {}) {
  if (!templateId) return null;

  templateStoreState.generating = true;
  templateStoreState.generationError = "";
  templateStoreState.error = "";
  state.wltError = "";
  state.generationStatus = "Template document generation started";

  try {
    const result = await generateTemplateDocument(templateId, payload);
    const documentRecord = result.documentRecord;
    if (!documentRecord) {
      throw new Error("Document service did not return a document record.");
    }
    const syncedDocument = upsertGeneratedDocumentRecord(documentRecord);
    state.generationStatus = "Template PDF ready";
    templateStoreState.lastGeneratedDocument = syncedDocument || documentRecord;
    saveDemoState();
    return syncedDocument || documentRecord;
  } catch (error) {
    const message = error.message || "Template document could not be generated.";
    templateStoreState.generationError = message;
    state.wltError = message;
    state.generationStatus = "Template generation failed";
    return null;
  } finally {
    templateStoreState.generating = false;
  }
}

function upsertTemplateRecord(record) {
  if (!record) return;
  const index = templateStoreState.records.findIndex((item) => item.id === record.id);
  if (index >= 0) {
    templateStoreState.records[index] = record;
  } else {
    templateStoreState.records.unshift(record);
  }
}

function upsertWorkListTemplate(record) {
  const index = workListTemplates.findIndex((template) => template.id === record.id || template.backendTemplateId === record.id);
  if (index >= 0) {
    workListTemplates[index] = templateRecordToWorkListTemplate(record, {
      ...workListTemplates[index],
      backendTemplateSyncedAt: new Date().toISOString()
    });
  } else {
    workListTemplates.unshift(templateRecordToWorkListTemplate(record));
  }
}

function ensureSelectedTemplate() {
  if (!workListTemplates.length) {
    state.selectedWltId = null;
    return;
  }
  if (!workListTemplates.some((template) => template.id === state.selectedWltId)) {
    state.selectedWltId = workListTemplates[0].id;
  }
}
