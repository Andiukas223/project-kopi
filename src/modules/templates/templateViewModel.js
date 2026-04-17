import {
  companyProfiles,
  customers,
  equipment,
  jobs,
  users,
  workActs,
  workEquipmentTools,
  workListTemplates
} from "../../js/data.js";
import { state } from "../../js/state.js";

export const richEditorCommands = [
  ["bold", "Bold"],
  ["italic", "Italic"],
  ["underline", "Underline"],
  ["insertUnorderedList", "List"],
  ["insertOrderedList", "Numbered"]
];

export function selectedWorkListTemplate() {
  const selectedId = workListTemplates.some((tpl) => tpl.id === state.selectedWltId)
    ? state.selectedWltId
    : workListTemplates[0]?.id;
  return workListTemplates.find((tpl) => tpl.id === selectedId) || null;
}

export function companyValueForTemplate(tpl) {
  return tpl?.company || tpl?.companyName || companyProfiles[0]?.name || "Viva Medical, UAB";
}

export function companyOptionsForTemplate(tpl) {
  const current = companyValueForTemplate(tpl);
  const options = companyProfiles.map((company) => company.name);
  return options.includes(current) ? options : [...options, current];
}

export function serviceTypeOptions() {
  return ["PM", "Service"].map((type) => ({ value: type, label: type }));
}

export function templateOptions() {
  return workListTemplates.map((tpl) => ({ value: tpl.id, label: tpl.name }));
}

export function userOptions() {
  return users.map((user) => ({ value: user.name, label: user.name }));
}

export function equipmentOptions() {
  return equipment.map((eq) => ({
    value: eq.id,
    label: `${eq.name}${eq.serial ? ` / SN ${eq.serial}` : ""}`,
    detail: eq.customer || ""
  }));
}

export function hospitalOptions() {
  return customers.map((customer) => ({
    value: customer.id,
    label: customer.name,
    detail: [customer.city, customer.type].filter(Boolean).join(" / ")
  }));
}

export function workEquipmentOptions() {
  return workEquipmentTools.map((tool) => ({
    value: tool.id,
    label: tool.name,
    detail: [tool.category, tool.purpose].filter(Boolean).join(" / ")
  }));
}

export function templateGenerationJobOptions() {
  return jobs.map((job) => ({
    value: job.id,
    label: `${job.id} / ${job.customer} / ${job.equipment}`
  }));
}

export function buildTemplateGenerationPayload(jobId, tpl = {}) {
  const job = jobs.find((item) => item.id === jobId) || jobs[0] || {};
  const eq = equipment.find((item) =>
    item.id === job.equipmentId ||
    item.name === job.equipment ||
    item.serial === job.serial
  ) || {};
  const customer = customers.find((item) => item.name === job.customer || item.id === eq.customerId) || {};
  const workAct = workActs.find((item) => item.jobId === job.id);
  const equipmentItems = workAct?.equipmentItems?.length
    ? workAct.equipmentItems
    : eq.id
      ? [{
          equipmentId: eq.id,
          name: eq.name,
          serial: eq.serial,
          location: eq.location || "",
          category: eq.category || ""
        }]
      : [];
  const contact = customer.contact || customer.contactRole
    ? [customer.contact, customer.phone].filter(Boolean).join(" - ")
    : "";

  return {
    documentType: "Template document",
    sourceType: "template",
    sourceId: tpl.backendTemplateId || tpl.id,
    jobId: job.id || "",
    customer: job.customer || customer.name || "",
    equipment: job.equipment || eq.name || "",
    serial: job.serial || eq.serial || "",
    owner: tpl.entryPerson || job.owner || "",
    description: `Generated from template ${tpl.name || ""}`.trim(),
    format: tpl.output?.defaultFormat || "pdf",
    equipmentItems,
    workActRows: workAct?.workRows || [],
    reportOptions: workAct?.reportOptions || {},
    payload: {
      customer: job.customer || customer.name || "",
      jobId: job.id || "",
      equipment: job.equipment || eq.name || "",
      serial: job.serial || eq.serial || "",
      owner: tpl.entryPerson || job.owner || "",
      buyerName: customer.legalName || job.customer || "",
      buyerAddress: customer.documentAddress || customer.address || "",
      workLocation: customer.documentAddress || customer.address || eq.location || "",
      contact,
      notes: workAct?.workText || tpl.bodyText || "",
      equipmentItems,
      equipmentItemsText: equipmentItems
        .map((item) => `${item.name || ""}${item.serial ? ` / SN ${item.serial}` : ""}${item.location ? ` / ${item.location}` : ""}`)
        .filter(Boolean)
        .join("\n"),
      workActRows: workAct?.workRows || [],
      workActRowsText: (workAct?.workRows || [])
        .map((row) => `${row.number || ""}. ${row.completed ? "[x]" : "[ ]"} ${row.description || ""}${row.comments ? ` - ${row.comments}` : ""}`)
        .join("\n"),
      reportOptions: workAct?.reportOptions || {}
    }
  };
}

export function wltArray(value) {
  const aliases = {
    "EQ-1001": "EQ-501",
    "EQ-1005": "EQ-505",
    "EQ-2001": "EQ-502",
    "EQ-3001": "EQ-503",
    "ultrasound-probes": "digital-multimeter",
    "printer-export": "electrical-safety-analyzer",
    "water-supply": "pressure-gauge",
    "chemistry-dosing": "thermometer",
    "battery-charger": "digital-multimeter",
    "safety-load": "load-cell-tester",
    "calibration-tools": "electrical-safety-analyzer"
  };
  return Array.isArray(value) ? value.map((item) => aliases[item] || item) : [];
}

export function wltVisualHtml(tpl) {
  return sanitizeRichTemplateHtml(tpl?.richBodyHtml || defaultWltVisualHtml(tpl));
}

export function defaultWltVisualHtml(tpl = {}) {
  return `
    <h3>${escapeHtml(tpl.name || "Template")}</h3>
    ${tpl.bodyText ? `<p>${escapeHtml(tpl.bodyText)}</p>` : ""}
    <p><strong>Applicability:</strong> configured by service type, equipment, hospital, and work equipment.</p>
    <p>Concrete checklist rows are added in the Work Acts module and appended to the generated Work Act document.</p>
  `;
}

export function sanitizeRichTemplateHtml(html = "") {
  return String(html)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
