import { documents, jobs, workActs } from "../../js/data.js";
import { state } from "../../js/state.js";
import { displayInitialsForRecord } from "../../js/userIdentity.js";

export const documentColumns = [
  { key: "reference", label: "Reference" },
  { key: "type", label: "Type" },
  { key: "customer", label: "Customer" },
  { key: "jobStatus", label: "Job status" },
  { key: "created", label: "Created" },
  { key: "generated", label: "Generated output" },
  { key: "signed", label: "Signed return" },
  { key: "source", label: "Source" }
];

export const documentTypeOptions = [
  "Work Act",
  "Diagnostic report",
  "Commercial offer",
  "Defect act",
  "Contract",
  "Contract annex",
  "Warranty confirmation",
  "Parts request",
  "Vendor return note",
  "Acceptance report",
  "Invoice"
];

export function documentTypeLabel(type) {
  return String(type || "").toLowerCase() === "service act" ? "Work Act" : String(type || "");
}

export function documentReference(doc) {
  return doc?.jobId || doc?.quotationId || doc?.id || "";
}

export function documentCreatedDate(doc) {
  return String(
    doc?.created ||
    doc?.createdAt?.slice?.(0, 10) ||
    doc?.uploadedAt?.slice?.(0, 10) ||
    doc?.generatedFile?.generatedAt?.slice?.(0, 10) ||
    doc?.due ||
    ""
  );
}

export function fullIsoDateOrEmpty(value = "") {
  const normalized = normalizeDateQuery(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : "";
}

export function documentCreatedDateMatches(doc, query = "") {
  const normalizedQuery = normalizeDateQuery(query);
  if (!normalizedQuery) return true;

  const createdDate = documentCreatedDate(doc);
  const normalizedDate = normalizeDateQuery(createdDate);
  const queryDigits = normalizedQuery.replace(/\D/g, "");
  const dateDigits = normalizedDate.replace(/\D/g, "");

  if (!queryDigits) return true;
  if (normalizedDate.startsWith(normalizedQuery)) return true;
  if (dateDigits.startsWith(queryDigits)) return true;
  return dateDigits.includes(queryDigits);
}

export function normalizeDateQuery(value = "") {
  let text = String(value || "")
    .trim()
    .replace(/[./\\_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (/^\d{8}$/.test(text)) {
    return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
  }
  if (/^\d{6}$/.test(text)) {
    return `${text.slice(0, 4)}-${text.slice(4, 6)}`;
  }

  const parts = text.split("-");
  if (/^\d{4}$/.test(parts[0] || "")) {
    if (parts[1]?.length === 1) parts[1] = `0${parts[1]}`;
    if (parts[2]?.length === 1) parts[2] = `0${parts[2]}`;
    return parts.filter(Boolean).join("-");
  }
  return text;
}

export function documentStageForUi(doc) {
  const stage = doc?.pipelineStep || doc?.status || "";
  return stage === "Archived" ? "Approved" : stage;
}

export function documentStatusForUi(doc) {
  if (documentIsDone(doc)) return "Done";
  if (documentHasSignedUpload(doc)) return "Signed";
  const status = doc?.status || documentStageForUi(doc);
  return status === "Archived" ? "Approved" : status;
}

export function documentHasSignedUpload(doc) {
  return Boolean(doc?.signedUploadedAt || doc?.signedFile);
}

export function documentIsDone(doc) {
  return Boolean(doc?.finishedAt || doc?.caseClosed || doc?.status === "Done");
}

export function documentUploadedAt(doc) {
  return (
    doc?.signedUploadedAt ||
    doc?.uploadedAt ||
    doc?.signedFile?.uploadedAt ||
    doc?.signedFile?.createdAt ||
    doc?.uploadedFile?.uploadedAt ||
    doc?.uploadedFile?.createdAt ||
    ""
  );
}

export function documentUploadedDownloadUrl(doc) {
  return (
    doc?.signedFile?.downloadUrl ||
    doc?.uploadedFile?.downloadUrl ||
    doc?.signedFile?.previewUrl ||
    doc?.uploadedFile?.previewUrl ||
    ""
  );
}

export function documentUploadStatus(doc) {
  const href = documentUploadedDownloadUrl(doc);
  const isUploaded = Boolean(documentUploadedAt(doc) || doc?.signedFile || doc?.uploadedFile || doc?.uploaded);

  if (href) {
    return {
      kind: "download",
      href,
      label: "Download signed",
      title: "Download uploaded signed copy"
    };
  }

  if (isUploaded) {
    return {
      kind: "download-missing-url",
      disabled: true,
      label: "Download signed",
      title: "Signed upload exists, but no usable URL is available"
    };
  }

  return {
    kind: "upload",
    label: "Upload signed",
    title: "Upload signed Work Act copy"
  };
}

export function documentGeneratedOutput(doc) {
  const file = realGeneratedFile(doc);
  if (!file) {
    return {
      kind: "missing",
      label: "Not generated",
      detail: "Open prepares a preview when source data is available.",
      fileName: "",
      downloadUrl: "",
      previewUrl: "",
      versionLabel: ""
    };
  }

  const downloadUrl = file.downloadUrl || file.fileRecord?.downloadUrl || "";
  const previewUrl = file.previewUrl || file.fileRecord?.previewUrl || "";
  const fileName = file.fileName || file.fileRecord?.fileName || `${doc.id}.pdf`;

  if (!downloadUrl && !previewUrl) {
    return {
      kind: "missing-url",
      label: "Generated",
      detail: "File metadata exists, but no usable URL is available.",
      fileName,
      downloadUrl: "",
      previewUrl: "",
      versionLabel: file.versionLabel || ""
    };
  }

  return {
    kind: "ready",
    label: "Generated PDF",
    detail: [file.versionLabel, fileName].filter(Boolean).join(" / "),
    fileName,
    downloadUrl,
    previewUrl,
    versionLabel: file.versionLabel || "",
    generatedAt: file.generatedAt || file.fileRecord?.createdAt || doc.generatedAt || ""
  };
}

export function isWorkActDocument(doc) {
  const type = String(doc?.type || "").toLowerCase();
  return Boolean(doc?.workActId || type.includes("work act") || type.includes("service act"));
}

export function workActDocumentForJob(job) {
  if (!job) return null;
  const act = workActs.find((item) => item.jobId === job.id);
  return documents.find((doc) =>
    (act?.generatedDocumentId && doc.id === act.generatedDocumentId) ||
    (act?.id && doc.workActId === act.id) ||
    (doc.jobId === job.id && isWorkActDocument(doc))
  ) || null;
}

export function jobStatusForUi(job) {
  if (!job) return "-";
  if (job.status === "Cancelled") return "Cancelled";
  if (job.status === "Done" || job.finishedAt || job.closedAt) return "Done";

  const workActDoc = workActDocumentForJob(job);
  if (workActDoc && documentIsDone(workActDoc)) return "Done";
  if (workActDoc?.generatedFile?.downloadUrl || workActDoc?.pipelineStep === "Signature" || job.status === "Waiting signature") {
    return "Waiting signature";
  }

  return "Open";
}

export function jobStatusForDocument(doc) {
  const job = jobs.find((item) => item.id === doc?.jobId);
  return job ? jobStatusForUi(job) : "-";
}

export function applyDocumentTableFilters(rows = documents) {
  const query = state.documentSearchQuery.trim().toLowerCase();
  return rows.filter((doc) => {
    if (state.documentTypeFilter !== "All" && doc.type !== state.documentTypeFilter) return false;
    if (state.documentCustomerFilter !== "All" && doc.customer !== state.documentCustomerFilter) return false;
    if (!documentCreatedDateMatches(doc, state.documentDateQuery)) return false;
    if (!query) return true;
    const generatedOutput = documentGeneratedOutput(doc);

    return [
      doc.id,
      doc.type,
      doc.jobId,
      doc.quotationId,
      doc.customer,
      doc.owner,
      documentReference(doc),
      documentCreatedDate(doc),
      doc.createdBy,
      doc.createdByInitials,
      displayInitialsForRecord(doc),
      documentStageForUi(doc),
      documentStatusForUi(doc),
      doc.signedBy,
      doc.description,
      generatedOutput.label,
      generatedOutput.fileName,
      generatedOutput.versionLabel,
      doc.generatedFile?.fileId,
      doc.generatedFile?.fileRecord?.id
    ].some((value) => String(value || "").toLowerCase().includes(query));
  }).sort(compareDocumentWorkflowRows);
}

export function documentFilterTypes() {
  return ["All", ...new Set(documents.map((doc) => doc.type).filter(Boolean))];
}

export function documentFilterCustomers() {
  return ["All", ...new Set(documents.map((doc) => doc.customer).filter(Boolean))];
}

export function uploadTargetDocument() {
  return documents.find((doc) => doc.id === state.documentUploadTargetId) || null;
}

export function defaultUploadJob(targetDoc = uploadTargetDocument()) {
  return targetDoc ? jobs.find((job) => job.id === targetDoc.jobId) : jobs[0];
}

export function defaultUploadType() {
  return state.documentUploadDefaultType || documentTypeOptions[0];
}

function realGeneratedFile(doc = {}) {
  const file = doc.generatedFile && typeof doc.generatedFile === "object" ? doc.generatedFile : null;
  if (!file || file.source === "mock") return null;
  return file;
}

function compareDocumentWorkflowRows(a, b) {
  const rankDiff = documentWorkflowRank(a) - documentWorkflowRank(b);
  if (rankDiff !== 0) return rankDiff;
  const dateDiff = documentSortDate(b) - documentSortDate(a);
  if (dateDiff !== 0) return dateDiff;
  return String(documentReference(a)).localeCompare(String(documentReference(b)));
}

function documentWorkflowRank(doc = {}) {
  const generated = documentGeneratedOutput(doc);
  if (generated.kind === "ready" && !documentHasSignedUpload(doc)) return 0;
  if (generated.kind === "ready") return 1;
  if (!documentHasSignedUpload(doc)) return 2;
  return 3;
}

function documentSortDate(doc = {}) {
  const value = (
    doc.createdAt ||
    doc.generatedFile?.generatedAt ||
    doc.uploadedAt ||
    doc.created ||
    ""
  );
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}
