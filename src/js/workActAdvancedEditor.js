import { companyProfiles, customers, documents, jobs, workActs, workListTemplates } from "./data.js";
import { saveDemoState } from "./persistence.js";
import { state } from "./state.js";
import { currentUserName } from "./userIdentity.js";

export async function openWorkActAdvancedEditorForAct(actId, renderApp, options = {}) {
  const act = workActs.find((item) => item.id === actId);
  if (!act) return;

  const requestedDocumentId = options.documentId || act.generatedDocumentId;
  const doc = documents.find((item) => item.id === requestedDocumentId)
    || documents.find((item) => item.workActId === act.id);

  state.selectedWorkActId = act.id;
  state.templateGenWorkActJobId = act.jobId || state.templateGenWorkActJobId;
  state.selectedServiceJobId = act.jobId || state.selectedServiceJobId;
  state.workActEditorDocumentId = doc?.id || act.generatedDocumentId || null;
  state.workActCollaboraSession = null;
  state.workActCollaboraError = "";

  if (!doc) {
    state.workActCollaboraStatus = "";
    state.workActCollaboraError = "Create the Work Act document draft before opening the advanced editor.";
    renderApp?.();
    return;
  }

  state.workActCollaboraStatus = "Preparing Work Act advanced editor...";
  suppressCollaboraWelcomeDialog();
  renderApp?.();

  try {
    const response = await fetch("/api/documents/collabora/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildWorkActCollaboraPayload(act, doc))
    });
    const result = await readJsonResponse(response, "Could not open Work Act advanced editor.");
    if (!response.ok || result?.ok === false) {
      throw new Error(result?.error || "Could not open Work Act advanced editor.");
    }

    const session = result.session || null;
    state.workActCollaboraSession = session;
    state.workActCollaboraStatus = session?.fileName
      ? `Work Act editor ready: ${session.fileName}`
      : "Work Act editor ready.";
    state.workActCollaboraError = "";
    state.workActEditorDocumentId = doc.id;

    act.collaboraSessionId = session?.id || "";
    act.collaboraFileName = session?.fileName || "";
    act.collaboraDownloadUrl = session?.downloadUrl || "";
    act.collaboraPdfDownloadUrl = session?.pdfDownloadUrl || "";
    act.collaboraUpdatedAt = session?.lastSavedAt || session?.updatedAt || new Date().toISOString();
    act.updatedAt = new Date().toISOString();

    doc.workActCollaboraSessionId = session?.id || "";
    doc.workActCollaboraFileName = session?.fileName || "";
    doc.workActCollaboraDownloadUrl = session?.downloadUrl || "";
    doc.workActCollaboraPdfDownloadUrl = session?.pdfDownloadUrl || "";
    doc.workActCollaboraUpdatedAt = act.collaboraUpdatedAt;
    saveDemoState();
  } catch (error) {
    state.workActCollaboraSession = null;
    state.workActCollaboraStatus = "";
    state.workActCollaboraError = error.message || "Could not open Work Act advanced editor.";
  }

  renderApp?.();
}

function buildWorkActCollaboraPayload(act, doc) {
  const job = jobs.find((item) => item.id === act.jobId || item.id === doc.jobId);
  const customer = customers.find((item) => item.name === act.customer || item.name === doc.customer || item.id === job?.customerId);
  const seller = companyProfiles.find((item) => item.id === "seller-viva-medical") || companyProfiles[0] || {};
  const template = workListTemplates.find((item) => item.id === act.workTemplateId);

  return {
    sourceType: "work-act-document",
    sourceId: doc.id,
    ownerId: doc.id,
    documentId: doc.id,
    workActId: act.id,
    mode: "edit",
    permission: "edit",
    title: `${act.number || doc.id} ${act.customer || doc.customer || "Work Act"}`.trim(),
    userId: "local-owner",
    userName: currentUserName(),
    company: seller.displayName || seller.name || act.company || "Viva Medical",
    sellerDisplayName: seller.displayName || seller.name || "Viva Medical",
    sellerName: seller.name || "Viva Medical, UAB",
    sellerAddress: seller.address || "",
    sellerPhone: seller.phone || "",
    sellerWebsite: seller.website || "",
    sellerCompanyCode: seller.registrationCode || "",
    sellerVatCode: seller.vatCode || "",
    sellerBankName: seller.bankName || "",
    sellerBankAccount: seller.bankAccount || "",
    buyerName: customer?.legalName || act.customer || doc.customer || "",
    buyerCompanyCode: customer?.companyCode || "",
    buyerVatCode: customer?.vatCode || "",
    buyerAddress: customer?.documentAddress || customer?.address || "",
    workLocation: customer?.documentAddress || customer?.address || job?.customer || "",
    contact: customer?.contact || "",
    jobId: act.jobId || doc.jobId || "",
    workActNumber: act.number || doc.id,
    documentDate: act.date || doc.created || "",
    workText: act.workText || "",
    workDescription: act.workDescription || "",
    serviceType: act.type || job?.type || "",
    templateName: template?.name || "",
    equipmentItems: act.equipmentItems || [],
    workRows: act.workRows || [],
    reportOptions: act.reportOptions || {},
    meta: {
      documentId: doc.id,
      workActId: act.id,
      jobId: act.jobId || doc.jobId || "",
      customer: act.customer || doc.customer || "",
      source: "Work Acts"
    }
  };
}

function suppressCollaboraWelcomeDialog() {
  try {
    const today = new Date().toDateString().replaceAll(" ", "-");
    window.localStorage.setItem("WSDWelcomeDisabled", "true");
    window.localStorage.setItem("WSDWelcomeDisabledDate", today);
  } catch {
    // Collabora still opens if browser storage is unavailable.
  }
}

async function readJsonResponse(response, fallbackMessage) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    const compactText = text.replace(/\s+/g, " ").trim().slice(0, 180);
    const status = [response.status, response.statusText].filter(Boolean).join(" ");
    throw new Error(`${fallbackMessage}. Server returned ${status || "a non-JSON response"}${compactText ? `: ${compactText}` : "."}`);
  }
}
