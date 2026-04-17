const TEMPLATE_API_BASE = "/api/documents/templates";

async function readJsonResponse(response, fallbackMessage) {
  let result = null;
  try {
    result = await response.json();
  } catch {
    result = null;
  }
  if (!response.ok || result?.ok === false) {
    throw new Error(result?.error || fallbackMessage);
  }
  return result || {};
}

export async function listTemplateRecords(options = {}) {
  const query = options.includeArchived ? "?includeArchived=1" : "";
  const response = await fetch(`${TEMPLATE_API_BASE}${query}`);
  return readJsonResponse(response, "Could not load templates.");
}

export async function getTemplateRecord(templateId) {
  const response = await fetch(`${TEMPLATE_API_BASE}/${encodeURIComponent(templateId)}`);
  return readJsonResponse(response, "Could not load template.");
}

export async function createTemplateRecord(payload) {
  const response = await fetch(TEMPLATE_API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return readJsonResponse(response, "Could not create template.");
}

export async function updateTemplateRecord(templateId, payload) {
  const response = await fetch(`${TEMPLATE_API_BASE}/${encodeURIComponent(templateId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return readJsonResponse(response, "Could not save template.");
}

export async function archiveTemplateRecord(templateId) {
  const response = await fetch(`${TEMPLATE_API_BASE}/${encodeURIComponent(templateId)}/archive`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });
  return readJsonResponse(response, "Could not archive template.");
}

export async function generateTemplateDocument(templateId, payload) {
  const response = await fetch(`${TEMPLATE_API_BASE}/${encodeURIComponent(templateId)}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return normaliseTemplateGenerationResponse(
    await readJsonResponse(response, "Could not generate document from template.")
  );
}

function normaliseTemplateGenerationResponse(result = {}) {
  const documentRecord = result.documentRecord && typeof result.documentRecord === "object"
    ? result.documentRecord
    : null;
  const fileRecord = result.fileRecord && typeof result.fileRecord === "object"
    ? result.fileRecord
    : documentRecord?.generatedFile?.fileRecord || null;
  const downloadUrl = result.downloadUrl || fileRecord?.downloadUrl || documentRecord?.generatedFile?.downloadUrl || "";
  const previewUrl = result.previewUrl || fileRecord?.previewUrl || documentRecord?.generatedFile?.previewUrl || "";

  if (!documentRecord?.id) {
    throw new Error("Document service did not return a generated document record.");
  }
  if (!fileRecord?.id) {
    throw new Error("Document service did not return generated file metadata.");
  }
  if (!downloadUrl && !previewUrl) {
    throw new Error("Document service did not return a preview or download URL.");
  }

  return {
    ok: true,
    contractVersion: result.contractVersion || "template-generation.v1",
    documentRecord: {
      ...documentRecord,
      generatedFile: {
        ...(documentRecord.generatedFile || {}),
        fileRecord,
        downloadUrl,
        previewUrl
      }
    },
    fileRecord,
    downloadUrl,
    previewUrl
  };
}
