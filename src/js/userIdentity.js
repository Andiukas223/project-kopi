import { users } from "./data.js";
import { state } from "./state.js";

export function initialsFromName(name = "") {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function userByRole(role = state.role) {
  if (role === "admin") {
    return users.find((user) => user.roles.includes("admin")) || null;
  }
  return users.find((user) => user.roles.includes(role)) || users.find((user) => user.roles.includes("admin")) || null;
}

export function currentUserName() {
  return userByRole()?.name || "Unknown user";
}

export function currentUserInitials() {
  const user = userByRole();
  return user?.initials || initialsFromName(user?.name || "");
}

export function creatorMeta() {
  return {
    createdBy: currentUserName(),
    createdByInitials: currentUserInitials()
  };
}

export function displayInitialsForRecord(record = {}) {
  if (record.createdByInitials) return record.createdByInitials;
  if (record.ownerInitials) return record.ownerInitials;
  if (record.createdBy) return initialsFromName(record.createdBy);
  const user = users.find((item) => item.name === record.owner || item.initials === record.owner);
  if (user) return user.initials || initialsFromName(user.name);
  return moduleOwnerFallbackInitials(record.owner);
}

function moduleOwnerFallbackInitials(owner = "") {
  return {
    Service: "RP",
    Sales: "VK",
    Finance: "VK",
    Contracts: "AL",
    Admin: "AL"
  }[owner] || initialsFromName(owner);
}
