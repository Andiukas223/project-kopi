import { qs, qsa } from "./dom.js";
import { roles } from "./data.js";
import { renderPage, renderRemindersStrip } from "./render.js";
import { setPage, setRole, state } from "./state.js";

export function renderApp() {
  const main = qs("#app-main");
  main.innerHTML = renderPage();
  updateActiveNav();
  updateRoleLabel();
  updateReminders();
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

