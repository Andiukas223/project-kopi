import { createApp } from "vue";
import App from "../app/App.vue";
import router from "../router/index.js";
import "../styles/base.css";
import "../styles/shell.css";
import "../styles/components.css";
import "../styles/pages.css";
import "../styles/wizard.css";
import { bindDocumentPipeline } from "./documentPipeline.js";
import { bindFeedback } from "./feedback.js";
import { bindServiceWizard } from "./wizard.js";
import { bindInteractions } from "./interactions.js";
import { loadPersistedDemoState } from "./persistence.js";
import {
  applyThemeToDocument,
  initializeShellRouteFromState,
  registerShellRouter,
  rerenderLegacyApp
} from "../stores/shellStore.js";

loadPersistedDemoState();
applyThemeToDocument();

registerShellRouter(router);
initializeShellRouteFromState();

const app = createApp(App);
app.use(router);

router.isReady().then(() => {
  app.mount("#vm-app");
  bindDocumentPipeline(rerenderLegacyApp);
  bindFeedback(rerenderLegacyApp);
  bindServiceWizard(rerenderLegacyApp);
  bindInteractions(rerenderLegacyApp);
  rerenderLegacyApp();
});
