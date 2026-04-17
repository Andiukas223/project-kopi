<script setup>
import { computed, onMounted, ref, watch } from "vue";
import UmoDocumentEditor from "../../components/documentEditor/UmoDocumentEditor.vue";
import { createEditorSnapshot } from "../../components/documentEditor/editorContent.js";
import { VmButton, VmSelect } from "../../components/ui/index.js";
import { state } from "../../js/state.js";
import { legacyRenderTick, rerenderLegacyApp, useShellStore } from "../../stores/shellStore.js";
import { useTemplateStore } from "../../stores/templateStore.js";
import WltSearchableCombobox from "./components/WltSearchableCombobox.vue";
import {
  buildTemplateGenerationPayload,
  companyOptionsForTemplate,
  companyValueForTemplate,
  equipmentOptions,
  hospitalOptions,
  selectedWorkListTemplate,
  serviceTypeOptions,
  templateGenerationJobOptions,
  templateOptions,
  userOptions,
  wltArray,
  wltVisualHtml,
  workEquipmentOptions
} from "./templateViewModel.js";

const templateStore = useTemplateStore();
const shellStore = useShellStore();
const templateEditorRef = ref(null);
const templateEditorHtml = ref("");
const templateEditorError = ref("");

const selectedTemplate = computed(() => {
  legacyRenderTick.value;
  return selectedWorkListTemplate();
});

const selectedMergeFields = computed(() => selectedTemplate.value?.mergeFields || []);

const generationJobOptions = computed(() => templateGenerationJobOptions());

const lastGeneratedDocument = computed(() => templateStore.state.lastGeneratedDocument);

const templateStatusText = computed(() => {
  if (templateStore.state.loading) return "Loading templates from document service...";
  if (templateStore.state.saving) return "Saving template...";
  if (templateStore.state.lastSavedAt) return `Saved ${new Date(templateStore.state.lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (templateStore.state.loadedAt) return "Loaded from document service";
  return "Ready";
});

onMounted(async () => {
  await templateStore.loadTemplates();
  rerenderLegacyApp({ syncRoute: false });
});

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

async function saveCurrentTemplate(editorSnapshot = null) {
  const tpl = selectedTemplate.value;
  if (!tpl) return;
  const contentSnapshot = editorSnapshot?.html !== undefined ? editorSnapshot : null;
  const record = await templateStore.saveTemplate(tpl, await readTemplateFormValues(tpl, contentSnapshot));
  if (record) rerenderLegacyApp({ syncRoute: false });
}

async function createTemplate() {
  const record = await templateStore.createTemplate();
  if (record) rerenderLegacyApp({ syncRoute: false });
}

async function archiveCurrentTemplate() {
  const tpl = selectedTemplate.value;
  if (!tpl) return;
  const record = await templateStore.archiveTemplate(tpl.backendTemplateId || tpl.id);
  if (record) rerenderLegacyApp({ syncRoute: false });
}

async function generateCurrentTemplateDocument() {
  const tpl = selectedTemplate.value;
  if (!tpl) return;
  const saved = await templateStore.saveTemplate(tpl, await readTemplateFormValues(tpl));
  if (!saved) {
    rerenderLegacyApp({ syncRoute: false });
    return;
  }

  const documentRecord = await templateStore.generateDocumentFromTemplate(
    saved.id,
    buildTemplateGenerationPayload(state.templateGenWorkActJobId, selectedTemplate.value)
  );
  if (documentRecord) rerenderLegacyApp({ syncRoute: false });
}

function updateGenerationJob(event) {
  state.templateGenWorkActJobId = event.target.value;
  rerenderLegacyApp({ syncRoute: false });
}

function openGeneratedDocument() {
  if (lastGeneratedDocument.value?.id) {
    state.selectedDocumentId = lastGeneratedDocument.value.id;
  }
  shellStore.goToPage("documents");
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

async function readTemplateFormValues(tpl, editorSnapshot = null) {
  const serviceType = controlValue("wlt-edit-service-type") || tpl.serviceType || "Service";
  const editorContent = editorSnapshot || await readEditorSnapshot(tpl);
  return {
    name: controlValue("wlt-edit-name") || tpl.name || "",
    company: controlValue("wlt-edit-company") || tpl.company || "",
    equipmentCategory: controlValue("wlt-edit-category") || tpl.equipmentCategory || "General",
    serviceType,
    language: controlValue("wlt-edit-language") || tpl.language || "lt",
    entryPerson: controlValue("wlt-edit-entry-person") || tpl.entryPerson || "",
    entryDate: controlValue("wlt-edit-entry-date") || tpl.entryDate || new Date().toISOString().slice(0, 10),
    bodyText: controlValue("wlt-edit-body") || tpl.bodyText || "",
    linkedServiceTypes: uniqueValues([serviceType, ...valuesForDataAttr("wlt-edit-service-type-link")]),
    linkedEquipmentIds: valuesForDataAttr("wlt-edit-equipment"),
    linkedHospitalIds: valuesForDataAttr("wlt-edit-hospital"),
    linkedWorkEquipmentIds: valuesForDataAttr("wlt-edit-work-equipment"),
    editorHtml: editorContent.html,
    editorText: editorContent.text,
    editorJson: editorContent.json,
    editorContent,
    mergeFields: tpl.mergeFields || []
  };
}

async function readEditorSnapshot(tpl) {
  const snapshot = await templateEditorRef.value?.getSnapshot?.();
  if (snapshot) return snapshot;
  return createEditorSnapshot({
    html: templateEditorHtml.value || wltVisualHtml(tpl),
    json: tpl.editorContent?.json || null
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
    <div class="page-content">
      <section v-if="!selectedTemplate" class="panel template-empty-state">
        <div class="section-heading">
          <div>
            <div class="section-title">Templates</div>
            <div class="filter-note">No reusable templates are available from document-service yet.</div>
          </div>
          <VmButton compact variant="primary" :disabled="templateStore.state.saving" @click="createTemplate">Create template</VmButton>
        </div>
      </section>

      <section v-else class="panel wlt-config-workspace">
        <div class="section-heading">
          <div>
            <div class="section-title">Templates</div>
            <div class="filter-note">Reusable Umo-authored procedure content for generated documents and Work Acts.</div>
            <div class="template-status-line" role="status" aria-live="polite">{{ templateStatusText }}</div>
          </div>
          <div class="wlt-template-picker">
            <label class="filter-control">
              <span>Template</span>
              <VmSelect
                :model-value="selectedTemplate.id"
                :options="templateOptions()"
                data-wlt-template-select
              />
            </label>
            <VmButton compact variant="ghost" :disabled="templateStore.state.saving" @click="createTemplate">New template</VmButton>
          </div>
        </div>

        <div v-if="state.wltError || templateStore.state.error" class="form-error" role="alert">
          {{ state.wltError || templateStore.state.error }}
        </div>

        <div class="wlt-form-section-title">Template metadata</div>
        <div class="wlt-config-form">
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

          <label class="filter-control wlt-name-field">
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

          <label class="filter-control wlt-description-field">
            <span>Description</span>
            <input
              id="wlt-edit-body"
              type="text"
              :value="selectedTemplate.bodyText || ''"
              placeholder="Short internal description"
            >
          </label>
        </div>

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

        <div class="wlt-config-actions">
          <VmButton compact variant="primary" :disabled="templateStore.state.saving || templateStore.state.loading" @click="saveCurrentTemplate()">
            {{ templateStore.state.saving ? "Saving..." : "Save template" }}
          </VmButton>
          <VmButton compact danger variant="ghost" :disabled="templateStore.state.saving" @click="archiveCurrentTemplate">Archive</VmButton>
          <VmButton compact variant="ghost" :disabled="templateStore.state.saving" @click="cancelEdits">Cancel</VmButton>
        </div>

        <div class="wlt-config-layout">
          <div class="wlt-editor-preview-panel">
            <div class="section-heading" style="margin-bottom:8px">
              <div>
                <div class="detail-group-title">Template content editor</div>
                <div class="filter-note">Umo owns reusable document content. Metadata, merge fields, and Work Act rows stay outside the editor.</div>
              </div>
            </div>
            <UmoDocumentEditor
              ref="templateEditorRef"
              v-model="templateEditorHtml"
              :title="selectedTemplate.name || 'Template content'"
              :merge-fields="selectedMergeFields"
              :readonly="templateStore.state.saving || templateStore.state.generating"
              :status="templateEditorError || 'A4 editing surface for generated PDF output'"
              @error="handleEditorError"
              @save="handleEditorSave"
            />
          </div>

          <div class="wlt-link-config">
            <div class="wlt-side-section-head">
              <div class="detail-group-title">Applicability</div>
              <div class="filter-note">Limit where this template appears during generation.</div>
            </div>
            <div class="wlt-link-grid">
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

            <div v-if="selectedTemplate.editorNote" class="info-box warn" style="margin-top:10px">
              <div class="info-title">Editor note</div>
              <div class="info-body">{{ selectedTemplate.editorNote }}</div>
            </div>

            <div class="info-box template-info-panel">
              <div class="info-title">Merge fields</div>
              <div class="info-body">Saved with the template record for the Umo editor and future generation flow.</div>
              <div class="wlt-merge-field-list">
                <span
                  v-for="field in selectedMergeFields"
                  :key="field.key"
                  class="wlt-merge-token"
                  :title="field.description || field.label"
                >
                  {{ field.token }}
                </span>
              </div>
            </div>

            <div class="info-box template-info-panel template-generate-panel" :aria-busy="templateStore.state.generating ? 'true' : 'false'">
              <div class="info-title">Generate document</div>
              <div class="info-body">Creates a PDF from this template and a structured service-job payload, then adds it to Documents.</div>
              <label class="filter-control template-generation-control">
                <span>Payload source</span>
                <VmSelect
                  :model-value="state.templateGenWorkActJobId"
                  :options="generationJobOptions"
                  @change="updateGenerationJob"
                />
              </label>
              <div class="template-generation-actions">
                <VmButton
                  compact
                  variant="primary"
                  :disabled="templateStore.state.saving || templateStore.state.generating"
                  @click="generateCurrentTemplateDocument"
                >
                  {{ templateStore.state.generating ? "Generating..." : "Generate PDF from template" }}
                </VmButton>
                <VmButton
                  v-if="lastGeneratedDocument"
                  compact
                  variant="ghost"
                  @click="openGeneratedDocument"
                >
                  Open generated document
                </VmButton>
              </div>
              <div class="template-generation-feedback" role="status" aria-live="polite">
                <span v-if="templateStore.state.generating">Generating PDF and syncing it to Documents...</span>
                <span v-else-if="lastGeneratedDocument">Generated {{ lastGeneratedDocument.id }}. It is now available in Documents.</span>
                <span v-else>Save the template first, then generate a PDF from the selected payload.</span>
              </div>
              <div v-if="templateStore.state.generationError" class="form-error" role="alert">
                {{ templateStore.state.generationError }}
              </div>
            </div>

          </div>
        </div>
      </section>

      <details class="dev-spec">
        <summary class="dev-spec-summary">DEV REFERENCE - Templates</summary>
        <div class="dev-spec-body">
          <div class="ds-row"><span class="ds-label">Purpose</span><p class="ds-value">Reusable procedure/checklist templates for Work Acts, kept separate from generated document output layouts.</p></div>
          <div class="ds-row"><span class="ds-label">Actions</span><p class="ds-value">Select template / Save metadata / Archive / Cancel / Umo content editing / applicability links.</p></div>
          <div class="ds-row"><span class="ds-label">Boundary</span><p class="ds-value">Concrete Work Act rows stay in Work Acts. Generated and signed file custody stays in Documents.</p></div>
        </div>
      </details>
    </div>
  </main>
</template>
