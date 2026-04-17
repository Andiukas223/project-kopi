import { createEditorSnapshot, htmlToPlainText } from "../../components/documentEditor/editorContent.js";

export const TEMPLATE_KIND = "procedure-template";
export const TEMPLATE_CONTENT_FORMAT = "umo-html";
export const TEMPLATE_STATUSES = ["Active", "Archived", "Draft"];
export const DEFAULT_TEMPLATE_OUTPUT = Object.freeze({
  defaultFormat: "pdf",
  outputTemplateId: "tpl-service-act"
});

export const DEFAULT_TEMPLATE_MERGE_FIELDS = Object.freeze([
  mergeField("documentId", "Document number", {
    group: "Document",
    required: true,
    example: "DOC-3108",
    description: "Generated document reference."
  }),
  mergeField("documentDateLt", "Document date", {
    group: "Document",
    required: true,
    valueType: "date",
    example: "2026 m. balandzio 16 d.",
    description: "Localized generation date."
  }),
  mergeField("workActNumber", "Work Act number", {
    group: "Source",
    example: "VM-WA-0001",
    description: "Concrete Work Act number when generated from Work Acts."
  }),
  mergeField("jobId", "Service job", {
    group: "Source",
    example: "VM-SV-1024",
    description: "Source service job reference."
  }),
  mergeField("customer", "Customer", {
    group: "Customer",
    required: true,
    example: "Vilnius Clinical Hospital",
    description: "Customer or hospital name."
  }),
  mergeField("buyerName", "Buyer legal name", {
    group: "Customer",
    example: "Vilnius Clinical Hospital",
    description: "Legal buyer name for document output."
  }),
  mergeField("workLocation", "Work location", {
    group: "Customer",
    example: "Santariskiu g. 2, Vilnius",
    description: "Customer work location or document address."
  }),
  mergeField("contact", "Contact", {
    group: "Customer",
    example: "Name - phone",
    description: "Customer contact details."
  }),
  mergeField("equipmentItemsText", "Equipment list", {
    group: "Work",
    valueType: "text",
    example: "ARIETTA 850 / SN US-850-0192",
    description: "Selected equipment lines."
  }),
  mergeField("workActRowsText", "Work rows", {
    group: "Work",
    valueType: "text",
    example: "1. [x] Checked device",
    description: "Concrete Work Act row output."
  }),
  mergeField("reportOptionsText", "Report options", {
    group: "Work",
    valueType: "text",
    example: "equipmentWorking: true",
    description: "Selected print/report flags."
  }),
  mergeField("notes", "Notes", {
    group: "Document",
    valueType: "text",
    example: "Completed preventive maintenance.",
    description: "Free text or generated template content."
  }),
  mergeField("owner", "Owner", {
    group: "Document",
    example: "RP",
    description: "Owner initials or responsible person."
  })
]);

export function createTemplateMetadata(input = {}, existing = {}) {
  const now = new Date().toISOString();
  const serviceType = stringValue(input.serviceType || existing.serviceType || "Service", 80);

  return {
    name: stringValue(input.name || existing.name || "Untitled template", 160),
    company: stringValue(input.company || existing.company || "Viva Medical, UAB", 160),
    equipmentCategory: stringValue(input.equipmentCategory || existing.equipmentCategory || "General", 120),
    serviceType,
    language: stringValue(input.language || existing.language || "lt", 20),
    description: stringValue(input.description || input.bodyText || existing.description || "", 1000),
    entryPerson: stringValue(input.entryPerson || existing.entryPerson || "", 160),
    entryDate: stringValue(input.entryDate || existing.entryDate || now.slice(0, 10), 20),
    status: TEMPLATE_STATUSES.includes(input.status)
      ? input.status
      : TEMPLATE_STATUSES.includes(existing.status) ? existing.status : "Active",
    applicability: normaliseTemplateApplicability(input.applicability || existing.applicability || { serviceTypes: [serviceType] })
  };
}

export function normaliseTemplateApplicability(value = {}) {
  return {
    serviceTypes: normaliseStringArray(value.serviceTypes),
    equipmentIds: normaliseStringArray(value.equipmentIds),
    hospitalIds: normaliseStringArray(value.hospitalIds),
    workEquipmentIds: normaliseStringArray(value.workEquipmentIds)
  };
}

export function normaliseTemplateMergeFields(fields = []) {
  const source = Array.isArray(fields) && fields.length ? fields : DEFAULT_TEMPLATE_MERGE_FIELDS;
  const seen = new Set();

  return source.reduce((result, field) => {
    const key = normaliseFieldKey(field?.key);
    if (!key || seen.has(key)) return result;
    seen.add(key);
    result.push(mergeField(key, field.label || key, field));
    return result;
  }, []);
}

export function createTemplateEditorContent(value = {}, fallback = {}) {
  const name = fallback.name || "Template";
  const description = fallback.description || "";
  const html = value.html || defaultTemplateHtml(name, description);

  return createEditorSnapshot({
    format: TEMPLATE_CONTENT_FORMAT,
    html,
    text: value.text || htmlToPlainText(html) || description,
    json: value.json === undefined ? null : value.json,
    updatedAt: value.updatedAt
  });
}

export function createTemplateRecord(input = {}, existing = {}, options = {}) {
  const now = options.now || new Date().toISOString();
  const metadataInput = input.metadata && typeof input.metadata === "object" ? input.metadata : input;
  const metadata = createTemplateMetadata(metadataInput, existing.metadata || {});
  const audit = existing.audit || input.audit || {};
  const editorContent = createTemplateEditorContent(input.editorContent || existing.editorContent || {}, {
    name: metadata.name,
    description: metadata.description
  });

  return {
    id: safeTemplateId(input.id || existing.id || metadata.name),
    kind: TEMPLATE_KIND,
    metadata,
    mergeFields: normaliseTemplateMergeFields(input.mergeFields || existing.mergeFields),
    editorContent,
    output: normaliseTemplateOutput(input.output || existing.output),
    audit: {
      createdAt: audit.createdAt || now,
      updatedAt: options.touch === false ? audit.updatedAt || now : now,
      version: options.touch === false ? Number(audit.version || 1) : Number(audit.version || 0) + 1,
      archivedAt: audit.archivedAt || ""
    }
  };
}

export function normaliseTemplateOutput(output = {}) {
  return {
    defaultFormat: stringValue(output.defaultFormat || DEFAULT_TEMPLATE_OUTPUT.defaultFormat, 20).toLowerCase(),
    outputTemplateId: stringValue(output.outputTemplateId || DEFAULT_TEMPLATE_OUTPUT.outputTemplateId, 120)
  };
}

export function defaultTemplateHtml(name = "Template", bodyText = "") {
  return defaultProcedureTemplateHtml(name, bodyText);
}

export function defaultProcedureTemplateHtml(name = "Template", bodyText = "", rows = []) {
  const rowItems = Array.isArray(rows) && rows.length
    ? `<ul>${rows.map((row) => `<li>${escapeHtml(row)}</li>`).join("")}</ul>`
    : "";

  return [
    `<h2>${escapeHtml(name)}</h2>`,
    bodyText ? `<p>${escapeHtml(bodyText)}</p>` : "",
    `<p><strong>Customer:</strong> ${fieldToken("customer")}</p>`,
    `<p><strong>Equipment:</strong> ${fieldToken("equipmentItemsText")}</p>`,
    rowItems,
    `<p><strong>Notes:</strong> ${fieldToken("notes")}</p>`
  ].filter(Boolean).join("\n");
}

export function fieldToken(key = "") {
  return `{d.${normaliseFieldKey(key)}}`;
}

function mergeField(key, label, options = {}) {
  const normalisedKey = normaliseFieldKey(key);
  return {
    key: normalisedKey,
    label: stringValue(label || normalisedKey, 120),
    token: fieldToken(normalisedKey),
    group: stringValue(options.group || "General", 80),
    valueType: stringValue(options.valueType || "string", 40),
    required: Boolean(options.required),
    example: stringValue(options.example || "", 240),
    description: stringValue(options.description || "", 500),
    sources: normaliseFieldSources(normalisedKey, options.sources)
  };
}

function normaliseFieldSources(key, sources = []) {
  return Array.from(new Set([
    ...(Array.isArray(sources) ? sources.map((source) => stringValue(source, 160)).filter(Boolean) : []),
    `fields.${key}`,
    `payload.${key}`,
    key
  ]));
}

function normaliseFieldKey(value = "") {
  return String(value || "").trim().replace(/[^A-Za-z0-9_]/g, "").slice(0, 80);
}

function normaliseStringArray(value) {
  return Array.isArray(value)
    ? value.map((item) => stringValue(item, 120)).filter(Boolean)
    : [];
}

function stringValue(value = "", maxLength = 1000) {
  return String(value || "").trim().slice(0, maxLength);
}

function safeTemplateId(value = "") {
  return stringValue(value, 100)
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || `template-${Date.now()}`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}
