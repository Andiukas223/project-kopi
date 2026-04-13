import { bindNavigation, renderApp } from "./navigation.js";
import { bindDocumentPipeline } from "./documentPipeline.js";
import { bindServiceWizard } from "./wizard.js";
import { bindInteractions } from "./interactions.js";
import { loadPersistedDemoState } from "./persistence.js";

loadPersistedDemoState();
renderApp();
bindNavigation();
bindDocumentPipeline(renderApp);
bindServiceWizard(renderApp);
bindInteractions(renderApp);
