<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { VmButton, VmStatusChip } from "../../components/ui/index.js";
import { rerenderLegacyApp } from "../../stores/shellStore.js";
import { useTemplateStore } from "../../stores/templateStore.js";
import {
  applyTemplateListFilters,
  templateColumns,
  templateListHasFilters,
  templateListOwnerOptions,
  templateListRows,
  templateListStatusOptions,
  templateListTypeOptions
} from "./templateViewModel.js";

const router = useRouter();
const templateStore = useTemplateStore();

const templateSearchQuery = ref("");
const templateTypeFilter = ref("All");
const templateStatusFilter = ref("All");
const templateOwnerFilter = ref("All");

const templateRows = computed(() => templateListRows(templateStore.state.records));

const templateFilters = computed(() => ({
  query: templateSearchQuery.value,
  type: templateTypeFilter.value,
  status: templateStatusFilter.value,
  owner: templateOwnerFilter.value
}));

const visibleTemplateRows = computed(() => applyTemplateListFilters(templateRows.value, templateFilters.value));
const templateTypeFilterOptions = computed(() => templateListTypeOptions(templateRows.value));
const templateStatusFilterOptions = computed(() => templateListStatusOptions(templateRows.value));
const templateOwnerFilterOptions = computed(() => templateListOwnerOptions(templateRows.value));
const hasTemplateFilters = computed(() => templateListHasFilters(templateFilters.value));

const templateStatusText = computed(() => {
  if (templateStore.state.loading) return "Loading templates from document service...";
  if (templateStore.state.saving) return "Saving template...";
  if (templateStore.state.lastSavedAt) return `Saved ${new Date(templateStore.state.lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (templateStore.state.loadedAt) return `${templateRows.value.length} template records loaded`;
  return "Ready";
});

async function createTemplate() {
  const record = await templateStore.createTemplate();
  if (!record?.id) return;
  rerenderLegacyApp({ syncRoute: false });
  await router.push({ name: "template-detail", params: { templateId: record.id } });
}

async function openTemplate(row) {
  const template = templateStore.selectTemplate(row?.id);
  if (!template) return;
  rerenderLegacyApp({ syncRoute: false });
  await router.push({ name: "template-detail", params: { templateId: row.id } });
}

async function duplicateTemplateRow(row) {
  const record = await templateStore.duplicateTemplate(row?.template);
  if (!record?.id) return;
  rerenderLegacyApp({ syncRoute: false });
  await router.push({ name: "template-detail", params: { templateId: record.id } });
}

async function archiveTemplateRow(row) {
  if (!row || row.isArchived) return;
  if (!window.confirm(`Archive template "${row.name}"? It will stay in Templates but will no longer be offered for Work Act generation.`)) return;
  const record = await templateStore.archiveTemplate(row.id);
  if (record) rerenderLegacyApp({ syncRoute: false });
}

function clearTemplateFilters() {
  templateSearchQuery.value = "";
  templateTypeFilter.value = "All";
  templateStatusFilter.value = "All";
  templateOwnerFilter.value = "All";
}
</script>

<template>
  <main id="app-main" class="main" tabindex="-1">
    <div class="page-content template-list-page">
      <section class="panel slim documents-filter-panel templates-list-panel">
        <div class="documents-page-head">
          <div>
            <div class="section-title">Templates</div>
            <div class="filter-note">Browse and manage reusable source templates. Generated outputs live in Documents.</div>
          </div>
          <div
            class="documents-sync-note"
            :class="{ 'is-error': templateStore.state.error }"
            role="status"
            aria-live="polite"
          >
            {{ templateStatusText }}
          </div>
        </div>

        <div class="doc-search-row">
          <label class="filter-control doc-search-text" for="template-search-query">
            <span>Search templates</span>
            <input
              id="template-search-query"
              v-model="templateSearchQuery"
              placeholder="Template name, type, owner, applicability"
              @keydown.enter.prevent
            >
          </label>

          <label class="filter-control" for="template-type-filter">
            <span>Type</span>
            <select id="template-type-filter" v-model="templateTypeFilter">
              <option v-for="type in templateTypeFilterOptions" :key="type" :value="type">{{ type }}</option>
            </select>
          </label>

          <label class="filter-control" for="template-status-filter">
            <span>Status</span>
            <select id="template-status-filter" v-model="templateStatusFilter">
              <option v-for="status in templateStatusFilterOptions" :key="status" :value="status">{{ status }}</option>
            </select>
          </label>

          <label class="filter-control" for="template-owner-filter">
            <span>Owner</span>
            <select id="template-owner-filter" v-model="templateOwnerFilter">
              <option v-for="owner in templateOwnerFilterOptions" :key="owner" :value="owner">{{ owner }}</option>
            </select>
          </label>

          <div class="doc-search-actions template-list-actions">
            <VmButton compact variant="ghost" :disabled="!hasTemplateFilters" @click="clearTemplateFilters">Clear filters</VmButton>
            <VmButton compact variant="primary" :disabled="templateStore.state.saving" @click="createTemplate">New template</VmButton>
          </div>
        </div>
      </section>

      <section class="table-card templates-table">
        <div class="table-toolbar">
          <span>{{ visibleTemplateRows.length }} templates</span>
          <span class="filter-note">Template records come from template persistence only.</span>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th v-for="column in templateColumns" :key="column.key">{{ column.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="templateStore.state.loading && !templateRows.length">
                <td :colspan="templateColumns.length" class="documents-empty-cell">
                  <strong>Loading templates.</strong>
                  <span>Reusable template source records are being loaded from the Templates API.</span>
                </td>
              </tr>
              <tr v-else-if="templateStore.state.error && !templateRows.length">
                <td :colspan="templateColumns.length" class="documents-empty-cell">
                  <strong>Templates could not be loaded.</strong>
                  <span>{{ templateStore.state.error }}</span>
                </td>
              </tr>
              <tr v-else-if="!visibleTemplateRows.length">
                <td :colspan="templateColumns.length" class="documents-empty-cell">
                  <strong>{{ hasTemplateFilters ? "No templates match the current filters." : "No templates are saved yet." }}</strong>
                  <span>{{ hasTemplateFilters ? "Clear filters to see reusable template source records." : "Create a reusable template here, then open it to edit Umo content and applicability." }}</span>
                </td>
              </tr>
              <template v-else>
                <tr
                  v-for="row in visibleTemplateRows"
                  :key="row.id"
                  :data-template-row="row.id"
                  @dblclick="openTemplate(row)"
                >
                  <td class="template-name-cell">
                    <strong>{{ row.name }}</strong>
                    <span class="doc-table-note">{{ row.description || "Reusable Work Act source template" }}</span>
                  </td>
                  <td>
                    {{ row.type }}
                    <span v-if="row.category" class="doc-table-note">{{ row.category }}</span>
                  </td>
                  <td class="template-applicability-cell">
                    <span>{{ row.applicability }}</span>
                    <span class="doc-table-note">{{ row.mergeFieldCount }} template data fields / {{ row.outputFormat.toUpperCase() }}</span>
                  </td>
                  <td>{{ row.owner }}</td>
                  <td class="mono">{{ row.updatedDate || "-" }}</td>
                  <td class="mono">{{ row.createdDate || "-" }}</td>
                  <td><VmStatusChip :status="row.status" /></td>
                  <td>
                    <div class="table-actions">
                      <VmButton compact variant="ghost" @click="openTemplate(row)">Open / Edit</VmButton>
                      <VmButton compact variant="ghost" :disabled="templateStore.state.saving" @click="duplicateTemplateRow(row)">Duplicate</VmButton>
                      <VmButton compact danger variant="ghost" :disabled="row.isArchived || templateStore.state.saving" @click="archiveTemplateRow(row)">
                        {{ row.isArchived ? "Archived" : "Archive" }}
                      </VmButton>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>

      <details class="dev-spec">
        <summary class="dev-spec-summary">DEV REFERENCE - Templates list</summary>
        <div class="dev-spec-body">
          <div class="ds-row"><span class="ds-label">Purpose</span><p class="ds-value">Reusable procedure/checklist source records for Work Act document generation.</p></div>
          <div class="ds-row"><span class="ds-label">Actions</span><p class="ds-value">Create, open/edit, duplicate, archive, search, and filter Templates inside the Templates module.</p></div>
          <div class="ds-row"><span class="ds-label">Boundary</span><p class="ds-value">Generated and signed file custody stays in Documents; concrete Work Act rows stay in Work Acts.</p></div>
        </div>
      </details>
    </div>
  </main>
</template>
