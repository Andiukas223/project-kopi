import { reactive } from "vue";
import { workListTemplates } from "../js/data.js";
import { saveDemoState } from "../js/persistence.js";
import { state } from "../js/state.js";
import {
  archiveTemplateRecord,
  createTemplateRecord,
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

export const templateStoreState = reactive({
  records: [],
  loading: false,
  saving: false,
  error: "",
  lastSavedAt: "",
  loadedAt: ""
});

export function useTemplateStore() {
  return {
    state: templateStoreState,
    archiveTemplate,
    createTemplate,
    duplicateTemplate,
    loadTemplates,
    saveTemplate,
    selectTemplate
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

export async function duplicateTemplate(template) {
  if (!template) return null;

  const createdAt = new Date().toISOString();
  const id = `wlt-copy-${Date.now()}`;
  const name = `${template.name || "Untitled template"} copy`;
  const copyTemplate = {
    ...template,
    id,
    backendTemplateId: id,
    name,
    entryDate: createdAt.slice(0, 10),
    backendTemplateStatus: "Active",
    backendTemplateAudit: {},
    isActive: true
  };
  const payload = workListTemplateToTemplateRecord(copyTemplate, {
    name,
    entryDate: createdAt.slice(0, 10),
    editorContent: {
      ...(template.editorContent || {}),
      html: template.richBodyHtml || template.editorContent?.html || defaultTemplateHtml(name, template.bodyText || ""),
      updatedAt: createdAt
    },
    linkedServiceTypes: Array.isArray(template.linkedServiceTypes) ? [...template.linkedServiceTypes] : [],
    linkedEquipmentIds: Array.isArray(template.linkedEquipmentIds) ? [...template.linkedEquipmentIds] : [],
    linkedHospitalIds: Array.isArray(template.linkedHospitalIds) ? [...template.linkedHospitalIds] : [],
    linkedWorkEquipmentIds: Array.isArray(template.linkedWorkEquipmentIds) ? [...template.linkedWorkEquipmentIds] : [],
    mergeFields: Array.isArray(template.mergeFields) ? [...template.mergeFields] : []
  });
  payload.id = id;
  payload.metadata.name = name;
  payload.metadata.status = "Active";
  payload.audit = {
    createdAt,
    updatedAt: createdAt,
    version: 1
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
    const message = error.message || "Template could not be duplicated.";
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
    upsertWorkListTemplate(record);
    state.selectedWltId = record.id;
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

export function selectTemplate(templateId) {
  if (!templateId) return null;

  let template = workListTemplates.find((item) => item.id === templateId || item.backendTemplateId === templateId) || null;
  if (!template) {
    const record = templateStoreState.records.find((item) => item.id === templateId);
    if (record) {
      upsertWorkListTemplate(record);
      template = workListTemplates.find((item) => item.id === record.id || item.backendTemplateId === record.id) || null;
    }
  }

  if (!template) return null;
  state.selectedWltId = template.id;
  state.wltError = "";
  saveDemoState();
  return template;
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
