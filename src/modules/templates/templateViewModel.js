import {
  companyProfiles,
  customers,
  equipment,
  users,
  workEquipmentTools,
  workListTemplates
} from "../../js/data.js";
import { state } from "../../js/state.js";
import { templateRecordToWorkListTemplate } from "./templateRecordAdapter.js";

export const templateColumns = [
  { key: "name", label: "Template name" },
  { key: "type", label: "Type" },
  { key: "applicability", label: "Applicability" },
  { key: "owner", label: "Owner" },
  { key: "updated", label: "Updated" },
  { key: "created", label: "Created" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" }
];

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
  return workListTemplates.map((tpl) => ({
    value: tpl.id,
    label: tpl.isActive === false ? `${tpl.name} (archived)` : tpl.name
  }));
}

export function templateListRows(records = []) {
  return (Array.isArray(records) ? records : [])
    .map(templateRecordToListRow)
    .filter(Boolean)
    .sort(compareTemplateRows);
}

export function applyTemplateListFilters(rows = [], filters = {}) {
  const query = String(filters.query || "").trim().toLowerCase();
  const type = filters.type || "All";
  const status = filters.status || "All";
  const owner = filters.owner || "All";

  return rows.filter((row) => {
    if (type !== "All" && row.type !== type) return false;
    if (status !== "All" && row.status !== status) return false;
    if (owner !== "All" && row.owner !== owner) return false;
    if (!query) return true;

    return [
      row.id,
      row.name,
      row.type,
      row.category,
      row.status,
      row.owner,
      row.description,
      row.applicability,
      row.updatedDate,
      row.createdDate,
      row.mergeFieldCount,
      row.outputFormat
    ].some((value) => String(value || "").toLowerCase().includes(query));
  });
}

export function templateListTypeOptions(rows = []) {
  return ["All", ...uniqueSorted(rows.map((row) => row.type).filter(Boolean))];
}

export function templateListStatusOptions(rows = []) {
  const statuses = uniqueSorted(rows.map((row) => row.status).filter(Boolean));
  return ["All", ...["Active", "Draft", "Archived"].filter((status) => statuses.includes(status))];
}

export function templateListOwnerOptions(rows = []) {
  return ["All", ...uniqueSorted(rows.map((row) => row.owner).filter(Boolean))];
}

export function templateListHasFilters(filters = {}) {
  return Boolean(
    String(filters.query || "").trim() ||
    (filters.type && filters.type !== "All") ||
    (filters.status && filters.status !== "All") ||
    (filters.owner && filters.owner !== "All")
  );
}

export function userOptions() {
  return users.map((user) => ({ value: user.name, label: user.name }));
}

export function equipmentOptions() {
  return [...equipment]
    .sort((a, b) => {
      const customerDiff = String(a.customer || "").localeCompare(String(b.customer || ""));
      if (customerDiff !== 0) return customerDiff;
      const nameDiff = String(a.name || "").localeCompare(String(b.name || ""));
      if (nameDiff !== 0) return nameDiff;
      return String(a.serial || "").localeCompare(String(b.serial || ""));
    })
    .map((eq) => ({
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

function templateRecordToListRow(record) {
  if (!record?.id) return null;
  return templateToListRow(templateRecordToWorkListTemplate(record), record);
}

function templateToListRow(template = {}, record = null) {
  if (!template?.id) return null;
  const metadata = record?.metadata || {};
  const audit = record?.audit || template.backendTemplateAudit || {};
  const status = metadata.status || template.backendTemplateStatus || (template.isActive === false ? "Archived" : "Active");
  const updatedDate = formatTemplateDate(audit.updatedAt || template.editorContent?.updatedAt || template.entryDate);
  const createdDate = formatTemplateDate(audit.createdAt || template.entryDate);

  return {
    id: template.backendTemplateId || template.id,
    localId: template.id,
    name: metadata.name || template.name || "Untitled template",
    type: metadata.serviceType || template.serviceType || "Service",
    category: metadata.equipmentCategory || template.equipmentCategory || "General",
    status,
    isArchived: status === "Archived" || template.isActive === false,
    owner: metadata.entryPerson || template.entryPerson || "Not assigned",
    description: metadata.description || template.bodyText || "",
    updatedDate,
    createdDate,
    applicability: templateApplicabilityText(template),
    mergeFieldCount: Array.isArray(template.mergeFields) ? template.mergeFields.length : 0,
    outputFormat: template.output?.defaultFormat || "pdf",
    template,
    record
  };
}

function templateApplicabilityText(template = {}) {
  const serviceTypes = wltArray(template.linkedServiceTypes);
  const equipmentCount = wltArray(template.linkedEquipmentIds).length;
  const hospitalCount = wltArray(template.linkedHospitalIds).length;
  const toolCount = wltArray(template.linkedWorkEquipmentIds).length;
  const parts = [
    serviceTypes.length ? serviceTypes.join(", ") : "All service types",
    countLabel(equipmentCount, "equipment item"),
    countLabel(hospitalCount, "hospital"),
    countLabel(toolCount, "work tool")
  ].filter(Boolean);

  return parts.join(" / ");
}

function countLabel(count, singular) {
  if (!count) return "";
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
}

function formatTemplateDate(value = "") {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function compareTemplateRows(a, b) {
  const statusDiff = templateStatusRank(a.status) - templateStatusRank(b.status);
  if (statusDiff !== 0) return statusDiff;
  const dateDiff = dateTime(b.updatedDate) - dateTime(a.updatedDate);
  if (dateDiff !== 0) return dateDiff;
  return String(a.name || "").localeCompare(String(b.name || ""));
}

function templateStatusRank(status = "") {
  if (status === "Active") return 0;
  if (status === "Draft") return 1;
  if (status === "Archived") return 2;
  return 3;
}

function dateTime(value = "") {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function uniqueSorted(values = []) {
  return Array.from(new Set(values)).sort((a, b) => String(a).localeCompare(String(b)));
}
