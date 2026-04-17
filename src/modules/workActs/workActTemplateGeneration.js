import { companyProfiles, contracts, customers, equipment, jobs } from "../../js/data.js";
import { currentUserName, initialsFromName } from "../../js/userIdentity.js";
import {
  reportOptionRows,
  reportOptionsForAct,
  selectedTemplateForAct,
  workActContractLabel,
  workListTemplateOptionsForAct
} from "./workActsViewModel.js";

const DEFAULT_OUTPUT_TEMPLATE_ID = "tpl-service-act";

export function resolveTemplateForWorkAct(act) {
  const selected = selectedTemplateForAct(act);
  if (selected?.isActive !== false) {
    return { template: selected, derived: false };
  }

  const derived = workListTemplateOptionsForAct(act).find((template) => template?.isActive !== false) || null;
  return { template: derived, derived: Boolean(derived) };
}

export function buildWorkActTemplateGenerationPayload(act, template, options = {}) {
  const job = jobs.find((item) => item.id === act?.jobId) || null;
  const customer = customerForWorkAct(act, job);
  const seller = companyProfiles[0] || {};
  const createdBy = act?.createdBy || currentUserName();
  const equipmentItems = normaliseEquipmentItems(act, job);
  const reportOptions = reportOptionsForAct(act);
  const reportOptionsText = reportOptionsSummary(reportOptions);
  const workActRows = normaliseWorkActRows(act?.workRows || []);
  const workActRowsText = workActRowsSummary(workActRows);
  const equipmentItemsText = equipmentItemsSummary(equipmentItems);
  const contractNumber = workActContractLabel(act);
  const documentId = options.documentId || act?.generatedDocumentId || "";
  const owner = act?.createdByInitials || initialsFromName(createdBy);
  const buyerName = customer?.legalName || act?.customer || job?.customer || "";
  const buyerAddress = customer?.documentAddress || customer?.address || "";
  const sellerRequisitesText = requisitesText({
    name: seller.name || seller.displayName,
    address: seller.address,
    phone: seller.phone,
    website: seller.website,
    companyCode: seller.registrationCode,
    vatCode: seller.vatCode,
    bankName: seller.bankName,
    bankAccount: seller.bankAccount
  });
  const buyerRequisitesText = requisitesText({
    name: buyerName,
    address: buyerAddress,
    phone: customer?.phone,
    companyCode: customer?.companyCode,
    vatCode: customer?.vatCode,
    bankName: customer?.bankName,
    bankAccount: customer?.bankAccount
  });
  const notes = act?.workText || act?.workDescription || job?.problemDescription || "";

  const fields = {
    documentId,
    documentType: "Work Act",
    sourceType: "work-act",
    sourceId: act?.id || "",
    workActId: act?.id || "",
    workActNumber: act?.number || "",
    jobId: act?.jobId || "",
    customer: act?.customer || job?.customer || "",
    customerAddress: customer?.address || "",
    sellerName: seller.name || "",
    sellerDisplayName: seller.displayName || seller.name || "",
    sellerAddress: seller.address || "",
    sellerPhone: seller.phone || "",
    sellerWebsite: seller.website || "",
    sellerCompanyCode: seller.registrationCode || "",
    sellerVatCode: seller.vatCode || "",
    sellerBankName: seller.bankName || "",
    sellerBankAccount: seller.bankAccount || "",
    sellerRequisitesText,
    buyerName,
    buyerCompanyCode: customer?.companyCode || "",
    buyerVatCode: customer?.vatCode || "",
    buyerAddress,
    buyerBankName: customer?.bankName || "",
    buyerBankAccount: customer?.bankAccount || "",
    buyerRequisitesText,
    contractNumber,
    workLocation: buyerAddress || equipmentItems[0]?.location || "",
    contact: customer ? [customer.contact, customer.phone].filter(Boolean).join(" - ") : "",
    equipment: equipmentItemsText || job?.equipment || "",
    equipmentItems,
    equipmentItemsText,
    serial: equipmentItems.map((item) => item.serial).filter(Boolean).join(", ") || job?.serial || "",
    workActRows,
    workActRowsText,
    reportOptions,
    reportOptionsText,
    notes,
    owner,
    entryPerson: reportOptions.entryPerson || createdBy
  };

  return {
    contractVersion: "work-act-template-generation.v1",
    documentId,
    documentType: "Work Act",
    sourceType: "work-act",
    sourceId: act?.id || "",
    workActId: act?.id || "",
    jobId: act?.jobId || "",
    customer: fields.customer,
    owner,
    createdBy,
    description: `Generated Work Act ${act?.number || documentId} from ${template?.name || "template"}.`,
    format: template?.output?.defaultFormat || "pdf",
    templateId: template?.output?.outputTemplateId || DEFAULT_OUTPUT_TEMPLATE_ID,
    equipmentItems,
    workActRows,
    reportOptions,
    equipment: fields.equipment,
    serial: fields.serial,
    notes,
    fieldsText: [
      sellerRequisitesText ? `Seller requisites:\n${sellerRequisitesText}` : "",
      buyerRequisitesText ? `Buyer requisites:\n${buyerRequisitesText}` : "",
      contractNumber ? `Contract: ${contractNumber}` : "",
      fields.contact ? `Contact: ${fields.contact}` : "",
      equipmentItemsText ? `Equipment items:\n${equipmentItemsText}` : "",
      notes ? `Work text: ${notes}` : "",
      workActRowsText ? `Work rows:\n${workActRowsText}` : "",
      reportOptionsText ? `Report options:\n${reportOptionsText}` : ""
    ].filter(Boolean).join("\n\n"),
    fields
  };
}

export function backendTemplateId(template) {
  return template?.backendTemplateId || template?.id || "";
}

function customerForWorkAct(act, job) {
  return customers.find((item) =>
    item.id === act?.customerId ||
    item.id === job?.customerId ||
    item.name === act?.customer ||
    item.name === job?.customer
  ) || null;
}

function normaliseEquipmentItems(act, job) {
  const selected = Array.isArray(act?.equipmentItems) ? act.equipmentItems : [];
  const fromJob = equipment.find((item) =>
    item.id === job?.equipmentId ||
    item.name === job?.equipment ||
    item.serial === job?.serial
  );
  const items = selected.length ? selected : fromJob ? [fromJob] : [];

  return items.map((item) => ({
    equipmentId: item.equipmentId || item.id || "",
    id: item.equipmentId || item.id || "",
    name: item.name || "",
    serial: item.serial || "",
    category: item.category || "",
    location: item.location || "",
    customer: item.customer || act?.customer || job?.customer || ""
  }));
}

function normaliseWorkActRows(rows) {
  return rows.map((row, index) => ({
    id: row.id || `row-${index + 1}`,
    number: row.number || index + 1,
    description: row.description || "",
    completed: Boolean(row.completed),
    comments: row.comments || ""
  }));
}

function equipmentItemsSummary(items) {
  return items
    .map((item) => [item.name, item.serial ? `SN ${item.serial}` : "", item.location].filter(Boolean).join(" / "))
    .filter(Boolean)
    .join("\n");
}

function workActRowsSummary(rows) {
  return rows
    .map((row) => `${row.number || ""}. ${row.completed ? "[x]" : "[ ]"} ${row.description || ""}${row.comments ? ` - ${row.comments}` : ""}`.trim())
    .filter(Boolean)
    .join("\n");
}

function reportOptionsSummary(options = {}) {
  const labels = new Map(reportOptionRows);
  return Object.entries(options)
    .filter(([key]) => key !== "entryPerson")
    .map(([key, value]) => `${labels.get(key) || key}: ${value ? "Yes" : "No"}`)
    .join("\n");
}

function requisitesText(value = {}) {
  return [
    value.name || "",
    value.address ? `Address: ${value.address}` : "",
    value.phone ? `Tel.: ${value.phone}` : "",
    value.website ? `Web: ${value.website}` : "",
    value.companyCode ? `Company code: ${value.companyCode}` : "",
    value.vatCode ? `VAT code: ${value.vatCode}` : "",
    value.bankName ? `Bank: ${value.bankName}` : "",
    value.bankAccount ? `Account: ${value.bankAccount}` : ""
  ].filter(Boolean).join("\n");
}
