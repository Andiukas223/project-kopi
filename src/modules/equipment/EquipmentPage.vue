<script setup>
import { computed, nextTick, ref, watch } from "vue";
import { VmButton } from "../../components/ui/index.js";
import { customers, equipment } from "../../js/data.js";
import { state } from "../../js/state.js";
import { useEquipmentStore } from "../../stores/equipmentStore.js";
import { legacyRenderTick } from "../../stores/shellStore.js";

const equipmentTabs = [
  { id: "system-info", label: "System Info" },
  { id: "installation", label: "Installation" },
  { id: "hospital-acceptance", label: "Hospital Acceptance" },
  { id: "support", label: "Support" }
];

const supportTabs = [
  { id: "settings", label: "Settings" },
  { id: "emails", label: "Emails" },
  { id: "web-links", label: "Web Links" }
];

const equipmentStore = useEquipmentStore();
const manufacturerFieldRef = ref(null);

const allEquipmentRows = computed(() => {
  legacyRenderTick.value;
  return equipment;
});

const equipmentRows = computed(() => {
  legacyRenderTick.value;
  return equipmentStore.filteredEquipmentRows();
});

const selectedEquipment = computed(() => {
  legacyRenderTick.value;
  const visibleRows = equipmentRows.value;
  return visibleRows.find((item) => item.id === state.selectedEquipmentId) || visibleRows[0] || null;
});

const activeEquipmentTab = computed(() => {
  legacyRenderTick.value;
  return state.equipmentTab;
});

const activeSupportTab = computed(() => {
  legacyRenderTick.value;
  return state.supportSubTab;
});

const editDraft = computed(() => equipmentStore.state.editDraft);
const listFilterDraft = computed(() => equipmentStore.state.listFilterDraft);

watch(
  () => selectedEquipment.value?.id || "",
  (equipmentId) => {
    if (!equipmentId) return;
    equipmentStore.ensureEditDraft(equipmentId);
  },
  { immediate: true }
);

const customerFilterOptions = computed(() => {
  const values = new Set(["All"]);
  allEquipmentRows.value.forEach((row) => {
    if (row.customer) values.add(row.customer);
  });
  return Array.from(values);
});

const statusFilterOptions = computed(() => {
  const values = new Set(["All"]);
  allEquipmentRows.value.forEach((row) => {
    if (row.status) values.add(row.status);
  });
  return Array.from(values);
});

const supportFilterOptions = [
  { value: "All", label: "All" },
  { value: "Enabled", label: "Enabled" },
  { value: "Disabled", label: "Disabled" }
];
const equipmentCustomerOptions = computed(() => {
  const byName = [...customers].sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  return byName.map((item) => ({ value: item.name, label: item.name }));
});

const installedSystemsLabel = computed(() => {
  const visible = equipmentRows.value.length;
  const total = allEquipmentRows.value.length;
  if (!hasActiveFilters()) return `Installed systems (${visible})`;
  return `Installed systems (${visible} of ${total})`;
});

function statusChipClass(status) {
  if (status === "Active") return "ok";
  if (status === "Under service") return "warn";
  return "pending";
}

function selectEquipmentRow(equipmentId) {
  equipmentStore.selectEquipment(equipmentId);
}

function selectEquipmentTab(tabId) {
  equipmentStore.setEquipmentTab(tabId);
}

function selectSupportTab(tabId) {
  equipmentStore.setSupportTab(tabId);
}

function handleSupportEnabledChange(event) {
  if (!selectedEquipment.value) return;
  equipmentStore.toggleSupportEnabled(selectedEquipment.value.id, event.target.checked);
}

function copySupportLink(linkType, url) {
  if (!selectedEquipment.value) return;
  equipmentStore.copySupportLink(`${selectedEquipment.value.id}:${linkType}`, url);
}

function supportCopyLabel(linkType) {
  if (!selectedEquipment.value) return "Copy";
  return equipmentStore.state.copiedLinkKey === `${selectedEquipment.value.id}:${linkType}` ? "Copied" : "Copy";
}

const supportBrandOptions = [
  { value: "none", label: "No override" },
  { value: "viva", label: "Viva Medical branding" },
  { value: "manufacturer", label: "Manufacturer branding" }
];

function createNewSystem() {
  equipmentStore.createEquipment();
}

function setDraftField(fieldName, event) {
  equipmentStore.setDraftField(fieldName, event.target.value);
}

function setDraftSupportEmail(fieldName, event) {
  equipmentStore.setDraftSupportEmail(fieldName, event.target.value);
}

function setDraftBoolean(fieldName, event) {
  equipmentStore.setDraftField(fieldName, Boolean(event.target.checked));
}

function saveEquipment() {
  equipmentStore.saveEquipmentDraft();
}

function cancelEquipment() {
  equipmentStore.cancelEquipmentDraft();
}

function deleteEquipment() {
  equipmentStore.deleteSelectedEquipment();
}

function editEquipment() {
  equipmentStore.setEquipmentTab("system-info");
  nextTick(() => {
    manufacturerFieldRef.value?.focus();
  });
}

function updateListFilter(key, event) {
  equipmentStore.setListFilterDraft(key, event.target.value);
}

function applyListFilters() {
  equipmentStore.applyListFilters();
}

function clearListFilters() {
  equipmentStore.clearListFilters();
}

function hasActiveFilters() {
  return equipmentStore.hasActiveListFilters();
}

function rowIsDraftTarget(eq) {
  return eq.id === equipmentStore.state.editDraftEquipmentId;
}

function rowIsDemo(eq) {
  if (rowIsDraftTarget(eq)) return Boolean(editDraft.value.isDemo);
  return Boolean(eq.isDemo);
}

function rowIsOutdated(eq) {
  if (rowIsDraftTarget(eq)) return Boolean(editDraft.value.isOutdated);
  return Boolean(eq.isOutdated);
}

const isNewSystemDraft = computed(() => {
  return Boolean(
    equipmentStore.state.pendingCreateEquipmentId
    && equipmentStore.state.editDraftEquipmentId === equipmentStore.state.pendingCreateEquipmentId
  );
});
</script>

<template>
  <main id="app-main" class="main" tabindex="-1">
    <div class="page-content">
      <section class="panel">
        <div class="section-heading">
          <div>
            <div class="section-title">Equipment registry</div>
            <div class="filter-note">Manage installed systems and structured equipment specifications used across Work Acts, Templates, and generated document context.</div>
          </div>
          <div class="action-row">
            <VmButton compact variant="primary" @click="createNewSystem">New system</VmButton>
          </div>
        </div>
      </section>

      <section class="panel slim">
        <div class="doc-search-row">
          <label class="filter-control doc-search-text" for="equipment-search-query">
            <span>Search</span>
            <input
              id="equipment-search-query"
              :value="listFilterDraft.query"
              placeholder="ID, system, serial, customer, location"
              @input="updateListFilter('query', $event)"
              @keydown.enter.prevent="applyListFilters"
            >
          </label>

          <label class="filter-control" for="equipment-customer-filter">
            <span>Customer</span>
            <select id="equipment-customer-filter" :value="listFilterDraft.customer" @change="updateListFilter('customer', $event)">
              <option v-for="option in customerFilterOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </label>

          <label class="filter-control" for="equipment-status-filter">
            <span>Status</span>
            <select id="equipment-status-filter" :value="listFilterDraft.status" @change="updateListFilter('status', $event)">
              <option v-for="option in statusFilterOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </label>

          <label class="filter-control" for="equipment-support-filter">
            <span>Support</span>
            <select id="equipment-support-filter" :value="listFilterDraft.support" @change="updateListFilter('support', $event)">
              <option v-for="option in supportFilterOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>

          <div class="doc-search-actions">
            <VmButton compact variant="dark" @click="applyListFilters">Search</VmButton>
            <VmButton compact variant="ghost" @click="clearListFilters">Clear</VmButton>
          </div>
        </div>
      </section>

      <section class="split-layout eq-layout">
        <div class="panel split-left">
          <div class="section-heading">
            <div>
              <div class="section-title">{{ installedSystemsLabel }}</div>
              <span v-if="hasActiveFilters()" class="filter-note">Filtered view</span>
            </div>
          </div>
          <table id="equipment-registry-table" class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>System</th>
                <th>Customer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="eq in equipmentRows"
                :key="eq.id"
                :class="['eq-row', { selected: eq.id === state.selectedEquipmentId }]"
                tabindex="0"
                :aria-selected="String(eq.id === state.selectedEquipmentId)"
                :aria-label="'Select equipment ' + eq.id + (eq.name ? ' ' + eq.name : '')"
                @click="selectEquipmentRow(eq.id)"
                @keydown.enter.prevent="selectEquipmentRow(eq.id)"
                @keydown.space.prevent="selectEquipmentRow(eq.id)"
              >
                <td class="mono">
                  <div class="eq-id-cell">
                    <span>{{ eq.id }}</span>
                    <span v-if="rowIsDemo(eq)" class="eq-inline-marker" title="Demo system" aria-hidden="true">
                      <svg class="eq-inline-marker-svg" viewBox="0 0 16 16" fill="none" focusable="false">
                        <rect x="2.25" y="2.25" width="11.5" height="11.5" rx="2" />
                        <path d="M5 10.5V8.2l3-2.7 3 2.7v2.3" />
                      </svg>
                    </span>
                    <span v-if="rowIsOutdated(eq)" class="eq-inline-marker eq-inline-marker--warn" title="Outdated / Uninstalled" aria-hidden="true">
                      <svg class="eq-inline-marker-svg" viewBox="0 0 16 16" fill="none" focusable="false">
                        <circle cx="8" cy="8" r="5.75" />
                        <path d="M4.8 11.2L11.2 4.8" />
                      </svg>
                    </span>
                  </div>
                </td>
                <td>
                  <div class="eq-system-cell">
                    <span
                      class="eq-row-icon"
                      :class="{ demo: rowIsDemo(eq), outdated: rowIsOutdated(eq) && !rowIsDemo(eq) }"
                      aria-hidden="true"
                    >
                      <svg class="eq-row-icon-svg" viewBox="0 0 24 24" fill="none" focusable="false">
                        <rect x="5" y="5" width="10.5" height="7.5" rx="1.4" />
                        <rect x="16.1" y="6.8" width="2.9" height="4.2" rx="0.8" />
                        <line x1="7.1" y1="8" x2="13.4" y2="8" />
                        <line x1="7.1" y1="10" x2="11.4" y2="10" />
                        <line x1="10.2" y1="12.5" x2="10.2" y2="15.5" />
                        <line x1="7.6" y1="15.5" x2="12.8" y2="15.5" />
                        <circle cx="7.8" cy="17.4" r="1.1" />
                        <circle cx="12.6" cy="17.4" r="1.1" />
                      </svg>
                    </span>
                    <div class="eq-system-meta">
                      <strong>{{ eq.name }}</strong>
                      <small class="text-muted">{{ eq.manufacturer }}</small>
                      <div v-if="rowIsDemo(eq) || rowIsOutdated(eq)" class="eq-row-flags">
                        <span v-if="rowIsDemo(eq)" class="eq-flag-pill demo">Demo system</span>
                        <span v-if="rowIsOutdated(eq)" class="eq-flag-pill outdated">Outdated / Uninstalled</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td>{{ eq.customer }}</td>
                <td>
                  <span class="chip" :class="statusChipClass(eq.status)">{{ eq.status }}</span>
                </td>
              </tr>
              <tr v-if="!equipmentRows.length">
                <td colspan="4" class="documents-empty-cell">
                  <strong>No equipment matches current filters.</strong>
                  <span>Clear filters or change search terms to see more systems.</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="panel split-right eq-detail">
          <template v-if="selectedEquipment">
            <div class="eq-detail-head">
              <div class="eq-tab-bar eq-tab-bar--head">
                <button
                  v-for="tab in equipmentTabs"
                  :key="tab.id"
                  class="eq-tab"
                  :class="{ active: activeEquipmentTab === tab.id }"
                  type="button"
                  @click="selectEquipmentTab(tab.id)"
                >
                  {{ tab.label }}
                </button>
              </div>
              <span class="chip" :class="statusChipClass(selectedEquipment.status)">{{ selectedEquipment.status }}</span>
            </div>

            <div class="eq-detail-selected">
              <span class="section-title">{{ selectedEquipment.name }}</span>
            </div>

            <div class="eq-tab-content">
              <template v-if="activeEquipmentTab === 'system-info'">
                <div class="eq-panels-row">
                  <div>
                    <div class="detail-group-title">System Information</div>
                    <div class="field-stack">
                      <div class="field">
                        <label>Manufacturer</label>
                        <input ref="manufacturerFieldRef" :value="editDraft.manufacturer" placeholder="Manufacturer" @input="setDraftField('manufacturer', $event)">
                      </div>
                      <div class="field">
                        <label>Equipment</label>
                        <input :value="editDraft.name" placeholder="Equipment" @input="setDraftField('name', $event)">
                      </div>
                      <div class="field">
                        <label>Hospital</label>
                        <select :value="editDraft.customer" @change="setDraftField('customer', $event)">
                          <option value="">Select customer / hospital</option>
                          <option v-for="option in equipmentCustomerOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                          </option>
                        </select>
                      </div>
                      <div class="field">
                        <label>Location</label>
                        <input :value="editDraft.location" placeholder="Location" @input="setDraftField('location', $event)">
                      </div>
                    </div>
                  </div>
                  <div>
                    <div class="detail-group-title">Identifiers</div>
                    <div class="field-stack">
                      <div class="field">
                        <label>S/N (Serial)</label>
                        <input :value="editDraft.serial" placeholder="S/N (Serial)" @input="setDraftField('serial', $event)">
                      </div>
                      <div class="field">
                        <label>P/N (Part number)</label>
                        <input :value="editDraft.partNumber" placeholder="P/N (Part number)" @input="setDraftField('partNumber', $event)">
                      </div>
                      <div class="field">
                        <label>ID (Manufacturer)</label>
                        <input :value="editDraft.idGE" placeholder="ID (Manufacturer)" @input="setDraftField('idGE', $event)">
                      </div>
                      <div class="field">
                        <label>Category</label>
                        <input :value="editDraft.category" placeholder="Category" @input="setDraftField('category', $event)">
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="activeEquipmentTab === 'installation'">
                <div class="eq-panels-row">
                  <div>
                    <div class="detail-group-title">Installation</div>
                    <div class="field-stack">
                      <div class="field">
                        <label>Seller invoice</label>
                        <input :value="editDraft.sellerInvoice" placeholder="Seller invoice" @input="setDraftField('sellerInvoice', $event)">
                      </div>
                      <div class="field">
                        <label>Installed</label>
                        <input :value="editDraft.installedDate" placeholder="Installed" @input="setDraftField('installedDate', $event)">
                      </div>
                      <div class="field">
                        <label>Year of manufacture</label>
                        <input :value="editDraft.yearOfManufacture" placeholder="Year of manufacture" @input="setDraftField('yearOfManufacture', $event)">
                      </div>
                      <div class="field">
                        <label>Warranty end (Manufacturer)</label>
                        <input :value="editDraft.warrantyEndManufacturer" placeholder="Warranty end (Manufacturer)" @input="setDraftField('warrantyEndManufacturer', $event)">
                      </div>
                    </div>
                  </div>
                  <div>
                    <div class="detail-group-title">Extended warranty metadata</div>
                    <div class="field-stack">
                      <div class="field">
                        <label>Custom warranty end</label>
                        <input
                          :value="editDraft.customWarrantyEnd"
                          placeholder="YYYY-MM-DD"
                          @input="setDraftField('customWarrantyEnd', $event)"
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="activeEquipmentTab === 'hospital-acceptance'">
                <div class="field-stack">
                  <div class="detail-group-title">Hospital Acceptance</div>
                  <div class="field">
                    <label>Acceptance certificate reference</label>
                    <input
                      :value="editDraft.acceptanceCertificateRef"
                      placeholder="Certificate number / reference"
                      @input="setDraftField('acceptanceCertificateRef', $event)"
                    >
                  </div>
                  <div class="field">
                    <label>Acceptance date</label>
                    <input :value="editDraft.acceptanceDate" placeholder="Acceptance date" @input="setDraftField('acceptanceDate', $event)">
                  </div>
                  <div class="field">
                    <label>Invoice number</label>
                    <input :value="editDraft.acceptanceInvoice" placeholder="Invoice number" @input="setDraftField('acceptanceInvoice', $event)">
                  </div>
                  <div class="field">
                    <label>Warranty end (Hospital)</label>
                    <input :value="editDraft.warrantyEndHospital" placeholder="Warranty end (Hospital)" @input="setDraftField('warrantyEndHospital', $event)">
                  </div>
                </div>
              </template>

              <template v-else-if="activeEquipmentTab === 'support'">
                <div class="support-sub-bar">
                  <button
                    v-for="tab in supportTabs"
                    :key="tab.id"
                    class="support-sub-tab"
                    :class="{ active: activeSupportTab === tab.id }"
                    type="button"
                    @click="selectSupportTab(tab.id)"
                  >
                    {{ tab.label }}
                  </button>
                </div>

                <div class="support-sub-content">
                  <template v-if="activeSupportTab === 'settings'">
                    <div class="field-stack">
                      <label class="perm-toggle">
                        <input
                          id="support-enabled"
                          type="checkbox"
                          :checked="selectedEquipment.supportEnabled"
                          @change="handleSupportEnabledChange"
                        >
                        <span>Support Page Is Enabled</span>
                      </label>
                      <div class="field">
                        <label for="support-group">Group Name</label>
                        <input
                          id="support-group"
                          :value="editDraft.supportGroupName"
                          placeholder="e.g. VCH Radiology"
                          @input="setDraftField('supportGroupName', $event)"
                        >
                      </div>
                      <div class="field">
                        <label for="support-brand-variant">Support brand variant</label>
                        <select
                          id="support-brand-variant"
                          :value="editDraft.supportBrandVariant"
                          @change="setDraftField('supportBrandVariant', $event)"
                        >
                          <option v-for="option in supportBrandOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div class="info-box" style="margin-top:12px">
                      <div class="info-title">{{ selectedEquipment.supportEnabled ? "Support portal active" : "Support portal disabled" }}</div>
                      <div class="info-body">
                        {{
                          selectedEquipment.supportEnabled
                            ? "Hospital staff can report faults using the URLs in the Web Links tab. Each submission creates a new Technical Case assigned to Admin for engineer assignment."
                            : "Enable to generate URLs for hospital staff fault reporting. No login required on the support page."
                        }}
                      </div>
                    </div>
                  </template>

                  <template v-else-if="activeSupportTab === 'emails'">
                    <div class="field-stack">
                      <div class="field">
                        <label for="email-company">Company emails</label>
                        <input
                          id="email-company"
                          :value="editDraft.supportEmails.company"
                          placeholder="service@vivamedical.lt"
                          @input="setDraftSupportEmail('company', $event)"
                        >
                      </div>
                      <div class="field">
                        <label for="email-manufacturer">Manufacturer emails</label>
                        <input
                          id="email-manufacturer"
                          :value="editDraft.supportEmails.manufacturer"
                          placeholder="support@manufacturer.com"
                          @input="setDraftSupportEmail('manufacturer', $event)"
                        >
                      </div>
                      <div class="field">
                        <label for="email-hospital">Hospital emails</label>
                        <input
                          id="email-hospital"
                          :value="editDraft.supportEmails.hospital"
                          placeholder="biomed@hospital.lt"
                          @input="setDraftSupportEmail('hospital', $event)"
                        >
                      </div>
                    </div>
                    <div class="info-box" style="margin-top:12px">
                      <div class="info-title">Notification recipients</div>
                      <div class="info-body">
                        Company email receives new case notifications. Manufacturer is notified for warranty incidents.
                        Hospital receives confirmation when the case is registered.
                      </div>
                    </div>
                  </template>

                  <template v-else-if="activeSupportTab === 'web-links'">
                    <template v-if="!selectedEquipment.supportEnabled">
                      <div class="info-box">
                        <div class="info-title">Support portal is disabled</div>
                        <div class="info-body">Enable the support portal in the Settings tab to generate URLs.</div>
                      </div>
                    </template>
                    <template v-else>
                      <div class="web-links-list">
                        <div class="web-link-row">
                          <span class="web-link-label">System</span>
                          <input class="web-link-input" readonly :value="selectedEquipment.webLinks.system" aria-label="System support URL">
                          <VmButton compact variant="ghost" @click="copySupportLink('system', selectedEquipment.webLinks.system)">
                            {{ supportCopyLabel("system") }}
                          </VmButton>
                        </div>
                        <div class="web-link-row">
                          <span class="web-link-label">Hospital</span>
                          <input class="web-link-input" readonly :value="selectedEquipment.webLinks.hospital" aria-label="Hospital support URL">
                          <VmButton compact variant="ghost" @click="copySupportLink('hospital', selectedEquipment.webLinks.hospital)">
                            {{ supportCopyLabel("hospital") }}
                          </VmButton>
                        </div>
                        <div class="web-link-row">
                          <span class="web-link-label">Group</span>
                          <input class="web-link-input" readonly :value="selectedEquipment.webLinks.group" aria-label="Group support URL">
                          <VmButton compact variant="ghost" @click="copySupportLink('group', selectedEquipment.webLinks.group)">
                            {{ supportCopyLabel("group") }}
                          </VmButton>
                        </div>
                      </div>
                      <div class="info-box" style="margin-top:12px">
                        <div class="info-title">How it works</div>
                        <div class="info-body">
                          Equipment stores the support URL configuration as structured system metadata. Case intake and support workflow execution belong to Service operations.
                        </div>
                      </div>
                    </template>
                  </template>
                </div>
              </template>
            </div>

            <div class="eq-footer">
              <div class="eq-flags">
                <label class="flag-check">
                  <input type="checkbox" :checked="Boolean(editDraft.isDemo)" @change="setDraftBoolean('isDemo', $event)">
                  Is Demo System
                </label>
                <label class="flag-check">
                  <input type="checkbox" :checked="Boolean(editDraft.isOutdated)" @change="setDraftBoolean('isOutdated', $event)">
                  Outdated / Unused / Uninstalled
                </label>
              </div>
              <div class="action-row">
                <span v-if="equipmentStore.state.draftDirty" class="filter-note">Unsaved changes</span>
                <VmButton variant="ghost" @click="editEquipment">Edit</VmButton>
                <VmButton variant="ghost" danger @click="deleteEquipment">Delete</VmButton>
                <VmButton v-if="isNewSystemDraft" variant="ghost" @click="cancelEquipment">Cancel</VmButton>
                <VmButton variant="dark" @click="saveEquipment">Save</VmButton>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="modal-placeholder">No equipment item selected. Adjust filters or create a new system.</div>
          </template>
        </div>
      </section>

      <details class="dev-spec">
        <summary class="dev-spec-summary">DEV REFERENCE - Equipment</summary>
        <div class="dev-spec-body">
          <div class="ds-row"><span class="ds-label">Purpose</span><p class="ds-value">Installed system registry, warranty/install metadata, and support portal settings.</p></div>
          <div class="ds-row"><span class="ds-label">Boundary</span><p class="ds-value">Equipment owns installed-system records and support settings. Document generation and custody stay in Work Acts and Documents.</p></div>
        </div>
      </details>
    </div>
  </main>

  <div v-if="equipmentStore.state.supportToastMessage" class="support-toast" role="status">
    {{ equipmentStore.state.supportToastMessage }}
  </div>
</template>

