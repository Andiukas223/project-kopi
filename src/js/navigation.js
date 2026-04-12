import { qs, qsa } from "./dom.js";
import { documents, jobs, partsRequests, roles } from "./data.js";
import { renderPage, renderRemindersStrip } from "./render.js";
import { setPage, setRole, state } from "./state.js";

export function renderApp() {
  const main = qs("#app-main");
  main.innerHTML = renderPage();
  updateActiveNav();
  updateRoleLabel();
  updateReminders();
  updateSidebarBadges();
}

// Update sidebar badge counts to reflect role-relevant queue depths.
function updateSidebarBadges() {
  const r = state.role;

  // Command Center — overdue docs + open jobs for most roles
  const overdueCount = documents.filter((d) => {
    const due = new Date(d.due + "T00:00:00");
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return !["Approved", "Archived"].includes(d.pipelineStep) && due < now;
  }).length;

  // Service badge — open jobs visible to this role
  const ownerName = ownerForRole(r);
  const myJobs = r === "service" && ownerName
    ? jobs.filter((j) => j.owner === ownerName)
    : jobs;
  const serviceCount = myJobs.filter((j) => j.status === "Open" || j.status === "Blocked").length;

  // Parts badge — pending approval for svcmgr/logistics/warehouse; in transit for logistics/warehouse
  const partsCount = ["svcmgr", "admin"].includes(r)
    ? partsRequests.filter((pr) => pr.status === "Pending approval").length
    : ["logistics", "warehouse"].includes(r)
      ? partsRequests.filter((pr) => ["In transit", "Arrived at warehouse"].includes(pr.status)).length
      : 0;

  // Documents badge — overdue docs relevant to this role
  const docsOwnerLabel = { sales: "Sales", finance: "Finance", service: "Service", svcmgr: "Service" }[r];
  const docsCount = docsOwnerLabel
    ? documents.filter((d) => d.owner === docsOwnerLabel && !["Approved", "Archived"].includes(d.pipelineStep)).length
    : overdueCount;

  setBadge("sb-command",   overdueCount,  "warn");
  setBadge("sb-service",   serviceCount,  "warn");
  setBadge("sb-parts",     partsCount,    "warn");
  setBadge("sb-documents", docsCount,     "warn");
}

function ownerForRole(role) {
  return { service: "R. Petrauskas", svcmgr: "M. Vaitkus", office: "I. Mazure",
           sales: "V. Klimaite", finance: "V. Klimaite",
           logistics: "T. Gruodis", warehouse: "T. Gruodis" }[role] || null;
}

function setBadge(navId, count, tone) {
  const item = qs(`#${navId}`);
  if (!item) return;
  let badge = item.querySelector(".sb-badge");
  if (count > 0) {
    if (!badge) {
      badge = document.createElement("span");
      badge.className = `sb-badge ${tone}`;
      item.appendChild(badge);
    }
    badge.textContent = count;
    badge.className = `sb-badge ${tone}`;
  } else if (badge) {
    badge.remove();
  }
}

function updateReminders() {
  const container = qs("#sidebar-reminders");
  if (container) container.innerHTML = renderRemindersStrip();
}

export function bindNavigation() {
  qsa("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      setPage(button.dataset.nav);
      renderApp();
      qs("#app-main").focus();
    });
  });

  document.addEventListener("click", (event) => {
    const roleButton = event.target.closest("[data-role]");
    if (!roleButton) return;
    setRole(roleButton.dataset.role);
    renderApp();
  });
}

function updateActiveNav() {
  qsa(".sb-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.nav === state.page);
  });
}

function updateRoleLabel() {
  const role = roles.find((item) => item.id === state.role);
  qs("#active-role-label").textContent = role ? role.label : "Workspace";
}

