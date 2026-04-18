<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import UmoDocumentEditor from "../../components/documentEditor/UmoDocumentEditor.vue";
import { createEditorSnapshot } from "../../components/documentEditor/editorContent.js";
import { VmButton, VmSelect, VmStatusChip } from "../../components/ui/index.js";
import { state } from "../../js/state.js";
import { legacyRenderTick, rerenderLegacyApp } from "../../stores/shellStore.js";
import { useTemplateStore } from "../../stores/templateStore.js";
import WltSearchableCombobox from "./components/WltSearchableCombobox.vue";
import {
  companyOptionsForTemplate,
  companyValueForTemplate,
  equipmentOptions,
  hospitalOptions,
  selectedWorkListTemplate,
  serviceTypeOptions,
  userOptions,
  wltArray,
  wltVisualHtml,
  workEquipmentOptions
} from "./templateViewModel.js";

const props = defineProps({
  templateId: {
    type: String,
    required: true
  }
});

const router = useRouter();
const templateStore = useTemplateStore();
const templateEditorRef = ref(null);
const templateEditorHtml = ref("");
const templateEditorError = ref("");
const activeSettingsTab = ref("metadata");

const settingTabs = [
  { id: "metadata", label: "Metadata" },
  { id: "applicability", label: "Applicability" },
  { id: "merge-fields", label: "Template data fields" }
];

const selectedTemplate = computed(() => {
  legacyRenderTick.value;
  const template = selectedWorkListTemplate();
  return templateMatchesRoute(template) ? template : null;
});

const selectedMergeFields = computed(() => selectedTemplate.value?.mergeFields || []);

const selectedStatus = computed(() => {
  const template = selectedTemplate.value;
  if (!template) return "Draft";
  return template.backendTemplateStatus || (template.isActive === false ? "Archived" : "Active");
});

const selectedUpdatedDate = computed(() => {
  const template = selectedTemplate.value;
  const value = template?.backendTemplateAudit?.updatedAt || template?.editorContent?.updatedAt || template?.entryDate || "";
  return value ? String(value).slice(0, 10) : "-";
});

const templateStatusText = computed(() => {
  if (templateStore.state.loading) return "Loading template...";
  if (templateStore.state.saving) return "Saving template...";
  if (templateStore.state.lastSavedAt) return `Saved ${new Date(templateStore.state.lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (templateStore.state.loadedAt) return "Template loaded";
  return "Ready";
});

onMounted(async () => {
  if (!templateStore.state.loadedAt && !templateStore.state.loading) {
    await templateStore.loadTemplates();
  }
  syncSelectedTemplate();
  rerenderLegacyApp({ syncRoute: false });
});

watch(
  () => [props.templateId, templateStore.state.loadedAt, templateStore.state.records.length, legacyRenderTick.value],
  () => {
    syncSelectedTemplate();
  },
  { immediate: true }
);

watch(
  () => [
    selectedTemplate.value?.id || "",
    selectedTemplate.value?.richBodyHtml || "",
    selectedTemplate.value?.editorContent?.updatedAt || ""
  ],
  () => {
    templateEditorHtml.value = selectedTemplate.value ? wltVisualHtml(selectedTemplate.value) : "";
    templateEditorError.value = "";
  },
  { immediate: true }
);

function templateMatchesRoute(template, routeTemplateId = props.templateId) {
  return Boolean(template && routeTemplateId && (
    template.id === routeTemplateId ||
    template.backendTemplateId === routeTemplateId
  ));
}

function syncSelectedTemplate() {
  if (!props.templateId) return;
  if (templateMatchesRoute(selectedWorkListTemplate())) return;
  const template = templateStore.selectTemplate(props.templateId);
  if (template) rerenderLegacyApp({ syncRoute: false });
}

async function saveCurrentTemplate(editorSnapshot = null) {
  const template = selectedTemplate.value;
  if (!template) return;
  const contentSnapshot = editorSnapshot?.html !== undefined ? editorSnapshot : null;
  const record = await templateStore.saveTemplate(template, await readTemplateFormValues(template, contentSnapshot));
  if (record) rerenderLegacyApp({ syncRoute: false });
}

async function duplicateCurrentTemplate() {
  const template = selectedTemplate.value;
  if (!template) return;
  const record = await templateStore.duplicateTemplate(template);
  if (!record?.id) return;
  rerenderLegacyApp({ syncRoute: false });
  await router.push({ name: "template-detail", params: { templateId: record.id } });
}

async function createTemplate() {
  const record = await templateStore.createTemplate();
  if (!record?.id) return;
  rerenderLegacyApp({ syncRoute: false });
  await router.replace({ name: "template-detail", params: { templateId: record.id } });
}

async function archiveCurrentTemplate() {
  const template = selectedTemplate.value;
  if (!template || template.isActive === false) return;
  if (!window.confirm(`Archive template "${template.name}"? It will stay in Templates but will no longer be offered for Work Act generation.`)) return;
  const record = await templateStore.archiveTemplate(template.backendTemplateId || template.id);
  if (record) rerenderLegacyApp({ syncRoute: false });
}

async function goBackToList() {
  await router.push({ name: "templates" });
}

function cancelEdits() {
  state.wltError = "";
  templateEditorHtml.value = selectedTemplate.value ? wltVisualHtml(selectedTemplate.value) : "";
  rerenderLegacyApp({ syncRoute: false });
}

async function handleEditorSave(snapshot) {
  await saveCurrentTemplate(snapshot);
}

function handleEditorError(message) {
  templateEditorError.value = message;
}

function activateSettingsTab(tabId) {
  activeSettingsTab.value = tabId;
}

async function readTemplateFormValues(template, editorSnapshot = null) {
  const serviceType = controlValue("wlt-edit-service-type") || template.serviceType || "Service";
  const editorContent = editorSnapshot || await readEditorSnapshot(template);
  return {
    name: controlValue("wlt-edit-name") || template.name || "",
    company: controlValue("wlt-edit-company") || template.company || "",
    equipmentCategory: controlValue("wlt-edit-category") || template.equipmentCategory || "General",
    serviceType,
    language: controlValue("wlt-edit-language") || template.language || "lt",
    entryPerson: controlValue("wlt-edit-entry-person") || template.entryPerson || "",
    entryDate: controlValue("wlt-edit-entry-date") || template.entryDate || new Date().toISOString().slice(0, 10),
    bodyText: controlValue("wlt-edit-body") || template.bodyText || "",
    linkedServiceTypes: uniqueValues([serviceType, ...valuesForDataAttr("wlt-edit-service-type-link")]),
    linkedEquipmentIds: valuesForDataAttr("wlt-edit-equipment"),
    linkedHospitalIds: valuesForDataAttr("wlt-edit-hospital"),
    linkedWorkEquipmentIds: valuesForDataAttr("wlt-edit-work-equipment"),
    editorHtml: editorContent.html,
    editorText: editorContent.text,
    editorJson: editorContent.json,
    editorContent,
    mergeFields: template.mergeFields || []
  };
}

async function readEditorSnapshot(template) {
  const snapshot = await templateEditorRef.value?.getSnapshot?.();
  if (snapshot) return snapshot;
  return createEditorSnapshot({
    html: templateEditorHtml.value || wltVisualHtml(template),
    json: template.editorContent?.json || null
  });
}

function controlValue(id) {
  return document.getElementById(id)?.value?.trim() || "";
}

function valuesForDataAttr(attr) {
  return Array.from(document.querySelectorAll(`[data-${attr}]`))
    .map((input) => input.value)
    .filter(Boolean);
}

function uniqueValues(values) {
  return Array.from(new Set(values.filter(Boolean)));
}
</script>

<template>
  <main id="app-main" class="main" tabindex="-1">
    <div class="page-content template-detail-page">
      <section class="panel slim template-detail-header">
        <div class="template-detail-breadcrumb">
          <VmButton compact variant="ghost" @click="goBackToList">Back to templates</VmButton>
          <div class="template-detail-identity">
            <div class="section-title">Template editor</div>
            <h1>{{ selectedTemplate?.name || "Template" }}</h1>
            <div class="filter-note">Reusable source asset for Work Act document generation.</div>
          </div>
        </div>

        <div class="template-detail-meta">
          <VmStatusChip :status="selectedStatus" />
          <span class="mono">Updated {{ selectedUpdatedDate }}</span>
          <span
            class="documents-sync-note"
            :class="{ 'is-error': templateStore.state.error }"
            role="status"
            aria-live="polite"
          >
            {{ templateStatusText }}
          </span>
        </div>

        <div class="template-detail-actions">
          <VmButton compact variant="primary" :disabled="!selectedTemplate || templateStore.state.saving || templateStore.state.loading" @click="saveCurrentTemplate()">
            {{ templateStore.state.saving ? "Saving..." : "Save template" }}
          </VmButton>
          <VmButton compact variant="ghost" :disabled="!selectedTemplate || templateStore.state.saving" @click="duplicateCurrentTemplate">Duplicate</VmButton>
          <VmButton compact danger variant="ghost" :disabled="!selectedTemplate || selectedTemplate.isActive === false || templateStore.state.saving" @click="archiveCurrentTemplate">
            {{ selectedTemplate?.isActive === false ? "Archived" : "Archive" }}
          </VmButton>
          <VmButton compact variant="ghost" :disabled="!selectedTemplate || templateStore.state.saving" @click="cancelEdits">Cancel</VmButton>
        </div>
      </section>

      <div v-if="state.wltError || templateStore.state.error" class="form-error" role="alert">
        {{ state.wltError || templateStore.state.error }}
      </div>

      <section v-if="templateStore.state.loading && !selectedTemplate" class="panel template-empty-state">
        <div class="section-title">Loading template</div>
        <p class="filter-note">Template source record is loading from the Templates API.</p>
      </section>

      <section v-else-if="!selectedTemplate" class="panel template-empty-state">
        <div class="section-heading">
          <div>
            <div class="section-title">Template not found</div>
            <div class="filter-note">This template is not available in the Templates source registry.</div>
          </div>
          <div class="template-detail-actions">
            <VmButton compact variant="ghost" @click="goBackToList">Back to templates</VmButton>
            <VmButton compact variant="primary" :disabled="templateStore.state.saving" @click="createTemplate">New template</VmButton>
          </div>
        </div>
      </section>

      <template v-else>
        <input id="wlt-edit-category" type="hidden" :value="selectedTemplate.equipmentCategory || 'General'">
        <input id="wlt-edit-language" type="hidden" :value="selectedTemplate.language || 'lt'">
        <input id="wlt-edit-entry-date" type="hidden" :value="selectedTemplate.entryDate || new Date().toISOString().slice(0, 10)">
        <input
          v-for="serviceType in wltArray(selectedTemplate.linkedServiceTypes)"
          :key="serviceType"
          type="hidden"
          :value="serviceType"
          data-wlt-edit-service-type-link
        >
        <textarea
          id="wlt-edit-note"
          hidden
          :data-wlt-editor-note="selectedTemplate.id"
          :value="selectedTemplate.editorNote || ''"
        ></textarea>

        <section class="template-edit-layout" aria-label="Template editing workspace">
          <div class="template-editor-column">
            <div class="template-editor-shell">
              <div class="section-heading template-editor-heading">
                <div>
                  <div class="detail-group-title">Template content</div>
                  <div class="filter-note">Reusable template source content. Insert template data fields where Work Acts should place real values during generation.</div>
                </div>
              </div>
              <UmoDocumentEditor
                ref="templateEditorRef"
                v-model="templateEditorHtml"
                :title="selectedTemplate.name || 'Template content'"
                :merge-fields="selectedMergeFields"
                :readonly="templateStore.state.saving"
                :status="templateEditorError || 'A4 editing surface for generated PDF output'"
                :min-height="760"
                @error="handleEditorError"
                @save="handleEditorSave"
              />
            </div>
          </div>

          <aside class="template-support-sidebar" aria-label="Template settings">
            <div class="template-support-tabs" role="tablist" aria-label="Template settings sections">
              <button
                v-for="tab in settingTabs"
                :id="`template-settings-tab-${tab.id}`"
                :key="tab.id"
                class="template-support-tab"
                :class="{ active: activeSettingsTab === tab.id }"
                type="button"
                role="tab"
                :aria-selected="activeSettingsTab === tab.id ? 'true' : 'false'"
                :aria-controls="`template-settings-panel-${tab.id}`"
                @click="activateSettingsTab(tab.id)"
              >
                {{ tab.label }}
              </button>
            </div>

            <div
              id="template-settings-panel-metadata"
              class="template-support-panel"
              role="tabpanel"
              aria-labelledby="template-settings-tab-metadata"
              v-show="activeSettingsTab === 'metadata'"
            >
              <div class="template-support-section">
                <div class="detail-group-title">Template metadata</div>
                <div class="template-settings-grid">
                  <label class="filter-control">
                    <span>Company</span>
                    <select id="wlt-edit-company" :value="companyValueForTemplate(selectedTemplate)">
                      <option
                        v-for="companyName in companyOptionsForTemplate(selectedTemplate)"
                        :key="companyName"
                        :value="companyName"
                      >
                        {{ companyName }}
                      </option>
                    </select>
                  </label>

                  <label class="filter-control">
                    <span>Entry person</span>
                    <VmSelect
                      id="wlt-edit-entry-person"
                      :model-value="selectedTemplate.entryPerson || ''"
                      :options="userOptions()"
                    />
                  </label>

                  <label class="filter-control">
                    <span>Template name</span>
                    <input
                      id="wlt-edit-name"
                      type="text"
                      :value="selectedTemplate.name"
                      placeholder="Custom template name"
                    >
                  </label>

                  <label class="filter-control">
                    <span>Service type</span>
                    <VmSelect
                      id="wlt-edit-service-type"
                      :model-value="selectedTemplate.serviceType || 'Service'"
                      :options="serviceTypeOptions()"
                    />
                  </label>

                  <label class="filter-control template-description-field">
                    <span>Description</span>
                    <textarea
                      id="wlt-edit-body"
                      :value="selectedTemplate.bodyText || ''"
                      placeholder="Short internal description"
                      rows="4"
                    ></textarea>
                  </label>
                </div>
              </div>
            </div>

            <div
              id="template-settings-panel-applicability"
              class="template-support-panel"
              role="tabpanel"
              aria-labelledby="template-settings-tab-applicability"
              v-show="activeSettingsTab === 'applicability'"
            >
              <div class="template-support-section">
                <div class="template-support-section-head">
                  <div class="detail-group-title">Applicability</div>
                  <div class="filter-note">Limit where this template appears in Work Acts.</div>
                </div>
                <div class="template-link-grid">
                  <WltSearchableCombobox
                    title="Equipment"
                    :options="equipmentOptions()"
                    :selected-values="wltArray(selectedTemplate.linkedEquipmentIds)"
                    data-attr="wlt-edit-equipment"
                    placeholder="Search equipment by name, serial, or hospital"
                    note="Customer devices this template can be used with."
                  />

                  <WltSearchableCombobox
                    title="Hospitals"
                    :options="hospitalOptions()"
                    :selected-values="wltArray(selectedTemplate.linkedHospitalIds)"
                    data-attr="wlt-edit-hospital"
                    placeholder="Search hospital or clinic"
                    note="Hospitals/customers where this template is allowed."
                  />

                  <WltSearchableCombobox
                    title="Work Equipment"
                    :options="workEquipmentOptions()"
                    :selected-values="wltArray(selectedTemplate.linkedWorkEquipmentIds)"
                    data-attr="wlt-edit-work-equipment"
                    placeholder="Search multimeter, oscilloscope, safety analyzer..."
                    note="Service/metrology tools used during checks; future Work Equipment module."
                  />
                </div>
              </div>
            </div>

            <div
              id="template-settings-panel-merge-fields"
              class="template-support-panel"
              role="tabpanel"
              aria-labelledby="template-settings-tab-merge-fields"
              v-show="activeSettingsTab === 'merge-fields'"
            >
              <div class="template-support-section">
                <div class="template-support-section-head">
                  <div class="detail-group-title">Template data fields</div>
                  <div class="filter-note">These placeholders are inserted into template content now, filled with Work Act values during generation, and rendered in generated document output stored in Documents.</div>
                </div>
                <div class="wlt-merge-field-list">
                  <span
                    v-for="field in selectedMergeFields"
                    :key="field.key"
                    class="wlt-merge-token"
                    :title="field.description || field.label"
                  >
                    {{ field.token }}
                  </span>
                  <span v-if="!selectedMergeFields.length" class="filter-note">No template data fields are defined for this template yet.</span>
                </div>
              </div>

              <div v-if="selectedTemplate.editorNote" class="info-box warn template-editor-note">
                <div class="info-title">Editor note</div>
                <div class="info-body">{{ selectedTemplate.editorNote }}</div>
              </div>
            </div>
          </aside>
        </section>
      </template>

      <details class="dev-spec">
        <summary class="dev-spec-summary">DEV REFERENCE - Template detail</summary>
        <div class="dev-spec-body">
          <div class="ds-row"><span class="ds-label">Purpose</span><p class="ds-value">Edit one reusable procedure/checklist template source record.</p></div>
          <div class="ds-row"><span class="ds-label">Actions</span><p class="ds-value">Save metadata and Umo content, duplicate, archive, cancel, and maintain applicability links.</p></div>
          <div class="ds-row"><span class="ds-label">Boundary</span><p class="ds-value">This route does not create Documents. Work Acts uses saved Templates to generate document outputs.</p></div>
        </div>
      </details>
    </div>
  </main>
</template>
