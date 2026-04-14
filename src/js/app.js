import { bindNavigation, renderApp } from "./navigation.js";
import { bindDocumentPipeline } from "./documentPipeline.js";
import { bindFeedback } from "./feedback.js";
import { bindServiceWizard } from "./wizard.js";
import { bindInteractions } from "./interactions.js";
import { loadPersistedDemoState } from "./persistence.js";

loadPersistedDemoState();
renderApp();
bindNavigation();
bindDocumentPipeline(renderApp);
bindFeedback(renderApp);
bindServiceWizard(renderApp);
bindInteractions(renderApp);
