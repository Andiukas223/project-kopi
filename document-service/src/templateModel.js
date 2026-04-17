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
    status: TEMPLATE_STATUSES.includes(input.status) ? input.status : existing.status || "Active",
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

export function normaliseTemplateEditorContent(value = {}, fallback = {}) {
  const name = fallback.name || "Template";
  const description = fallback.description || "";
  const updatedAt = fallback.updatedAt || new Date().toISOString();
  const html = sanitizeStoredHtml(value.html || defaultProcedureTemplateHtml(name, description));

  return {
    format: TEMPLATE_CONTENT_FORMAT,
    html,
    text: stringValue(value.text || stripHtmlToText(html) || description, 20000),
    json: value.json && typeof value.json === "object" ? value.json : null,
    updatedAt: stringValue(value.updatedAt || updatedAt, 40)
  };
}

export function normaliseTemplateOutput(output = {}, existing = {}, options = {}) {
  const format = stringValue(output.defaultFormat || existing.defaultFormat || DEFAULT_TEMPLATE_OUTPUT.defaultFormat, 20).toLowerCase();
  const outputTemplateId = stringValue(output.outputTemplateId || existing.outputTemplateId || DEFAULT_TEMPLATE_OUTPUT.outputTemplateId, 120);

  return {
    defaultFormat: options.allowedFormats?.has(format) ? format : existing.defaultFormat || DEFAULT_TEMPLATE_OUTPUT.defaultFormat,
    outputTemplateId: options.allowedTemplateIds?.has(outputTemplateId) ? outputTemplateId : existing.outputTemplateId || DEFAULT_TEMPLATE_OUTPUT.outputTemplateId
  };
}

export function defaultTemplateMergeFields() {
  return normaliseTemplateMergeFields(DEFAULT_TEMPLATE_MERGE_FIELDS);
}

export function defaultProcedureTemplateHtml(name = "Template", description = "", rows = []) {
  const rowItems = Array.isArray(rows) && rows.length
    ? `<ul>${rows.map((row) => `<li>${escapeXml(row)}</li>`).join("")}</ul>`
    : "<p>Concrete checklist rows are added in Work Acts.</p>";

  return [
    `<h2>${escapeXml(name)}</h2>`,
    description ? `<p>${escapeXml(description)}</p>` : "",
    `<p><strong>Customer:</strong> ${fieldToken("customer")}</p>`,
    `<p><strong>Equipment:</strong> ${fieldToken("equipmentItemsText")}</p>`,
    rowItems,
    `<p><strong>Notes:</strong> ${fieldToken("notes")}</p>`
  ].filter(Boolean).join("\n");
}

export function resolveTemplateGenerationFields(mergeFields = [], body = {}, systemFields = {}) {
  const definitions = normaliseTemplateMergeFields(mergeFields);
  const flatInput = flattenGenerationInput(body, systemFields);
  const values = { ...flatInput };
  const missingRequiredFields = [];

  definitions.forEach((field) => {
    const value = resolveFieldValue(field, flatInput);
    values[field.key] = normaliseFieldValue(value, field.valueType);
    if (field.required && isEmptyFieldValue(values[field.key])) {
      missingRequiredFields.push(field.key);
    }
  });

  return {
    definitions,
    values,
    missingRequiredFields
  };
}

export function stripHtmlToText(html = "") {
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;|&apos;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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

function flattenGenerationInput(body = {}, systemFields = {}) {
  const payload = body.payload && typeof body.payload === "object" ? body.payload : {};
  const fields = body.fields && typeof body.fields === "object" ? body.fields : {};
  return {
    ...payload,
    ...fields,
    ...body,
    ...systemFields,
    payload,
    fields
  };
}

function resolveFieldValue(field, flatInput) {
  for (const source of field.sources) {
    const value = getPathValue(flatInput, source);
    if (!isEmptyFieldValue(value)) return value;
  }
  return "";
}

function getPathValue(source = {}, path = "") {
  return String(path || "").split(".").reduce((value, key) => {
    if (value === null || value === undefined) return undefined;
    return value[key];
  }, source);
}

function normaliseFieldValue(value, valueType = "string") {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map((item) => String(item || "")).filter(Boolean).join("\n");
  if (typeof value === "object") {
    if (valueType === "object") return value;
    return Object.entries(value).map(([key, item]) => `${key}: ${item}`).join("\n");
  }
  return String(value);
}

function isEmptyFieldValue(value) {
  return value === null || value === undefined || value === "";
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

function sanitizeStoredHtml(html = "") {
  return String(html)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
