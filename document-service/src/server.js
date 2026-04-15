import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import carbone from "carbone";
import cors from "cors";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const templatesDir = path.join(appRoot, "templates");
const generatedDir = path.join(appRoot, "generated");
const customTemplatesDir = path.join(generatedDir, "templates");
const storageDir = process.env.STORAGE_DIR || path.join(appRoot, "storage");
const feedbackAttachmentDir = path.join(storageDir, "attachments", "bug-reports");
const feedbackReportsPath = path.join(storageDir, "feedback-reports.json");
const fileIndexPath = path.join(storageDir, "files.json");
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
  const equipmentItemsText = Array.isArray(equipmentItems)
    ? equipmentItems.map((item) => `${item.name || ""}${item.serial ? ` / SN ${item.serial}` : ""}${item.location ? ` / ${item.location}` : ""}`).filter(Boolean).join("\n")
    : "";
  const workActRowsText = Array.isArray(workActRows)
    ? workActRows.map((row) => `${row.number || ""}. ${row.completed ? "[x]" : "[ ]"} ${row.description || ""}${row.comments ? ` - ${row.comments}` : ""}`).join("\n")
    : "";
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

function renderTemplateText(text = "", data = {}) {
  return String(text).replace(/\{d\.([A-Za-z0-9_]+)\}/g, (_, key) => {
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
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
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
