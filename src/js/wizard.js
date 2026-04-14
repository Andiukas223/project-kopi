import { documents, jobs } from "./data.js";
import { escapeHtml, qs } from "./dom.js";
import { setPage } from "./state.js";

const steps = ["Customer", "Issue", "Contract", "Diagnostics", "Quotation", "Parts", "Repair", "Close"];

const W = {
  step: 0,
  customer: "",
  contact: "",
  phone: "",
  equipment: "",
  serial: "",
  issue: "",
  priority: "Normal",
  owner: "R. Petrauskas",
  hasContract: null,
  hasWarranty: null,
  quotationNeeded: null,
  quotationApproved: null,
  partsAvailable: null,
  edd: "",
  diagDuration: "",
  repairDuration: "",
  checklist: [false, false, false, false]
};

let renderAppCallback = null;

export function bindServiceWizard(renderApp) {
  renderAppCallback = renderApp;

  qs("#wiz-close").addEventListener("click", closeWizard);
  qs("#wiz-back").addEventListener("click", backStep);
  qs("#wiz-next").addEventListener("click", nextStep);
  qs("#service-wizard").addEventListener("click", (event) => {
    if (event.target.id === "service-wizard") closeWizard();
  });

  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]");
    if (action?.dataset.action === "new-service-job") {
      openWizard();
      return;
    }

    const decision = event.target.closest("[data-decision]");
    if (decision) {
      W[decision.dataset.decision] = decision.dataset.value === "true";
      renderWizard();
      return;
    }

    const check = event.target.closest("[data-check]");
    if (check) {
      const index = Number(check.dataset.check);
      W.checklist[index] = !W.checklist[index];
      renderWizard();
    }
  });
}

function openWizard() {
  resetWizard();
  qs("#service-wizard").classList.add("open");
  qs("#service-wizard").setAttribute("aria-hidden", "false");
  renderWizard();
}

function closeWizard() {
  qs("#service-wizard").classList.remove("open");
  qs("#service-wizard").setAttribute("aria-hidden", "true");
}

function resetWizard() {
  Object.assign(W, {
    step: 0,
    customer: "",
    contact: "",
    phone: "",
    equipment: "",
    serial: "",
    issue: "",
    priority: "Normal",
    owner: "R. Petrauskas",
    hasContract: null,
    hasWarranty: null,
    quotationNeeded: null,
    quotationApproved: null,
    partsAvailable: null,
    edd: "",
    diagDuration: "",
    repairDuration: "",
    checklist: [false, false, false, false]
  });
}

function renderWizard() {
  qs("#wiz-subtitle").textContent = `Step ${W.step + 1} of ${steps.length} - ${steps[W.step]}`;
  qs("#wiz-count").textContent = `${W.step + 1} / ${steps.length}`;
  qs("#wiz-back").style.visibility = W.step === 0 ? "hidden" : "visible";
  qs("#wiz-next").textContent = W.step === steps.length - 1 ? "Submit job" : "Continue";
  qs("#wiz-steps").innerHTML = renderStepIndicator();
  qs("#wiz-content").innerHTML = renderStepContent();
}

function renderStepIndicator() {
  return steps.map((label, index) => {
    const state = index < W.step ? "done" : index === W.step ? "active" : "";
    const dot = index < W.step ? "ok" : index + 1;
    const line = index < steps.length - 1 ? `<span class="wiz-line ${index < W.step ? "done" : ""}"></span>` : "";
    return `
      <div class="wiz-step-wrap ${state}">
        <div class="wiz-dot">${dot}</div>
        <div class="wiz-step-label">${label}</div>
      </div>
      ${line}
    `;
  }).join("");
}

function renderStepContent() {
  const content = [
    customerStep,
    issueStep,
    contractStep,
    diagnosticsStep,
    quotationStep,
    partsStep,
    repairStep,
    closeStep
  ];
  return content[W.step]();
}

function customerStep() {
  return `
    <h3 class="wiz-step-title">Customer and equipment</h3>
    <div class="field-grid">
      ${field("Customer", "f-customer", W.customer, "Vilnius Clinical Hospital")}
      ${field("Contact", "f-contact", W.contact, "Name Surname")}
      ${field("Phone", "f-phone", W.phone, "+370 600 00000")}
      ${field("Equipment", "f-equipment", W.equipment, "ARIETTA 850 DeepInsight")}
      ${field("Serial", "f-serial", W.serial, "US-850-0192")}
      ${selectField("Owner", "f-owner", W.owner, ["R. Petrauskas", "M. Vaitkus", "A. Jankauske"])}
    </div>
  `;
}

function issueStep() {
  return `
    <h3 class="wiz-step-title">Issue intake</h3>
    <div class="field-grid">
      ${selectField("Priority", "f-priority", W.priority, ["Normal", "High", "Critical"])}
      <div class="field full">
        <label for="f-issue">Issue</label>
        <textarea id="f-issue" placeholder="Describe the customer request">${escapeHtml(W.issue)}</textarea>
      </div>
    </div>
  `;
}

function detectPipelineType() {
  if (W.hasContract === true  && W.hasWarranty === false) return "B";
  if (W.hasContract === false && W.hasWarranty === false) return "A";
  if (W.hasContract === true  && W.hasWarranty === true)  return "C";
  if (W.hasContract === null  || W.hasWarranty === null)  return null;
  return "A"; // fallback
}

const pipelineTypeMeta = {
  A: { label: "Pipeline A — Repair (no contract)",           desc: "Diagnostics → Quotation required → Parts → Repair → Invoice → Signature → Archive",   color: "var(--blue-lt)",  border: "var(--blue)" },
  B: { label: "Pipeline B — Repair (service contract)",      desc: "Diagnostics → Parts → Repair — deducts from contract balance → Work Act → Archive",    color: "var(--green-lt)", border: "var(--green)" },
  C: { label: "Pipeline C — New installation",               desc: "Commercial Offer → Contract indexing → Installation → Acceptance Act → Warranty start", color: "var(--amber-lt)", border: "var(--amber)" },
  D: { label: "Pipeline D — PM periodic maintenance",        desc: "Auto-generated from contract → PM schedule → Service → Work Act → Archive",            color: "var(--wb)",       border: "var(--text-muted)" }
};

function contractStep() {
  const type = detectPipelineType();
  const typeBadge = type ? (() => {
    const meta = pipelineTypeMeta[type];
    return `
      <div class="pipeline-type-badge" style="background:${meta.color};border-left:4px solid ${meta.border}">
        <div class="pipeline-type-label">${escapeHtml(meta.label)}</div>
        <div class="pipeline-type-desc">${escapeHtml(meta.desc)}</div>
      </div>
    `;
  })() : "";

  // Show contract balance warning for Type B
  const balanceWarning = W.hasContract === true ? `
    <div class="info-box warn">
      <div class="info-title">Contract balance check</div>
      <div class="info-body">Pipeline B: repair cost will be deducted from the contract remaining balance. If repair cost exceeds remaining balance, a warning will appear before proceeding.</div>
    </div>
  ` : "";

  return `
    <h3 class="wiz-step-title">Contract and warranty check</h3>
    <div class="info-box">
      <div class="info-title">Routing decision</div>
      <div class="info-body">Select contract and warranty status — this determines which pipeline (A/B/C/D) the job will follow.</div>
    </div>
    ${decisionGrid("hasContract", W.hasContract, "Contract exists", "No contract", "Use contract service route (Pipeline B).", "Quotation may be required (Pipeline A).")}
    ${decisionGrid("hasWarranty", W.hasWarranty, "Under warranty", "No warranty", "Installation route (Pipeline C) if new system.", "Standard repair or PM route.")}
    ${typeBadge}
    ${balanceWarning}
  `;
}

function diagnosticsStep() {
  return `
    <h3 class="wiz-step-title">Diagnostics time</h3>
    ${durationField("Diagnostics duration", "f-diag-duration", W.diagDuration, "00:45 or 45 min")}
  `;
}

function quotationStep() {
  return `
    <h3 class="wiz-step-title">Quotation decision</h3>
    ${decisionGrid("quotationNeeded", W.quotationNeeded, "Quotation needed", "No quotation", "Sales prepares customer offer.", "Proceed to parts or repair.")}
    ${W.quotationNeeded ? decisionGrid("quotationApproved", W.quotationApproved, "Approved", "Not approved", "Service can continue.", "Keep job in customer queue.") : ""}
  `;
}

function partsStep() {
  return `
    <h3 class="wiz-step-title">Parts and vendor handling</h3>
    ${decisionGrid("partsAvailable", W.partsAvailable, "Parts in warehouse", "Parts pending", "Repair can be scheduled.", "Track EDD and vendor response.")}
    <div class="field-grid spaced">
      ${field("Expected delivery date", "f-edd", W.edd, "2026-04-18")}
    </div>
  `;
}

function repairStep() {
  return `
    <h3 class="wiz-step-title">Repair time</h3>
    ${durationField("Repair duration", "f-repair-duration", W.repairDuration, "01:20 or 1h 20m")}
  `;
}

function closeStep() {
  const items = ["Diagnostic report drafted", "Service act generated", "Customer signature requested", "Job ready for archive"];
  return `
    <h3 class="wiz-step-title">Final documents and checklist</h3>
    <ul class="checklist">
      ${items.map((item, index) => `
        <li>
          <button class="check ${W.checklist[index] ? "done" : ""}" type="button" data-check="${index}">${W.checklist[index] ? "ok" : ""}</button>
          <span>${item}</span>
        </li>
      `).join("")}
    </ul>
  `;
}

function field(label, id, value, placeholder) {
  return `
    <div class="field">
      <label for="${id}">${label}</label>
      <input id="${id}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}">
    </div>
  `;
}

function selectField(label, id, value, options) {
  return `
    <div class="field">
      <label for="${id}">${label}</label>
      <select id="${id}">
        ${options.map((option) => `<option value="${escapeHtml(option)}" ${option === value ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
      </select>
    </div>
  `;
}

function durationField(label, id, value, placeholder) {
  return `
    <div class="duration-card">
      <div class="duration-label">${label}</div>
      <input id="${id}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" aria-label="${label}">
      <div class="duration-hint">Enter the time spent after the procedure is complete.</div>
    </div>
  `;
}

function decisionGrid(key, value, yesTitle, noTitle, yesMeta, noMeta) {
  return `
    <div class="decision-grid">
      ${decisionCard(key, true, value, yesTitle, yesMeta)}
      ${decisionCard(key, false, value, noTitle, noMeta)}
    </div>
  `;
}

function decisionCard(key, bool, value, title, meta) {
  const selected = value === bool ? (bool ? "selected-yes" : "selected-no") : "";
  return `
    <button class="decision-card ${selected}" type="button" data-decision="${key}" data-value="${bool}">
      <div class="decision-title">${title}</div>
      <div class="decision-meta">${meta}</div>
    </button>
  `;
}

function nextStep() {
  harvestStep();
  if (W.step < steps.length - 1) {
    W.step = nextAllowedStep(W.step + 1, 1);
    renderWizard();
    return;
  }
  submitJob();
}

function backStep() {
  harvestStep();
  if (W.step === 0) return;
  W.step = nextAllowedStep(W.step - 1, -1);
  renderWizard();
}

// Returns the nearest allowed step in given direction (+1 or -1), skipping steps
// that should be bypassed based on current routing decisions.
function nextAllowedStep(candidate, direction) {
  const skipQuotation = W.hasContract === true; // Pipeline B — no quotation needed
  while (candidate > 0 && candidate < steps.length - 1) {
    if (steps[candidate] === "Quotation" && skipQuotation) {
      candidate += direction;
    } else {
      break;
    }
  }
  return Math.max(0, Math.min(steps.length - 1, candidate));
}

function harvestStep() {
  const map = {
    customer: "f-customer",
    contact: "f-contact",
    phone: "f-phone",
    equipment: "f-equipment",
    serial: "f-serial",
    owner: "f-owner",
    issue: "f-issue",
    priority: "f-priority",
    edd: "f-edd",
    diagDuration: "f-diag-duration",
    repairDuration: "f-repair-duration"
  };
  Object.entries(map).forEach(([key, id]) => {
    const el = qs(`#${id}`);
    if (el) W[key] = el.value.trim();
  });
}

function submitJob() {
  const id = `VM-SV-${1024 + jobs.length}`;
  const docId = `DOC-${3108 + documents.length}`;
  const customer = W.customer || "New customer";
  const equipment = W.equipment || "Medical equipment";
  const due = W.edd || "2026-04-22";

  jobs.unshift({
    id,
    customer,
    equipment,
    serial: W.serial || "Pending",
    owner: W.owner,
    priority: W.priority,
    stage: "Diagnostics",
    status: "Open",
    due,
    documentStatus: "Draft",
    diagDuration: W.diagDuration,
    repairDuration: W.repairDuration
  });

  documents.unshift({
    id: docId,
    type: "Service act",
    jobId: id,
    customer,
    owner: "Service",
    status: "Draft",
    due,
    pipelineStep: "Draft"
  });

  setPage("service");
  closeWizard();
  renderAppCallback();
}
