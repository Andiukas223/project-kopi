<script setup>
import { computed, nextTick, onMounted } from "vue";
import { VmButton, VmModal, VmStatusChip } from "../../components/ui/index.js";
import { documents, jobs } from "../../js/data.js";
import { state } from "../../js/state.js";
import { useDocumentStore } from "../../stores/documentStore.js";
import { legacyRenderTick, rerenderLegacyApp } from "../../stores/shellStore.js";
import {
  applyDocumentTableFilters,
  defaultUploadJob,
  defaultUploadType,
  documentColumns,
  documentCreatedDate,
  documentFilterCustomers,
  documentFilterTypes,
  documentGeneratedOutput,
  documentReference,
  documentTypeLabel,
  documentTypeOptions,
  documentUploadStatus,
  fullIsoDateOrEmpty,
  jobStatusForDocument,
  jobStatusForUi,
  uploadTargetDocument
} from "./documentViewModel.js";

const documentStore = useDocumentStore();

onMounted(async () => {
  await documentStore.loadGeneratedDocuments();
  rerenderLegacyApp({ syncRoute: false });
});

const visibleDocuments = computed(() => {
  legacyRenderTick.value;
  return applyDocumentTableFilters(documents);
});

const typeFilterOptions = computed(() => {
  legacyRenderTick.value;
  return documentFilterTypes();
});

const customerFilterOptions = computed(() => {
  legacyRenderTick.value;
  return documentFilterCustomers();
});

const datePickerValue = computed(() => {
  legacyRenderTick.value;
  return fullIsoDateOrEmpty(state.documentDateQuery || "");
});

const uploadOpen = computed(() => {
  legacyRenderTick.value;
  return state.documentUploadOpen;
});

const uploadTarget = computed(() => {
  legacyRenderTick.value;
  return uploadTargetDocument();
});

const uploadDefaultJob = computed(() => {
  legacyRenderTick.value;
  return defaultUploadJob(uploadTarget.value);
});

const uploadTargetJob = computed(() => {
  legacyRenderTick.value;
  return uploadTarget.value ? jobs.find((job) => job.id === uploadTarget.value.jobId) : null;
});

const completionDocument = computed(() => {
  legacyRenderTick.value;
  return documents.find((doc) => doc.id === state.jobCompletionConfirmDocId) || null;
});

const completionJob = computed(() => {
  legacyRenderTick.value;
  return completionDocument.value ? jobs.find((job) => job.id === completionDocument.value.jobId) : null;
});

function uploadStatusFor(doc) {
  legacyRenderTick.value;
  return documentUploadStatus(doc);
}

function generatedOutputFor(doc) {
  legacyRenderTick.value;
  return documentGeneratedOutput(doc);
}

function openExternalDocumentUpload() {
  state.documentUploadOpen = true;
  state.documentUploadTargetId = null;
  state.documentUploadDefaultType = "";
  state.documentUploadError = "";
  rerenderLegacyApp({ syncRoute: false });
  focusDocumentUploadField("doc-upload-type");
}

function openSignedDocumentUpload(docId) {
  state.documentUploadOpen = true;
  state.documentUploadTargetId = docId;
  state.documentUploadDefaultType = "";
  state.documentUploadError = "";
  rerenderLegacyApp({ syncRoute: false });
  focusDocumentUploadField("doc-upload-signed-by");
}

function closeDocumentUpload() {
  state.documentUploadOpen = false;
  state.documentUploadTargetId = null;
  state.documentUploadDefaultType = "";
  state.documentUploadError = "";
  rerenderLegacyApp({ syncRoute: false });
}

async function focusDocumentUploadField(fieldId) {
  await nextTick();
  document.getElementById(fieldId)?.focus();
}

const generatedSyncStatus = computed(() => {
  if (documentStore.state.loadingGenerated) return "Syncing generated documents...";
  if (documentStore.state.generatedError) return documentStore.state.generatedError;
  if (documentStore.state.generatedLoadedAt) {
    return `${documentStore.state.generatedSyncCount} generated records synced`;
  }
  return "";
});
</script>

<template>
  <main id="app-main" class="main" tabindex="-1">
    <div class="page-content">
      <section class="panel slim documents-filter-panel">
        <div class="documents-page-head">
          <div>
            <div class="section-title">Documents</div>
            <div class="filter-note">Generated output and signed-file custody stay visible in one workflow table.</div>
          </div>
          <div
            v-if="generatedSyncStatus"
            class="documents-sync-note"
            :class="{ 'is-error': documentStore.state.generatedError }"
            role="status"
            aria-live="polite"
          >
            {{ generatedSyncStatus }}
          </div>
        </div>
        <div class="doc-search-row">
          <label class="filter-control doc-search-text" for="doc-search-query">
            <span>Search</span>
            <input
              id="doc-search-query"
              :value="state.documentSearchQuery"
              placeholder="Reference, customer, owner initials, description"
            >
          </label>

          <label class="filter-control" for="doc-type-filter">
            <span>Type</span>
            <select id="doc-type-filter" :value="state.documentTypeFilter">
              <option v-for="type in typeFilterOptions" :key="type" :value="type">
                {{ documentTypeLabel(type) }}
              </option>
            </select>
          </label>

          <label class="filter-control" for="doc-customer-filter">
            <span>Customer</span>
            <select id="doc-customer-filter" :value="state.documentCustomerFilter">
              <option v-for="customer in customerFilterOptions" :key="customer" :value="customer">
                {{ customer }}
              </option>
            </select>
          </label>

          <label class="filter-control doc-date-filter doc-date-query-filter" for="doc-date-query">
            <span>Created</span>
            <div class="date-combo">
              <input
                id="doc-date-query"
                type="text"
                inputmode="numeric"
                :value="state.documentDateQuery || ''"
                placeholder="2026 / 2026-04 / 2026-04-15"
              >
              <input
                class="date-combo-picker"
                type="date"
                :value="datePickerValue"
                aria-label="Pick created date"
                data-doc-date-picker
              >
            </div>
          </label>

          <div class="doc-search-actions">
            <VmButton compact variant="dark" data-doc-search-apply>Search</VmButton>
            <VmButton compact variant="ghost" data-doc-search-clear>Cancel</VmButton>
            <VmButton compact variant="primary" data-doc-upload-open @click="openExternalDocumentUpload">Upload document</VmButton>
          </div>
        </div>
      </section>

      <VmModal
        :open="uploadOpen"
        overlay-class="document-upload-modal-backdrop"
        dialog-class="document-upload-modal"
        aria-labelledby="doc-upload-title"
        role="presentation"
      >
        <div class="document-upload-head">
          <div>
            <div id="doc-upload-title" class="section-title">
              {{ uploadTarget ? `Upload signed ${documentTypeLabel(uploadTarget.type)}` : "Upload document" }}
            </div>
            <div class="filter-note">
              {{ uploadTarget ? "Use the signed copy returned by the customer." : "Create a document record from an external file." }}
            </div>
          </div>
          <span class="chip" :class="uploadTarget ? 'signature' : 'pending'">
            {{ uploadTarget ? "Signed return" : "Upload" }}
          </span>
        </div>

        <div v-if="uploadTarget" class="doc-return-summary">
          <div class="field"><div class="field-label">Document</div><div class="field-value">{{ uploadTarget.id }}</div></div>
          <div class="field"><div class="field-label">Type</div><div class="field-value">{{ documentTypeLabel(uploadTarget.type) }}</div></div>
          <div class="field"><div class="field-label">Job</div><div class="field-value">{{ uploadTarget.jobId || "-" }}</div></div>
          <div v-if="uploadTargetJob" class="field"><div class="field-label">Job status</div><div class="field-value">{{ jobStatusForUi(uploadTargetJob) }}</div></div>
          <div class="field"><div class="field-label">Customer</div><div class="field-value">{{ uploadTarget.customer || "-" }}</div></div>
        </div>

        <div class="field-stack upload-form">
          <template v-if="!uploadTarget">
            <div class="field">
              <label for="doc-upload-type">Document type</label>
              <select id="doc-upload-type" :value="defaultUploadType()">
                <option v-for="type in documentTypeOptions" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>
            <div class="field">
              <label for="doc-upload-job">Job ref</label>
              <select id="doc-upload-job">
                <option v-for="job in jobs" :key="job.id" :value="job.id">
                  {{ job.id }} / {{ job.customer }}
                </option>
              </select>
            </div>
            <div class="field">
              <label for="doc-upload-customer">Customer</label>
              <input id="doc-upload-customer" :value="uploadDefaultJob?.customer || ''" placeholder="Customer name">
            </div>
          </template>

          <div class="field">
            <label for="doc-upload-signed-by">Who signed</label>
            <input
              id="doc-upload-signed-by"
              placeholder="Name or department"
              :value="uploadTarget ? 'Customer representative' : ''"
            >
          </div>

          <div v-if="!uploadTarget" class="field">
            <label for="doc-upload-created">Created</label>
            <input id="doc-upload-created" type="date" :value="new Date().toISOString().slice(0, 10)">
          </div>

          <div class="field full">
            <label class="upload-dropzone" for="doc-upload-file" data-doc-upload-dropzone>
              <input id="doc-upload-file" class="upload-dropzone-input" type="file" accept=".pdf,.odt,.docx,.doc,.png,.jpg,.jpeg,.webp">
              <span class="upload-dropzone-title">Drag and drop file here</span>
              <span class="upload-dropzone-note">or click to choose a file</span>
              <span class="upload-dropzone-file" data-doc-upload-file-name>No file selected</span>
            </label>
          </div>

          <div class="field full">
            <label for="doc-upload-description">Short description</label>
            <textarea
              id="doc-upload-description"
              rows="3"
              :placeholder="uploadTarget ? 'Optional note about signature / received copy' : 'Location, contract reference, date, executor, or other indexed metadata'"
              :value="uploadTarget ? 'Signed document returned by customer.' : ''"
            />
          </div>
        </div>

        <div v-if="state.documentUploadError" class="form-error" role="alert">{{ state.documentUploadError }}</div>

        <div class="document-upload-actions">
          <VmButton variant="primary" data-doc-upload-submit>Upload</VmButton>
          <VmButton variant="ghost" data-doc-upload-cancel @click="closeDocumentUpload">Cancel</VmButton>
        </div>
      </VmModal>

      <section class="table-card documents-table">
        <div class="table-toolbar">
          <span>{{ visibleDocuments.length }} documents</span>
          <span class="filter-note">Preview/print, download/export, and signed return actions are kept separate.</span>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th v-for="column in documentColumns" :key="column.key">{{ column.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!visibleDocuments.length">
                <td :colspan="documentColumns.length" class="documents-empty-cell">
                  <strong>No documents match the current filters.</strong>
                  <span>Clear filters or upload a document to create a new custody record.</span>
                </td>
              </tr>
              <tr
                v-for="doc in visibleDocuments"
                :key="doc.id"
                :class="{ selected: doc.id === state.selectedDocumentId }"
                :data-doc-row="doc.id"
              >
                <td class="mono">{{ documentReference(doc) }}</td>
                <td>{{ documentTypeLabel(doc.type) }}</td>
                <td>{{ doc.customer || "Not assigned" }}</td>
                <td><VmStatusChip :status="jobStatusForDocument(doc)" /></td>
                <td class="mono">{{ documentCreatedDate(doc) || "-" }}</td>
                <td>
                  <div class="doc-generated-output" :class="generatedOutputFor(doc).kind">
                    <div>
                      <span class="doc-signal" :class="generatedOutputFor(doc).kind === 'ready' ? 'done' : 'warn'">
                        {{ generatedOutputFor(doc).label }}
                      </span>
                      <span v-if="generatedOutputFor(doc).detail" class="doc-table-note">
                        {{ generatedOutputFor(doc).detail }}
                      </span>
                    </div>
                    <div class="doc-generated-actions">
                      <VmButton
                        compact
                        :data-doc-view="doc.id"
                        title="Preview and print generated output"
                        variant="primary"
                      >
                        Preview / Print
                      </VmButton>
                      <VmButton
                        v-if="generatedOutputFor(doc).downloadUrl"
                        compact
                        :download="generatedOutputFor(doc).fileName || undefined"
                        :href="generatedOutputFor(doc).downloadUrl"
                        rel="noopener"
                        target="_blank"
                        title="Download generated PDF from document-service"
                        variant="ghost"
                      >
                        Download PDF
                      </VmButton>
                      <VmButton
                        v-else
                        compact
                        disabled
                        title="Generated download is not available yet"
                        variant="ghost"
                      >
                        Download PDF
                      </VmButton>
                      <VmButton
                        v-if="generatedOutputFor(doc).downloadUrl"
                        compact
                        :href="generatedOutputFor(doc).downloadUrl"
                        rel="noopener"
                        target="_blank"
                        title="Export generated PDF from document-service"
                        variant="ghost"
                      >
                        Export PDF
                      </VmButton>
                      <VmButton
                        v-else
                        compact
                        disabled
                        title="Generated export is not available yet"
                        variant="ghost"
                      >
                        Export PDF
                      </VmButton>
                      <span class="doc-table-note">Generated file custody</span>
                    </div>
                  </div>
                </td>
                <td>
                  <VmButton
                    v-if="uploadStatusFor(doc).kind === 'download'"
                    compact
                    :href="uploadStatusFor(doc).href"
                    rel="noopener"
                    target="_blank"
                    :title="uploadStatusFor(doc).title"
                    variant="done"
                  >
                    {{ uploadStatusFor(doc).label }}
                  </VmButton>
                  <VmButton
                    v-else-if="uploadStatusFor(doc).kind === 'download-missing-url'"
                    compact
                    disabled
                    :title="uploadStatusFor(doc).title"
                    variant="done"
                  >
                    {{ uploadStatusFor(doc).label }}
                  </VmButton>
                  <VmButton
                    v-else
                    compact
                    :data-doc-upload-signed-open="doc.id"
                    :title="uploadStatusFor(doc).title"
                    variant="warn"
                    @click="openSignedDocumentUpload(doc.id)"
                  >
                    {{ uploadStatusFor(doc).label }}
                  </VmButton>
                  <span class="doc-table-note">Signed return custody</span>
                </td>
                <td>
                  <div class="table-actions">
                    <VmButton compact :data-doc-edit="doc.id" variant="ghost">Edit source</VmButton>
                    <VmButton compact danger :data-doc-delete="doc.id" title="Delete document custody record" variant="ghost">Delete</VmButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <details class="dev-spec">
        <summary class="dev-spec-summary">DEV REFERENCE — Documents</summary>
        <div class="dev-spec-body">
          <div class="ds-row"><span class="ds-label">Purpose</span><p class="ds-value">Repository search and file custody for generated and signed documents.</p></div>
          <div class="ds-row"><span class="ds-label">Actions</span><p class="ds-value">Upload document · Upload signed copy · View generated output · Edit source workspace.</p></div>
        </div>
      </details>
    </div>
  </main>

  <VmModal
    :open="Boolean(completionDocument)"
    overlay-class="document-upload-modal-backdrop"
    dialog-class="document-upload-modal"
    aria-labelledby="job-done-title"
    role="presentation"
  >
    <template v-if="completionDocument">
      <div class="document-upload-head">
        <div>
          <div id="job-done-title" class="section-title">Signed Work Act uploaded</div>
          <div class="filter-note">Do you want to mark the linked Service job as Done?</div>
        </div>
        <span class="chip signed">Signed file</span>
      </div>
      <div class="doc-return-summary">
        <div class="field"><div class="field-label">Document</div><div class="field-value">{{ completionDocument.id }}</div></div>
        <div class="field"><div class="field-label">Type</div><div class="field-value">{{ documentTypeLabel(completionDocument.type) }}</div></div>
        <div class="field"><div class="field-label">Job</div><div class="field-value">{{ completionDocument.jobId || "-" }}</div></div>
        <div class="field"><div class="field-label">Current job status</div><div class="field-value">{{ completionJob ? jobStatusForUi(completionJob) : "-" }}</div></div>
        <div class="field"><div class="field-label">Customer</div><div class="field-value">{{ completionDocument.customer || "-" }}</div></div>
      </div>
      <div class="info-box">
        <div class="info-title">Recommended</div>
        <div class="info-body">Use Mark job Done when the uploaded signed Work Act is the final proof that this job is finished.</div>
      </div>
      <div class="document-upload-actions">
        <VmButton variant="primary" :data-doc-confirm-job-done="completionDocument.id">Mark job Done</VmButton>
        <VmButton variant="ghost" :data-doc-confirm-job-keep="completionDocument.id">Upload only</VmButton>
      </div>
    </template>
  </VmModal>
</template>
