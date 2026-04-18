import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import carbone from "carbone";
import cors from "cors";
import express from "express";
import {
  TEMPLATE_KIND,
  TEMPLATE_STATUSES,
  defaultProcedureTemplateHtml,
  defaultTemplateMergeFields,
  normaliseTemplateApplicability,
  normaliseTemplateEditorContent,
  normaliseTemplateMergeFields,
  normaliseTemplateOutput,
  resolveTemplateGenerationFields,
  stripHtmlToText
} from "./templateModel.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const templatesDir = path.join(appRoot, "templates");
const generatedDir = path.join(appRoot, "generated");
const customTemplatesDir = path.join(generatedDir, "templates");
const storageDir = process.env.STORAGE_DIR || path.join(appRoot, "storage");
const feedbackAttachmentDir = path.join(storageDir, "attachments", "bug-reports");
const feedbackReportsPath = path.join(storageDir, "feedback-reports.json");
const fileIndexPath = path.join(storageDir, "files.json");
const templateRecordsPath = path.join(storageDir, "templates.json");
const generatedDocumentRecordsPath = path.join(storageDir, "generated-document-records.json");
const app = express();
const port = Number(process.env.PORT || 3001);
const maxFeedbackAttachmentBytes = Number(process.env.FEEDBACK_ATTACHMENT_MAX_BYTES || 5 * 1024 * 1024);
const maxUploadedFileBytes = Number(process.env.UPLOAD_MAX_BYTES || 7 * 1024 * 1024);

const templateMap = {
  "tpl-service-act": "work-act.fodt",
  "tpl-diagnostic": "generic-document.fodt",
  "tpl-quotation": "commercial-offer.fodt",
  "tpl-defect-act": "defect-act.fodt",
  "tpl-acceptance": "generic-document.fodt",
  "tpl-vendor-return": "generic-document.fodt",
  "tpl-generic-document": "generic-document.fodt"
};

const allowedFormats = new Set(["odt", "docx", "pdf"]);
const allowedTemplateIds = new Set(Object.keys(templateMap));
const feedbackStatuses = new Set(["New", "Assigned", "In progress", "Fixed", "Reviewed", "Closed"]);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use((error, _req, res, next) => {
  if (!error) {
    next();
    return;
  }

  const isBodyError = error.type === "entity.parse.failed"
    || error.type === "entity.too.large"
    || error instanceof SyntaxError;
  if (!isBodyError) {
    next(error);
    return;
  }

  const status = error.status || (error.type === "entity.too.large" ? 413 : 400);
  res.status(status).json({
    ok: false,
    error: status === 413 ? "Request is too large." : "Request body must be valid JSON."
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "document-service", engine: "carbone+libreoffice" });
});

app.post("/preview", async (req, res) => {
  const payload = normalisePayload(req.body);
  res.json({
    ok: true,
    templateId: payload.templateId,
    format: payload.format,
    data: payload.data
  });
});

app.post("/generate", async (req, res) => {
  try {
    const payload = normalisePayload(req.body);
    const rendered = await renderDocument(payload);
    res.json({
      ok: true,
      id: rendered.id,
      fileName: rendered.fileName,
      format: payload.format,
      downloadUrl: rendered.fileRecord?.downloadUrl || `/api/documents/download/${rendered.fileName}`,
      previewUrl: rendered.fileRecord?.previewUrl || (payload.format === "pdf" ? `/api/documents/download/${rendered.fileName}?inline=1` : ""),
      version: rendered.fileRecord?.version || null,
      versionLabel: rendered.fileRecord?.versionLabel || "",
      fileRecord: rendered.fileRecord
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: error.message || "Document generation failed." });
  }
});

app.get("/generated-records", async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit || 1000), 1), 1000);
    const records = (await readGeneratedDocumentRecords()).filter(isDocumentRepositoryRecord);
    res.json({
      ok: true,
      contractVersion: "generated-document-records.v1",
      count: records.length,
      documents: records.slice(0, limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: error.message || "Generated documents could not be loaded." });
  }
});

app.delete("/documents/:documentId", async (req, res) => {
  try {
    const result = await deleteDocumentCustodyRecord(req.params.documentId);
    res.json({ ok: true, ...result });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, error: error.message || "Document could not be deleted." });
  }
});

app.get("/templates", async (req, res) => {
  try {
    const includeArchived = req.query.includeArchived === "1" || req.query.status === "all";
    const records = await readTemplateRecords();
    res.json({
      ok: true,
      templates: includeArchived
        ? records
        : records.filter((record) => record.metadata.status !== "Archived")
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: error.message || "Templates could not be loaded." });
  }
});

app.get("/templates/:templateId", async (req, res) => {
  try {
    const record = await findTemplateRecord(req.params.templateId);
    if (!record) {
      res.status(404).json({ ok: false, error: "Template not found." });
      return;
    }
    res.json({ ok: true, template: record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: error.message || "Template could not be loaded." });
  }
});

app.post("/templates", async (req, res) => {
  try {
    const records = await readTemplateRecords();
    const record = normaliseTemplateRecord(req.body || {});
    if (records.some((item) => item.id === record.id)) {
      res.status(409).json({ ok: false, error: `Template already exists: ${record.id}` });
      return;
    }
    records.unshift(record);
    await writeJsonArray(templateRecordsPath, records);
    res.status(201).json({ ok: true, template: record });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, error: error.message || "Template could not be created." });
  }
});

app.put("/templates/:templateId", async (req, res) => {
  try {
    const records = await readTemplateRecords();
    const index = records.findIndex((record) => record.id === req.params.templateId);
    if (index < 0) {
      res.status(404).json({ ok: false, error: "Template not found." });
      return;
    }

    const record = normaliseTemplateRecord({
      ...(req.body || {}),
      id: req.params.templateId
    }, records[index]);
    records[index] = record;
    await writeJsonArray(templateRecordsPath, records);
    res.json({ ok: true, template: record });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, error: error.message || "Template could not be saved." });
  }
});

app.patch("/templates/:templateId/archive", async (req, res) => {
  try {
    const records = await readTemplateRecords();
    const index = records.findIndex((record) => record.id === req.params.templateId);
    if (index < 0) {
      res.status(404).json({ ok: false, error: "Template not found." });
      return;
    }

    const record = normaliseTemplateRecord({
      ...records[index],
      metadata: {
        ...records[index].metadata,
        status: "Archived"
      },
      audit: {
        ...records[index].audit,
        archivedAt: new Date().toISOString()
      }
    }, records[index]);
    records[index] = record;
    await writeJsonArray(templateRecordsPath, records);
    res.json({ ok: true, template: record });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, error: error.message || "Template could not be archived." });
  }
});

app.post("/templates/:templateId/generate", async (req, res) => {
  try {
    const template = await findTemplateRecord(req.params.templateId);
    if (!template) {
      res.status(404).json({ ok: false, error: "Template not found." });
      return;
    }
    if (template.metadata.status === "Archived") {
      res.status(400).json({ ok: false, error: "Archived templates cannot generate documents." });
      return;
    }

    assertWorkActTemplateGenerationRequest(req.body || {});
    const result = await generateDocumentFromTemplate(template, req.body || {});
    res.status(201).json({
      ok: true,
      contractVersion: "template-generation.v1",
      documentRecord: result.documentRecord,
      fileRecord: result.fileRecord,
      downloadUrl: result.fileRecord.downloadUrl,
      previewUrl: result.fileRecord.previewUrl
    });
  } catch (error) {
    const status = error.statusCode || 500;
    if (status >= 500) console.error(error);
    res.status(status).json({ ok: false, error: error.message || "Template-based document generation failed." });
  }
});

app.post("/template/upload", async (req, res) => {
  try {
    const result = await saveTemplateUpload(req.body || {});
    res.json({
      ok: true,
      templateId: result.templateId,
      fileName: result.fileName,
      downloadUrl: `/api/documents/template/download/${result.fileName}`,
      fileRecord: result.fileRecord
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, error: error.message || "Template upload failed." });
  }
});

app.get("/template/download/:fileName", async (req, res) => {
  const safeName = path.basename(req.params.fileName);
  const filePath = await resolveDownloadTemplatePath(safeName);
  res.download(filePath);
});

app.get("/download/:fileName", async (req, res) => {
  const safeName = path.basename(req.params.fileName);
  const filePath = path.join(generatedDir, safeName);
  if (req.query.inline === "1") {
    res.setHeader("Content-Type", contentTypeForFile(safeName));
    res.setHeader("Content-Disposition", `inline; filename="${safeName.replace(/"/g, "")}"`);
    res.sendFile(filePath);
    return;
  }
  res.download(filePath);
});

app.get("/files", async (req, res) => {
  if (!isAdminRequest(req)) {
    res.json({ ok: true, files: [] });
    return;
  }

  const kind = String(req.query.kind || "");
  const files = await readJsonArray(fileIndexPath);
  res.json({
    ok: true,
    files: kind ? files.filter((file) => file.kind === kind) : files
  });
});

app.post("/files/upload", async (req, res) => {
  try {
    const fileRecord = await saveUploadedFile(req.body || {});
    res.status(201).json({ ok: true, fileRecord });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, error: error.message || "File upload failed." });
  }
});

app.get("/files/download/:fileId", async (req, res) => {
  const files = await readJsonArray(fileIndexPath);
  const fileRecord = files.find((file) => file.id === req.params.fileId);
  if (!fileRecord) {
    res.status(404).json({ ok: false, error: "File not found." });
    return;
  }

  const filePath = resolveStoredFilePath(fileRecord.storagePath);
  if (req.query.inline === "1") {
    res.setHeader("Content-Type", fileRecord.mimeType || contentTypeForFile(fileRecord.fileName));
    res.setHeader("Content-Disposition", `inline; filename="${fileRecord.fileName.replace(/"/g, "")}"`);
    res.sendFile(filePath);
    return;
  }
  res.download(filePath, fileRecord.fileName);
});

app.get("/feedback/reports", async (req, res) => {
  if (!isAdminRequest(req)) {
    res.json({ ok: true, reports: [] });
    return;
  }

  const reports = filterFeedbackReports(await readFeedbackReports(), req.query);
  res.json({ ok: true, reports });
});

app.post("/feedback/reports", async (req, res) => {
  try {
    const report = await createFeedbackReport(req.body || {});
    res.status(201).json({ ok: true, report });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, error: error.message || "Feedback report could not be saved." });
  }
});

app.patch("/feedback/reports/:id", async (req, res) => {
  if (!isAdminRequest(req)) {
    res.status(403).json({ ok: false, error: "Admin role is required." });
    return;
  }

  try {
    const report = await updateFeedbackReport(req.params.id, req.body || {});
    res.json({ ok: true, report });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, error: error.message || "Feedback report could not be updated." });
  }
});

app.get("/feedback/attachments/:fileName", async (req, res) => {
  const safeName = path.basename(req.params.fileName);
  const filePath = path.join(feedbackAttachmentDir, safeName);
  res.setHeader("Content-Type", contentTypeForFile(safeName));
  res.setHeader("Content-Disposition", `inline; filename="${safeName.replace(/"/g, "")}"`);
  res.sendFile(filePath);
});

app.listen(port, () => {
  console.log(`Document service listening on ${port}`);
});

async function readTemplateRecords() {
  const records = await readJsonArray(templateRecordsPath);
  if (records.length) {
    return records.map((record) => normaliseTemplateRecord(record, record, { touch: false }));
  }

  const seededRecords = defaultTemplateRecords();
  await writeJsonArray(templateRecordsPath, seededRecords);
  return seededRecords;
}

async function findTemplateRecord(templateId) {
  const records = await readTemplateRecords();
  return records.find((record) => record.id === templateId) || null;
}

function defaultTemplateRecords() {
  const now = new Date().toISOString();
  return [
    {
      id: "wlt-ultrasound-pm",
      name: "Ultrasound PM / technine prieziura",
      equipmentCategory: "Ultrasound",
      serviceType: "PM",
      linkedServiceTypes: ["PM"],
      linkedEquipmentIds: ["EQ-501", "EQ-505"],
      linkedHospitalIds: ["CUST-01"],
      linkedWorkEquipmentIds: ["digital-multimeter", "electrical-safety-analyzer"],
      entryPerson: "Rokas Petrauskas",
      entryDate: "2026-04-13",
      language: "lt",
      bodyText: "Technines prieziuros metu atlikti ultragarso sistemos patikrinimai.",
      workRows: [
        "Vizualiai patikrintas aparatas, laidai, davikliai ir maitinimo kabeliai.",
        "Isvalytas aparatas, oro filtrai ir isoriniai pavirsiai.",
        "Patikrintas sistemos uzsikrovimas, data/laikas ir klaidu pranesimai.",
        "Patikrintas vaizdo gavimas su turimais davikliais.",
        "Patikrintas spausdintuvas / eksportas, jeigu taikoma.",
        "Aparatas paliktas veikiantis ir tinkamas naudojimui."
      ]
    },
    {
      id: "wlt-endoscopy-pm",
      name: "Endoscope washer PM / technine prieziura",
      equipmentCategory: "Endoscopy",
      serviceType: "PM",
      linkedServiceTypes: ["PM"],
      linkedEquipmentIds: ["EQ-502"],
      linkedHospitalIds: ["CUST-03"],
      linkedWorkEquipmentIds: ["pressure-gauge", "thermometer"],
      entryPerson: "Marius Vaitkus",
      entryDate: "2026-04-13",
      language: "lt",
      bodyText: "Technines prieziuros metu atlikti endoskopu plovyklos patikrinimai.",
      workRows: [
        "Vizualiai patikrinta irangos bukle, pajungimai ir saugumo zymejimai.",
        "Patikrinti filtrai, vandens padavimas ir drenazo sistema.",
        "Patikrintas ciklo paleidimas ir ciklo pabaigos registravimas.",
        "Patikrinti chemijos lygiai ir dozavimo grandine.",
        "Patikrinti klaidu pranesimai ir sistemos zurnalas.",
        "Iranga palikta veikianti ir tinkama naudojimui."
      ]
    },
    {
      id: "wlt-patient-lift-check",
      name: "Patient lift safety check",
      equipmentCategory: "Patient Handling",
      serviceType: "Service",
      linkedServiceTypes: ["Service", "Repair"],
      linkedEquipmentIds: ["EQ-503"],
      linkedHospitalIds: ["CUST-04"],
      linkedWorkEquipmentIds: ["load-cell-tester", "digital-multimeter"],
      entryPerson: "Aurelija Jankauske",
      entryDate: "2026-04-12",
      language: "lt",
      bodyText: "Atliktas paciento keltuvo funkciniu ir saugos tasku patikrinimas.",
      workRows: [
        "Vizualiai patikrinta konstrukcija, ratai, stabdziai ir dirzai.",
        "Patikrintas valdymo pultas ir avarinis sustabdymas.",
        "Patikrintas akumuliatoriaus ikrovimas ir kroviklio veikimas.",
        "Atliktas pakelimo / nuleidimo funkcijos bandymas be apkrovos.",
        "Patikrinti saugos lipdukai ir identifikaciniai duomenys.",
        "Iranga palikta saugi naudojimui arba pazymeti apribojimai komentaruose."
      ]
    },
    {
      id: "wlt-generic-service",
      name: "Bendrinis serviso darbu sarasas",
      equipmentCategory: "General",
      serviceType: "Service",
      linkedServiceTypes: ["Service", "Repair", "Installation"],
      linkedEquipmentIds: [],
      linkedHospitalIds: [],
      linkedWorkEquipmentIds: [],
      entryPerson: "Marius Vaitkus",
      entryDate: "2026-04-12",
      language: "lt",
      bodyText: "Atlikti bendriniai serviso darbai pagal registruota gedima.",
      workRows: [
        "Isklausytas vartotojo gedimo aprasymas ir patikrinta registruota problema.",
        "Atlikta irangos apziura ir funkcine diagnostika.",
        "Atlikti korekciniai darbai arba pateiktos rekomendacijos.",
        "Patikrintas irangos veikimas po atliktu darbu.",
        "Klientas informuotas apie atliktus darbus ir tolimesnius veiksmus."
      ]
    }
  ].map((template) => normaliseTemplateRecord({
    id: template.id,
    kind: "procedure-template",
    metadata: {
      name: template.name,
      company: "Viva Medical, UAB",
      equipmentCategory: template.equipmentCategory,
      serviceType: template.serviceType,
      language: template.language,
      description: template.bodyText,
      entryPerson: template.entryPerson,
      entryDate: template.entryDate,
      status: "Active",
      applicability: {
        serviceTypes: template.linkedServiceTypes,
        equipmentIds: template.linkedEquipmentIds,
        hospitalIds: template.linkedHospitalIds,
        workEquipmentIds: template.linkedWorkEquipmentIds
      }
    },
    mergeFields: defaultTemplateMergeFields(),
    editorContent: {
      format: "umo-html",
      html: defaultProcedureTemplateHtml(template.name, template.bodyText, template.workRows),
      text: [template.bodyText, ...template.workRows].filter(Boolean).join("\n"),
      json: null,
      updatedAt: now
    },
    output: {
      defaultFormat: "pdf",
      outputTemplateId: "tpl-service-act"
    },
    audit: {
      createdAt: now,
      updatedAt: now,
      version: 1
    }
  }, null, { touch: false }));
}

function normaliseTemplateRecord(input = {}, existing = null, options = {}) {
  const { touch = true } = options;
  const now = new Date().toISOString();
  const metadataInput = input.metadata && typeof input.metadata === "object" ? input.metadata : input;
  const outputInput = input.output && typeof input.output === "object" ? input.output : {};
  const auditInput = input.audit && typeof input.audit === "object" ? input.audit : {};
  const id = safeTemplateRecordId(existing?.id || input.id || metadataInput.id || metadataInput.name || "");
  const name = String(metadataInput.name || existing?.metadata?.name || "Untitled template").trim().slice(0, 160);
  const description = String(metadataInput.description || metadataInput.bodyText || existing?.metadata?.description || "").slice(0, 1000);
  const statusInput = String(metadataInput.status || existing?.metadata?.status || "").slice(0, 40);
  const status = TEMPLATE_STATUSES.includes(statusInput) ? statusInput : "Active";
  const outputTemplateId = allowedTemplateIds.has(outputInput.outputTemplateId)
    ? outputInput.outputTemplateId
    : existing?.output?.outputTemplateId || "tpl-service-act";
  const defaultFormat = allowedFormats.has(String(outputInput.defaultFormat || "").toLowerCase())
    ? String(outputInput.defaultFormat).toLowerCase()
    : existing?.output?.defaultFormat || "pdf";
  const currentVersion = Number(existing?.audit?.version || auditInput.version || 0);
  const createdAt = existing?.audit?.createdAt || auditInput.createdAt || now;
  const updatedAt = touch ? now : auditInput.updatedAt || existing?.audit?.updatedAt || now;

  if (!id) {
    throw new Error("Template id is required.");
  }
  if (!name) {
    throw new Error("Template name is required.");
  }

  return {
    id,
    kind: TEMPLATE_KIND,
    metadata: {
      name,
      company: String(metadataInput.company || existing?.metadata?.company || "Viva Medical, UAB").slice(0, 160),
      equipmentCategory: String(metadataInput.equipmentCategory || existing?.metadata?.equipmentCategory || "General").slice(0, 120),
      serviceType: String(metadataInput.serviceType || existing?.metadata?.serviceType || "Service").slice(0, 80),
      language: String(metadataInput.language || existing?.metadata?.language || "lt").slice(0, 20),
      description,
      entryPerson: String(metadataInput.entryPerson || existing?.metadata?.entryPerson || "").slice(0, 160),
      entryDate: String(metadataInput.entryDate || existing?.metadata?.entryDate || now.slice(0, 10)).slice(0, 20),
      status,
      applicability: normaliseTemplateApplicability(metadataInput.applicability || existing?.metadata?.applicability || {})
    },
    mergeFields: normaliseTemplateMergeFields(input.mergeFields || existing?.mergeFields || defaultTemplateMergeFields()),
    editorContent: normaliseTemplateEditorContent(input.editorContent || existing?.editorContent || {}, { name, description, updatedAt }),
    output: normaliseTemplateOutput({ defaultFormat, outputTemplateId }, existing?.output || {}, { allowedFormats, allowedTemplateIds }),
    audit: {
      createdAt,
      updatedAt,
      version: touch ? currentVersion + 1 : currentVersion || 1,
      archivedAt: auditInput.archivedAt || existing?.audit?.archivedAt || ""
    }
  };
}

function safeTemplateRecordId(value = "") {
  const id = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
  return id || `template-${crypto.randomUUID().slice(0, 8)}`;
}

function assertWorkActTemplateGenerationRequest(body = {}) {
  const fields = body.fields && typeof body.fields === "object" ? body.fields : {};
  const documentId = String(body.documentId || fields.documentId || "").slice(0, 120);
  const sourceType = String(body.sourceType || fields.sourceType || "").slice(0, 80).toLowerCase();
  const workActId = String(body.workActId || fields.workActId || "").slice(0, 120);

  if (!documentId) {
    const error = new Error("Work Act document draft id is required before generating a document from a template.");
    error.statusCode = 400;
    throw error;
  }
  if (sourceType !== "work-act" || !workActId) {
    const error = new Error("Templates can generate persisted documents only from a Work Act source.");
    error.statusCode = 400;
    throw error;
  }

  return {
    documentId,
    sourceType: "work-act",
    workActId
  };
}

async function generateDocumentFromTemplate(template, body = {}) {
  const sourceContext = assertWorkActTemplateGenerationRequest(body);
  const initialFields = resolveTemplateGenerationFields(template.mergeFields, body).values;
  const documentId = sourceContext.documentId;
  const generatedAt = new Date().toISOString();
  const fieldResolution = resolveTemplateGenerationFields(template.mergeFields, body, {
    documentId,
    documentDateLt: formatLithuanianDate(new Date(generatedAt)),
    documentType: body.documentType || "Work Act",
    templateRecordId: template.id,
    templateName: template.metadata.name,
    owner: body.owner || initialFields.owner || template.metadata.entryPerson || ""
  });
  const fields = fieldResolution.values;
  const outputTemplateId = template.output?.outputTemplateId || "tpl-service-act";
  const format = allowedFormats.has(String(body.format || template.output?.defaultFormat || "").toLowerCase())
    ? String(body.format || template.output?.defaultFormat).toLowerCase()
    : "pdf";
  const fieldData = {
    ...fields,
    documentId,
    documentType: body.documentType || "Work Act",
    templateRecordId: template.id,
    templateName: template.metadata.name,
    owner: fields.owner || body.owner || template.metadata.entryPerson || "",
    mergeFields: fieldResolution.definitions,
    missingRequiredFields: fieldResolution.missingRequiredFields
  };
  const templateContentText = renderTemplateText(
    stripHtmlToText(template.editorContent?.html || template.editorContent?.text || ""),
    fieldData,
    fieldResolution.definitions
  );
  const payload = normalisePayload({
    ...body,
    documentId,
    documentType: fieldData.documentType,
    sourceType: sourceContext.sourceType,
    sourceId: body.sourceId || fields.sourceId || sourceContext.workActId,
    workActId: sourceContext.workActId,
    templateId: outputTemplateId,
    templateName: template.metadata.name,
    templateBody: templateContentText,
    templateSections: [
      {
        id: "template-content",
        label: template.metadata.name,
        value: templateContentText
      }
    ],
    format,
    customer: fields.customer || body.customer || "",
    jobId: fields.jobId || body.jobId || "",
    equipmentItems: Array.isArray(fields.equipmentItems) ? fields.equipmentItems : [],
    workActRows: Array.isArray(fields.workActRows) ? fields.workActRows : [],
    reportOptions: fields.reportOptions || {},
    equipment: fields.equipment || body.equipment || "",
    serial: fields.serial || body.serial || "",
    owner: fieldData.owner,
    notes: fields.notes || body.notes || templateContentText,
    fields: {
      ...fields,
      ...fieldData,
      templateContentText
    }
  });
  const editorHtml = String(template.editorContent?.html || "").trim();
  if (editorHtml) {
    payload.templatePath = await writeEditorHtmlTemplateFodt(template, editorHtml, {
      ...payload.data,
      notes: fields.notes || body.notes || ""
    }, fieldResolution.definitions);
  }
  const rendered = await renderDocument(payload);
  const fileRecord = rendered.fileRecord;
  const generatedFile = {
    id: rendered.id,
    fileId: fileRecord.id,
    fileName: rendered.fileName,
    format,
    generatedAt,
    downloadUrl: fileRecord.downloadUrl,
    previewUrl: fileRecord.previewUrl,
    version: fileRecord.version || null,
    versionLabel: fileRecord.versionLabel || "",
    fileRecord,
    source: "document-service",
    sourceType: payload.source?.sourceType || "",
    sourceId: payload.source?.sourceId || ""
  };
  const documentRecord = {
    id: documentId,
    type: fieldData.documentType,
    jobId: fields.jobId || body.jobId || "",
    quotationId: fields.quotationId || body.quotationId || "",
    customer: fields.customer || body.customer || "",
    owner: fieldData.owner || template.metadata.entryPerson || "",
    createdBy: body.createdBy || template.metadata.entryPerson || "Work Act generation",
    createdByInitials: initialsFromName(body.createdBy || template.metadata.entryPerson || "Work Act generation"),
    created: generatedAt.slice(0, 10),
    createdAt: generatedAt,
    status: "Signature",
    pipelineStep: "Signature",
    deliveryStatus: "Needs signed upload",
    description: body.description || `Generated from template ${template.metadata.name}.`,
    templateRecordId: template.id,
    templateId: outputTemplateId,
    sourceType: payload.source?.sourceType || sourceContext.sourceType,
    sourceId: payload.source?.sourceId || sourceContext.workActId,
    workActId: payload.source?.workActId || "",
    generatedFile,
    generatedFileVersions: [generatedFile],
    deliveryAudit: [
      {
        action: "Generated",
        note: `PDF generated from template ${template.metadata.name}.`,
        at: generatedAt,
        fileId: fileRecord.id,
        fileName: fileRecord.fileName,
        fileVersion: fileRecord.version || null,
        fileVersionLabel: fileRecord.versionLabel || "",
        sourceType: payload.source?.sourceType || "",
        sourceId: payload.source?.sourceId || ""
      }
    ]
  };

  await upsertGeneratedDocumentRecord(documentRecord);
  return { documentRecord, fileRecord };
}

async function upsertGeneratedDocumentRecord(documentRecord) {
  const records = await readGeneratedDocumentRecords();
  const nextRecords = [
    normaliseStoredGeneratedDocumentRecord(documentRecord),
    ...records.filter((record) => record.id !== documentRecord.id)
  ].slice(0, 1000);
  await writeJsonArray(generatedDocumentRecordsPath, nextRecords);
}

async function readGeneratedDocumentRecords() {
  const records = await readJsonArray(generatedDocumentRecordsPath);
  return records.map(normaliseStoredGeneratedDocumentRecord).filter((record) => record.id);
}

async function deleteDocumentCustodyRecord(documentId) {
  const id = String(documentId || "").slice(0, 120);
  if (!id) {
    throw new Error("Document id is required.");
  }

  const generatedRecords = await readGeneratedDocumentRecords();
  const nextGeneratedRecords = generatedRecords.filter((record) => record.id !== id);
  const removedGeneratedRecords = generatedRecords.length - nextGeneratedRecords.length;
  if (removedGeneratedRecords) {
    await writeJsonArray(generatedDocumentRecordsPath, nextGeneratedRecords);
  }

  const files = await readJsonArray(fileIndexPath);
  const matchingFiles = files.filter((file) => file.ownerType === "document" && file.ownerId === id);
  await Promise.all(matchingFiles.map(deleteStoredFile));
  if (matchingFiles.length) {
    await writeJsonArray(
      fileIndexPath,
      files.filter((file) => !(file.ownerType === "document" && file.ownerId === id))
    );
  }

  return {
    documentId: id,
    removedGeneratedRecords,
    removedFileRecords: matchingFiles.length
  };
}

function normaliseStoredGeneratedDocumentRecord(record = {}) {
  const generatedFile = record.generatedFile && typeof record.generatedFile === "object"
    ? record.generatedFile
    : {};
  const fileRecord = generatedFile.fileRecord && typeof generatedFile.fileRecord === "object"
    ? generatedFile.fileRecord
    : {};
  const downloadUrl = generatedFile.downloadUrl || fileRecord.downloadUrl || "";
  const previewUrl = generatedFile.previewUrl || fileRecord.previewUrl || "";
  const fileId = generatedFile.fileId || generatedFile.id || fileRecord.id || "";

  return {
    ...record,
    id: String(record.id || "").slice(0, 120),
    type: String(record.type || "Document").slice(0, 120),
    jobId: String(record.jobId || "").slice(0, 120),
    quotationId: String(record.quotationId || "").slice(0, 120),
    customer: String(record.customer || "").slice(0, 180),
    owner: String(record.owner || "").slice(0, 160),
    createdBy: String(record.createdBy || "Document generation").slice(0, 160),
    createdByInitials: String(record.createdByInitials || initialsFromName(record.createdBy || "Document generation")).slice(0, 12),
    created: String(record.created || record.createdAt || new Date().toISOString()).slice(0, 10),
    createdAt: String(record.createdAt || new Date().toISOString()).slice(0, 40),
    status: String(record.status || "Signature").slice(0, 80),
    pipelineStep: String(record.pipelineStep || "Signature").slice(0, 80),
    deliveryStatus: String(record.deliveryStatus || "Needs signed upload").slice(0, 120),
    description: String(record.description || "").slice(0, 1000),
    sourceType: String(record.sourceType || generatedFile.sourceType || "").slice(0, 80),
    sourceId: String(record.sourceId || generatedFile.sourceId || record.workActId || "").slice(0, 120),
    workActId: String(record.workActId || "").slice(0, 120),
    generatedFile: {
      ...generatedFile,
      id: fileId,
      fileId,
      downloadUrl,
      previewUrl,
      source: generatedFile.source || "document-service",
      fileRecord
    },
    generatedFileVersions: normaliseGeneratedFileVersions(record.generatedFileVersions, {
      ...generatedFile,
      id: fileId,
      fileId,
      downloadUrl,
      previewUrl,
      source: generatedFile.source || "document-service",
      fileRecord
    }),
    deliveryAudit: Array.isArray(record.deliveryAudit) ? record.deliveryAudit : []
  };
}

function generatedDocumentSourceType(record = {}) {
  return String(
    record.sourceType ||
    record.generatedFile?.sourceType ||
    record.generatedFile?.fileRecord?.sourceType ||
    record.generatedFile?.fileRecord?.meta?.sourceType ||
    ""
  ).toLowerCase();
}

function isDocumentRepositoryRecord(record = {}) {
  const sourceType = generatedDocumentSourceType(record);
  const type = String(record.type || record.documentType || "").toLowerCase();
  const hasSourceDocumentContext = Boolean(
    record.workActId ||
    record.defectActId ||
    record.commercialOfferDraftId ||
    record.jobId ||
    record.quotationId ||
    ["work-act", "defect-act", "commercial-offer"].includes(sourceType)
  );

  if (sourceType === "template" && !hasSourceDocumentContext) return false;
  if (type === "template document" && !hasSourceDocumentContext) return false;
  if (record.templateRecordId && !hasSourceDocumentContext) return false;
  return true;
}

function normaliseGeneratedFileVersions(versions = [], generatedFile = {}) {
  const fileKey = generatedFile.fileId || generatedFile.id || generatedFile.fileName;
  const safeVersions = Array.isArray(versions) ? versions.filter(Boolean) : [];
  if (!fileKey) return safeVersions.slice(0, 12);
  return [
    generatedFile,
    ...safeVersions.filter((item) => (item.fileId || item.id || item.fileName) !== fileKey)
  ].slice(0, 12);
}

function initialsFromName(value = "") {
  const initials = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
  return initials || "VM";
}

async function saveTemplateUpload(body = {}) {
  const templateId = String(body.templateId || "");
  if (!allowedTemplateIds.has(templateId)) {
    throw new Error(`Unknown template: ${templateId}`);
  }

  await fs.mkdir(customTemplatesDir, { recursive: true });
  const fileName = safeTemplateFileName(templateId, body.fileName || `${templateId}-custom.fodt`);
  const filePath = path.join(customTemplatesDir, fileName);
  let buffer;

  if (body.contentBase64) {
    buffer = Buffer.from(String(body.contentBase64), "base64");
  } else {
    buffer = Buffer.from(renderSectionsAsFodt(body), "utf8");
  }

  if (!buffer.length) {
    throw new Error("Template file is empty.");
  }

  await fs.writeFile(filePath, buffer);
  const fileRecord = await registerStoredFile({
    kind: "output-template",
    ownerType: "template",
    ownerId: templateId,
    filePath,
    storagePath: path.relative(appRoot, filePath).replaceAll("\\", "/"),
    fileName,
    mimeType: contentTypeForFile(fileName),
    downloadUrl: `/api/documents/template/download/${fileName}`,
    previewUrl: ""
  });
  templateMap[templateId] = filePath;
  return { templateId, fileName, fileRecord };
}

async function resolveDownloadTemplatePath(fileName) {
  const customPath = path.join(customTemplatesDir, fileName);
  try {
    await fs.access(customPath);
    return customPath;
  } catch {
    return path.join(templatesDir, fileName);
  }
}

function safeTemplateFileName(templateId, fileName) {
  const ext = path.extname(String(fileName)).toLowerCase();
  if (ext !== ".fodt") {
    throw new Error("Only .fodt templates are supported in this prototype step.");
  }
  const baseName = path.basename(String(fileName), ext).replace(/[^A-Za-z0-9._-]/g, "-") || "template";
  return `${templateId}-${baseName}.fodt`;
}

function renderSectionsAsFodt(body = {}) {
  const sections = Array.isArray(body.templateSections) ? body.templateSections : [];
  const sectionText = sections.length
    ? sections.map((section) => `${section.label || "Section"}\n${section.value || ""}`).join("\n\n")
    : String(body.templateBody || "");

  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" office:version="1.2" office:mimetype="application/vnd.oasis.opendocument.text">
  <office:styles>
    <style:style style:name="Standard" style:family="paragraph"><style:text-properties fo:font-size="10pt"/></style:style>
    <style:style style:name="Title" style:family="paragraph"><style:text-properties fo:font-size="18pt" fo:font-weight="bold"/></style:style>
  </office:styles>
  <office:body>
    <office:text>
      <text:p text:style-name="Title">${escapeXml(body.templateName || "Viva Medical Document")}</text:p>
      <text:p>${escapeXml("{d.templateSectionsText}")}</text:p>
      <text:p>${escapeXml(sectionText)}</text:p>
    </office:text>
  </office:body>
</office:document>`;
}

async function writeEditorHtmlTemplateFodt(template, editorHtml, data, mergeFields = []) {
  await fs.mkdir(customTemplatesDir, { recursive: true });
  const templateId = safeFilePart(template.id || "template");
  const fileName = `${templateId}-editor-${crypto.randomUUID().slice(0, 8)}.fodt`;
  const filePath = path.join(customTemplatesDir, fileName);
  const content = renderEditorHtmlAsFodt({
    title: template.metadata?.name || template.name || "Template",
    html: editorHtml,
    data,
    mergeFields
  });
  await fs.writeFile(filePath, content, "utf8");
  return filePath;
}

function renderEditorHtmlAsFodt({ title, html, data, mergeFields }) {
  const bodyXml = htmlBlocksToFodtXml(renderTemplateText(html || "", data, mergeFields));
  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" office:version="1.2" office:mimetype="application/vnd.oasis.opendocument.text">
  <office:styles>
    <style:style style:name="Standard" style:family="paragraph"><style:text-properties fo:font-size="10pt"/></style:style>
    <style:style style:name="EditorTitle" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-bottom="0.18in"/><style:text-properties fo:font-size="16pt" fo:font-weight="bold"/></style:style>
    <style:style style:name="EditorHeading" style:family="paragraph"><style:paragraph-properties fo:margin-top="0.12in" fo:margin-bottom="0.06in"/><style:text-properties fo:font-size="11pt" fo:font-weight="bold"/></style:style>
  </office:styles>
  <office:automatic-styles>
    <style:style style:name="EditorTable" style:family="table"><style:table-properties table:border-model="collapsing" style:width="100%" table:align="margins"/></style:style>
    <style:style style:name="EditorColumn" style:family="table-column"><style:table-column-properties style:rel-column-width="1*"/></style:style>
    <style:style style:name="EditorCell" style:family="table-cell"><style:table-cell-properties fo:border-left="0.75pt solid #000000" fo:border-right="0.75pt solid #000000" fo:border-top="0.75pt solid #000000" fo:border-bottom="0.75pt solid #000000" fo:padding="0.04in" style:vertical-align="middle"/></style:style>
    <style:style style:name="EditorHeaderCell" style:family="table-cell"><style:table-cell-properties fo:border-left="0.75pt solid #000000" fo:border-right="0.75pt solid #000000" fo:border-top="0.75pt solid #000000" fo:border-bottom="0.75pt solid #000000" fo:padding="0.04in" fo:background-color="#f3f5f7" style:vertical-align="middle"/></style:style>
    <style:style style:name="EditorHeaderParagraph" style:family="paragraph"><style:text-properties fo:font-weight="bold"/></style:style>
  </office:automatic-styles>
  <office:body>
    <office:text>
      ${bodyXml || `<text:p text:style-name="EditorTitle">${escapeXml(title || "Template")}</text:p>`}
    </office:text>
  </office:body>
</office:document>`;
}

function htmlBlocksToFodtXml(html = "") {
  const sanitized = stripUnsafeHtml(String(html));
  const parts = [];
  let cursor = 0;
  const tableRegex = /<table\b[\s\S]*?<\/table>/gi;
  let match;

  while ((match = tableRegex.exec(sanitized))) {
    parts.push(...paragraphHtmlToFodtBlocks(sanitized.slice(cursor, match.index)));
    parts.push(tableHtmlToFodtBlock(match[0]));
    cursor = match.index + match[0].length;
  }

  parts.push(...paragraphHtmlToFodtBlocks(sanitized.slice(cursor)));
  return parts.filter(Boolean).join("\n      ");
}

function paragraphHtmlToFodtBlocks(html = "") {
  const blocks = [];
  const blockRegex = /<(h[1-6]|p|div|li)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;

  while ((match = blockRegex.exec(html))) {
    const tag = match[1].toLowerCase();
    const lines = inlineHtmlToText(match[2]).split("\n").map((line) => line.trim()).filter(Boolean);
    lines.forEach((line) => {
      const style = tag.startsWith("h") ? " text:style-name=\"EditorHeading\"" : "";
      blocks.push(`<text:p${style}>${escapeXml(line)}</text:p>`);
    });
  }

  if (!blocks.length) {
    const lines = inlineHtmlToText(html).split("\n").map((line) => line.trim()).filter(Boolean);
    lines.forEach((line) => blocks.push(`<text:p>${escapeXml(line)}</text:p>`));
  }

  return blocks;
}

function tableHtmlToFodtBlock(tableHtml = "") {
  const rows = [];
  const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  let columnCount = 0;
  const pendingRowSpans = [];

  while ((rowMatch = rowRegex.exec(tableHtml))) {
    const rowCells = [];
    const cellRegex = /<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi;
    let cellMatch;
    let columnIndex = 0;

    while ((cellMatch = cellRegex.exec(rowMatch[1]))) {
      while (pendingRowSpans[columnIndex] > 0) {
        rowCells.push("<table:covered-table-cell/>");
        pendingRowSpans[columnIndex] -= 1;
        columnIndex += 1;
      }

      const cellTag = cellMatch[0].match(/^<t[dh]\b[^>]*>/i)?.[0] || "";
      const isHeader = /^<th\b/i.test(cellTag);
      const colSpan = htmlAttributeNumber(cellTag, "colspan", 1);
      const rowSpan = htmlAttributeNumber(cellTag, "rowspan", 1);
      const cellText = inlineHtmlToText(cellMatch[1]).trim();
      const paragraphStyle = isHeader ? " text:style-name=\"EditorHeaderParagraph\"" : "";
      const paragraphs = cellText
        ? cellText.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => `<text:p${paragraphStyle}>${escapeXml(line)}</text:p>`).join("")
        : "<text:p/>";
      const spanAttrs = [
        colSpan > 1 ? `table:number-columns-spanned="${colSpan}"` : "",
        rowSpan > 1 ? `table:number-rows-spanned="${rowSpan}"` : ""
      ].filter(Boolean).join(" ");
      const cellStyle = isHeader ? "EditorHeaderCell" : "EditorCell";
      rowCells.push(`<table:table-cell table:style-name="${cellStyle}" office:value-type="string"${spanAttrs ? ` ${spanAttrs}` : ""}>${paragraphs}</table:table-cell>`);

      if (rowSpan > 1) {
        for (let offset = 0; offset < colSpan; offset += 1) {
          pendingRowSpans[columnIndex + offset] = Math.max(pendingRowSpans[columnIndex + offset] || 0, rowSpan - 1);
        }
      }

      for (let offset = 1; offset < colSpan; offset += 1) {
        rowCells.push("<table:covered-table-cell/>");
      }

      columnIndex += colSpan;
    }

    while (pendingRowSpans[columnIndex] > 0) {
      rowCells.push("<table:covered-table-cell/>");
      pendingRowSpans[columnIndex] -= 1;
      columnIndex += 1;
    }

    if (rowCells.length) {
      columnCount = Math.max(columnCount, columnIndex);
      rows.push(`<table:table-row>${rowCells.join("")}</table:table-row>`);
    }
  }

  if (!rows.length) return "";
  const columns = Array.from({ length: columnCount }, () => "<table:table-column table:style-name=\"EditorColumn\"/>").join("");
  return `<table:table table:name="TemplateTable" table:style-name="EditorTable">${columns}${rows.join("")}</table:table>`;
}

function htmlAttributeNumber(tag = "", name = "", fallback = 1) {
  const pattern = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]+)"|'([^']+)'|([^\\s>]+))`, "i");
  const value = String(tag || "").match(pattern)?.slice(1).find(Boolean);
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 100) : fallback;
}

function stripUnsafeHtml(html = "") {
  return String(html)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "");
}

function inlineHtmlToText(html = "") {
  return decodeHtmlEntities(String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<\/t[dh]>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n"));
}

function decodeHtmlEntities(value = "") {
  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;|&apos;/g, "'");
}

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function contentTypeForFile(fileName = "") {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === ".odt") return "application/vnd.oasis.opendocument.text";
  if (ext === ".fodt") return "application/vnd.oasis.opendocument.text-flat-xml";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

function normalisePayload(body = {}) {
  const format = String(body.format || "pdf").toLowerCase();
  if (!allowedFormats.has(format)) {
    throw new Error(`Unsupported output format: ${format}`);
  }

  const templateId = body.templateId || "tpl-service-act";
  const templateName = templateMap[templateId];
  if (!templateName) {
    throw new Error(`Unknown template: ${templateId}`);
  }

  const fields = body.fields || {};
  const source = normaliseGenerationSource(body, fields);
  const equipmentItems = body.equipmentItems || fields.equipmentItems || [];
  const workActRows = body.workActRows || fields.workActRows || [];
  const derivedEquipmentItemsText = Array.isArray(equipmentItems)
    ? equipmentItems.map((item) => `${item.name || ""}${item.serial ? ` / SN ${item.serial}` : ""}${item.location ? ` / ${item.location}` : ""}`).filter(Boolean).join("\n")
    : "";
  const equipmentItemsText = fields.equipmentItemsText || body.equipmentItemsText || derivedEquipmentItemsText;
  const derivedWorkActRowsText = Array.isArray(workActRows)
    ? workActRows.map((row) => `${row.number || ""}. ${row.completed ? "[x]" : "[ ]"} ${row.description || ""}${row.comments ? ` - ${row.comments}` : ""}`).join("\n")
    : "";
  const workActRowsText = fields.workActRowsText || body.workActRowsText || derivedWorkActRowsText;
  const templateSections = Array.isArray(body.templateSections) ? body.templateSections : [];
  const reportOptions = body.reportOptions || fields.reportOptions || {};
  const reportOptionsText = fields.reportOptionsText || Object.entries(reportOptions)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
  const commercialOfferLineItems = fields.commercialOfferLineItems || [];
  const commercialOfferLineItemsText = Array.isArray(commercialOfferLineItems)
    ? commercialOfferLineItems.map((item) => `${item.description || ""}${item.amount != null ? ` - ${item.amount} ${item.currency || fields.commercialOfferCurrency || ""}` : ""}`).filter(Boolean).join("\n")
    : "";
  const generatedAt = new Date().toISOString().slice(0, 10);
  const documentDateLt = formatLithuanianDate(new Date());
  const data = {
    documentId: body.documentId || "DOC-0000",
    documentType: body.documentType || "Document",
    sourceType: source.sourceType,
    sourceId: source.sourceId,
    workActId: source.workActId,
    defectActId: source.defectActId,
    commercialOfferDraftId: source.commercialOfferDraftId,
    templateName: body.templateName || "",
    templateBody: body.templateBody || "",
    templateSections,
    customer: body.customer || "",
    jobId: body.jobId || "",
    equipment: body.equipment || "",
    equipmentItems,
    equipmentItemsText,
    serial: body.serial || "",
    owner: body.owner || "",
    generatedAt,
    documentDateLt,
    notes: body.notes || "",
    fieldsText: body.fieldsText || "",
    customerAddress: fields.customerAddress || "",
    contact: fields.contact || "",
    sellerName: fields.sellerName || body.sellerName || "",
    sellerDisplayName: fields.sellerDisplayName || body.sellerDisplayName || "",
    sellerAddress: fields.sellerAddress || body.sellerAddress || "",
    sellerPhone: fields.sellerPhone || body.sellerPhone || "",
    sellerWebsite: fields.sellerWebsite || body.sellerWebsite || "",
    sellerCompanyCode: fields.sellerCompanyCode || body.sellerCompanyCode || "",
    sellerVatCode: fields.sellerVatCode || body.sellerVatCode || "",
    sellerBankName: fields.sellerBankName || body.sellerBankName || "",
    sellerBankAccount: fields.sellerBankAccount || body.sellerBankAccount || "",
    sellerRequisitesText: fields.sellerRequisitesText || body.sellerRequisitesText || "",
    buyerName: fields.buyerName || body.buyerName || body.customer || "",
    buyerCompanyCode: fields.buyerCompanyCode || body.buyerCompanyCode || "",
    buyerVatCode: fields.buyerVatCode || body.buyerVatCode || "",
    buyerAddress: fields.buyerAddress || body.buyerAddress || fields.customerAddress || "",
    buyerBankName: fields.buyerBankName || body.buyerBankName || "",
    buyerBankAccount: fields.buyerBankAccount || body.buyerBankAccount || "",
    buyerRequisitesText: fields.buyerRequisitesText || body.buyerRequisitesText || "",
    contractNumber: fields.contractNumber || body.contractNumber || "",
    workLocation: fields.workLocation || body.workLocation || fields.customerAddress || "",
    quotationAmount: fields.quotationAmount || "",
    quotationDue: fields.quotationDue || "",
    commercialOfferNumber: fields.commercialOfferNumber || body.documentId || "",
    commercialOfferHeaderText: fields.commercialOfferHeaderText || "",
    commercialOfferFooterText: fields.commercialOfferFooterText || "",
    commercialOfferScopeText: fields.commercialOfferScopeText || "",
    commercialOfferRecipient: fields.commercialOfferRecipient || "",
    commercialOfferContract: fields.commercialOfferContract || "",
    commercialOfferInvoiceId: fields.commercialOfferInvoiceId || "",
    commercialOfferLineItems,
    commercialOfferLineItemsText,
    defectDescription: fields.defectDescription || body.notes || "",
    engineerFindings: fields.engineerFindings || "",
    recommendedCorrection: fields.recommendedCorrection || "",
    riskLevel: fields.riskLevel || "",
    customerAcknowledgement: fields.customerAcknowledgement || "",
    defectActVisits: fields.defectActVisits || [],
    defectActVisitsText: fields.defectActVisitsText || "",
    pipelineStep: fields.pipelineStep || "",
    workActNumber: fields.workActNumber || body.documentId || "",
    fields,
    workActRows,
    workActRowsText,
    reportOptions,
    reportOptionsText
  };
  data.templateBodyRendered = renderTemplateText(data.templateBody, data);
  data.templateSectionsText = templateSections.length
    ? templateSections.map((section) => `${section.label || ""}\n${renderTemplateText(section.value || "", data)}`).join("\n\n")
    : data.templateBodyRendered;

  return {
    format,
    templateId,
    templatePath: path.isAbsolute(templateName) ? templateName : path.join(templatesDir, templateName),
    source,
    data
  };
}

function normaliseGenerationSource(body = {}, fields = {}) {
  const workActId = String(body.workActId || fields.workActId || "").slice(0, 120);
  const defectActId = String(body.defectActId || fields.defectActId || "").slice(0, 120);
  const commercialOfferDraftId = String(body.commercialOfferDraftId || fields.commercialOfferDraftId || "").slice(0, 120);
  let sourceType = String(body.sourceType || fields.sourceType || "").slice(0, 80);
  let sourceId = String(body.sourceId || fields.sourceId || "").slice(0, 120);

  if (!sourceType && workActId) sourceType = "work-act";
  if (!sourceType && defectActId) sourceType = "defect-act";
  if (!sourceType && commercialOfferDraftId) sourceType = "commercial-offer";
  if (!sourceId) sourceId = workActId || defectActId || commercialOfferDraftId || String(body.documentId || fields.documentId || "").slice(0, 120);

  return {
    sourceType,
    sourceId,
    workActId,
    defectActId,
    commercialOfferDraftId
  };
}

function formatLithuanianDate(date) {
  const months = [
    "sausio",
    "vasario",
    "kovo",
    "balandzio",
    "geguzes",
    "birzelio",
    "liepos",
    "rugpjucio",
    "rugsejo",
    "spalio",
    "lapkricio",
    "gruodzio"
  ];
  return `${date.getFullYear()} m. ${months[date.getMonth()]} ${date.getDate()} d.`;
}

function renderTemplateText(text = "", data = {}, mergeFields = []) {
  const allowedKeys = Array.isArray(mergeFields) && mergeFields.length
    ? new Set(normaliseTemplateMergeFields(mergeFields).map((field) => field.key))
    : null;
  return String(text).replace(/\{d\.([A-Za-z0-9_]+)\}/g, (_, key) => {
    if (allowedKeys && !allowedKeys.has(key)) return "";
    const value = data[key];
    if (Array.isArray(value)) return value.join("\n");
    if (value === null || value === undefined) return "";
    return String(value);
  });
}

async function renderDocument(payload) {
  await fs.mkdir(generatedDir, { recursive: true });
  const id = crypto.randomUUID().slice(0, 8);
  const fileId = `file-${crypto.randomUUID().slice(0, 12)}`;
  const fileName = `${payload.data.documentId}-${id}.${payload.format}`;
  const filePath = path.join(generatedDir, fileName);
  const options = { convertTo: payload.format };

  const buffer = await new Promise((resolve, reject) => {
    carbone.render(payload.templatePath, payload.data, options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });

  await fs.writeFile(filePath, buffer);
  const fileRecord = await registerStoredFile({
    id: fileId,
    kind: "generated-document",
    ownerType: "document",
    ownerId: payload.data.documentId,
    filePath,
    storagePath: path.relative(appRoot, filePath).replaceAll("\\", "/"),
    fileName,
    mimeType: contentTypeForFile(fileName),
    downloadUrl: `/api/documents/files/download/${fileId}`,
    previewUrl: payload.format === "pdf" ? `/api/documents/files/download/${fileId}?inline=1` : "",
    sourceType: payload.source?.sourceType || "",
    sourceId: payload.source?.sourceId || "",
    meta: {
      documentType: payload.data.documentType,
      templateId: payload.templateId,
      format: payload.format,
      sourceType: payload.source?.sourceType || "",
      sourceId: payload.source?.sourceId || "",
      workActId: payload.source?.workActId || "",
      defectActId: payload.source?.defectActId || "",
      commercialOfferDraftId: payload.source?.commercialOfferDraftId || "",
      customer: payload.data.customer,
      jobId: payload.data.jobId,
      equipment: payload.data.equipment
    }
  });
  return { id, fileName, filePath, fileRecord };
}

function isAdminRequest(req) {
  return String(req.get("x-vm-role") || req.query.role || "").toLowerCase() === "admin";
}

async function createFeedbackReport(body = {}) {
  const comment = String(body.comment || "").trim();
  if (!comment) {
    throw new Error("Short comment is required.");
  }

  const reports = await readFeedbackReports();
  const createdAt = new Date().toISOString();
  const id = nextFeedbackReportId(reports, createdAt);
  const screenshotAttachment = await saveFeedbackAttachment({
    dataUrl: body.screenshot,
    reportId: id,
    label: "annotated"
  });
  const rawAttachment = body.rawScreenshot && body.rawScreenshot !== body.screenshot
    ? await saveFeedbackAttachment({ dataUrl: body.rawScreenshot, reportId: id, label: "raw" })
    : null;

  const report = {
    id,
    comment: comment.slice(0, 500),
    screenshot: screenshotAttachment.previewUrl,
    rawScreenshot: rawAttachment?.previewUrl || "",
    screenshotAttachment,
    rawAttachment,
    createdAt,
    createdBy: String(body.createdBy || body.role || "user").slice(0, 120),
    role: String(body.role || "user").slice(0, 40),
    page: String(body.page || "").slice(0, 80),
    status: "New",
    assignee: "",
    visibility: "admin-only",
    context: normaliseFeedbackContext(body.context),
    history: [
      {
        at: createdAt,
        action: "Created",
        by: String(body.createdBy || body.role || "user").slice(0, 120)
      }
    ]
  };

  reports.unshift(report);
  await writeJsonArray(feedbackReportsPath, reports.slice(0, 500));
  return report;
}

async function updateFeedbackReport(id, body = {}) {
  const reports = await readFeedbackReports();
  const report = reports.find((item) => item.id === id);
  if (!report) {
    throw new Error(`Feedback report not found: ${id}`);
  }

  const history = [];
  if (body.status) {
    const status = String(body.status);
    if (!feedbackStatuses.has(status)) {
      throw new Error(`Unsupported feedback status: ${status}`);
    }
    if (report.status !== status) {
      report.status = status;
      history.push(`Marked ${status}`);
    }
  }

  if ("assignee" in body) {
    const assignee = String(body.assignee || "").slice(0, 120);
    if ((report.assignee || "") !== assignee) {
      report.assignee = assignee;
      history.push(assignee ? `Assigned to ${assignee}` : "Cleared assignee");
      if (assignee && report.status === "New") report.status = "Assigned";
    }
  }

  if (history.length) {
    const at = new Date().toISOString();
    const by = String(body.by || "Admin").slice(0, 120);
    report.history = report.history || [];
    history.forEach((action) => report.history.unshift({ at, action, by }));
  }

  await writeJsonArray(feedbackReportsPath, reports);
  return report;
}

function filterFeedbackReports(reports, query = {}) {
  const status = String(query.status || "All");
  const assignee = String(query.assignee || "All");
  const page = String(query.page || "All");

  return reports.filter((report) => {
    const statusMatch = status === "All" || report.status === status;
    const assigneeMatch = assignee === "All"
      || (assignee === "Unassigned" ? !report.assignee : report.assignee === assignee);
    const pageMatch = page === "All" || report.page === page;
    return statusMatch && assigneeMatch && pageMatch;
  });
}

async function saveFeedbackAttachment({ dataUrl, reportId, label }) {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed.mimeType.startsWith("image/")) {
    throw new Error("Feedback attachment must be an image.");
  }
  if (parsed.buffer.length > maxFeedbackAttachmentBytes) {
    throw new Error(`Screenshot is too large. Limit is ${Math.round(maxFeedbackAttachmentBytes / 1024 / 1024)} MB.`);
  }

  await fs.mkdir(feedbackAttachmentDir, { recursive: true });
  const hash = crypto.createHash("sha256").update(parsed.buffer).digest("hex");
  const extension = extensionForMimeType(parsed.mimeType);
  const fileName = `${safeFilePart(reportId)}-${safeFilePart(label)}-${hash.slice(0, 10)}${extension}`;
  const filePath = path.join(feedbackAttachmentDir, fileName);
  await fs.writeFile(filePath, parsed.buffer);

  return registerStoredFile({
    kind: "bug-report-screenshot",
    ownerType: "bug-report",
    ownerId: reportId,
    filePath,
    storagePath: path.relative(appRoot, filePath).replaceAll("\\", "/"),
    fileName,
    mimeType: parsed.mimeType,
    downloadUrl: `/api/documents/feedback/attachments/${fileName}`,
    previewUrl: `/api/documents/feedback/attachments/${fileName}`
  });
}

function normaliseFeedbackContext(context = {}) {
  if (!context || typeof context !== "object") return {};
  return Object.fromEntries(
    [
      "url",
      "viewport",
      "selectedDocumentId",
      "selectedTemplateId",
      "selectedServiceJobId",
      "selectedWorkActId",
      "selectedEquipmentId",
      "templateGenTab"
    ].map((key) => [key, String(context[key] || "").slice(0, 300)])
  );
}

function parseDataUrl(value) {
  const match = String(value || "").match(/^data:([^;,]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Screenshot data is missing.");
  }
  return {
    mimeType: match[1].toLowerCase(),
    buffer: Buffer.from(match[2], "base64")
  };
}

function extensionForMimeType(mimeType) {
  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/webp") return ".webp";
  return ".png";
}

async function saveUploadedFile(body = {}) {
  const originalName = String(body.fileName || "uploaded-file").slice(0, 160);
  const contentBase64 = String(body.contentBase64 || "");
  if (!contentBase64) {
    throw new Error("Uploaded file content is missing.");
  }

  const buffer = Buffer.from(contentBase64, "base64");
  if (!buffer.length) {
    throw new Error("Uploaded file is empty.");
  }
  if (buffer.length > maxUploadedFileBytes) {
    throw new Error(`Uploaded file is too large. Limit is ${Math.round(maxUploadedFileBytes / 1024 / 1024)} MB.`);
  }

  const uploadDir = path.join(storageDir, "uploads", "documents");
  await fs.mkdir(uploadDir, { recursive: true });
  const ownerId = String(body.ownerId || "document").slice(0, 80);
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  const extension = path.extname(originalName).toLowerCase() || extensionForUploadedMimeType(String(body.mimeType || "")) || ".bin";
  const fileName = `${safeFilePart(ownerId)}-${safeFilePart(path.basename(originalName, extension))}-${hash.slice(0, 10)}${extension}`;
  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, buffer);

  const fileId = `file-${crypto.randomUUID().slice(0, 12)}`;
  return registerStoredFile({
    id: fileId,
    kind: String(body.kind || "uploaded-document").slice(0, 80),
    ownerType: String(body.ownerType || "document").slice(0, 80),
    ownerId,
    filePath,
    storagePath: path.relative(appRoot, filePath).replaceAll("\\", "/"),
    fileName,
    mimeType: String(body.mimeType || contentTypeForFile(fileName)).slice(0, 120),
    downloadUrl: `/api/documents/files/download/${fileId}`,
    previewUrl: isPreviewableFile(fileName) ? `/api/documents/files/download/${fileId}?inline=1` : "",
    meta: body.meta && typeof body.meta === "object" ? body.meta : {}
  });
}

async function registerStoredFile(record) {
  const files = await readJsonArray(fileIndexPath);
  const sizeBytes = record.sizeBytes ?? (await fs.stat(record.filePath)).size;
  const buffer = await fs.readFile(record.filePath);
  const sha256 = record.sha256 || crypto.createHash("sha256").update(buffer).digest("hex");
  const version = record.version ?? inferFileVersion(files, record);
  const fileRecord = {
    id: record.id || `file-${crypto.randomUUID().slice(0, 12)}`,
    kind: record.kind,
    ownerType: record.ownerType,
    ownerId: record.ownerId || "",
    sourceType: record.sourceType || record.meta?.sourceType || "",
    sourceId: record.sourceId || record.meta?.sourceId || "",
    fileName: record.fileName,
    mimeType: record.mimeType || contentTypeForFile(record.fileName),
    sizeBytes,
    sha256,
    storagePath: record.storagePath,
    downloadUrl: record.downloadUrl || "",
    previewUrl: record.previewUrl || record.downloadUrl || "",
    createdAt: new Date().toISOString(),
    meta: record.meta || {}
  };
  if (version) {
    fileRecord.version = version;
    fileRecord.versionLabel = record.versionLabel || `v${version}`;
  }
  files.unshift(fileRecord);
  await writeJsonArray(fileIndexPath, files.slice(0, 1000));
  return fileRecord;
}

function inferFileVersion(files = [], record = {}) {
  if (record.kind !== "generated-document" || record.ownerType !== "document" || !record.ownerId) {
    return null;
  }

  const sameDocumentFiles = files.filter((file) =>
    file.kind === "generated-document" &&
    file.ownerType === "document" &&
    file.ownerId === record.ownerId
  );
  const maxVersion = sameDocumentFiles.reduce((max, file) => Math.max(max, Number(file.version) || 0), 0);
  return maxVersion > 0 ? maxVersion + 1 : sameDocumentFiles.length + 1;
}

function resolveStoredFilePath(storagePath = "") {
  const filePath = path.resolve(appRoot, storagePath);
  if (!filePath.startsWith(appRoot)) {
    throw new Error("Stored file path is outside service root.");
  }
  return filePath;
}

async function deleteStoredFile(fileRecord = {}) {
  if (!fileRecord.storagePath) return;
  const filePath = resolveStoredFilePath(fileRecord.storagePath);
  await fs.rm(filePath, { force: true }).catch(() => {});
}

function isPreviewableFile(fileName = "") {
  const ext = path.extname(fileName).toLowerCase();
  return [".pdf", ".png", ".jpg", ".jpeg", ".webp"].includes(ext);
}

function extensionForUploadedMimeType(mimeType) {
  if (mimeType === "application/pdf") return ".pdf";
  if (mimeType === "application/vnd.oasis.opendocument.text") return ".odt";
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return ".docx";
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/webp") return ".webp";
  return "";
}

async function readFeedbackReports() {
  return readJsonArray(feedbackReportsPath);
}

async function readJsonArray(filePath) {
  try {
    return parseJsonArray(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    if (error instanceof SyntaxError) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      try {
        return parseJsonArray(await fs.readFile(filePath, "utf8"));
      } catch (retryError) {
        if (retryError instanceof SyntaxError) {
          const corruptPath = `${filePath}.corrupt-${Date.now()}`;
          await fs.copyFile(filePath, corruptPath).catch(() => {});
          console.warn(`Ignoring malformed JSON registry ${path.basename(filePath)}; backup: ${path.basename(corruptPath)}`);
          return [];
        }
        throw retryError;
      }
    }
    throw error;
  }
}

function parseJsonArray(rawValue) {
  const raw = String(rawValue || "").replace(/^\uFEFF/, "").trim();
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

async function writeJsonArray(filePath, items) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(items, null, 2), "utf8");
  await fs.rename(tempPath, filePath);
}

function nextFeedbackReportId(reports, createdAt) {
  const prefix = `BUG-${createdAt.slice(2, 10).replaceAll("-", "")}`;
  const numbers = reports
    .map((item) => String(item.id || ""))
    .filter((id) => id.startsWith(prefix))
    .map((id) => Number(id.split("-").at(-1)))
    .filter(Number.isFinite);
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return `${prefix}-${String(next).padStart(3, "0")}`;
}

function safeFilePart(value) {
  return String(value || "file").replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 80) || "file";
}
