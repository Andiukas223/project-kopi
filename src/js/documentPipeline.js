import { documents, pipelineStages, templates } from "./data.js";
import { state } from "./state.js";

const statusByStage = {
  Draft: "Draft",
  Review: "Review",
  Customer: "Customer",
  Signature: "Signature",
  Approved: "Approved",
  Archived: "Archived"
};

let renderAppCallback = null;

export function bindDocumentPipeline(renderApp) {
  renderAppCallback = renderApp;

  document.addEventListener("click", (event) => {
    const selectButton = event.target.closest("[data-doc-select]");
    if (selectButton) {
      selectDocument(selectButton.dataset.docSelect);
      return;
    }

    const row = event.target.closest("[data-doc-row]");
    if (row && !event.target.closest("button")) {
      selectDocument(row.dataset.docRow);
      return;
    }

    const advanceButton = event.target.closest("[data-doc-advance]");
    if (advanceButton) {
      advanceDocument(advanceButton.dataset.docAdvance);
      return;
    }

    const reviewNextButton = event.target.closest("[data-doc-review-next]");
    if (reviewNextButton) {
      reviewNextDocument();
      return;
    }

    const templateButton = event.target.closest("[data-template-pick]");
    if (templateButton) {
      state.selectedTemplateId = templateButton.dataset.templatePick;
      state.generationStatus = "Ready";
      renderAppCallback();
      return;
    }

    const generateButton = event.target.closest("[data-generate-document]");
    if (generateButton) {
      generateMockDocument(generateButton.dataset.generateDocument);
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-doc-filter]")) {
      state.documentFilter = event.target.value;
      renderAppCallback();
      return;
    }

    if (event.target.matches("[data-template-select]")) {
      state.selectedTemplateId = event.target.value;
      state.generationStatus = "Ready";
      renderAppCallback();
      return;
    }

    if (event.target.matches("[data-output-format]")) {
      state.documentOutputFormat = event.target.value;
      state.generationStatus = "Ready";
      renderAppCallback();
    }
  });
}

function selectDocument(id) {
  if (!documents.some((doc) => doc.id === id)) return;
  state.selectedDocumentId = id;
  state.generationStatus = "Ready";
  renderAppCallback();
}

function advanceDocument(id) {
  const doc = documents.find((item) => item.id === id);
  if (!doc) return;

  const currentIndex = pipelineStages.indexOf(doc.pipelineStep);
  if (currentIndex < 0 || currentIndex >= pipelineStages.length - 1) return;

  const nextStage = pipelineStages[currentIndex + 1];
  doc.pipelineStep = nextStage;
  doc.status = statusByStage[nextStage];
  state.selectedDocumentId = doc.id;
  state.generationStatus = "Ready";
  renderAppCallback();
}

function reviewNextDocument() {
  const nextDoc = documents.find((doc) => doc.pipelineStep !== "Archived") || documents[0];
  if (!nextDoc) return;
  state.selectedDocumentId = nextDoc.id;
  state.documentFilter = "All";
  state.generationStatus = "Ready";
  renderAppCallback();
}

function generateMockDocument(id) {
  const doc = documents.find((item) => item.id === id);
  const template = templates.find((item) => item.id === state.selectedTemplateId);
  if (!doc || !template) return;

  state.selectedDocumentId = doc.id;
  state.generationStatus = `${state.documentOutputFormat.toUpperCase()} mock ready`;
  renderAppCallback();
}
