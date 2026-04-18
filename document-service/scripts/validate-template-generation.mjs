import { execFile } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import zlib from "node:zlib";

const execFileAsync = promisify(execFile);
const serviceUrl = process.env.DOCUMENT_SERVICE_URL || "http://127.0.0.1:3001";
const appRoot = process.env.APP_ROOT || "/app";
const storageDir = process.env.STORAGE_DIR || path.join(appRoot, "storage");
const generatedDir = path.join(appRoot, "generated");
const templatesPath = path.join(storageDir, "templates.json");
const recordsPath = path.join(storageDir, "generated-document-records.json");
const filesPath = path.join(storageDir, "files.json");

const runId = crypto.randomUUID().slice(0, 8);
const templateId = `validation-template-${runId}`;
const documentId = `DOC-WA-VALIDATION-${runId}`;
const workActId = `WA-VALIDATION-${runId}`;
const previewDir = path.join(generatedDir, `template-validation-${runId}`);
const createdPaths = [];
let generatedRecord = null;
let fileRecord = null;
let passed = false;

const editorHtml = `
  <h2>Validation PM Work Act</h2>
  <p>Customer block: {d.customer}</p>
  <p>Notes: {d.notes}</p>
  <table>
    <tbody>
      <tr>
        <th>Check</th>
        <th>Result</th>
        <th>Engineer</th>
      </tr>
      <tr>
        <td>Customer in cell: {d.customer}</td>
        <td><p>Line one</p><p>Line two</p></td>
        <td>{d.owner}</td>
      </tr>
      <tr>
        <td colspan="2">Merged equipment: {d.equipmentItemsText}</td>
        <td rowspan="2">Rowspan note</td>
      </tr>
      <tr>
        <td>Final note</td>
        <td>{d.notes}</td>
      </tr>
    </tbody>
  </table>
`;

try {
  await ensureServiceIsHealthy();
  await createValidationTemplate();
  await generateValidationDocument();
  const fodtPath = await findGeneratedFodt();
  await assertFodtStructure(fodtPath);
  const pngPath = await convertPdfToPng();
  const imageMetrics = await inspectPngForTableLines(pngPath);
  console.log(JSON.stringify({
    ok: true,
    templateId,
    documentId,
    generatedFile: fileRecord?.fileName,
    fodtPath,
    pngPath,
    imageMetrics
  }, null, 2));
  passed = true;
} finally {
  if (passed) {
    await cleanupValidationArtifacts();
  } else {
    console.error(JSON.stringify({
      ok: false,
      templateId,
      documentId,
      generatedFile: fileRecord?.fileName || "",
      previewDir,
      note: "Validation artifacts were left in place for debugging."
    }, null, 2));
  }
}

async function ensureServiceIsHealthy() {
  const response = await fetch(`${serviceUrl}/health`);
  const body = await response.json();
  assert(response.ok && body.ok, "document-service health check failed");
}

async function createValidationTemplate() {
  const response = await fetch(`${serviceUrl}/templates`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: templateId,
      metadata: {
        name: "Validation PM Work Act Template",
        company: "Viva Medical, UAB",
        serviceType: "PM",
        description: "FLATTENED_BODY_MARKER_SHOULD_NOT_APPEAR",
        entryPerson: "Validation",
        entryDate: new Date().toISOString().slice(0, 10),
        status: "Active"
      },
      mergeFields: [
        { key: "documentId", label: "Document" },
        { key: "documentDateLt", label: "Date" },
        { key: "customer", label: "Customer" },
        { key: "equipmentItemsText", label: "Equipment" },
        { key: "notes", label: "Notes" },
        { key: "owner", label: "Owner" }
      ],
      editorContent: {
        format: "umo-html",
        html: editorHtml,
        text: "",
        json: {
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Validation PM Work Act" }] },
            { type: "table", content: [] }
          ]
        }
      },
      output: {
        defaultFormat: "pdf",
        outputTemplateId: "tpl-service-act"
      }
    })
  });
  const body = await response.json();
  assert(response.status === 201 && body.ok, `template create failed: ${body.error || response.status}`);
}

async function generateValidationDocument() {
  const response = await fetch(`${serviceUrl}/templates/${templateId}/generate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      documentId,
      documentType: "Work Act",
      sourceType: "work-act",
      sourceId: workActId,
      workActId,
      format: "pdf",
      customer: "Validation Hospital",
      equipmentItemsText: "Validation Ultrasound / SN VAL-001",
      notes: "Validation note only",
      owner: "QA"
    })
  });
  const body = await response.json();
  assert(response.status === 201 && body.ok, `document generation failed: ${body.error || response.status}`);
  generatedRecord = body.documentRecord;
  fileRecord = body.fileRecord;
  assert(fileRecord?.storagePath, "generated file record did not include storagePath");
  createdPaths.push(path.join(appRoot, fileRecord.storagePath));
}

async function findGeneratedFodt() {
  const templateDir = path.join(generatedDir, "templates");
  const names = await fs.readdir(templateDir);
  const matching = names
    .filter((name) => name.startsWith(`${templateId}-editor-`) && name.endsWith(".fodt"))
    .map((name) => path.join(templateDir, name));
  assert(matching.length > 0, "temporary editor FODT was not created");
  matching.forEach((filePath) => createdPaths.push(filePath));
  return matching[0];
}

async function assertFodtStructure(fodtPath) {
  const content = await fs.readFile(fodtPath, "utf8");
  assert(content.includes("<table:table "), "FODT does not contain an ODF table");
  assert(content.includes("<table:table-column "), "FODT does not declare ODF table columns");
  assert(content.includes("EditorHeaderCell"), "FODT does not use the header-cell style");
  assert(content.includes("fo:border-left=\"0.75pt solid #000000\""), "FODT cell border style is missing");
  assert(content.includes("table:number-columns-spanned=\"2\""), "FODT colspan was not preserved");
  assert(content.includes("table:number-rows-spanned=\"2\""), "FODT rowspan was not preserved");
  assert(content.includes("<table:covered-table-cell"), "FODT does not include covered cells for merged areas");
  assert(content.includes("Customer block: Validation Hospital"), "normal placeholder text was not resolved");
  assert(content.includes("Customer in cell: Validation Hospital"), "placeholder inside table cell was not resolved");
  assert(content.includes("Validation Ultrasound / SN VAL-001"), "equipment placeholder inside merged cell was not resolved");
  assert(content.includes("<text:p>Line one</text:p><text:p>Line two</text:p>"), "multiline table cell was not preserved as separate paragraphs");
  assert(countOccurrences(content, "Validation note only") === 2, "notes placeholder did not resolve exactly where used");
  assert(!content.includes("FLATTENED_BODY_MARKER_SHOULD_NOT_APPEAR"), "template description/body fallback leaked into generated editor FODT");
  assert(!content.includes("{d."), "unresolved merge token remained in generated editor FODT");
}

async function convertPdfToPng() {
  const pdfPath = path.join(appRoot, fileRecord.storagePath);
  await fs.mkdir(previewDir, { recursive: true });
  await execFileAsync("libreoffice", [
    "--headless",
    "--convert-to",
    "png",
    "--outdir",
    previewDir,
    pdfPath
  ], { timeout: 120000 });
  const names = await fs.readdir(previewDir);
  const pngName = names.find((name) => name.toLowerCase().endsWith(".png"));
  assert(pngName, "LibreOffice did not produce a PNG preview for the generated PDF");
  const pngPath = path.join(previewDir, pngName);
  createdPaths.push(pngPath);
  return pngPath;
}

async function inspectPngForTableLines(pngPath) {
  const { width, height, bytesPerPixel, pixels } = await readPngPixels(pngPath);
  let darkPixels = 0;
  let horizontalRuns = 0;
  let verticalRuns = 0;

  for (let y = 0; y < height; y += 1) {
    let run = 0;
    for (let x = 0; x < width; x += 1) {
      if (isDarkPixel(pixels, width, bytesPerPixel, x, y)) {
        darkPixels += 1;
        run += 1;
      } else {
        if (run >= 80) horizontalRuns += 1;
        run = 0;
      }
    }
    if (run >= 80) horizontalRuns += 1;
  }

  for (let x = 0; x < width; x += 1) {
    let run = 0;
    for (let y = 0; y < height; y += 1) {
      if (isDarkPixel(pixels, width, bytesPerPixel, x, y)) {
        run += 1;
      } else {
        if (run >= 40) verticalRuns += 1;
        run = 0;
      }
    }
    if (run >= 40) verticalRuns += 1;
  }

  assert(darkPixels > 1000, "generated PDF preview appears blank or nearly blank");
  assert(horizontalRuns >= 4, `expected visible table horizontal borders, found ${horizontalRuns}`);
  assert(verticalRuns >= 3, `expected visible table vertical borders, found ${verticalRuns}`);

  return { width, height, darkPixels, horizontalRuns, verticalRuns };
}

async function cleanupValidationArtifacts() {
  await filterJsonArray(templatesPath, (item) => item.id !== templateId);
  await filterJsonArray(recordsPath, (item) => item.id !== documentId);
  await filterJsonArray(filesPath, (item) => item.ownerId !== documentId && item.id !== fileRecord?.id);
  await Promise.all(createdPaths.map((filePath) => fs.rm(filePath, { force: true }).catch(() => {})));
  await fs.rm(previewDir, { recursive: true, force: true }).catch(() => {});
}

async function filterJsonArray(filePath, predicate) {
  const items = await readJsonArray(filePath);
  await fs.writeFile(filePath, `${JSON.stringify(items.filter(predicate), null, 2)}\n`, "utf8");
}

async function readJsonArray(filePath) {
  try {
    const raw = String(await fs.readFile(filePath, "utf8")).replace(/^\uFEFF/, "").trim();
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function readPngPixels(filePath) {
  const buffer = await fs.readFile(filePath);
  const signature = buffer.subarray(0, 8).toString("hex");
  assert(signature === "89504e470d0a1a0a", "preview output is not a PNG file");

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idatChunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += length + 12;
  }

  assert(bitDepth === 8, `unsupported PNG bit depth: ${bitDepth}`);
  const bytesPerPixel = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  assert(bytesPerPixel > 0, `unsupported PNG color type: ${colorType}`);

  const inflated = zlib.inflateSync(Buffer.concat(idatChunks));
  const stride = width * bytesPerPixel;
  const pixels = new Uint8Array(height * stride);
  let sourceOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[sourceOffset];
    sourceOffset += 1;
    const row = inflated.subarray(sourceOffset, sourceOffset + stride);
    sourceOffset += stride;
    const rowOffset = y * stride;
    const previousRowOffset = (y - 1) * stride;

    for (let x = 0; x < stride; x += 1) {
      const left = x >= bytesPerPixel ? pixels[rowOffset + x - bytesPerPixel] : 0;
      const up = y > 0 ? pixels[previousRowOffset + x] : 0;
      const upLeft = y > 0 && x >= bytesPerPixel ? pixels[previousRowOffset + x - bytesPerPixel] : 0;
      const raw = row[x];
      let value = raw;
      if (filter === 1) value = raw + left;
      else if (filter === 2) value = raw + up;
      else if (filter === 3) value = raw + Math.floor((left + up) / 2);
      else if (filter === 4) value = raw + paeth(left, up, upLeft);
      else assert(filter === 0, `unsupported PNG filter: ${filter}`);
      pixels[rowOffset + x] = value & 0xff;
    }
  }

  return { width, height, bytesPerPixel, pixels };
}

function isDarkPixel(pixels, width, bytesPerPixel, x, y) {
  const index = (y * width + x) * bytesPerPixel;
  const alpha = bytesPerPixel === 4 ? pixels[index + 3] : 255;
  return alpha > 20 && pixels[index] < 95 && pixels[index + 1] < 95 && pixels[index + 2] < 95;
}

function paeth(left, up, upLeft) {
  const estimate = left + up - upLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upLeftDistance = Math.abs(estimate - upLeft);
  if (leftDistance <= upDistance && leftDistance <= upLeftDistance) return left;
  if (upDistance <= upLeftDistance) return up;
  return upLeft;
}

function countOccurrences(value, search) {
  return String(value).split(search).length - 1;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
