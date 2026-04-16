import { customers, equipment, jobs, users } from "./data.js";
import { escapeHtml, qs } from "./dom.js";
import { saveDemoState } from "./persistence.js";
import { setPage, state } from "./state.js";
import { creatorMeta } from "./userIdentity.js";

const jobForm = {
  error: "",
  id: "",
  customer: "",
  system: "",
  contactName: "",
  contactNumber: "",
  problem: "",
  plannedVisitDate: "",
  engineer: ""
};

let renderAppCallback = null;

export function bindServiceWizard(renderApp) {
  renderAppCallback = renderApp;

  qs("#wiz-close").addEventListener("click", closeWizard);
  qs("#wiz-back").addEventListener("click", closeWizard);
  qs("#wiz-next").addEventListener("click", submitJob);
  qs("#service-wizard").addEventListener("click", (event) => {
    if (event.target.id === "service-wizard") closeWizard();
  });
  qs("#service-wizard").addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.target instanceof HTMLTextAreaElement) return;
    event.preventDefault();
    submitJob();
  });

  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]");
    if (action?.dataset.action === "new-service-job") {
      openWizard();
    }
  });
}

function openWizard() {
  resetJobForm();
  qs("#service-wizard").classList.add("open");
  qs("#service-wizard").setAttribute("aria-hidden", "false");
  renderWizard();
}

function closeWizard() {
  qs("#service-wizard").classList.remove("open");
  qs("#service-wizard").setAttribute("aria-hidden", "true");
}

function resetJobForm() {
  const today = new Date();
  const planned = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  Object.assign(jobForm, {
    error: "",
    id: nextJobId(),
    customer: "",
    system: "",
    contactName: "",
    contactNumber: "",
    problem: "",
    plannedVisitDate: planned.toISOString().slice(0, 10),
    engineer: serviceEngineerNames()[0] || ""
  });
}

function renderWizard() {
  qs("#wiz-title").textContent = "New service job";
  qs("#wiz-subtitle").textContent = "Create the job for tracking. The Work Act will document the work later.";
  qs("#wiz-count").textContent = "Required fields";
  qs("#wiz-back").style.visibility = "hidden";
  qs("#wiz-next").textContent = "Create job";
  qs("#wiz-steps").innerHTML = renderJobChecklist();
  qs("#wiz-content").innerHTML = renderJobForm();
}

function renderJobChecklist() {
  return `
    <div class="wiz-step-wrap active">
      <div class="wiz-dot">1</div>
      <div class="wiz-step-label">Job</div>
    </div>
    <span class="wiz-line done"></span>
    <div class="wiz-step-wrap">
      <div class="wiz-dot">2</div>
      <div class="wiz-step-label">Work Act later</div>
    </div>
  `;
}

function renderJobForm() {
  return `
    <h3 class="wiz-step-title">Service job basics</h3>
    <div class="info-box">
      <div class="info-title">Simple rule</div>
      <div class="info-body">Service tracks the job. Work Acts document how the job was done. Documents store the generated and signed files.</div>
    </div>
    <div class="field-grid">
      ${field("Job ID", "f-job-id", jobForm.id, "VM-SV-1028")}
      ${fieldWithDatalist("Hospital / customer", "f-customer", jobForm.customer, "Vilnius Clinical Hospital", "customer-options", customerOptions())}
      ${fieldWithDatalist("System", "f-system", jobForm.system, "ARIETTA 850 DeepInsight", "system-options", systemOptions())}
      ${field("Contact name", "f-contact-name", jobForm.contactName, "Name Surname")}
      ${field("Contact number", "f-contact-number", jobForm.contactNumber, "+370 600 00000")}
      ${field("Planned visit date", "f-planned-visit", jobForm.plannedVisitDate, "", "date")}
      ${selectField("Responsible engineer", "f-engineer", jobForm.engineer, serviceEngineerNames())}
      <div class="field full">
        <label for="f-problem">Short problem description</label>
        <textarea id="f-problem" rows="3" placeholder="What should the engineer check or repair?">${escapeHtml(jobForm.problem)}</textarea>
      </div>
    </div>
    ${jobForm.error ? `<div class="form-error">${escapeHtml(jobForm.error)}</div>` : ""}
  `;
}

function field(label, id, value, placeholder, type = "text") {
  return `
    <div class="field">
      <label for="${id}">${escapeHtml(label)}</label>
      <input id="${id}" type="${escapeHtml(type)}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}">
    </div>
  `;
}

function fieldWithDatalist(label, id, value, placeholder, datalistId, options) {
  return `
    <div class="field">
      <label for="${id}">${escapeHtml(label)}</label>
      <input id="${id}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" list="${escapeHtml(datalistId)}">
      <datalist id="${escapeHtml(datalistId)}">
        ${options.map((option) => `<option value="${escapeHtml(option)}"></option>`).join("")}
      </datalist>
    </div>
  `;
}

function selectField(label, id, value, options) {
  return `
    <div class="field">
      <label for="${id}">${escapeHtml(label)}</label>
      <select id="${id}">
        ${options.map((option) => `<option value="${escapeHtml(option)}" ${option === value ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
      </select>
    </div>
  `;
}

function harvestJobForm() {
  jobForm.id = readField("f-job-id");
  jobForm.customer = readField("f-customer");
  jobForm.system = readField("f-system");
  jobForm.contactName = readField("f-contact-name");
  jobForm.contactNumber = readField("f-contact-number");
  jobForm.problem = readField("f-problem");
  jobForm.plannedVisitDate = readField("f-planned-visit");
  jobForm.engineer = readField("f-engineer");
}

function readField(id) {
  return qs(`#${id}`)?.value?.trim() || "";
}

function submitJob() {
  harvestJobForm();
  const missing = requiredFields().filter((field) => !jobForm[field.key]);
  if (missing.length) {
    jobForm.error = `Required: ${missing.map((field) => field.label).join(", ")}.`;
    renderWizard();
    return;
  }

  if (jobs.some((job) => job.id === jobForm.id)) {
    jobForm.error = "Job ID already exists. Use a unique job number.";
    renderWizard();
    return;
  }

  const matchedEquipment = equipment.find((item) =>
    item.name === jobForm.system ||
    `${item.name} / ${item.serial || "No serial"}` === jobForm.system
  );
  const createdAt = new Date().toISOString();
  const job = {
    id: jobForm.id,
    customer: jobForm.customer,
    customerId: customers.find((item) => item.name === jobForm.customer)?.id || "",
    equipment: matchedEquipment?.name || jobForm.system,
    equipmentId: matchedEquipment?.id || "",
    serial: matchedEquipment?.serial || "",
    owner: jobForm.engineer,
    responsibleEngineer: jobForm.engineer,
    contactName: jobForm.contactName,
    contactNumber: jobForm.contactNumber,
    problemDescription: jobForm.problem,
    priority: "Normal",
    stage: "Open",
    status: "Open",
    due: jobForm.plannedVisitDate,
    plannedVisitDate: jobForm.plannedVisitDate,
    documentStatus: "No Work Act",
    createdAt,
    ...creatorMeta()
  };

  jobs.unshift(job);
  state.selectedServiceJobId = job.id;
  state.templateGenWorkActJobId = job.id;
  setPage("service");
  closeWizard();
  saveDemoState();
  renderAppCallback();
}

function requiredFields() {
  return [
    { key: "id", label: "Job ID" },
    { key: "customer", label: "Hospital / customer" },
    { key: "system", label: "System" },
    { key: "contactName", label: "Contact name" },
    { key: "contactNumber", label: "Contact number" },
    { key: "problem", label: "Short problem description" },
    { key: "plannedVisitDate", label: "Planned visit date" },
    { key: "engineer", label: "Responsible engineer" }
  ];
}

function nextJobId() {
  const nextNumber = jobs.reduce((max, job) => {
    const match = String(job.id || "").match(/VM-SV-(\d+)/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 1023) + 1;
  return `VM-SV-${nextNumber}`;
}

function serviceEngineerNames() {
  return users
    .filter((user) => user.roles?.includes("service"))
    .map((user) => user.name);
}

function customerOptions() {
  return customers.map((customer) => customer.name);
}

function systemOptions() {
  return equipment.map((item) => `${item.name} / ${item.serial || "No serial"}`);
}
