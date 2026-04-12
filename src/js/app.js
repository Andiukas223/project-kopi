import { bindNavigation, renderApp } from "./navigation.js";
import { bindDocumentPipeline } from "./documentPipeline.js";
import { bindServiceWizard } from "./wizard.js";
import { bindInteractions } from "./interactions.js";

renderApp();
bindNavigation();
bindDocumentPipeline(renderApp);
bindServiceWizard(renderApp);
bindInteractions(renderApp);
