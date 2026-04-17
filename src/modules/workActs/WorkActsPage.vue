<script setup>
import { computed } from "vue";
import { VmButton, VmSelect, VmStatusChip } from "../../components/ui/index.js";
import { workActs } from "../../js/data.js";
import { state } from "../../js/state.js";
import { legacyRenderTick } from "../../stores/shellStore.js";
import {
  filteredWorkActs,
  generatedFileDisplayName,
  generatedFileForAct,
  groupWorkActsByEntryDate,
  reportOptionRows,
  reportOptionsForAct,
  selectedJobHasWorkAct,
  selectedSourceJob,
  selectedTemplateForAct,
  selectedWorkAct,
  serviceUserOptions,
  sourceJobOptions,
  templateOptionsForAct,
  workActCandidateEquipment,
  workActContractLabel,
  workActEquipmentOptionLabel,
  workActStatusOptions
} from "./workActsViewModel.js";

const sourceJob = computed(() => {
  legacyRenderTick.value;
  return selectedSourceJob();
});

const activeAct = computed(() => {
  legacyRenderTick.value;
  return selectedWorkAct(sourceJob.value);
});

const hasWorkActForSource = computed(() => {
  legacyRenderTick.value;
  return selectedJobHasWorkAct(sourceJob.value);
});

const visibleWorkActs = computed(() => {
  legacyRenderTick.value;
  return filteredWorkActs();
});

const groupedWorkActs = computed(() => {
  legacyRenderTick.value;
  return groupWorkActsByEntryDate(visibleWorkActs.value);
});

function selectedEquipment(act) {
  return act?.equipmentItems || [];
}

function workRows(act) {
  return act?.workRows || [];
}

function showWorkActError(act) {
  return Boolean(state.workActError && state.selectedWorkActId === act?.id);
}
</script>

<template>
  <main id="app-main" class="main" tabindex="-1">
    <div class="page-content">
      <section class="panel">
        <div class="section-heading">
          <div>
            <div class="section-title">Work Acts</div>
            <div class="filter-note">One Service job has one Work Act. Configure the work, preview the result, and generate the PDF here.</div>
          </div>
        </div>

        <div class="tg-command-bar">
          <label class="filter-control">
            <span>Source service job</span>
            <VmSelect
              :model-value="sourceJob?.id || ''"
              :options="sourceJobOptions()"
              data-template-work-act-job
            />
          </label>
          <div class="tg-action-cluster">
            <VmButton
              compact
              variant="primary"
              :data-work-act-create="sourceJob?.id || ''"
            >
              {{ hasWorkActForSource ? "Open Work Act" : "Create Work Act" }}
            </VmButton>
          </div>
        </div>

        <div v-if="sourceJob" class="detail-block">
          <div class="detail-group-title">Selected Work Act</div>

          <div v-if="!activeAct" class="work-act-empty">
            <p>
              {{ hasWorkActForSource ? "Open the existing Work Act for this job. The Work Act is where the completed work, steps, equipment, preview, and PDF are prepared." : "Create one Work Act for this job. The Work Act is where the completed work, steps, equipment, preview, and PDF are prepared." }}
            </p>
            <VmButton variant="primary" :data-work-act-create="sourceJob.id">
              {{ hasWorkActForSource ? "Open Work Act" : "Create Work Act" }}
            </VmButton>
          </div>

          <div v-else class="work-act-builder">
            <div class="doc-detail-grid compact">
              <div class="field"><div class="field-label">Act number</div><div class="field-value">{{ activeAct.number }}</div></div>
              <div class="field"><div class="field-label">Status</div><div class="field-value">{{ activeAct.status }}</div></div>
              <div class="field"><div class="field-label">Source</div><div class="field-value">{{ activeAct.source || "Manual" }}</div></div>
              <div class="field"><div class="field-label">Template</div><div class="field-value">{{ selectedTemplateForAct(activeAct)?.name || "Not selected" }}</div></div>
              <div v-if="activeAct.generatedDocumentId" class="field"><div class="field-label">Document</div><div class="field-value">{{ activeAct.generatedDocumentId }}</div></div>
              <div v-if="generatedFileForAct(activeAct)" class="field"><div class="field-label">Generated file</div><div class="field-value">{{ generatedFileDisplayName(generatedFileForAct(activeAct)) }}</div></div>
              <div v-if="generatedFileForAct(activeAct)?.fileId" class="field"><div class="field-label">File id</div><div class="field-value">{{ generatedFileForAct(activeAct).fileId }}</div></div>
            </div>

            <div v-if="showWorkActError(activeAct)" class="form-error">{{ state.workActError }}</div>

            <div class="work-act-section work-act-options-panel">
              <div>
                <div class="detail-group-title">Options / print settings</div>
                <div class="filter-note">Compact print flags for the final Work Act output.</div>
              </div>
              <label class="filter-control">
                <span>Entry Person</span>
                <VmSelect
                  :model-value="reportOptionsForAct(activeAct).entryPerson || ''"
                  :options="serviceUserOptions()"
                  :data-work-act-entry-person="activeAct.id"
                />
              </label>
              <fieldset class="work-act-option-grid">
                <legend class="sr-only">Work Act print settings</legend>
                <label
                  v-for="[key, label] in reportOptionRows"
                  :key="key"
                  class="work-act-option"
                >
                  <input
                    type="checkbox"
                    :data-work-act-option="`${activeAct.id}:${key}`"
                    :checked="Boolean(reportOptionsForAct(activeAct)[key])"
                  >
                  <span>{{ label }}</span>
                </label>
              </fieldset>
            </div>

            <div class="work-act-section">
              <div class="detail-group-title">Equipment selection</div>
              <div class="work-act-equipment-picker tg-search-band">
                <label class="filter-control">
                  <span>Search equipment</span>
                  <input
                    :list="`work-act-equipment-options-${activeAct.id}`"
                    :data-work-act-equipment-search="activeAct.id"
                    placeholder="Start typing equipment name, serial, location"
                  >
                  <datalist :id="`work-act-equipment-options-${activeAct.id}`">
                    <option
                      v-for="eq in workActCandidateEquipment(sourceJob)"
                      :key="eq.id"
                      :value="workActEquipmentOptionLabel(eq)"
                    />
                  </datalist>
                </label>
                <VmButton compact :data-work-act-equipment-add="activeAct.id">Add equipment</VmButton>
              </div>

              <div class="work-act-selected-equipment">
                <div
                  v-for="item in selectedEquipment(activeAct)"
                  :key="item.equipmentId"
                  class="work-act-selected-eq"
                >
                  <span>
                    <strong>{{ item.name }}</strong>
                    <em>{{ item.serial || "No serial" }} / {{ item.location || item.category || "Equipment" }}</em>
                  </span>
                  <VmButton
                    compact
                    variant="ghost"
                    :aria-label="`Remove ${item.name}`"
                    :data-work-act-equipment-remove="`${activeAct.id}:${item.equipmentId}`"
                  >
                    X
                  </VmButton>
                </div>
                <div v-if="!selectedEquipment(activeAct).length" class="modal-placeholder">No equipment selected yet.</div>
              </div>
            </div>

            <div class="tg-command-bar compact">
              <label class="filter-control">
                <span>Template</span>
                <VmSelect
                  :model-value="activeAct.workTemplateId || ''"
                  :options="templateOptionsForAct(activeAct)"
                  :data-work-act-template="activeAct.id"
                />
              </label>
              <div class="tg-action-cluster">
                <VmButton compact variant="ghost" :data-work-act-apply-template="activeAct.id">Apply template</VmButton>
                <VmButton compact variant="ghost" :data-work-act-add-row="activeAct.id">Add row</VmButton>
                <VmButton compact variant="primary" :data-work-act-generate="activeAct.id">
                  {{ activeAct.generatedDocumentId ? "Update PDF draft" : "Create PDF draft" }}
                </VmButton>
                <VmButton
                  compact
                  variant="dark"
                  :data-work-act-generate-template="activeAct.id"
                >
                  {{ generatedFileForAct(activeAct) ? "Regenerate from template" : "Generate from template" }}
                </VmButton>
                <VmButton
                  v-if="activeAct.generatedDocumentId"
                  compact
                  variant="ghost"
                  :data-doc-preview-open="activeAct.generatedDocumentId"
                >
                  Preview
                </VmButton>
              </div>
            </div>

            <label class="field work-act-text">
              <span>Work Description</span>
              <textarea
                rows="3"
                :data-work-act-text="activeAct.id"
                :value="activeAct.workText || ''"
                placeholder="Short customer-facing work summary"
              />
            </label>

            <div class="work-act-section">
              <div class="detail-group-title">Work: List ({{ workRows(activeAct).length }})</div>
              <table v-if="workRows(activeAct).length" class="data-table work-act-table">
                <thead>
                  <tr><th>Nr.</th><th>Description</th><th>Completed</th><th>Comments</th></tr>
                </thead>
                <tbody>
                  <tr v-for="row in workRows(activeAct)" :key="row.id">
                    <td class="mono">{{ row.number }}</td>
                    <td>
                      <input
                        class="inline-input wide"
                        :data-work-act-row-description="`${activeAct.id}:${row.id}`"
                        :value="row.description"
                        placeholder="Work description"
                      >
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        :data-work-act-row-completed="`${activeAct.id}:${row.id}`"
                        :checked="Boolean(row.completed)"
                      >
                    </td>
                    <td>
                      <input
                        class="inline-input"
                        :data-work-act-row-comment="`${activeAct.id}:${row.id}`"
                        :value="row.comments || ''"
                        placeholder="Comment"
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="modal-placeholder">Apply a template or add a row.</div>
            </div>
          </div>
        </div>

        <div v-if="workActs.length" class="detail-block">
          <div class="detail-group-title">All Work Acts ({{ visibleWorkActs.length }} of {{ workActs.length }})</div>
          <div class="tg-filter-strip work-act-list-filters">
            <label class="filter-control doc-search-text">
              <span>Search</span>
              <input
                type="search"
                data-work-act-search
                :value="state.workActSearchQuery"
                placeholder="Number, job, customer, equipment"
              >
            </label>
            <label class="filter-control">
              <span>Status</span>
              <VmSelect
                :model-value="state.workActStatusFilter"
                :options="workActStatusOptions()"
                data-work-act-status-filter
              />
            </label>
            <div></div>
            <div class="tg-section-subtitle">Results update while typing.</div>
          </div>

          <table v-if="visibleWorkActs.length" class="data-table work-act-list-table">
            <thead>
              <tr><th>Work Act Nr.</th><th>Work</th><th>Equipment</th><th>Systems</th><th>Hospital</th><th>Type</th><th>Contract</th><th>Status</th></tr>
            </thead>
            <tbody>
              <template v-for="group in groupedWorkActs" :key="group.label">
                <tr class="work-act-group-row">
                  <td colspan="8">{{ group.label }}: {{ group.rows.length }} work act(s)</td>
                </tr>
                <tr
                  v-for="act in group.rows"
                  :key="act.id"
                  :class="{ selected: act.id === activeAct?.id }"
                  :data-work-act-select="act.id"
                >
                  <td class="mono">{{ act.number || act.id }}</td>
                  <td>{{ act.workText || act.workDescription || "-" }}</td>
                  <td>{{ selectedEquipment(act).map((item) => item.name).join(", ") || "-" }}</td>
                  <td>{{ selectedEquipment(act).map((item) => item.serial).filter(Boolean).join(" / ") || "-" }}</td>
                  <td>{{ act.customer || "-" }}</td>
                  <td>{{ act.type || "-" }}</td>
                  <td>{{ workActContractLabel(act) }}</td>
                  <td><VmStatusChip :status="act.status || 'Draft'" /></td>
                </tr>
              </template>
            </tbody>
          </table>
          <div v-else class="modal-placeholder">No Work Acts match the current filters.</div>
        </div>

        <div v-else class="info-box">
          <div class="info-title">No Work Acts yet</div>
          <div class="info-body">Create a Work Act from a Service job first.</div>
        </div>
      </section>

      <details class="dev-spec">
        <summary class="dev-spec-summary">DEV REFERENCE - Work Acts</summary>
        <div class="dev-spec-body">
          <div class="ds-row"><span class="ds-label">Purpose</span><p class="ds-value">Concrete Work Act source records for Service jobs.</p></div>
          <div class="ds-row"><span class="ds-label">Actions</span><p class="ds-value">Create/open one Work Act per job / add equipment / choose Template / edit rows / create and generate PDF.</p></div>
          <div class="ds-row"><span class="ds-label">Boundary</span><p class="ds-value">Reusable Templates stay in Templates. Generated and signed file custody stays in Documents.</p></div>
        </div>
      </details>
    </div>
  </main>
</template>
