import { contracts, customers, documents, equipment, jobs, users, workActs, workListTemplates } from "../../js/data.js";
import { state } from "../../js/state.js";

export const reportOptionRows = [
  ["equipmentWorking", "Equipment working"],
  ["readyForUse", "Ready for use"],
  ["oldPartReturned", "Old part returned to manufacturer"],
  ["hygieneStandard", "Hygiene Standard"],
  ["includePersonName", "Include person name"],
  ["includeSignature", "Include signature"],
  ["includeWorkingHours", "Include working hours"],
  ["showTravelHours", "Show travel hours in report"],
  ["showStartedCompletedTime", "Show started / completed time"],
  ["includeSystemIdentity", "Include system identity"],
  ["includeSystemName", "Include system name"],
  ["useThreeSideTemplate", "Use three side template"]
];

export function sourceJobOptions() {
  return jobs.map((job) => ({
    value: job.id,
    label: `${job.id} / ${job.customer} / ${job.equipment}`
  }));
}

export function selectedSourceJob() {
  return jobs.find((job) => job.id === state.templateGenWorkActJobId)
    || jobs.find((job) => job.id === state.selectedServiceJobId)
    || jobs[0]
    || null;
}

export function selectedWorkAct(job = selectedSourceJob()) {
  return workActs.find((item) => item.id === state.selectedWorkActId)
    || workActs.find((item) => item.jobId === job?.id)
    || null;
}

export function selectedJobHasWorkAct(job = selectedSourceJob()) {
  return Boolean(job && (workActs.some((item) => item.jobId === job.id) || workActDocumentForJob(job)));
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

export function selectedTemplateForAct(act) {
  return workListTemplates.find((tpl) => tpl.id === act?.workTemplateId) || null;
}

export function generatedFileForAct(act) {
  const doc = documents.find((item) => item.id === act?.generatedDocumentId);
  return act?.generatedFile || doc?.generatedFile || null;
}

export function generatedFileDisplayName(generatedFile) {
  if (!generatedFile) return "";
  return [generatedFile.versionLabel || "", generatedFile.fileName || ""].filter(Boolean).join(" / ");
}

export function serviceUserOptions() {
  return users
    .filter((user) => user.roles?.some((role) => ["service", "svcmgr", "admin"].includes(role)))
    .map((user) => ({ value: user.name, label: user.name }));
}

export function reportOptionsForAct(act) {
  return {
    includePersonName: true,
    includeSignature: true,
    includeWorkingHours: true,
    includeSystemIdentity: true,
    includeSystemName: true,
    equipmentWorking: true,
    readyForUse: false,
    oldPartReturned: false,
    hygieneStandard: false,
    showTravelHours: false,
    showStartedCompletedTime: false,
    useThreeSideTemplate: false,
    ...(act?.reportOptions || {})
  };
}

export function workActCandidateEquipment(job) {
  if (!job) return [];
  const byCustomer = equipment.filter((eq) => eq.customer === job.customer || eq.customerId === job.customerId);
  const fromJob = equipment.find((eq) => eq.name === job.equipment || eq.serial === job.serial || eq.id === job.equipmentId);
  const merged = [...(fromJob ? [fromJob] : []), ...byCustomer];
  return merged.filter((eq, index, list) => list.findIndex((item) => item.id === eq.id) === index);
}

export function workActEquipmentOptionLabel(eq) {
  return `${eq.name} / ${eq.serial || "No serial"} / ${eq.location || eq.category || "Equipment"}`;
}

export function workListTemplateOptionsForAct(act) {
  const activeTemplates = workListTemplates.filter((tpl) => tpl.isActive !== false);
  const applicable = activeTemplates.filter((tpl) => isWorkListTemplateApplicableToAct(tpl, act));
  return applicable.length ? applicable : activeTemplates;
}

export function templateOptionsForAct(act) {
  return [
    { value: "", label: "Not selected" },
    ...workListTemplateOptionsForAct(act).map((tpl) => ({ value: tpl.id, label: tpl.name }))
  ];
}

export function filteredWorkActs() {
  const query = String(state.workActSearchQuery || "").trim().toLowerCase();
  const status = state.workActStatusFilter || "All";
  return workActs.filter((act) => {
    const equipmentText = (act.equipmentItems || []).map((item) => `${item.name} ${item.serial} ${item.location}`).join(" ");
    const haystack = [
      act.number,
      act.jobId,
      act.customer,
      act.type,
      act.status,
      act.workText,
      act.workDescription,
      equipmentText,
      workActContractLabel(act)
    ].filter(Boolean).join(" ").toLowerCase();
    return (!query || haystack.includes(query)) && (status === "All" || act.status === status);
  });
}

export function workActStatusOptions() {
  return ["All", ...Array.from(new Set(workActs.map((act) => act.status || "Draft")))]
    .map((status) => ({ value: status, label: status }));
}

export function groupWorkActsByEntryDate(rows) {
  return rows.reduce((groups, act) => {
    const label = workActDateGroup(act.date);
    const existing = groups.find((group) => group.label === label);
    if (existing) existing.rows.push(act);
    else groups.push({ label, rows: [act] });
    return groups;
  }, []);
}

export function workActDateGroup(dateValue) {
  if (!dateValue) return "Entry Date: No date";
  const today = new Date();
  const date = new Date(`${dateValue}T00:00:00`);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round((todayStart - date) / 86400000);
  if (diffDays === 0) return "Entry Date: Today";
  if (diffDays === 1) return "Entry Date: Yesterday";
  if (diffDays > 1 && diffDays <= 7) return "Entry Date: Last Week";
  if (diffDays > 7 && diffDays <= 31) return "Entry Date: Last Month";
  if (diffDays > 31) return "Entry Date: Older";
  return "Entry Date: Future";
}

export function workActContractLabel(act) {
  const eqId = act?.equipmentItems?.[0]?.equipmentId;
  const contract = contracts.find((item) => (
    item.customer === act?.customer &&
    (!eqId || item.equipmentId === eqId || item.equipment === act?.equipmentItems?.[0]?.name)
  ));
  return act?.contract || contract?.id || "Recommended";
}

export function customerForAct(act) {
  return customers.find((item) => item.name === act?.customer || item.id === act?.customerId) || null;
}

function isWorkListTemplateApplicableToAct(tpl, act) {
  const linkedEquipmentIds = wltArray(tpl.linkedEquipmentIds);
  const linkedHospitalIds = wltArray(tpl.linkedHospitalIds);
  const linkedServiceTypes = wltArray(tpl.linkedServiceTypes);
  const selectedEquipmentIds = wltArray(act?.equipmentIds);
  wltArray(act?.equipmentItems).forEach((item) => {
    if (item?.id && !selectedEquipmentIds.includes(item.id)) selectedEquipmentIds.push(item.id);
  });
  const selectedEquipment = selectedEquipmentIds.map((eqId) => equipment.find((eq) => eq.id === eqId)).filter(Boolean);
  const job = jobs.find((item) => item.id === act?.jobId);
  const jobEquipment = equipment.find((eq) => eq.id === job?.equipmentId || eq.name === job?.equipment || eq.serial === job?.serial);
  if (jobEquipment && !selectedEquipment.some((eq) => eq.id === jobEquipment.id)) selectedEquipment.push(jobEquipment);
  const customerIds = new Set(selectedEquipment.map((eq) => eq.customerId).filter(Boolean));
  if (job?.customer) {
    const customer = customers.find((item) => item.name === job.customer);
    if (customer) customerIds.add(customer.id);
  }
  const serviceType = job?.type || act?.type || "";

  const equipmentMatches = !linkedEquipmentIds.length || selectedEquipment.some((eq) => linkedEquipmentIds.includes(eq.id));
  const hospitalMatches = !linkedHospitalIds.length || [...customerIds].some((customerId) => linkedHospitalIds.includes(customerId));
  const serviceTypeMatches = !linkedServiceTypes.length || linkedServiceTypes.includes(serviceType) || linkedServiceTypes.includes(tpl.serviceType);
  return equipmentMatches && hospitalMatches && serviceTypeMatches;
}

function wltArray(value) {
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
