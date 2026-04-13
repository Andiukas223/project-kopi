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
const app = express();
const port = Number(process.env.PORT || 3001);

const templateMap = {
  "tpl-service-act": "work-act.fodt",
  "tpl-diagnostic": "generic-document.fodt",
  "tpl-quotation": "commercial-offer.fodt",
  "tpl-defect-act": "defect-act.fodt",
  "tpl-acceptance": "generic-document.fodt",
  "tpl-vendor-return": "generic-document.fodt"
};

const allowedFormats = new Set(["odt", "docx", "pdf"]);

app.use(cors());
app.use(express.json({ limit: "2mb" }));

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
      downloadUrl: `/api/documents/download/${rendered.fileName}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: error.message || "Document generation failed." });
  }
});

app.get("/download/:fileName", async (req, res) => {
  const safeName = path.basename(req.params.fileName);
  const filePath = path.join(generatedDir, safeName);
  res.download(filePath);
});

app.listen(port, () => {
  console.log(`Document service listening on ${port}`);
});

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
  const equipmentItems = body.equipmentItems || fields.equipmentItems || [];
  const workActRows = body.workActRows || fields.workActRows || [];
  const equipmentItemsText = Array.isArray(equipmentItems)
    ? equipmentItems.map((item) => `${item.name || ""}${item.serial ? ` / SN ${item.serial}` : ""}${item.location ? ` / ${item.location}` : ""}`).filter(Boolean).join("\n")
    : "";
  const workActRowsText = Array.isArray(workActRows)
    ? workActRows.map((row) => `${row.number || ""}. ${row.completed ? "[x]" : "[ ]"} ${row.description || ""}${row.comments ? ` - ${row.comments}` : ""}`).join("\n")
    : "";
  const templateSections = Array.isArray(body.templateSections) ? body.templateSections : [];
  const data = {
    documentId: body.documentId || "DOC-0000",
    documentType: body.documentType || "Document",
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
    generatedAt: new Date().toISOString().slice(0, 10),
    notes: body.notes || "",
    fieldsText: body.fieldsText || "",
    customerAddress: fields.customerAddress || "",
    contact: fields.contact || "",
    quotationAmount: fields.quotationAmount || "",
    quotationDue: fields.quotationDue || "",
    defectDescription: fields.defectDescription || body.notes || "",
    pipelineStep: fields.pipelineStep || "",
    workActNumber: fields.workActNumber || "",
    fields,
    workActRows,
    workActRowsText
  };
  data.templateBodyRendered = renderTemplateText(data.templateBody, data);
  data.templateSectionsText = templateSections.length
    ? templateSections.map((section) => `${section.label || ""}\n${renderTemplateText(section.value || "", data)}`).join("\n\n")
    : data.templateBodyRendered;

  return {
    format,
    templateId,
    templatePath: path.join(templatesDir, templateName),
    data
  };
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
  return { id, fileName, filePath };
}
