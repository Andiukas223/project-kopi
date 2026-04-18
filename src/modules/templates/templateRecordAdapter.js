import { createEditorSnapshot, htmlToPlainText } from "../../components/documentEditor/editorContent.js";
import {
  DEFAULT_TEMPLATE_MERGE_FIELDS,
  DEFAULT_TEMPLATE_OUTPUT,
  TEMPLATE_KIND,
  createTemplateMetadata,
  defaultTemplateHtml,
  normaliseTemplateMergeFields,
  normaliseTemplateOutput
} from "./templateModel.js";

export { DEFAULT_TEMPLATE_MERGE_FIELDS, defaultTemplateHtml };

export function templateRecordToWorkListTemplate(record = {}, existing = null) {
  const metadata = record.metadata || {};
  const applicability = metadata.applicability || {};
  const editorContent = record.editorContent || {};

  return {
    ...(existing || {}),
    id: record.id,
    name: metadata.name || existing?.name || "Untitled template",
    company: metadata.company || existing?.company || "Viva Medical, UAB",
    equipmentCategory: metadata.equipmentCategory || existing?.equipmentCategory || "General",
    serviceType: metadata.serviceType || existing?.serviceType || "Service",
    linkedServiceTypes: applicability.serviceTypes || existing?.linkedServiceTypes || [],
    linkedEquipmentIds: applicability.equipmentIds || existing?.linkedEquipmentIds || [],
    linkedHospitalIds: applicability.hospitalIds || existing?.linkedHospitalIds || [],
    linkedWorkEquipmentIds: applicability.workEquipmentIds || existing?.linkedWorkEquipmentIds || [],
    entryPerson: metadata.entryPerson || existing?.entryPerson || "",
    entryDate: metadata.entryDate || existing?.entryDate || new Date().toISOString().slice(0, 10),
    language: metadata.language || existing?.language || "lt",
    bodyText: metadata.description || editorContent.text || existing?.bodyText || "",
    richBodyHtml: editorContent.html || existing?.richBodyHtml || "",
    editorContent,
    mergeFields: normaliseMergeFields(record.mergeFields || existing?.mergeFields),
    output: record.output || existing?.output || { defaultFormat: "pdf", outputTemplateId: "tpl-service-act" },
    backendTemplateId: record.id,
    backendTemplateAudit: record.audit || {},
    backendTemplateStatus: metadata.status || "Active",
    isActive: (metadata.status || "Active") !== "Archived",
    backendTemplateSyncedAt: new Date().toISOString()
  };
}

export function workListTemplateToTemplateRecord(template = {}, overrides = {}) {
  const name = overrides.name || template.name || "Untitled template";
  const bodyText = overrides.bodyText || template.bodyText || "";
  const sourceEditorContent = overrides.editorContent || {};
  const editorHtml = sourceEditorContent.html || overrides.editorHtml || template.richBodyHtml || template.editorContent?.html || defaultTemplateHtml(name, bodyText);
  const editorText = sourceEditorContent.text || overrides.editorText || htmlToText(editorHtml) || bodyText;
  const editorContent = createEditorSnapshot({
    html: editorHtml,
    text: editorText,
    json: sourceEditorContent.json ?? overrides.editorJson ?? template.editorContent?.json ?? null,
    updatedAt: sourceEditorContent.updatedAt
  });
  const serviceType = overrides.serviceType || template.serviceType || "Service";
  const metadata = createTemplateMetadata({
    name,
    company: overrides.company || template.company,
    equipmentCategory: overrides.equipmentCategory || template.equipmentCategory,
    serviceType,
    language: overrides.language || template.language,
    description: bodyText,
    entryPerson: overrides.entryPerson || template.entryPerson,
    entryDate: overrides.entryDate || template.entryDate,
    status: template.backendTemplateStatus === "Archived" ? "Archived" : "Active",
    applicability: {
      serviceTypes: overrides.linkedServiceTypes?.length ? overrides.linkedServiceTypes : [serviceType],
      equipmentIds: overrides.linkedEquipmentIds || template.linkedEquipmentIds || [],
      hospitalIds: overrides.linkedHospitalIds || template.linkedHospitalIds || [],
      workEquipmentIds: overrides.linkedWorkEquipmentIds || template.linkedWorkEquipmentIds || []
    }
  }, template.metadata || {});

  return {
    id: template.backendTemplateId || template.id,
    kind: TEMPLATE_KIND,
    metadata,
    mergeFields: normaliseMergeFields(overrides.mergeFields || template.mergeFields),
    editorContent,
    output: normaliseTemplateOutput(template.output || DEFAULT_TEMPLATE_OUTPUT),
    audit: template.backendTemplateAudit || template.audit || {}
  };
}

export function syncTemplateRecordsToWorkListTemplates(records = [], workListTemplates = []) {
  records
    .forEach((record) => {
      const index = workListTemplates.findIndex((template) => template.id === record.id || template.backendTemplateId === record.id);
      if (index >= 0) {
        workListTemplates[index] = templateRecordToWorkListTemplate(record, workListTemplates[index]);
      } else {
        workListTemplates.push(templateRecordToWorkListTemplate(record));
      }
    });
}

export function normaliseMergeFields(fields = []) {
  return normaliseTemplateMergeFields(fields);
}

export function htmlToText(html = "") {
  return htmlToPlainText(html);
}
