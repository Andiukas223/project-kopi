import {
  allPermissions, calendarEvents, contracts, customers, documents, equipment,
  jobs, partsRequests, pipelineStages, quotations, roles, templates, users
} from "./data.js";
import { escapeHtml } from "./dom.js";
import { state } from "./state.js";

const pageMeta = {
  command:   ["Command Center", "Live overview for service work, documents, approvals, and overdue items."],
  service:   ["Service", "Medical equipment service jobs from intake to final work act."],
  sales:     ["Sales", "Quotation and customer approval pipeline before service handoff."],
  documents: ["Documents", "Document creation, review, signature, and template generation pipeline."],
  customers: ["Customers", "Hospitals, clinics, and customer activity overview."],
  equipment: ["Equipment", "Customer equipment registry and service status."],
  parts:     ["Parts", "Parts requests, warehouse status, and vendor return monitoring."],
  reports:   ["Reports", "Operational metrics for service, sales, and documents."],
  admin:     ["Admin", "Users, document templates, workflow settings, and system exceptions."],
  calendar:  ["Calendar", "Organisation-wide scheduling, PM date management, and contract validity overview."]
};

const closedDocumentStages = ["Approved", "Archived"];

// ---------------------------------------------------------------------------
// Module specs — DEV REFERENCE data shown inside each page during development.
// Each entry describes purpose, roles, submodules, pipeline, actions, and
// what is planned but not yet implemented.
// ---------------------------------------------------------------------------
const moduleSpecs = {
  command: {
    purpose: "Single-screen operational overview. Each role sees their priority queue. Admin sees all exceptions and approvals. Service sees active jobs and repair queues. Sales sees quotation and approval queues. Logistics sees parts delivery queue. Finance sees invoice queue.",
    roles: "All roles (filtered by permissions). Admin — full data + exceptions. Service Engineer — jobs/repair focus. Sales — quotes/approvals. Logistics — parts queue. Finance — invoice queue. Manager — read-only overview.",
    submodules: "Stat cards · Pipeline board · Needs attention table · Quick actions · Role focus panel · Reminders strip (sidebar)",
    pipeline: "Read-only aggregation from Service, Documents, Sales, and Parts pipelines. No write actions from this page except quick-action launchers.",
    actions: "New service job · New quotation · Create service act",
    planned: "Role-filtered stat cards per active workspace · Reminders sidebar strip (place / case open date / status colour: red/yellow/green/gray) · Per-role overdue counts · Assignments view from calendar"
  },
  service: {
    purpose: "Medical equipment service from first contact to signed work act. Supports four pipeline types: A (repair, no contract), B (repair, with service contract balance deduction), C (new system installation), D (PM periodic maintenance). One job = one installed system (serial number).",
    roles: "Service Engineer — creates cases, logs diagnostics/repair, uploads signed docs. Service Manager — approves parts requests, controls/assigns engineers. Office Manager — creates cases, assigns work from calendar.",
    submodules: "New Requests · Diagnostics · Parts Pending · Repairs · Vendor Returns · Final Documents · PM submodule (periodic maintenance auto-scheduling)",
    pipeline: [
      "PIPELINE A (repair, no contract):",
      "  Technical Case → Diagnostics (duration entry) → Parts check → Commercial Offer → Customer approval",
      "  → Repair (duration entry) → Work Act generation → Signature collected → Upload signed doc",
      "  → INVOICE NEEDED → Finance uploads invoice PDF → Invoice signature → Upload → Admin review",
      "  → Approval Required (system working) → Admin Approves → ARCHIVED",
      "",
      "PIPELINE B (repair, service contract):",
      "  Technical Case → Diagnostics → Parts check → Repair (deducts from contract balance; warns if insufficient)",
      "  → Work Act → Signature → Upload → Admin review → ARCHIVED",
      "",
      "PIPELINE C (new installation):",
      "  Commercial Offer (Sales) → Contract indexing (fields + warranty dates + comments section)",
      "  → Installation (engineer) → Acceptance Act → Signature → Upload",
      "  → WARRANTY STARTS from upload date (not from admin approval) → Admin verification → ARCHIVED",
      "  → Calendar syncs warranty expiry date",
      "",
      "PIPELINE D (PM periodic maintenance):",
      "  Auto-generated PM case from contract → PM submodule: status [Scheduled / Unscheduled / Problem]",
      "  → Dates distributed evenly over contract period (e.g. 4×/year = one per quarter; no stacking allowed)",
      "  → User can move date within same month → Main calendar auto-updates → Service work → Work Act → Admin review → ARCHIVED"
    ].join("\n"),
    actions: "New service job wizard · Parts request · Work Act generation · Upload signed document · Log diagnostics duration · Log repair duration · Assign engineer (Service Manager)",
    planned: "Full wizard with all 4 pipeline branches · Contract balance deduction + warning display · PM submodule with auto-scheduling algorithm · Vendor return trigger from Work Act notation · Parts request approval flow"
  },
  sales: {
    purpose: "Quotation pipeline and customer approval management before service handoff. Sales handles commercial offer creation, contract upload and indexing (new installations), and invoice upload. Finance manages payment status.",
    roles: "Sales / Sales Manager (same role) — creates offers, manages contracts, uploads invoice. Finance — generates/uploads invoice PDF, marks payment status (paid / pending / canceled). History entry preserved on status change.",
    submodules: "Quotations · Customer approvals · Service handoff · Contract management",
    pipeline: "Commercial Offer draft → Sent to customer → Customer approved → Handoff to Service  |OR|  Rejected\nContract flow: Sales uploads contract → Admin takes ownership after handoff. Sales cannot edit after submission. Admin can restore archived contract to edit mode (Sales then modifies).",
    actions: "Create commercial offer · Mark customer approved · Send to service · Upload contract · Generate / upload invoice · Mark invoice paid / pending / canceled",
    planned: "Commercial offer template generation (Carbone) · Customer approval tracking with due dates · Invoice payment status history · Contract indexing form with warranty fields for new installations · Autofill from installed system Device ID"
  },
  documents: {
    purpose: "Central document lifecycle management. All document types flow through here. Supports generate-from-template (Carbone mock now, real backend later) and upload-external-document workflows. Signed documents are uploaded back into the same job flow.",
    roles: "All roles create documents of their own type. Admin has full pipeline control. All roles can upload external documents with metadata. Rejection with comment can be raised by any reviewer; permanent resolution by Admin.",
    submodules: "Pipeline view · Document table with filters · Selected document detail panel · Template generation panel (Carbone mock) · Upload panel (create or upload external) · Global search with indexed metadata",
    pipeline: "Draft → Review → Customer → Signature → Approved → Archived\nReject path: Rejected → Draft (comment required, visible in document history)\nPermanent rejection: add comment explaining why → Admin resolves and closes issue\nSigned doc return: engineer/sales downloads generated doc → collects physical signature → re-uploads into same document record",
    actions: "Create (from template) · Upload external document · Advance pipeline stage · Reject with comment · Archive · Search with filters · Download generated file",
    planned: "Global search with indexed metadata (location / contract / date / executor / who signed / description) · Search UI: filter chips + text field + Search / Cancel buttons · Carbone backend integration for real document generation · Rejection comment thread · Re-upload signed version flow"
  },
  customers: {
    purpose: "Registry of hospitals, clinics, and private medical institutions. Central reference for jobs, documents, equipment, and parts delivery addresses. Office Manager is primary manager; all roles use it read-only for autofill in forms.",
    roles: "Office Manager — primary: creates/updates customers, manages contacts. Admin — full access. All roles — read for autofill (job wizard, parts delivery, document forms).",
    submodules: "Customer list · Contact management · Open jobs count · Equipment count · Outstanding documents · Address book (delivery autofill for parts logistics)",
    pipeline: "Customer created → Contacts added → Linked to jobs / equipment / contracts → Active / Archived",
    actions: "Create customer · Add / edit contacts · Link equipment · View open jobs · View outstanding documents · Save delivery address for parts logistics",
    planned: "Hospital address saved as delivery destination for parts requests (autofill on future requests) · Contact person registry for signature collection reminders · Customer activity history timeline · Search and filter by hospital / city / contract type"
  },
  equipment: {
    purpose: "Registry of installed medical systems. One record per physical unit (serial number). Device type templates autofill fields when registering same-model units (e.g. 20 identical echoscopes). Each system record also has a Support Portal tab that generates unique client-facing URLs for fault reporting — hospital staff submit issues without logging in, auto-creating a Technical Case.",
    roles: "Service Engineer — views records, links to jobs. Service Manager — manages records. Admin — full access. Office Manager — creates and updates records.",
    submodules: [
      "Equipment list",
      "System Information tab (manufacturer, hospital, owner, S/N, P/N, ID, FDO/SO)",
      "Installation tab (seller invoice, installed date, year of manufacture, warranty end)",
      "Extended Warranty tab (custom warranty end date)",
      "Hospital Acceptance tab (certificate, acceptance date, invoice number, warranty end hospital)",
      "Support tab — three sub-tabs:",
      "  Settings: 'Support Page Is Enabled' checkbox · Group Name · Image (override)",
      "  Emails: Company Emails · Manufacturer Emails · Hospital Emails",
      "  Web Links: System URL (+ Copy) · Hospital URL · Group URL",
      "Comments tab · Record Information tab",
      "Device type templates (autofill by model) · Service history · PM contract link"
    ].join(" · "),
    pipeline: [
      "Register system (apply device type template → fill/modify fields → save with serial)",
      "→ Link to customer (hospital)",
      "→ Link to contract",
      "→ Enable Support Portal if needed (check 'Support Page Is Enabled' → URLs generated)",
      "→ Active service",
      "→ Warranty tracking (starts from Acceptance Act upload date for new installations)",
      "→ Archived (when Outdated / Unused / Uninstalled checked)",
      "",
      "Support Portal flow (client-facing):",
      "Hospital staff visits System URL (no login required)",
      "→ Page shows: system name, model, hospital, location (pre-filled from system record)",
      "→ Staff fills: short problem description + optional contact name",
      "→ Submit → new Technical Case auto-created: pre-filled with system info + description + source='Support portal'",
      "→ Case status: New / Unassigned",
      "→ Admin notified → Admin assigns to engineer → normal service pipeline continues"
    ].join("\n"),
    actions: "Register new installed system · Apply device type template · Enable Support Portal · Copy system/hospital/group URL · View service history · Link to contract · View warranty expiry",
    planned: "Full Support tab UI on equipment detail page · Public support sub-page (no auth) for hospital staff · Auto case creation on support form submit · Admin notification on new support case · Warranty expiry calendar sync · Device ID autofill across job wizard forms · PM schedule linked to equipment · Service history timeline · Autofill suggestions for same model type"
  },
  parts: {
    purpose: "Parts request pipeline from engineer identification through warehouse fulfillment to job-site delivery. Includes vendor return management triggered by Work Act repair-exchange notation.",
    roles: "Service Engineer — creates requests, specifies delivery details. Service Manager — approves requests (reviews situation description). Warehouse — confirms stock, manages inventory, confirms arrival. Logistics Manager — delivery execution, vendor returns, logistics issue resolution.",
    submodules: "Parts requests · Warehouse status · Delivery management · Vendor returns",
    pipeline: [
      "Engineer identifies part needed in diagnostics",
      "→ Parts request created (with situation description for Service Manager)",
      "→ Service Manager approves",
      "→ Logistics / Warehouse fulfills order",
      "→ Parts arrive → Warehouse confirms arrival → Engineer notified",
      "→ Engineer decides delivery:",
      "   [Pick up from warehouse]  OR  [Deliver to site: address + contact person (saveable to registry)]",
      "   Recipient: named engineer OR local person at site (can be saved for future autofill)",
      "→ Repair proceeds",
      "",
      "Vendor return trigger:",
      "→ 'Repair exchange' marked in Work Act → Logistics creates return case",
      "→ Engineer specifies destination: bad-parts collection spot OR warehouse re-stock"
    ].join("\n"),
    actions: "Create parts request · Approve request (Service Manager) · Confirm arrival (Warehouse) · Specify delivery method · Save delivery address to registry · Create vendor return · Mark part destination",
    planned: "Full request workflow with approval chain UI · Delivery address autofill from customer / hospital registry · Vendor return documentation form · EDD (expected delivery date) tracking and alerts · Parts inventory view"
  },
  reports: {
    purpose: "Management-level operational metrics. Read-only aggregation of service, document, and sales data for Manager, Admin, and Service Manager roles.",
    roles: "Manager — read-only full overview. Admin — full access. Service Manager — service metrics.",
    submodules: "SLA summary · Document cycle time · Jobs by stage · Sales-to-service handoff · Contract balance utilization · PM completion rate",
    pipeline: "Read-only. No pipeline actions from this page.",
    actions: "Export view · Filter by date range / customer / engineer",
    planned: "Full metrics with live aggregations from in-memory state · Chart components (bar, line, status distribution) · Export to CSV / PDF · SLA breach alerts · Contract balance burn-rate chart · PM schedule compliance rate"
  },
  admin: {
    purpose: "System configuration and user management. Only Admin can access this page. Manages user permission grid, document templates, workflow settings, exception resolution, and contract edit-mode restoration.",
    roles: "Admin only. This page is not visible to other roles unless Admin explicitly grants access via the permission grid.",
    submodules: "User management (permission grid) · Document templates · Workflow settings · System alerts · Role assignment · Contract archive management",
    pipeline: "Admin functions are configuration actions, not a processing pipeline. Exception: restoring archived contract to edit mode follows: Archived → Edit mode → Sales modifies → Re-submitted → Admin re-approves.",
    actions: "Add / edit user · Assign role permissions via checkbox grid (per user: create job · approve parts · manage contracts · view all calendars · close cases · edit archived docs · configure system) · Manage document templates · Configure workflow stages · Resolve document exceptions · Restore archived contract to edit mode",
    planned: "Full per-user permission matrix UI with checkbox grid · Template upload / management · Workflow stage configuration (custom stages, SLA rules) · System alert rules · Audit log view · Office Manager: admin can optionally grant case-close permission"
  },
  calendar: {
    purpose: "Organisation-wide scheduling and PM date management. Events are colour-coded per user. Visibility is permission-filtered: users see own calendar; admin sees all and can assign. Shows service cases, PM visits, sales meetings, demos, and contract validity periods.",
    roles: "All roles — own calendar (view + edit own events). With permissions — can view assigned users' calendars. Admin — sees all users, can assign events to any user. Office Manager — can assign jobs to engineers and sales from calendar.",
    submodules: "Month / week / day view · PM schedule grid (per contract) · Contract validity overlay · User colour filter · Event creation form",
    pipeline: "PM auto-distribution: system generates dates evenly over contract period. Rule: N visits over M months = evenly spaced (e.g. 4×/12 months = one per quarter; cannot stack visits in consecutive months). User can move date within same month. Main calendar auto-updates.",
    actions: "Create event · Assign event to engineer / sales · Filter by user / date range / equipment / contract · View PM schedule · Modify PM date (within month constraint) · View contract validity period",
    planned: "Full calendar grid component · PM auto-distribution algorithm · Event creation / edit form · Per-user colour coding · Filter panel · Contract validity overlay · Reminder generation from calendar events"
  }
};

// ---------------------------------------------------------------------------
// Dev spec panel — collapsible reference block shown at the bottom of each
// page during development. Uses native <details>/<summary> — no JS needed.
// ---------------------------------------------------------------------------
function devSpecPanel(page) {
  const spec = moduleSpecs[page];
  if (!spec) return "";
  const title = pageMeta[page]?.[0] || page;

  function row(label, value) {
    const formatted = escapeHtml(value).replace(/\n/g, "<br>");
    return `<div class="ds-row"><span class="ds-label">${label}</span><p class="ds-value">${formatted}</p></div>`;
  }

  return `
    <details class="dev-spec">
      <summary class="dev-spec-summary">DEV REFERENCE — ${escapeHtml(title)}</summary>
      <div class="dev-spec-body">
        ${row("Purpose", spec.purpose)}
        ${row("Roles", spec.roles)}
        ${spec.submodules ? row("Submodules", spec.submodules) : ""}
        ${row("Pipeline", spec.pipeline)}
        ${row("Actions", spec.actions)}
        ${row("Planned", spec.planned)}
      </div>
    </details>
  `;
}

// ---------------------------------------------------------------------------
// PM schedule generator — derives PM visit dates from contracts.
// Rule: N visits per year distributed evenly over the contract period.
// User may later adjust individual dates but cannot stack consecutive months.
// ---------------------------------------------------------------------------
function computePmSchedule() {
  const schedule = [];
  contracts.filter((ct) => ct.pmPerYear > 0).forEach((ct) => {
    const start = new Date(ct.start + "T00:00:00");
    const end   = new Date(ct.end   + "T00:00:00");
    const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const totalVisits = Math.max(1, Math.round(ct.pmPerYear * totalMonths / 12));
    const intervalMonths = Math.max(1, Math.floor(totalMonths / totalVisits));
    const now = new Date(); now.setHours(0, 0, 0, 0);

    for (let i = 0; i < totalVisits; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i * intervalMonths, 15);
      if (d > end) break;
      schedule.push({
        id:           `PM-${ct.id}-${String(i + 1).padStart(2, "0")}`,
        contractId:   ct.id,
        equipmentId:  ct.equipmentId,
        equipment:    ct.equipment,
        customer:     ct.customer,
        customerId:   ct.customerId,
        date:         d.toISOString().slice(0, 10),
        status:       d < now ? "Completed" : "Scheduled",
        visitNumber:  i + 1,
        totalVisits
      });
    }
  });
  return schedule;
}

// Color class per event type for the calendar
function eventColorClass(type) {
  return { job: "ev-job", pm: "ev-pm", sales: "ev-sales", logistics: "ev-logistics", contract: "ev-contract" }[type] || "ev-default";
}

// Collect all events for a given year/month (0-indexed month)
function getMonthEvents(year, month) {
  const pfx = `${year}-${String(month + 1).padStart(2, "0")}-`;
  const events = [];

  // Service jobs — due dates
  jobs.forEach((job) => {
    if (job.due.startsWith(pfx)) {
      events.push({ date: job.due, title: `${job.id} — ${job.stage}`, type: "job", sub: job.customer });
    }
  });

  // Manual calendar events (sales, logistics, contract)
  calendarEvents.forEach((ev) => {
    if (ev.date.startsWith(pfx)) {
      events.push({ date: ev.date, title: ev.title, type: ev.type, sub: "" });
    }
  });

  // Auto-generated PM visits
  computePmSchedule().forEach((pm) => {
    if (pm.date.startsWith(pfx) && pm.status !== "Completed") {
      events.push({ date: pm.date, title: `PM — ${pm.equipment}`, type: "pm", sub: pm.customer });
    }
  });

  // Contract expiry warnings
  contracts.forEach((ct) => {
    if (ct.end.startsWith(pfx)) {
      events.push({ date: ct.end, title: `Contract end — ${ct.customer}`, type: "contract", sub: ct.id });
    }
  });

  return events;
}

// ---------------------------------------------------------------------------
// Reminders — derive actionable items from live data
// ---------------------------------------------------------------------------
function getReminders() {
  const items = [];

  // Overdue documents
  documents.filter(documentIsOverdue).forEach((doc) => {
    items.push({ tone: "red",   text: `${doc.customer} · ${doc.type} · Overdue` });
  });

  // Parts requests awaiting approval
  partsRequests.filter((pr) => pr.status === "Pending approval").forEach((pr) => {
    items.push({ tone: "amber", text: `${pr.equipment} · Parts · Pending approval` });
  });

  // Parts arrived, delivery not specified
  partsRequests.filter((pr) => pr.status === "Arrived at warehouse" && !pr.delivery).forEach((pr) => {
    items.push({ tone: "amber", text: `${pr.id} · Arrived · Specify delivery` });
  });

  // Upcoming PM visits (next 14 days)
  const today = todayOnly();
  const in14  = new Date(today.getTime() + 14 * 864e5);
  computePmSchedule().filter((pm) => {
    const d = dateOnly(pm.date);
    return pm.status === "Scheduled" && d >= today && d <= in14;
  }).forEach((pm) => {
    items.push({ tone: "green", text: `PM ${pm.date} · ${pm.customer}` });
  });

  return items.slice(0, 7);
}

export function renderRemindersStrip() {
  const items = getReminders();
  if (!items.length) {
    return `<div class="reminder-empty">No pending reminders</div>`;
  }
  return items.map((item) => `
    <div class="reminder-row ${item.tone}">
      <span class="reminder-dot"></span>
      <span class="reminder-text">${escapeHtml(item.text)}</span>
    </div>
  `).join("");
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------
function chipClass(status) {
  return status.toLowerCase().replaceAll(" ", "-");
}

function pageHeader(page) {
  const [title, sub] = pageMeta[page] || pageMeta.command;
  const newJobBtn = canCreateServiceJob()
    ? `<button class="btn primary" type="button" data-action="new-service-job">New service job</button>`
    : "";
  return `
    <div class="page-header">
      <div>
        <h1 class="ph-title">${title}</h1>
        <div class="ph-sub">${sub}</div>
      </div>
      <div class="action-row">
        ${roleSwitcher()}
        <button class="btn ghost" type="button">Export view</button>
        ${newJobBtn}
      </div>
    </div>
  `;
}

function roleSwitcher() {
  return `
    <div class="role-switcher" aria-label="Role switcher">
      ${roles.map((role) => `
        <button class="role-btn ${state.role === role.id ? "active" : ""}" type="button" data-role="${role.id}">
          ${escapeHtml(role.id.toUpperCase())}
        </button>
      `).join("")}
    </div>
  `;
}

function statCard(label, value, note, tone) {
  return `
    <article class="stat-card ${tone}">
      <div class="stat-label">${label}</div>
      <div class="stat-value">${value}</div>
      <div class="stat-note">${note}</div>
    </article>
  `;
}

function statusChip(status) {
  return `<span class="chip ${chipClass(status)}">${escapeHtml(status)}</span>`;
}

function dateOnly(value) {
  const date = new Date(`${value}T00:00:00`);
  date.setHours(0, 0, 0, 0);
  return date;
}

function todayOnly() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function documentIsOpen(doc) {
  return !closedDocumentStages.includes(doc.pipelineStep);
}

function documentIsOverdue(doc) {
  return documentIsOpen(doc) && dateOnly(doc.due) < todayOnly();
}

function documentIsDueToday(doc) {
  return documentIsOpen(doc) && dateOnly(doc.due).getTime() === todayOnly().getTime();
}

function overdueDocuments() {
  return documents.filter(documentIsOverdue);
}

function dueTodayDocuments() {
  return documents.filter(documentIsDueToday);
}

function dueCell(doc) {
  const badge = documentIsOverdue(doc)
    ? '<span class="due-badge overdue">Overdue</span>'
    : documentIsDueToday(doc)
      ? '<span class="due-badge today">Today</span>'
      : "";
  return `<span class="due-cell"><span class="mono">${escapeHtml(doc.due)}</span>${badge}</span>`;
}

function documentActionLabel(doc) {
  if (doc.pipelineStep === "Archived") return "Archived";
  if (doc.pipelineStep === "Approved") return "Archive";
  return "Advance";
}

function jobsTable(rows = jobs) {
  return `
    <section class="table-card">
      <div class="table-toolbar">
        <span>${rows.length} service jobs</span>
        <button class="btn ghost" type="button">Open queue</button>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Job ID</th>
            <th>Customer</th>
            <th>Equipment</th>
            <th>Stage</th>
            <th>Status</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((job) => `
            <tr>
              <td class="mono">${escapeHtml(job.id)}</td>
              <td>${escapeHtml(job.customer)}</td>
              <td>${escapeHtml(job.equipment)}</td>
              <td>${escapeHtml(job.stage)}</td>
              <td>${statusChip(job.status)}</td>
              <td class="mono">${escapeHtml(job.due)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function documentsTable(rows = documents) {
  return `
    <section class="table-card">
      <div class="table-toolbar">
        <span>${rows.length} documents in pipeline</span>
        <button class="btn ghost" type="button" data-doc-review-next>Review next</button>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Document</th>
            <th>Type</th>
            <th>Job</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Due</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((doc) => `
            <tr class="${doc.id === state.selectedDocumentId ? "selected" : ""} ${documentIsOverdue(doc) ? "overdue" : ""}" data-doc-row="${escapeHtml(doc.id)}">
              <td class="mono">${escapeHtml(doc.id)}</td>
              <td>${escapeHtml(doc.type)}</td>
              <td class="mono">${escapeHtml(doc.jobId)}</td>
              <td>${escapeHtml(doc.owner)}</td>
              <td>${statusChip(doc.status)}</td>
              <td>${dueCell(doc)}</td>
              <td>
                <div class="table-actions">
                  <button class="btn ghost compact" type="button" data-doc-select="${escapeHtml(doc.id)}">Open</button>
                  <button class="btn dark compact" type="button" data-doc-advance="${escapeHtml(doc.id)}" ${doc.pipelineStep === "Archived" ? "disabled" : ""}>${documentActionLabel(doc)}</button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function pipelineBoard() {
  return `
    <div class="pipeline">
      ${pipelineStages.map((stage) => {
        const count = documents.filter((doc) => doc.pipelineStep === stage).length;
        return `
          <div class="pipeline-stage">
            <strong>${stage}</strong>
            <span>${count}</span>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function documentMonitoringPanel() {
  const waitingCustomer = documents.filter((doc) => doc.pipelineStep === "Customer").length;
  const waitingSignature = documents.filter((doc) => doc.pipelineStep === "Signature").length;
  return `
    <section class="monitor-grid" aria-label="Document monitoring">
      ${monitorCard("Overdue", overdueDocuments().length, "Owners must follow up", "danger")}
      ${monitorCard("Due today", dueTodayDocuments().length, "Finish before day end", "warn")}
      ${monitorCard("Customer queue", waitingCustomer, "Waiting outside response", "info")}
      ${monitorCard("Signature", waitingSignature, "Ready for signed close", "ok")}
    </section>
  `;
}

function monitorCard(label, value, note, tone) {
  return `
    <article class="monitor-card ${tone}">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${note}</small>
    </article>
  `;
}

function documentFilters() {
  const owners = ["All", ...new Set(documents.map((doc) => doc.owner))];
  return `
    <section class="panel slim">
      <div class="doc-filter-row">
        <div>
          <div class="section-title">Document queue</div>
          <div class="filter-note">Filter by owner and move documents through the processing pipeline.</div>
        </div>
        <label class="filter-control" for="doc-owner-filter">
          <span>Owner</span>
          <select id="doc-owner-filter" data-doc-filter>
            ${owners.map((owner) => `<option value="${escapeHtml(owner)}" ${state.documentFilter === owner ? "selected" : ""}>${escapeHtml(owner)}</option>`).join("")}
          </select>
        </label>
      </div>
    </section>
  `;
}

function selectedDocument() {
  return documents.find((doc) => doc.id === state.selectedDocumentId) || documents[0];
}

function documentDetailPanel(doc) {
  if (!doc) return "";
  return `
    <section class="panel">
      <div class="section-heading">
        <div class="section-title">Selected document</div>
        ${statusChip(doc.status)}
      </div>
      <div class="doc-detail-grid">
        ${detailItem("Document", doc.id)}
        ${detailItem("Type", doc.type)}
        ${detailItem("Job", doc.jobId)}
        ${detailItem("Customer", doc.customer)}
        ${detailItem("Owner", doc.owner)}
        ${detailItem("Due", `${doc.due}${documentIsOverdue(doc) ? " / Overdue" : documentIsDueToday(doc) ? " / Today" : ""}`)}
      </div>
    </section>
  `;
}

function detailItem(label, value) {
  return `
    <div class="detail-item">
      <span>${label}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function moduleTile(code, name, meta) {
  return `
    <article class="module-tile">
      <div class="tile-code">${code}</div>
      <div class="tile-name">${name}</div>
      <div class="tile-meta">${meta}</div>
    </article>
  `;
}

function serviceFlow() {
  const nodes = [
    ["start",    "Intake",     "Request"],
    ["process",  "Contract",   "Warranty"],
    ["duration", "Diagnostics","Duration"],
    ["decision", "Quote?",     "Sales"],
    ["action",   "Parts",      "EDD"],
    ["duration", "Repair",     "Duration"],
    ["process",  "Work act",   "Draft"],
    ["end",      "Finished",   "Archive"]
  ];
  return `
    <div class="flow-row">
      ${nodes.map(([type, label, sub], index) => `
        <div class="flow-node ${type}">
          <div class="flow-label">${label}</div>
          <div class="flow-sub">${sub}</div>
        </div>
        ${index < nodes.length - 1 ? '<span class="flow-arrow" aria-hidden="true"></span>' : ""}
      `).join("")}
    </div>
  `;
}

function templatePanel(doc = selectedDocument()) {
  const template = templates.find((tpl) => tpl.id === state.selectedTemplateId) || templates[0];

  // Check if a preview has been generated for the current doc+template combination
  const p = state.generatedDocPreview;
  const previewActive = p && p.docId === doc?.id && p.templateId === template?.id;

  return `
    <section class="panel">
      <div class="section-heading">
        <div class="section-title">Template generation</div>
        <span class="chip ${previewActive ? "done" : "pending"}">${escapeHtml(state.generationStatus)}</span>
      </div>
      <div class="template-controls">
        <label class="filter-control" for="template-select">
          <span>Template</span>
          <select id="template-select" data-template-select>
            ${templates.map((tpl) => `
              <option value="${escapeHtml(tpl.id)}" ${tpl.id === state.selectedTemplateId ? "selected" : ""}>${escapeHtml(tpl.name)}</option>
            `).join("")}
          </select>
        </label>
        <label class="filter-control" for="output-format">
          <span>Output</span>
          <select id="output-format" data-output-format>
            ${["pdf", "docx", "odt"].map((format) => `<option value="${format}" ${state.documentOutputFormat === format ? "selected" : ""}>${format.toUpperCase()}</option>`).join("")}
          </select>
        </label>
        <button class="btn dark" type="button" data-generate-document="${escapeHtml(doc?.id || "")}">Generate mock</button>
      </div>
      <div class="tile-grid">
        ${templates.map((tpl) => `
          <button class="template-card ${tpl.id === state.selectedTemplateId ? "selected" : ""}" type="button" data-template-pick="${escapeHtml(tpl.id)}">
            <strong>${escapeHtml(tpl.name)}</strong>
            <span>${escapeHtml(tpl.format)} / ${escapeHtml(tpl.owner)}</span>
          </button>
        `).join("")}
      </div>
      ${previewActive
        ? docPreviewPanel(doc, template, p)
        : `<pre class="json-preview">${escapeHtml(JSON.stringify({ documentId: doc?.id || "DOC-0000", type: doc?.type || "Service act", jobId: doc?.jobId || "VM-SV-0000", customer: doc?.customer || "Customer", owner: doc?.owner || "Service", template: template?.name || "Service act", output: state.documentOutputFormat }, null, 2))}</pre>`
      }
    </section>
  `;
}

// ---------------------------------------------------------------------------
// Document preview panel — rendered HTML mock of the generated document
// ---------------------------------------------------------------------------

function dpfRow(label, value) {
  return `<div class="dpf-row"><div class="dpf-label">${escapeHtml(label)}</div><div class="dpf-value">${escapeHtml(String(value ?? "—"))}</div></div>`;
}

function sigRow(role, name = "") {
  return `
    <div class="dpf-sig">
      <div class="dpf-sig-line"></div>
      <div class="dpf-sig-label">${escapeHtml(role)}${name ? " — " + escapeHtml(name) : ""}</div>
    </div>
  `;
}

function generateDownloadText(doc, template, job, eq) {
  const lines = [
    `VIVA MEDICAL SERVICE IS — MOCK DOCUMENT`,
    `Generated: ${new Date().toLocaleString("lt-LT")}`,
    `Template: ${template?.name || ""}  |  Format: ${(state.documentOutputFormat || "pdf").toUpperCase()}`,
    ``,
    `Document No: ${doc?.id || ""}`,
    `Date: ${new Date().toISOString().slice(0, 10)}`,
    `Type: ${doc?.type || ""}`,
    `Job No: ${doc?.jobId || ""}`,
    `Customer: ${doc?.customer || ""}`,
    `Equipment: ${job?.equipment || eq?.name || ""}`,
    `Serial No: ${job?.serial || eq?.serial || ""}`,
    `Owner: ${doc?.owner || ""}`,
    ``,
    `[END OF MOCK]`
  ];
  return "data:text/plain;charset=utf-8," + encodeURIComponent(lines.join("\n"));
}

function docPreviewPanel(doc, template, preview) {
  const job  = jobs.find((j) => j.id === doc?.jobId);
  const cust = customers.find((c) => c.name === doc?.customer);
  const eq   = equipment.find((e) => e.name === (job?.equipment || ""));
  const dateStr = new Date().toISOString().slice(0, 10);
  const fmt  = (preview?.format || "pdf").toUpperCase();
  const body = docPreviewBody(template?.id, doc, job, cust, eq, dateStr);
  const dlHref = generateDownloadText(doc, template, job, eq);

  return `
    <div class="doc-preview">
      <div class="doc-preview-head">
        <div class="doc-preview-brand">VIVA MEDICAL</div>
        <div class="doc-preview-type">${escapeHtml(template?.name || doc?.type || "Document")}</div>
        <div class="doc-preview-meta-row">
          <span>No: <strong>${escapeHtml(doc?.id || "")}</strong></span>
          <span>Date: <strong>${escapeHtml(dateStr)}</strong></span>
          <span>Format: <strong>${escapeHtml(fmt)}</strong></span>
        </div>
      </div>
      <div class="doc-preview-body">
        ${body}
      </div>
      <div class="doc-preview-actions">
        <a class="btn primary compact" href="${dlHref}" download="${escapeHtml((doc?.id || "doc") + "-mock.txt")}">Download mock (.txt)</a>
        <button class="btn ghost compact" type="button" data-reset-preview>Reset</button>
      </div>
    </div>
  `;
}

function docPreviewBody(templateId, doc, job, cust, eq, dateStr) {
  const serial   = job?.serial   || eq?.serial   || "—";
  const eqName   = job?.equipment || eq?.name    || "—";
  const custName = doc?.customer || cust?.name   || "—";
  const custAddr = cust?.address || "—";
  const owner    = doc?.owner    || "—";
  const jobId    = doc?.jobId    || "—";

  if (templateId === "tpl-service-act") {
    return `
      <div class="dpf-section">General</div>
      ${dpfRow("Document No", doc?.id)}
      ${dpfRow("Job No", jobId)}
      ${dpfRow("Date", dateStr)}
      ${dpfRow("Customer", custName)}
      ${dpfRow("Address", custAddr)}
      <div class="dpf-section">Equipment</div>
      ${dpfRow("Equipment", eqName)}
      ${dpfRow("Serial No", serial)}
      ${dpfRow("Fault reported", job?.stage || "—")}
      <div class="dpf-section">Work performed</div>
      ${dpfRow("Diagnosis", "Equipment inspected; fault identified and corrected.")}
      ${dpfRow("Parts used", "Per attached parts list.")}
      ${dpfRow("Duration (h)", "—")}
      ${dpfRow("Engineer", owner)}
      <div class="dpf-section">Signatures</div>
      <div class="dpf-sig-row">
        ${sigRow("Service engineer", owner)}
        ${sigRow("Customer representative")}
      </div>
    `;
  }

  if (templateId === "tpl-diagnostic") {
    return `
      <div class="dpf-section">Diagnostic Report</div>
      ${dpfRow("Document No", doc?.id)}
      ${dpfRow("Job No", jobId)}
      ${dpfRow("Date", dateStr)}
      ${dpfRow("Customer", custName)}
      <div class="dpf-section">Equipment</div>
      ${dpfRow("Equipment", eqName)}
      ${dpfRow("Serial No", serial)}
      <div class="dpf-section">Findings</div>
      ${dpfRow("Symptom", "Reported fault as described in intake.")}
      ${dpfRow("Root cause", "To be completed by engineer.")}
      ${dpfRow("Recommended action", "—")}
      ${dpfRow("Engineer", owner)}
      <div class="dpf-section">Signature</div>
      <div class="dpf-sig-row">
        ${sigRow("Diagnosing engineer", owner)}
      </div>
    `;
  }

  if (templateId === "tpl-quotation") {
    const qte = quotations.find((q) => q.id === doc?.quotationId) || quotations[0];
    return `
      <div class="dpf-section">Quotation</div>
      ${dpfRow("Document No", doc?.id)}
      ${dpfRow("Date", dateStr)}
      ${dpfRow("Customer", custName)}
      ${dpfRow("Contact", cust?.contact || "—")}
      <div class="dpf-section">Scope</div>
      ${dpfRow("Equipment", eqName)}
      ${dpfRow("Type", qte?.type || "—")}
      ${dpfRow("Description", qte?.notes || "As per service agreement.")}
      <div class="dpf-section">Pricing</div>
      ${dpfRow("Amount", qte ? `${qte.amount.toLocaleString("lt-LT")} ${qte.currency}` : "—")}
      ${dpfRow("Valid until", qte?.due || "—")}
      ${dpfRow("Prepared by", owner)}
      <div class="dpf-section">Acceptance</div>
      <div class="dpf-sig-row">
        ${sigRow("Sales representative", owner)}
        ${sigRow("Customer authorisation")}
      </div>
    `;
  }

  if (templateId === "tpl-acceptance") {
    return `
      <div class="dpf-section">Acceptance Report</div>
      ${dpfRow("Document No", doc?.id)}
      ${dpfRow("Job No", jobId)}
      ${dpfRow("Date", dateStr)}
      ${dpfRow("Customer", custName)}
      ${dpfRow("Address", custAddr)}
      <div class="dpf-section">Installed Equipment</div>
      ${dpfRow("Equipment", eqName)}
      ${dpfRow("Serial No", serial)}
      ${dpfRow("Installation date", dateStr)}
      ${dpfRow("Installer", owner)}
      <div class="dpf-section">Acceptance</div>
      ${dpfRow("Acceptance criteria met", "Yes")}
      ${dpfRow("Training provided", "Yes")}
      <div class="dpf-sig-row">
        ${sigRow("Installation engineer", owner)}
        ${sigRow("Customer representative")}
        ${sigRow("Hospital management")}
      </div>
    `;
  }

  if (templateId === "tpl-vendor-return") {
    const pr = partsRequests.find((p) => p.jobId === jobId);
    return `
      <div class="dpf-section">Vendor Return Note</div>
      ${dpfRow("Document No", doc?.id)}
      ${dpfRow("Date", dateStr)}
      ${dpfRow("Job No", jobId)}
      ${dpfRow("Customer", custName)}
      <div class="dpf-section">Part Details</div>
      ${dpfRow("Part No", pr?.partNumber || "—")}
      ${dpfRow("Description", pr?.description || "—")}
      ${dpfRow("Reason", "Defective part returned to vendor.")}
      ${dpfRow("Authorised by", owner)}
      <div class="dpf-sig-row">
        ${sigRow("Service manager", owner)}
      </div>
    `;
  }

  // Fallback
  return `
    <div class="dpf-section">Document fields</div>
    ${dpfRow("Document No", doc?.id)}
    ${dpfRow("Date", dateStr)}
    ${dpfRow("Customer", custName)}
    ${dpfRow("Equipment", eqName)}
    ${dpfRow("Owner", owner)}
  `;
}

// ---------------------------------------------------------------------------
// Role-awareness helpers
// ---------------------------------------------------------------------------

// Maps the active role to the demo user's display name used on job records.
// Returns null for admin/manager who see all data.
function currentUserName() {
  return {
    service:   "R. Petrauskas",
    svcmgr:    "M. Vaitkus",
    sales:     "V. Klimaite",
    finance:   "V. Klimaite",
    office:    "I. Mazure",
    logistics: "T. Gruodis",
    warehouse: "T. Gruodis"
  }[state.role] || null;
}

// Returns jobs the current role is allowed to see.
// service engineers see only their own; everyone else sees all.
function visibleJobs() {
  const name = currentUserName();
  if (state.role === "service" && name) return jobs.filter((j) => j.owner === name);
  return jobs;
}

// Whether the current role can open the "New service job" wizard.
function canCreateServiceJob() {
  return ["service", "svcmgr", "office", "admin"].includes(state.role);
}

// Returns the 4 joined stat-card HTML strings for the Command Center.
function roleStats() {
  const r           = state.role;
  const allOverdue  = overdueDocuments();
  const myJobList   = visibleJobs();
  const pmSchedule  = computePmSchedule();

  if (r === "service") {
    const myOverdueCount = allOverdue.filter((d) =>
      myJobList.some((j) => j.id === d.jobId)
    ).length;
    return [
      statCard("My open jobs",     myJobList.filter((j) => j.status === "Open").length, "Assigned to me",         "info"),
      statCard("My overdue docs",  myOverdueCount,                                       "Need my follow-up",      myOverdueCount > 0 ? "danger" : "ok"),
      statCard("Parts pending",    partsRequests.filter((pr) => pr.status === "Pending approval").length, "Waiting for svcmgr", "warn"),
      statCard("Final documents",  myJobList.filter((j) => j.stage === "Final documents").length, "Work acts to complete", "")
    ].join("");
  }

  if (r === "svcmgr") {
    const needApproval = partsRequests.filter((pr) => pr.status === "Pending approval").length;
    const today = todayOnly();
    const in14  = new Date(today.getTime() + 14 * 864e5);
    const pmSoon = pmSchedule.filter((pm) => {
      const d = dateOnly(pm.date);
      return pm.status === "Scheduled" && d >= today && d <= in14;
    }).length;
    return [
      statCard("Open jobs (all)",     jobs.filter((j) => j.status === "Open").length, "Across all engineers", "info"),
      statCard("Parts to approve",    needApproval, "Awaiting your decision",       needApproval > 0 ? "warn" : "ok"),
      statCard("Overdue documents",   allOverdue.length, "Team follow-up needed",   allOverdue.length > 0 ? "danger" : "ok"),
      statCard("PM visits (14 days)", pmSoon, "Scheduled visits approaching",       pmSoon > 0 ? "warn" : "")
    ].join("");
  }

  if (r === "sales") {
    const salesDocs = documents.filter((d) => d.owner === "Sales");
    return [
      statCard("Quotations in review",  salesDocs.filter((d) => d.pipelineStep === "Review").length,   "Awaiting approval",    salesDocs.filter((d) => d.pipelineStep === "Review").length > 0 ? "warn" : ""),
      statCard("Awaiting customer",     salesDocs.filter((d) => d.pipelineStep === "Customer").length, "Customer signature",   salesDocs.filter((d) => d.pipelineStep === "Customer").length > 0 ? "warn" : ""),
      statCard("Sales docs total",      salesDocs.length,                                              "In pipeline",          "info"),
      statCard("Active contracts",      contracts.length,                                              "Managed contracts",    "")
    ].join("");
  }

  if (r === "finance") {
    const atSig = documents.filter((d) => d.pipelineStep === "Signature").length;
    return [
      statCard("Awaiting signature",   atSig, "Docs at signature stage",           atSig > 0 ? "warn" : "ok"),
      statCard("Overdue documents",    allOverdue.length, "All owners",             allOverdue.length > 0 ? "danger" : "ok"),
      statCard("Active contracts",     contracts.length, "Balance tracking active", "info"),
      statCard("Total contract value", contracts.reduce((s, c) => s + c.value, 0).toLocaleString() + " EUR", "Combined value", "")
    ].join("");
  }

  if (r === "office") {
    const today   = todayOnly();
    const in7     = new Date(today.getTime() + 7 * 864e5);
    const upcoming = getMonthEvents(today.getFullYear(), today.getMonth())
      .filter((ev) => { const d = dateOnly(ev.date); return d >= today && d <= in7; }).length;
    return [
      statCard("Open jobs",          jobs.filter((j) => j.status === "Open").length, "Active service cases", "info"),
      statCard("Overdue documents",  allOverdue.length, "Need follow-up",             allOverdue.length > 0 ? "danger" : "ok"),
      statCard("Events next 7 days", upcoming,          "Calendar, PM, sales",        upcoming > 0 ? "warn" : ""),
      statCard("Customers",          customers.length,  "In registry",                "")
    ].join("");
  }

  if (r === "logistics") {
    const inTransit  = partsRequests.filter((pr) => pr.status === "In transit").length;
    const arrived    = partsRequests.filter((pr) => pr.status === "Arrived at warehouse").length;
    const noDelivery = partsRequests.filter((pr) => pr.status === "Arrived at warehouse" && !pr.delivery).length;
    return [
      statCard("In transit",           inTransit,   "Ordered and en route",          inTransit > 0 ? "info" : ""),
      statCard("Arrived at warehouse", arrived,     "Ready for delivery decision",    arrived > 0 ? "warn" : "ok"),
      statCard("Delivery unspecified", noDelivery,  "Need your decision",             noDelivery > 0 ? "danger" : "ok"),
      statCard("Pending approval",     partsRequests.filter((pr) => pr.status === "Pending approval").length, "Not yet approved", "")
    ].join("");
  }

  if (r === "warehouse") {
    return [
      statCard("Pending approval",     partsRequests.filter((pr) => pr.status === "Pending approval").length, "Awaiting svcmgr",        "warn"),
      statCard("In transit",           partsRequests.filter((pr) => pr.status === "In transit").length,       "Ordered and en route",   "info"),
      statCard("Arrived at warehouse", partsRequests.filter((pr) => pr.status === "Arrived at warehouse").length, "Log stock receipt",  "warn"),
      statCard("Total parts requests", partsRequests.length, "All statuses",                                                           "")
    ].join("");
  }

  if (r === "manager") {
    const pmDone = pmSchedule.filter((pm) => pm.status === "Completed").length;
    return [
      statCard("Open jobs",         jobs.filter((j) => j.status === "Open").length, "Across all teams",          "info"),
      statCard("Overdue documents", allOverdue.length, "Require team follow-up",      allOverdue.length > 0 ? "danger" : "ok"),
      statCard("Active contracts",  contracts.length,  "Contract coverage",           ""),
      statCard("PM completion",     `${pmDone}/${pmSchedule.length}`, "This contract period", pmDone === pmSchedule.length && pmSchedule.length > 0 ? "ok" : "")
    ].join("");
  }

  // admin — default
  return [
    statCard("Open service jobs",  jobs.length,        "Across diagnostics, repair, and documents", "info"),
    statCard("Overdue documents",  allOverdue.length,   "Require owner follow-up today",              allOverdue.length > 0 ? "danger" : "ok"),
    statCard("Customer approvals", 3,                   "Waiting before service handoff",             "warn"),
    statCard("Finishing this week", 5,                  "Ready for final work act",                   "ok")
  ].join("");
}

// Returns the role-specific focus panel for the Command Center.
function roleFocusPanel() {
  const r = state.role;

  if (r === "service") {
    const myJobList = visibleJobs();
    return `
      <section class="panel">
        <div class="section-heading">
          <div class="section-title">My assigned jobs</div>
          <span class="role-tag service">service</span>
        </div>
        ${myJobList.length
          ? jobsTableRows(myJobList)
          : `<div class="modal-placeholder">No jobs currently assigned to you.</div>`}
      </section>
    `;
  }

  if (r === "svcmgr") {
    const pending = partsRequests.filter((pr) => pr.status === "Pending approval");
    return `
      <section class="panel">
        <div class="section-heading">
          <div class="section-title">Parts awaiting your approval (${pending.length})</div>
          <span class="role-tag svcmgr">svcmgr</span>
        </div>
        ${pending.length
          ? partsQueueTable(pending)
          : `<div class="modal-placeholder">No parts requests pending your approval.</div>`}
      </section>
      <section class="panel">
        <div class="section-heading"><div class="section-title">All active jobs</div></div>
        ${jobsTableRows(jobs)}
      </section>
    `;
  }

  if (r === "sales" || r === "finance") {
    const ownerLabel = r === "sales" ? "Sales" : "Finance";
    const ownerDocs  = documents.filter((d) => d.owner === ownerLabel);
    return `
      <section class="panel">
        <div class="section-heading">
          <div class="section-title">${ownerLabel} document queue</div>
          <span class="role-tag ${r}">${r}</span>
        </div>
        ${ownerDocs.length
          ? documentsTableRows(ownerDocs)
          : `<div class="modal-placeholder">No ${ownerLabel.toLowerCase()} documents in pipeline.</div>`}
      </section>
    `;
  }

  if (r === "logistics" || r === "warehouse") {
    const relevant = partsRequests.filter((pr) =>
      ["Pending approval", "In transit", "Arrived at warehouse"].includes(pr.status)
    );
    return `
      <section class="panel">
        <div class="section-heading">
          <div class="section-title">Parts queue</div>
          <span class="role-tag ${r}">${r}</span>
        </div>
        ${relevant.length
          ? partsQueueTable(relevant)
          : `<div class="modal-placeholder">No active parts requests.</div>`}
      </section>
    `;
  }

  if (r === "office" || r === "manager") {
    return `
      <section class="panel">
        <div class="section-heading">
          <div class="section-title">All service jobs</div>
          <span class="role-tag ${r}">${r}</span>
        </div>
        ${jobsTableRows(jobs)}
      </section>
    `;
  }

  // admin — document pipeline + jobs
  return `
    <section class="panel">
      <div class="section-heading"><div class="section-title">Document pipeline</div></div>
      ${pipelineBoard()}
    </section>
  `;
}

// Inline jobs table body (reuses columns from jobsTable but without the outer card wrapper).
function jobsTableRows(rows) {
  if (!rows.length) return `<div class="modal-placeholder">No jobs to display.</div>`;
  return `
    <table class="data-table">
      <thead>
        <tr>
          <th>Job ID</th><th>Customer</th><th>Equipment</th>
          <th>Owner</th><th>Stage</th><th>Status</th><th>Due</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map((job) => `
          <tr>
            <td class="mono">${escapeHtml(job.id)}</td>
            <td>${escapeHtml(job.customer)}</td>
            <td>${escapeHtml(job.equipment)}</td>
            <td>${escapeHtml(job.owner)}</td>
            <td>${escapeHtml(job.stage)}</td>
            <td>${statusChip(job.status)}</td>
            <td class="mono">${escapeHtml(job.due)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

// Inline documents table body for focus panels.
function documentsTableRows(rows) {
  if (!rows.length) return `<div class="modal-placeholder">No documents to display.</div>`;
  return `
    <table class="data-table">
      <thead>
        <tr>
          <th>Doc ID</th><th>Type</th><th>Customer</th><th>Stage</th><th>Due</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map((doc) => `
          <tr class="${documentIsOverdue(doc) ? "overdue" : ""}">
            <td class="mono">${escapeHtml(doc.id)}</td>
            <td>${escapeHtml(doc.type)}</td>
            <td>${escapeHtml(doc.customer)}</td>
            <td>${statusChip(doc.pipelineStep)}</td>
            <td>${dueCell(doc)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

// Compact parts table for svcmgr approval queue and logistics focus panels.
function partsQueueTable(rows) {
  return `
    <table class="data-table">
      <thead>
        <tr>
          <th>Request</th><th>Equipment</th><th>Part</th><th>Status</th><th>EDD</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map((pr) => `
          <tr>
            <td class="mono">${escapeHtml(pr.id)}</td>
            <td>${escapeHtml(pr.equipment)}</td>
            <td>${escapeHtml(pr.part)}</td>
            <td>${statusChip(pr.status)}</td>
            <td class="mono">${escapeHtml(pr.edd || "—")}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

// ---------------------------------------------------------------------------
// Page renders
// ---------------------------------------------------------------------------
function commandPage() {
  return `
    ${pageHeader("command")}
    <div class="page-content">
      <div class="stat-grid">
        ${roleStats()}
      </div>
      ${roleFocusPanel()}
      ${state.role === "admin" ? jobsTable(jobs.slice(0, 3)) : ""}
      ${devSpecPanel("command")}
    </div>
  `;
}

function servicePage() {
  const pmSchedule  = computePmSchedule();
  const pmUpcoming  = pmSchedule.filter((pm) => pm.status === "Scheduled").length;
  const pmCompleted = pmSchedule.filter((pm) => pm.status === "Completed").length;
  const myJobList   = visibleJobs();
  const isOwn       = state.role === "service";

  return `
    ${pageHeader("service")}
    <div class="page-content">
      <div class="tile-grid">
        ${moduleTile("NEW", "New requests",    isOwn ? `${myJobList.length} my jobs` : "4 unassigned jobs")}
        ${moduleTile("DIA", "Diagnostics",     "2 durations to log")}
        ${moduleTile("PRT", "Parts pending",   "3 waiting for EDD")}
        ${moduleTile("PM",  "PM schedule",     `${pmUpcoming} upcoming · ${pmCompleted} done`)}
        ${moduleTile("VRT", "Vendor returns",  "1 return in progress")}
        ${moduleTile("DOC", "Final documents", "5 work acts to finish")}
      </div>
      <section class="panel">
        <div class="section-heading"><div class="section-title">Service process — Pipeline A (repair, no contract)</div></div>
        ${serviceFlow()}
      </section>
      ${isOwn
        ? `<section class="panel">
             <div class="section-heading">
               <div class="section-title">My jobs (${myJobList.length})</div>
               <span class="role-tag service">service</span>
             </div>
             ${jobsTableRows(myJobList)}
           </section>`
        : jobsTable()}
      ${state.role === "svcmgr" || state.role === "admin" ? `
        <section class="panel">
          <div class="section-heading">
            <div class="section-title">Parts awaiting approval</div>
            <span class="role-tag svcmgr">svcmgr</span>
          </div>
          ${partsQueueTable(partsRequests.filter((pr) => pr.status === "Pending approval"))}
        </section>` : ""}
      <section class="panel">
        <div class="section-heading">
          <div class="section-title">PM submodule — periodic maintenance auto-schedule</div>
        </div>
        ${pmScheduleTable()}
      </section>
      ${devSpecPanel("service")}
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Sales page helpers
// ---------------------------------------------------------------------------
function selectedQuotation() {
  return quotations.find((q) => q.id === state.selectedQuotationId) || quotations[0];
}

function salesQuotationsTable() {
  return `
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th><th>Customer</th><th>Type</th>
          <th class="num">Amount</th><th>Status</th><th>Due</th>
        </tr>
      </thead>
      <tbody>
        ${quotations.map((q) => `
          <tr class="${q.id === state.selectedQuotationId ? "selected" : ""}"
              data-qte-row="${escapeHtml(q.id)}" style="cursor:pointer">
            <td class="mono">${escapeHtml(q.id)}</td>
            <td>${escapeHtml(q.customer)}</td>
            <td>${escapeHtml(q.type)}</td>
            <td class="num">${q.amount.toLocaleString()} ${q.currency}</td>
            <td>${statusChip(q.status)}</td>
            <td class="mono">${escapeHtml(q.due)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function salesDetailPanel(qte) {
  const tabs       = ["offer", "contract", "approval", "handoff"];
  const tabLabels  = { offer: "Offer", contract: "Contract / Warranty", approval: "Approval", handoff: "Handoff" };
  const activeTab  = state.salesTab || "offer";

  const tabBar = tabs.map((t) => `
    <button class="eq-tab ${activeTab === t ? "active" : ""}"
            type="button" data-sales-tab="${t}">${tabLabels[t]}</button>
  `).join("");

  const content = activeTab === "offer"    ? salesOfferTab(qte)
                : activeTab === "contract" ? salesContractTab(qte)
                : activeTab === "approval" ? salesApprovalTab(qte)
                :                            salesHandoffTab(qte);

  return `
    <div class="section-heading">
      <div class="section-title">${escapeHtml(qte.id)} — ${escapeHtml(qte.customer)}</div>
      ${statusChip(qte.status)}
    </div>
    <div class="eq-tab-bar">${tabBar}</div>
    <div class="eq-tab-content">${content}</div>
  `;
}

function salesOfferTab(qte) {
  return `
    <div class="field-stack">
      <div class="field"><div class="field-label">Customer</div><div class="field-value">${escapeHtml(qte.customer)}</div></div>
      <div class="field"><div class="field-label">Equipment</div><div class="field-value">${escapeHtml(qte.equipment)}</div></div>
      <div class="field"><div class="field-label">Offer type</div><div class="field-value">${escapeHtml(qte.type)}</div></div>
      <div class="field"><div class="field-label">Amount</div><div class="field-value mono">${qte.amount.toLocaleString()} ${qte.currency}</div></div>
      <div class="field"><div class="field-label">Owner</div><div class="field-value">${escapeHtml(qte.owner)}</div></div>
      <div class="field"><div class="field-label">Created</div><div class="field-value mono">${escapeHtml(qte.created)}</div></div>
      <div class="field"><div class="field-label">Due</div><div class="field-value mono">${escapeHtml(qte.due)}</div></div>
      <div class="field full"><div class="field-label">Notes</div><div class="field-value">${escapeHtml(qte.notes)}</div></div>
    </div>
    ${qte.status === "Draft" ? `
      <div class="eq-footer">
        <button class="btn primary" type="button" data-qte-send="${escapeHtml(qte.id)}">
          Mark as sent to customer
        </button>
      </div>
    ` : ""}
  `;
}

function salesContractTab(qte) {
  if (!["PM Contract", "Installation"].includes(qte.type)) {
    return `<div class="modal-placeholder">Contract indexing applies to PM Contract and Installation offer types only.</div>`;
  }
  return `
    <div class="field-stack">
      <div class="field"><div class="field-label">Linked contract</div><div class="field-value mono">${escapeHtml(qte.contractId || "Not yet indexed")}</div></div>
      <div class="field"><div class="field-label">Warranty start</div><div class="field-value mono">${escapeHtml(qte.warrantyStart || "—")}</div></div>
      <div class="field"><div class="field-label">Warranty end</div><div class="field-value mono">${escapeHtml(qte.warrantyEnd || "—")}</div></div>
      <div class="field"><div class="field-label">PM visits / year</div><div class="field-value mono">${qte.pmPerYear || "—"}</div></div>
      <div class="field full"><div class="field-label">Contract scope</div><div class="field-value">${escapeHtml(qte.contractScope || "—")}</div></div>
    </div>
    <div class="info-box" style="margin-top:12px">
      <div class="info-title">Contract ownership</div>
      <div class="info-body">After handoff to Service, contract ownership transfers to Admin. Sales cannot edit the contract after submission. Admin can restore it to edit mode from the Admin module.</div>
    </div>
  `;
}

function salesApprovalTab(qte) {
  const canDecide = ["Sent", "Awaiting approval"].includes(qte.status);
  return `
    <div class="field-stack">
      <div class="field"><div class="field-label">Approval contact</div><div class="field-value">${escapeHtml(qte.approvalContact)}</div></div>
      <div class="field"><div class="field-label">Approval date</div><div class="field-value mono">${escapeHtml(qte.approvalDate || "Pending")}</div></div>
      <div class="field"><div class="field-label">Current status</div><div class="field-value">${statusChip(qte.status)}</div></div>
    </div>
    ${canDecide ? `
      <div class="sales-actions">
        <button class="btn primary" type="button" data-qte-approve="${escapeHtml(qte.id)}">Mark customer approved</button>
        <button class="btn ghost"   type="button" data-qte-reject="${escapeHtml(qte.id)}">Mark rejected</button>
      </div>
    ` : ""}
    ${qte.status === "Approved" ? `
      <div class="info-box" style="margin-top:12px">
        <div class="info-title">Approved on ${escapeHtml(qte.approvalDate || "—")}</div>
        <div class="info-body">Go to the Handoff tab to transfer this job to the Service team.</div>
      </div>
    ` : ""}
    ${qte.status === "Rejected" ? `
      <div class="info-box warn" style="margin-top:12px">
        <div class="info-title">Rejected by customer</div>
        <div class="info-body">Revise the offer on the Offer tab and re-send to customer.</div>
      </div>
    ` : ""}
  `;
}

function salesHandoffTab(qte) {
  if (qte.status === "Handed off") {
    return `
      <div class="info-box" style="margin-top:8px">
        <div class="info-title">Handed off to Service</div>
        <div class="info-body">Resulting job: <span class="mono">${escapeHtml(qte.handedOffJobId || "—")}</span>. The Service team now owns this case. Contract ownership has transferred to Admin.</div>
      </div>
    `;
  }
  if (qte.status !== "Approved") {
    return `<div class="modal-placeholder">Customer approval is required before handoff. Go to the Approval tab.</div>`;
  }
  return `
    <div class="field-stack">
      <div class="field"><div class="field-label">Customer</div><div class="field-value">${escapeHtml(qte.customer)}</div></div>
      <div class="field"><div class="field-label">Equipment</div><div class="field-value">${escapeHtml(qte.equipment)}</div></div>
      <div class="field"><div class="field-label">Offer amount</div><div class="field-value mono">${qte.amount.toLocaleString()} ${qte.currency}</div></div>
    </div>
    <div class="sales-actions">
      <button class="btn primary" type="button" data-qte-handoff="${escapeHtml(qte.id)}">Send to Service team</button>
    </div>
    <div class="info-box" style="margin-top:12px">
      <div class="info-title">What happens on handoff</div>
      <div class="info-body">A new service job is created automatically. The offer status changes to "Handed off". Contract ownership transfers to Admin. This action cannot be undone.</div>
    </div>
  `;
}

function salesPage() {
  const qte          = selectedQuotation();
  const awaitingCount = quotations.filter((q) => q.status === "Awaiting approval").length;
  const approvedCount = quotations.filter((q) => q.status === "Approved").length;
  const handedCount   = quotations.filter((q) => q.status === "Handed off").length;

  return `
    ${pageHeader("sales")}
    <div class="page-content">
      <div class="stat-grid">
        ${statCard("Total quotations",    quotations.length, "In system",                 "info")}
        ${statCard("Awaiting approval",   awaitingCount,     "Customer response needed",  awaitingCount > 0 ? "warn" : "")}
        ${statCard("Approved",            approvedCount,     "Ready to hand off",         approvedCount > 0 ? "ok"   : "")}
        ${statCard("Handed off",          handedCount,       "Transferred to Service",    "")}
      </div>

      <section class="split-layout">
        <div class="panel split-left">
          <div class="section-heading">
            <div class="section-title">Quotations (${quotations.length})</div>
            <button class="btn primary compact" type="button">New quotation</button>
          </div>
          ${salesQuotationsTable()}
        </div>
        <div class="panel split-right">
          ${qte ? salesDetailPanel(qte) : `<div class="modal-placeholder">Select a quotation to view details.</div>`}
        </div>
      </section>

      ${devSpecPanel("sales")}
    </div>
  `;
}

// Returns the default document owner filter for the current role.
function roleDefaultDocFilter() {
  return { sales: "Sales", finance: "Finance", service: "Service", svcmgr: "Service" }[state.role] || "All";
}

function documentsPage() {
  // If the user hasn't explicitly set a filter yet, use the role default.
  const effectiveFilter = state.documentFilter === "All" && roleDefaultDocFilter() !== "All"
    ? roleDefaultDocFilter()
    : state.documentFilter;
  const filteredDocs = effectiveFilter === "All"
    ? documents
    : documents.filter((doc) => doc.owner === effectiveFilter);
  const doc = selectedDocument();

  return `
    ${pageHeader("documents")}
    <div class="page-content">
      <section class="panel">
        <div class="section-heading"><div class="section-title">Pipeline stages</div></div>
        ${pipelineBoard()}
      </section>
      ${documentMonitoringPanel()}
      ${documentFilters()}
      <section class="two-col docs-layout">
        <div>
          ${documentsTable(filteredDocs)}
        </div>
        <div>
          ${documentDetailPanel(doc)}
          ${templatePanel(doc)}
        </div>
      </section>
      ${devSpecPanel("documents")}
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Customers page
// ---------------------------------------------------------------------------
function customersPage() {
  const selected = customers.find((c) => c.id === state.selectedCustomerId) || customers[0];
  return `
    ${pageHeader("customers")}
    <div class="page-content">
      <section class="split-layout">
        <div class="panel split-left">
          <div class="section-heading">
            <div class="section-title">Customers (${customers.length})</div>
            <button class="btn primary compact" type="button">Add customer</button>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Jobs</th>
                <th>Docs</th>
              </tr>
            </thead>
            <tbody>
              ${customers.map((c) => `
                <tr class="${c.id === state.selectedCustomerId ? "selected" : ""}"
                    data-customer-row="${escapeHtml(c.id)}" style="cursor:pointer">
                  <td><strong>${escapeHtml(c.name)}</strong></td>
                  <td>${escapeHtml(c.type)}</td>
                  <td>${c.openJobs}</td>
                  <td>${c.outstandingDocs > 0 ? `<span class="chip warn">${c.outstandingDocs}</span>` : "0"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="panel split-right">
          ${selected ? customerDetail(selected) : ""}
        </div>
      </section>
      ${devSpecPanel("customers")}
    </div>
  `;
}

function customerDetail(c) {
  const linked = equipment.filter((eq) => eq.customerId === c.id);
  const linkedContracts = contracts.filter((ct) => ct.customerId === c.id);
  return `
    <div class="section-heading">
      <div class="section-title">${escapeHtml(c.name)}</div>
      <span class="chip ok">${escapeHtml(c.type)}</span>
    </div>
    <div class="detail-block">
      <div class="detail-group-title">Contact</div>
      <div class="doc-detail-grid">
        ${detailItem("Name", c.contact)}
        ${detailItem("Role", c.contactRole)}
        ${detailItem("Email", c.email)}
        ${detailItem("Phone", c.phone)}
        ${detailItem("Address", c.address)}
      </div>
    </div>
    <div class="detail-block">
      <div class="detail-group-title">Activity</div>
      <div class="mini-stat-row">
        <div class="mini-stat info"><span>${c.openJobs}</span><small>Open jobs</small></div>
        <div class="mini-stat ok"><span>${c.equipmentCount}</span><small>Systems</small></div>
        <div class="mini-stat ${c.outstandingDocs > 0 ? "warn" : ""}"><span>${c.outstandingDocs}</span><small>Pending docs</small></div>
        <div class="mini-stat"><span>${c.activeContracts}</span><small>Contracts</small></div>
      </div>
    </div>
    ${linked.length > 0 ? `
    <div class="detail-block">
      <div class="detail-group-title">Installed systems</div>
      <div class="linked-list">
        ${linked.map((eq) => `
          <div class="linked-row">
            <span class="mono">${escapeHtml(eq.id)}</span>
            <span>${escapeHtml(eq.name)}</span>
            <span class="chip ${eq.status === "Active" ? "ok" : eq.status === "Under service" ? "warn" : "pending"}">${escapeHtml(eq.status)}</span>
          </div>
        `).join("")}
      </div>
    </div>
    ` : ""}
    ${linkedContracts.length > 0 ? `
    <div class="detail-block">
      <div class="detail-group-title">Active contracts</div>
      <div class="linked-list">
        ${linkedContracts.map((ct) => `
          <div class="linked-row">
            <span class="mono">${escapeHtml(ct.id)}</span>
            <span>${escapeHtml(ct.type)}</span>
            <span class="mono">${ct.remaining.toLocaleString()} ${ct.currency} remaining</span>
          </div>
        `).join("")}
      </div>
    </div>
    ` : ""}
  `;
}

// ---------------------------------------------------------------------------
// Equipment page — full detail with Support Portal tab
// ---------------------------------------------------------------------------
function equipmentPage() {
  const selected = equipment.find((eq) => eq.id === state.selectedEquipmentId) || equipment[0];
  return `
    ${pageHeader("equipment")}
    <div class="page-content">
      <section class="split-layout eq-layout">
        <div class="panel split-left">
          <div class="section-heading">
            <div class="section-title">Installed systems (${equipment.length})</div>
            <button class="btn primary compact" type="button">New system</button>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>System</th>
                <th>Customer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${equipment.map((eq) => `
                <tr class="${eq.id === state.selectedEquipmentId ? "selected" : ""}"
                    data-eq-row="${escapeHtml(eq.id)}" style="cursor:pointer">
                  <td class="mono">${escapeHtml(eq.id)}</td>
                  <td><strong>${escapeHtml(eq.name)}</strong><br><small class="text-muted">${escapeHtml(eq.manufacturer)}</small></td>
                  <td>${escapeHtml(eq.customer)}</td>
                  <td><span class="chip ${eq.status === "Active" ? "ok" : eq.status === "Under service" ? "warn" : "pending"}">${escapeHtml(eq.status)}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="panel split-right eq-detail">
          ${selected ? equipmentDetail(selected) : ""}
        </div>
      </section>
      ${devSpecPanel("equipment")}
    </div>
  `;
}

function equipmentDetail(eq) {
  const tabs = [
    { id: "system-info",         label: "System Info" },
    { id: "installation",        label: "Installation" },
    { id: "hospital-acceptance", label: "Hospital Acceptance" },
    { id: "support",             label: "Support" }
  ];
  return `
    <div class="section-heading">
      <div class="section-title">${escapeHtml(eq.name)}</div>
      <span class="chip ${eq.status === "Active" ? "ok" : eq.status === "Under service" ? "warn" : "pending"}">${escapeHtml(eq.status)}</span>
    </div>
    <div class="eq-tab-bar">
      ${tabs.map((t) => `
        <button class="eq-tab ${state.equipmentTab === t.id ? "active" : ""}" type="button" data-eq-tab="${t.id}">
          ${t.label}
        </button>
      `).join("")}
    </div>
    <div class="eq-tab-content">
      ${state.equipmentTab === "system-info"         ? eqSystemInfoTab(eq)        : ""}
      ${state.equipmentTab === "installation"        ? eqInstallationTab(eq)      : ""}
      ${state.equipmentTab === "hospital-acceptance" ? eqHospitalAcceptanceTab(eq): ""}
      ${state.equipmentTab === "support"             ? eqSupportTab(eq)           : ""}
    </div>
    <div class="eq-footer">
      <div class="eq-flags">
        <label class="flag-check"><input type="checkbox" ${eq.isDemo ? "checked" : ""} disabled> Is Demo System</label>
        <label class="flag-check"><input type="checkbox" ${eq.isOutdated ? "checked" : ""} disabled> Outdated / Unused / Uninstalled</label>
      </div>
      <div class="action-row">
        <button class="btn ghost" type="button">Open service history</button>
        <button class="btn dark" type="button">Save</button>
      </div>
    </div>
  `;
}

function eqSystemInfoTab(eq) {
  return `
    <div class="eq-panels-row">
      <div>
        <div class="detail-group-title">System Information</div>
        <div class="field-stack">
          ${eqField("Manufacturer", eq.manufacturer)}
          ${eqField("Equipment", eq.name)}
          ${eqField("Hospital", eq.customer)}
          ${eqField("Location", eq.location)}
        </div>
      </div>
      <div>
        <div class="detail-group-title">Identifiers</div>
        <div class="field-stack">
          ${eqField("S/N (Serial)", eq.serial)}
          ${eqField("P/N (Part number)", eq.partNumber)}
          ${eqField("ID (Manufacturer)", eq.idGE || "—")}
          ${eqField("Category", eq.category)}
        </div>
      </div>
    </div>
  `;
}

function eqInstallationTab(eq) {
  return `
    <div class="eq-panels-row">
      <div>
        <div class="detail-group-title">Installation</div>
        <div class="field-stack">
          ${eqField("Seller invoice", eq.sellerInvoice)}
          ${eqField("Installed", eq.installedDate)}
          ${eqField("Year of manufacture", eq.yearOfManufacture)}
          ${eqField("Warranty end (Manufacturer)", eq.warrantyEndManufacturer)}
        </div>
      </div>
      <div>
        <div class="detail-group-title">Extended warranty</div>
        <div class="field-stack">
          ${eqField("Custom warranty end", "—")}
        </div>
      </div>
    </div>
  `;
}

function eqHospitalAcceptanceTab(eq) {
  return `
    <div class="field-stack">
      <div class="detail-group-title">Hospital Acceptance</div>
      ${eqField("Certificate", "—")}
      ${eqField("Acceptance date", eq.acceptanceDate)}
      ${eqField("Invoice number", eq.acceptanceInvoice)}
      ${eqField("Warranty end (Hospital)", eq.warrantyEndHospital)}
    </div>
  `;
}

function eqSupportTab(eq) {
  const subTabs = ["Settings", "Emails", "Web Links"];
  return `
    <div class="support-sub-bar">
      ${subTabs.map((t) => {
        const id = t.toLowerCase().replace(" ", "-");
        return `<button class="support-sub-tab ${state.supportSubTab === id ? "active" : ""}" type="button" data-support-tab="${id}">${t}</button>`;
      }).join("")}
    </div>
    <div class="support-sub-content">
      ${state.supportSubTab === "settings"   ? supportSettingsTab(eq)  : ""}
      ${state.supportSubTab === "emails"     ? supportEmailsTab(eq)    : ""}
      ${state.supportSubTab === "web-links"  ? supportWebLinksTab(eq)  : ""}
    </div>
  `;
}

function supportSettingsTab(eq) {
  return `
    <div class="field-stack">
      <label class="perm-toggle">
        <input type="checkbox" id="support-enabled" data-support-enabled="${escapeHtml(eq.id)}" ${eq.supportEnabled ? "checked" : ""}>
        <span>Support Page Is Enabled</span>
      </label>
      <div class="field">
        <label for="support-group">Group Name</label>
        <input id="support-group" value="${escapeHtml(eq.supportGroupName)}" placeholder="e.g. VCH Radiology">
      </div>
      <div class="field">
        <label for="support-image">Image (override)</label>
        <select id="support-image">
          <option>[value is not selected]</option>
          <option>Viva Medical logo</option>
          <option>GE Healthcare logo</option>
        </select>
      </div>
    </div>
    ${eq.supportEnabled ? `
      <div class="info-box" style="margin-top:12px">
        <div class="info-title">Support portal active</div>
        <div class="info-body">Hospital staff can report faults using the URLs in the Web Links tab. Each submission creates a new Technical Case assigned to Admin for engineer assignment.</div>
      </div>
    ` : `
      <div class="info-box" style="margin-top:12px">
        <div class="info-title">Support portal disabled</div>
        <div class="info-body">Enable to generate URLs for hospital staff fault reporting. No login required on the support page.</div>
      </div>
    `}
  `;
}

function supportEmailsTab(eq) {
  return `
    <div class="field-stack">
      <div class="field">
        <label for="email-company">Company emails</label>
        <input id="email-company" value="${escapeHtml(eq.supportEmails.company)}" placeholder="service@vivamedical.lt">
      </div>
      <div class="field">
        <label for="email-manufacturer">Manufacturer emails</label>
        <input id="email-manufacturer" value="${escapeHtml(eq.supportEmails.manufacturer)}" placeholder="support@manufacturer.com">
      </div>
      <div class="field">
        <label for="email-hospital">Hospital emails</label>
        <input id="email-hospital" value="${escapeHtml(eq.supportEmails.hospital)}" placeholder="biomed@hospital.lt">
      </div>
    </div>
    <div class="info-box" style="margin-top:12px">
      <div class="info-title">Notification recipients</div>
      <div class="info-body">Company email receives new case notifications. Manufacturer is notified for warranty incidents. Hospital receives confirmation when the case is registered.</div>
    </div>
  `;
}

function supportWebLinksTab(eq) {
  if (!eq.supportEnabled) {
    return `<div class="info-box"><div class="info-title">Support portal is disabled</div><div class="info-body">Enable the support portal in the Settings tab to generate URLs.</div></div>`;
  }
  return `
    <div class="web-links-list">
      ${webLinkRow("System", eq.webLinks.system, eq.id, "system")}
      ${webLinkRow("Hospital", eq.webLinks.hospital, eq.id, "hospital")}
      ${webLinkRow("Group", eq.webLinks.group, eq.id, "group")}
    </div>
    <div class="info-box" style="margin-top:12px">
      <div class="info-title">How it works</div>
      <div class="info-body">Hospital staff open the System link (no login). They fill in a short fault description. The system creates a Technical Case pre-filled with system and hospital data. Admin assigns the case to an engineer.</div>
    </div>
    <button class="btn primary" type="button" data-support-preview="${escapeHtml(eq.id)}" style="margin-top:12px">
      Preview support page
    </button>
  `;
}

function webLinkRow(label, url, eqId, type) {
  return `
    <div class="web-link-row">
      <span class="web-link-label">${label}</span>
      <input class="web-link-input" readonly value="${escapeHtml(url)}" aria-label="${label} support URL">
      <button class="btn ghost compact" type="button" data-copy-url="${escapeHtml(eqId)}:${type}">Copy</button>
    </div>
  `;
}

function eqField(label, value) {
  return `
    <div class="field">
      <label>${label}</label>
      <input value="${escapeHtml(value || "")}" placeholder="${label}">
    </div>
  `;
}

// Support portal preview modal (shown inside the page as an overlay)
export function renderSupportPortalPreview(eqId) {
  const eq = equipment.find((e) => e.id === eqId);
  if (!eq) return "";
  return `
    <div class="support-preview-overlay" id="support-preview">
      <div class="support-preview-dialog">
        <div class="support-preview-head">
          <div>
            <div class="support-preview-brand">Viva Medical — Support</div>
            <h2 class="support-preview-title">${escapeHtml(eq.name)}</h2>
            <div class="support-preview-meta">${escapeHtml(eq.customer)} · ${escapeHtml(eq.location)}</div>
          </div>
          <button class="wiz-close" type="button" data-close-support-preview>×</button>
        </div>
        <div class="support-preview-body">
          <div class="info-box">
            <div class="info-title">Report a fault or service request</div>
            <div class="info-body">This page is accessible to hospital staff without login. Submitting this form creates a new service case in the Viva Medical system.</div>
          </div>
          <div class="field-stack" style="margin-top:16px">
            <div class="field">
              <label for="sp-system">System</label>
              <input id="sp-system" value="${escapeHtml(eq.name)} — S/N: ${escapeHtml(eq.serial)}" readonly>
            </div>
            <div class="field">
              <label for="sp-hospital">Hospital / location</label>
              <input id="sp-hospital" value="${escapeHtml(eq.customer)} — ${escapeHtml(eq.location)}" readonly>
            </div>
            <div class="field">
              <label for="sp-contact">Your name and contact</label>
              <input id="sp-contact" placeholder="Name — phone or email">
            </div>
            <div class="field full">
              <label for="sp-description">Problem description</label>
              <textarea id="sp-description" rows="4" placeholder="Describe the fault or issue briefly..."></textarea>
            </div>
          </div>
        </div>
        <div class="support-preview-footer">
          <div class="info-box" style="flex:1"><div class="info-body">On submit: new Technical Case created · Admin notified · Engineer assigned</div></div>
          <button class="btn primary" type="button" data-submit-support-case="${escapeHtml(eq.id)}">Submit fault report</button>
        </div>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Parts page — request pipeline with approval and delivery workflow
// ---------------------------------------------------------------------------
function partsPage() {
  const selected = partsRequests.find((pr) => pr.id === state.selectedPartsRequestId) || partsRequests[0];
  const statusCount = (s) => partsRequests.filter((pr) => pr.status === s).length;
  return `
    ${pageHeader("parts")}
    <div class="page-content">
      <section class="stat-grid">
        ${statCard("Pending approval", statusCount("Pending approval"), "Awaiting Service Manager", "warn")}
        ${statCard("Approved",         statusCount("Approved"),         "Logistics fulfilling",    "info")}
        ${statCard("In transit",       statusCount("In transit"),       "On the way",              "ok")}
        ${statCard("At warehouse",     statusCount("Arrived at warehouse"), "Ready to dispatch",   "ok")}
      </section>

      <section class="split-layout">
        <div class="panel split-left">
          <div class="section-heading">
            <div class="section-title">Parts requests (${partsRequests.length})</div>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Part</th>
                <th>Job</th>
                <th>Status</th>
                <th>EDD</th>
              </tr>
            </thead>
            <tbody>
              ${partsRequests.map((pr) => `
                <tr class="${pr.id === state.selectedPartsRequestId ? "selected" : ""}"
                    data-pr-row="${escapeHtml(pr.id)}" style="cursor:pointer">
                  <td class="mono">${escapeHtml(pr.id)}</td>
                  <td>
                    <strong>${escapeHtml(pr.part)}</strong>
                    <br><small class="text-muted mono">${escapeHtml(pr.partNumber)}</small>
                  </td>
                  <td class="mono">${escapeHtml(pr.jobId)}</td>
                  <td>${partsStatusChip(pr.status)}</td>
                  <td class="mono">${escapeHtml(pr.edd)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="panel split-right">
          ${selected ? partsDetailPanel(selected) : ""}
        </div>
      </section>
      ${devSpecPanel("parts")}
    </div>
  `;
}

function partsStatusChip(status) {
  const map = {
    "Pending approval":     "warn",
    "Approved":             "info",
    "In transit":           "ok",
    "Arrived at warehouse": "ok",
    "Delivered":            "ok",
    "Cancelled":            "danger"
  };
  const cls = map[status] || "pending";
  return `<span class="chip ${cls}">${escapeHtml(status)}</span>`;
}

function partsDetailPanel(pr) {
  return `
    <div class="section-heading">
      <div class="section-title">${escapeHtml(pr.id)}</div>
      ${partsStatusChip(pr.status)}
    </div>
    <div class="detail-block">
      <div class="doc-detail-grid">
        ${detailItem("Part", pr.part)}
        ${detailItem("Part number", pr.partNumber)}
        ${detailItem("Quantity", String(pr.quantity))}
        ${detailItem("Job", pr.jobId)}
        ${detailItem("Equipment", pr.equipment)}
        ${detailItem("Requested by", pr.requestedBy)}
        ${pr.approvedBy ? detailItem("Approved by", pr.approvedBy) : ""}
        ${detailItem("EDD", pr.edd)}
      </div>
    </div>
    <div class="detail-block">
      <div class="detail-group-title">Situation description</div>
      <div class="info-box"><div class="info-body">${escapeHtml(pr.description)}</div></div>
    </div>
    ${pr.delivery ? `
    <div class="detail-block">
      <div class="detail-group-title">Delivery</div>
      <div class="doc-detail-grid">
        ${detailItem("Method", pr.delivery)}
        ${pr.deliveryAddress ? detailItem("Address", pr.deliveryAddress) : ""}
        ${pr.deliveryContact ? detailItem("Contact", pr.deliveryContact) : ""}
      </div>
    </div>
    ` : ""}
    <div class="parts-actions">
      ${pr.status === "Pending approval" ? `
        <button class="btn primary" type="button" data-pr-approve="${escapeHtml(pr.id)}">Approve request</button>
        <button class="btn ghost" type="button" data-pr-reject="${escapeHtml(pr.id)}">Reject</button>
      ` : ""}
      ${pr.status === "Arrived at warehouse" && !pr.delivery ? `
        <button class="btn primary" type="button" data-pr-deliver="${escapeHtml(pr.id)}">Specify delivery</button>
        <button class="btn ghost" type="button" data-pr-pickup="${escapeHtml(pr.id)}">Pick up at warehouse</button>
      ` : ""}
      ${pr.status === "Approved" ? `
        <button class="btn dark" type="button" data-pr-transit="${escapeHtml(pr.id)}">Mark in transit</button>
      ` : ""}
      ${pr.status === "In transit" ? `
        <button class="btn dark" type="button" data-pr-arrived="${escapeHtml(pr.id)}">Mark arrived at warehouse</button>
      ` : ""}
    </div>
  `;
}

function reportsPage() {
  const openJobs     = jobs.filter((j) => j.status === "Open").length;
  const overdueDocs  = overdueDocuments();
  const pendingParts = partsRequests.filter((pr) => pr.status === "Pending approval").length;
  const pmSchedule   = computePmSchedule();
  const pmCompleted  = pmSchedule.filter((pm) => pm.status === "Completed").length;
  const pmTotal      = pmSchedule.length;

  // Jobs grouped by stage
  const stageCounts = {};
  jobs.forEach((j) => { stageCounts[j.stage] = (stageCounts[j.stage] || 0) + 1; });

  // Documents grouped by pipeline step
  const stepCounts = {};
  documents.forEach((d) => { stepCounts[d.pipelineStep] = (stepCounts[d.pipelineStep] || 0) + 1; });

  return `
    ${pageHeader("reports")}
    <div class="page-content">
      <div class="stat-grid">
        ${statCard("Open jobs",              openJobs,                  `${jobs.length} total in system`,   openJobs > 6 ? "warn" : "")}
        ${statCard("Overdue documents",      overdueDocs.length,        "Need attention now",               overdueDocs.length > 0 ? "danger" : "ok")}
        ${statCard("Parts pending approval", pendingParts,              "Awaiting service manager",         pendingParts > 0 ? "warn" : "")}
        ${statCard("PM completion",          `${pmCompleted}/${pmTotal}`, "Visits completed this period",   pmCompleted === pmTotal && pmTotal > 0 ? "ok" : "")}
      </div>

      <div class="two-col">
        <section class="panel">
          <div class="section-heading"><div class="section-title">Jobs by stage</div></div>
          <table class="data-table">
            <thead><tr><th>Stage</th><th class="num">Count</th><th>Distribution</th></tr></thead>
            <tbody>
              ${Object.entries(stageCounts).sort((a, b) => b[1] - a[1]).map(([stage, count]) => `
                <tr>
                  <td>${escapeHtml(stage)}</td>
                  <td class="num">${count}</td>
                  <td>
                    <div class="bar-track">
                      <div class="bar-fill" style="width:${Math.round(count / jobs.length * 100)}%"></div>
                    </div>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </section>

        <section class="panel">
          <div class="section-heading"><div class="section-title">Document pipeline health</div></div>
          <table class="data-table">
            <thead><tr><th>Stage</th><th class="num">Count</th><th>Distribution</th></tr></thead>
            <tbody>
              ${pipelineStages.map((stage) => {
                const count = stepCounts[stage] || 0;
                return `
                  <tr>
                    <td>${escapeHtml(stage)}</td>
                    <td class="num">${count}</td>
                    <td>
                      <div class="bar-track">
                        <div class="bar-fill${stage === "Rejected" && count > 0 ? " warn" : ""}" style="width:${Math.round(count / Math.max(1, documents.length) * 100)}%"></div>
                      </div>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </section>
      </div>

      <section class="panel">
        <div class="section-heading"><div class="section-title">Contract utilisation</div></div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Contract</th>
              <th>Customer</th>
              <th>Equipment</th>
              <th class="num">Value</th>
              <th class="num">Consumed</th>
              <th class="num">Remaining</th>
              <th>Utilisation</th>
              <th>Expires</th>
            </tr>
          </thead>
          <tbody>
            ${contracts.map((ct) => {
              const pct = Math.min(100, Math.round((ct.consumed / ct.value) * 100));
              const low = ct.remaining < ct.value * 0.15;
              return `
                <tr>
                  <td class="mono">${escapeHtml(ct.id)}</td>
                  <td>${escapeHtml(ct.customer)}</td>
                  <td>${escapeHtml(ct.equipment)}</td>
                  <td class="num">${ct.value.toLocaleString()} ${ct.currency}</td>
                  <td class="num">${ct.consumed.toLocaleString()} ${ct.currency}</td>
                  <td class="num ${low ? "text-red" : ""}">${ct.remaining.toLocaleString()} ${ct.currency}</td>
                  <td>
                    <div class="bar-row">
                      <div class="bar-track">
                        <div class="bar-fill ${pct > 85 ? "warn" : ""}" style="width:${pct}%"></div>
                      </div>
                      <span class="bar-pct">${pct}%</span>
                    </div>
                  </td>
                  <td class="mono">${escapeHtml(ct.end)}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </section>

      ${devSpecPanel("reports")}
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Admin page — user management with permission grid
// ---------------------------------------------------------------------------
function adminPage() {
  const selected = users.find((u) => u.id === state.adminEditUserId) || users[0];
  return `
    ${pageHeader("admin")}
    <div class="page-content">
      <div class="tile-grid">
        ${moduleTile("USR", "Users",              `${users.length} configured`)}
        ${moduleTile("TPL", "Templates",          `${templates.length} planned`)}
        ${moduleTile("CFG", "Workflow settings",  "Stages and SLA rules")}
        ${moduleTile("CTR", "Contract archive",   "Restore to edit mode")}
      </div>

      <section class="split-layout admin-layout">
        <div class="panel split-left">
          <div class="section-heading">
            <div class="section-title">Users (${users.length})</div>
            <button class="btn primary compact" type="button">Add user</button>
          </div>
          <div class="user-list">
            ${users.map((u) => `
              <button class="user-row ${u.id === state.adminEditUserId ? "selected" : ""}"
                      type="button" data-admin-user="${escapeHtml(u.id)}">
                <div class="user-avatar">${escapeHtml(u.initials)}</div>
                <div class="user-info">
                  <div class="user-name">${escapeHtml(u.name)}</div>
                  <div class="user-roles">
                    ${u.roles.map((r) => `<span class="role-tag ${r}">${escapeHtml(r)}</span>`).join("")}
                  </div>
                </div>
              </button>
            `).join("")}
          </div>
        </div>

        <div class="panel split-right">
          ${selected ? permissionGrid(selected) : ""}
        </div>
      </section>

      ${devSpecPanel("admin")}
    </div>
  `;
}

function permissionGrid(user) {
  const allRoleOptions = roles.filter((r) => r.id !== "admin");
  return `
    <div class="section-heading">
      <div class="section-title">${escapeHtml(user.name)}</div>
      <button class="btn primary compact" type="button" data-admin-save="${escapeHtml(user.id)}">Save changes</button>
    </div>

    <div class="perm-section">
      <div class="perm-section-title">Assigned roles</div>
      <div class="perm-role-list">
        ${allRoleOptions.map((r) => `
          <label class="perm-role-check">
            <input type="checkbox" data-perm-role="${escapeHtml(r.id)}" ${user.roles.includes(r.id) ? "checked" : ""}>
            <span>${escapeHtml(r.id)}</span>
          </label>
        `).join("")}
      </div>
    </div>

    <div class="perm-section">
      <div class="perm-section-title">Permission overrides</div>
      <div class="perm-grid">
        <div class="perm-grid-head">Permission</div>
        <div class="perm-grid-head center">Granted</div>
        ${allPermissions.map((perm) => `
          <div class="perm-name">${escapeHtml(perm.label)}</div>
          <div class="perm-cell center">
            <input type="checkbox" class="perm-check" data-perm="${escapeHtml(perm.id)}"
                   ${user.permissions[perm.id] ? "checked" : ""}
                   data-user="${escapeHtml(user.id)}">
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function pmScheduleTable() {
  const schedule = computePmSchedule();
  if (!schedule.length) {
    return `<div class="modal-placeholder">No contracts with PM visits configured.</div>`;
  }
  return `
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Customer</th>
          <th>Equipment</th>
          <th>Contract</th>
          <th>Date</th>
          <th>Visit</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${schedule.map((pm) => `
          <tr>
            <td class="mono">${escapeHtml(pm.id)}</td>
            <td>${escapeHtml(pm.customer)}</td>
            <td>${escapeHtml(pm.equipment)}</td>
            <td class="mono">${escapeHtml(pm.contractId)}</td>
            <td class="mono">${escapeHtml(pm.date)}</td>
            <td>${pm.visitNumber} / ${pm.totalVisits}</td>
            <td>${statusChip(pm.status)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function calendarPage() {
  const { calendarYear: year, calendarMonth: month } = state;
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const dowLabels  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const firstDow   = (new Date(year, month, 1).getDay() + 6) % 7; // Mon = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr   = new Date().toISOString().slice(0, 10);

  // Group events by date string
  const evByDate = {};
  getMonthEvents(year, month).forEach((ev) => {
    (evByDate[ev.date] = evByDate[ev.date] || []).push(ev);
  });

  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const day = i - firstDow + 1;
    if (day < 1 || day > daysInMonth) return `<div class="cal-cell empty"></div>`;
    const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayEvs = evByDate[ds] || [];
    return `
      <div class="cal-cell${ds === todayStr ? " today" : ""}">
        <div class="cal-day-num">${day}</div>
        <div class="cal-event-list">
          ${dayEvs.map((ev) => `
            <div class="cal-event ${eventColorClass(ev.type)}" title="${escapeHtml(ev.sub || ev.title)}">
              ${escapeHtml(ev.title)}
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }).join("");

  return `
    ${pageHeader("calendar")}
    <div class="page-content">
      <div class="cal-nav-bar">
        <button class="btn ghost compact" type="button" data-cal-prev>&#8592; Prev</button>
        <h2 class="cal-month-title">${monthNames[month]} ${year}</h2>
        <button class="btn ghost compact" type="button" data-cal-next>Next &#8594;</button>
      </div>

      <section class="panel no-padding">
        <div class="cal-dow-row">
          ${dowLabels.map((d) => `<div class="cal-dow">${d}</div>`).join("")}
        </div>
        <div class="cal-grid">${cells}</div>
      </section>

      <section class="panel">
        <div class="section-heading"><div class="section-title">PM schedule — auto-generated from contracts</div></div>
        ${pmScheduleTable()}
      </section>

      ${devSpecPanel("calendar")}
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
export function renderPage() {
  switch (state.page) {
    case "service":   return servicePage();
    case "sales":     return salesPage();
    case "documents": return documentsPage();
    case "customers": return customersPage();
    case "equipment": return equipmentPage();
    case "parts":     return partsPage();
    case "reports":   return reportsPage();
    case "admin":     return adminPage();
    case "calendar":  return calendarPage();
    case "command":
    default:          return commandPage();
  }
}
