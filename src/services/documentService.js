const DOCUMENT_API_BASE = "/api/documents";

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

export async function generateDocument(payload) {
  const response = await fetch(`${DOCUMENT_API_BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return readJsonResponse(response, "Could not generate document.");
}

export async function listGeneratedDocumentRecords(options = {}) {
  const query = new URLSearchParams();
  if (options.limit) query.set("limit", String(options.limit));
  const suffix = query.toString() ? `?${query}` : "";
  const response = await fetch(`${DOCUMENT_API_BASE}/generated-records${suffix}`);
  const result = await readJsonResponse(response, "Could not load generated documents.");
  return {
    contractVersion: result.contractVersion || "generated-document-records.v1",
    count: Number(result.count || result.documents?.length || 0),
    documents: Array.isArray(result.documents) ? result.documents : []
  };
}

export async function uploadDocumentFile(payload) {
  const response = await fetch(`${DOCUMENT_API_BASE}/files/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return readJsonResponse(response, "Could not upload document file.");
}

export async function listFeedbackReports() {
  const response = await fetch(`${DOCUMENT_API_BASE}/feedback/reports`);
  return readJsonResponse(response, "Could not load feedback reports.");
}
