<script setup>
import { computed, nextTick, onErrorCaptured, ref, watch } from "vue";
import { UmoEditor } from "@umoteam/editor";
import "@umoteam/editor/style";
import { VmButton } from "../ui/index.js";
import { createEditorSnapshot, htmlToPlainText, normaliseEditorMergeFields } from "./editorContent.js";

const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  },
  title: {
    type: String,
    default: "Document"
  },
  mergeFields: {
    type: Array,
    default: () => []
  },
  readonly: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: ""
  },
  minHeight: {
    type: Number,
    default: 620
  }
});

const emit = defineEmits([
  "dirty-change",
  "error",
  "ready",
  "save",
  "update:modelValue"
]);

const umoRef = ref(null);
const fallbackRef = ref(null);
const boundaryRef = ref(null);
const localHtml = ref(props.modelValue || "");
const isDirty = ref(false);
const isReady = ref(false);
const runtimeFailed = ref(false);
const runtimeMessage = ref("");

const editorId = `umo-editor-${Math.random().toString(36).slice(2, 10)}`;

const fieldsForInsertion = computed(() => normaliseEditorMergeFields(props.mergeFields));

const editorOptions = computed(() => ({
  editorKey: editorId,
  locale: "en-US",
  theme: "light",
  skin: "default",
  height: `${props.minHeight}px`,
  cdnUrl: "",
  toolbar: {
    showSaveLabel: true,
    defaultMode: "classic",
    menus: ["base", "insert", "table", "page", "view", "export"]
  },
  page: {
    layouts: ["page"],
    defaultMargin: {
      left: 2.2,
      right: 2.2,
      top: 2,
      bottom: 2
    },
    defaultOrientation: "portrait",
    defaultBackground: "#fff",
    showBreakMarks: true,
    showLineNumber: false,
    showBookmark: false,
    showToc: false
  },
  document: {
    title: props.title,
    content: localHtml.value,
    placeholder: "Write reusable template content...",
    enableSpellcheck: true,
    enableMarkdown: true,
    enableBubbleMenu: true,
    enableBlockMenu: true,
    readOnly: props.readonly,
    autofocus: false,
    autoSave: {
      enabled: false,
      interval: 300000
    },
    parseOptions: {
      preserveWhitespace: "full"
    }
  },
  file: {
    allowedMimeTypes: [],
    maxSize: 0,
    preview: []
  },
  webPages: [],
  users: [],
  disableExtensions: [
    "audio",
    "blockMath",
    "diagrams",
    "echarts",
    "file",
    "iframe",
    "image",
    "inlineImage",
    "inlineMath",
    "math",
    "mermaid",
    "video",
    "web-page"
  ],
  async onSave(content) {
    const rawContent = content || await readUmoSnapshot();
    const snapshot = createEditorSnapshot(rawContent);
    updateLocalContent(snapshot.html, { dirty: false });
    emit("save", snapshot);
    return { status: "success", message: "Saved", showMessage: false };
  },
  async onFileUpload() {
    throw new Error("File upload from the editor is not enabled for templates.");
  },
  onFileDelete() {}
}));

watch(
  () => props.modelValue,
  async (html) => {
    const nextHtml = html || "";
    if (nextHtml === localHtml.value) return;
    localHtml.value = nextHtml;
    isDirty.value = false;
    emit("dirty-change", false);
    if (isReady.value && !runtimeFailed.value) {
      await setUmoContent(nextHtml, { emitUpdate: false });
    }
  }
);

watch(
  () => props.readonly,
  (readonly) => {
    try {
      umoRef.value?.setReadOnly?.(readonly);
    } catch (error) {
      reportError(error);
    }
  }
);

onErrorCaptured((error) => {
  runtimeFailed.value = true;
  reportError(error);
  return false;
});

async function handleCreated() {
  isReady.value = true;
  emit("ready");
  await nextTick();
  await setUmoContent(localHtml.value, { emitUpdate: false });
}

function handleChanged() {
  markDirty();
}

function handleFallbackInput(event) {
  updateLocalContent(event.currentTarget.innerHTML, { dirty: true });
}

function updateLocalContent(html, { dirty }) {
  localHtml.value = html || "";
  emit("update:modelValue", localHtml.value);
  if (isDirty.value !== dirty) {
    isDirty.value = dirty;
    emit("dirty-change", dirty);
  }
}

function markDirty() {
  if (!isDirty.value) {
    isDirty.value = true;
    emit("dirty-change", true);
  }
}

async function requestSave() {
  const snapshot = await getSnapshot();
  updateLocalContent(snapshot.html, { dirty: false });
  emit("save", snapshot);
  return snapshot;
}

async function getSnapshot() {
  if (!runtimeFailed.value && umoRef.value) {
    try {
      return createEditorSnapshot(await readUmoSnapshot());
    } catch (error) {
      reportError(error);
    }
  }

  const html = fallbackRef.value?.innerHTML || localHtml.value || "";
  return createEditorSnapshot({
    html,
    text: htmlToPlainText(html)
  });
}

async function readUmoSnapshot() {
  return {
    html: umoRef.value?.getHTML?.() || umoRef.value?.getContent?.("html") || localHtml.value || "",
    text: umoRef.value?.getText?.() || umoRef.value?.getContent?.("text") || "",
    json: umoRef.value?.getJSON?.() || umoRef.value?.getContent?.("json") || null
  };
}

async function setUmoContent(html, options = {}) {
  try {
    umoRef.value?.setContent?.(html || "", {
      emitUpdate: options.emitUpdate ?? false,
      focusPosition: "start",
      focusOptions: { scrollIntoView: false }
    });
  } catch (error) {
    reportError(error);
  }
}

async function insertToken(field) {
  const token = field?.token || "";
  if (!token || props.readonly) return;

  if (!runtimeFailed.value && umoRef.value?.insertContent) {
    try {
      umoRef.value.insertContent(token, {
        updateSelection: true,
        focusPosition: "end",
        focusOptions: { scrollIntoView: false }
      });
      markDirty();
      return;
    } catch (error) {
      reportError(error);
    }
  }

  insertTextIntoFallback(token);
}

function insertTextIntoFallback(text) {
  const editor = fallbackRef.value;
  if (!editor) return;
  editor.focus();
  const selection = window.getSelection();
  if (!selection?.rangeCount) {
    editor.append(document.createTextNode(text));
  } else {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  updateLocalContent(editor.innerHTML, { dirty: true });
}

function handleBoundaryKeydown(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement) || !isEditorBodyTarget(target)) return;

  if (event.key === "Tab") {
    event.preventDefault();
    event.stopPropagation();
    focusOutsideEditor(event.shiftKey ? -1 : 1);
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    boundaryRef.value?.querySelector("button:not([disabled])")?.focus({ preventScroll: true });
  }
}

function isEditorBodyTarget(target) {
  return Boolean(
    target.closest(".ProseMirror") ||
    target.closest(".umo-editor-fallback-paper")
  );
}

function focusOutsideEditor(direction = 1) {
  const boundary = boundaryRef.value;
  if (!boundary) return;

  const focusable = Array.from(document.querySelectorAll(
    [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled]):not([type='hidden'])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])"
    ].join(",")
  )).filter(isVisibleFocusable);

  const boundaryIndexes = focusable
    .map((element, index) => boundary.contains(element) ? index : -1)
    .filter((index) => index >= 0);

  if (!boundaryIndexes.length) {
    boundary.focus({ preventScroll: true });
    return;
  }

  const edgeIndex = direction > 0 ? Math.max(...boundaryIndexes) : Math.min(...boundaryIndexes);
  const nextElement = focusable[edgeIndex + direction];
  if (nextElement) {
    nextElement.focus({ preventScroll: false });
    return;
  }

  boundary.focus({ preventScroll: true });
}

function isVisibleFocusable(element) {
  return Boolean(
    element instanceof HTMLElement &&
    !element.hasAttribute("disabled") &&
    element.getAttribute("aria-hidden") !== "true" &&
    (element.offsetWidth || element.offsetHeight || element.getClientRects().length)
  );
}

function reportError(error) {
  const message = error?.message || "Editor runtime error";
  runtimeMessage.value = message;
  emit("error", message);
}

defineExpose({
  focusEditor() {
    if (!runtimeFailed.value) {
      umoRef.value?.focus?.("start", { scrollIntoView: true });
      return;
    }
    fallbackRef.value?.focus();
  },
  getSnapshot,
  insertToken,
  printDocument() {
    if (!runtimeFailed.value && umoRef.value?.print) {
      umoRef.value.print();
      return;
    }
    window.print();
  },
  requestSave,
  setContent(html) {
    updateLocalContent(html || "", { dirty: false });
    return setUmoContent(html || "", { emitUpdate: false });
  }
});
</script>

<template>
  <div
    ref="boundaryRef"
    class="umo-document-editor-boundary"
    :class="{ 'is-dirty': isDirty, 'is-readonly': readonly, 'has-runtime-fallback': runtimeFailed }"
    tabindex="-1"
    :aria-describedby="`${editorId}-keyboard-hint`"
    @keydown.ctrl.s.prevent="requestSave"
    @keydown.meta.s.prevent="requestSave"
    @keydown.capture="handleBoundaryKeydown"
  >
    <div class="umo-document-editor-header">
      <div>
        <div class="detail-group-title">{{ title }}</div>
        <div class="filter-note">{{ status || (isDirty ? "Unsaved content changes" : "Editor ready") }}</div>
      </div>
      <VmButton compact variant="ghost" :disabled="readonly" @click="requestSave">Save content</VmButton>
    </div>

    <div v-if="fieldsForInsertion.length" class="umo-merge-toolbar" role="toolbar" aria-label="Insert template data field">
      <span>Insert data field</span>
      <button
        v-for="field in fieldsForInsertion"
        :key="field.key"
        type="button"
        class="umo-merge-token"
        :disabled="readonly"
        :title="field.description || field.example || field.label"
        @click="insertToken(field)"
      >
        {{ field.token }}
      </button>
    </div>

    <div class="umo-editor-a4-stage" :style="{ minHeight: `${minHeight}px` }">
      <UmoEditor
        v-if="!runtimeFailed"
        ref="umoRef"
        class="umo-editor-runtime"
        v-bind="editorOptions"
        @created="handleCreated"
        @changed="handleChanged"
      />
      <div
        v-else
        ref="fallbackRef"
        class="umo-editor-fallback-paper"
        :contenteditable="!readonly"
        spellcheck="true"
        tabindex="0"
        role="textbox"
        aria-multiline="true"
        aria-label="Document content editor"
        @input="handleFallbackInput"
        v-html="localHtml"
      ></div>
    </div>

    <div :id="`${editorId}-keyboard-hint`" class="umo-editor-keyboard-hint">
      Ctrl+S saves. Tab exits the document body; use the toolbar buttons above to insert template data fields.
    </div>

    <div v-if="runtimeMessage" class="form-error">{{ runtimeMessage }}</div>
  </div>
</template>

<style scoped>
.umo-document-editor-boundary {
  background: var(--wb);
  border: 1px solid var(--wb-dark);
  border-radius: var(--r);
  display: grid;
  gap: 10px;
  min-width: 0;
  padding: 10px;
}

.umo-document-editor-header {
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

.umo-merge-toolbar {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.umo-merge-toolbar span {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.umo-merge-token {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  cursor: pointer;
  font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
  font-size: 11px;
  min-height: 28px;
  padding: 4px 7px;
}

.umo-merge-token:hover,
.umo-merge-token:focus-visible {
  border-color: var(--brand);
  outline: 2px solid rgba(47, 128, 237, .18);
  outline-offset: 1px;
}

.umo-merge-token:disabled {
  cursor: not-allowed;
  opacity: .55;
}

.umo-editor-a4-stage {
  background: #dfe3e8;
  border: 1px solid var(--paper-border);
  border-radius: var(--r);
  min-width: 0;
  overflow: hidden;
}

.umo-editor-keyboard-hint {
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.4;
}

.umo-editor-runtime {
  min-height: inherit;
}

.umo-editor-fallback-paper {
  background: var(--paper-bg);
  color: var(--paper-text);
  font-family: "Times New Roman", Times, serif;
  font-size: 13px;
  line-height: 1.45;
  margin: 18px auto;
  max-width: 794px;
  min-height: 540px;
  outline: none;
  padding: 54px 58px;
  width: calc(100% - 36px);
}

.umo-editor-fallback-paper:focus {
  box-shadow: 0 0 0 2px rgba(47, 128, 237, .28);
}

:deep(.umo-editor-container) {
  border: 0;
  min-height: inherit;
}

:deep(.umo-main) {
  background: #dfe3e8;
}

:deep(.umo-page-content) {
  background: #fff;
  color: #111827;
}

@media (max-width: 720px) {
  .umo-document-editor-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .umo-editor-fallback-paper {
    margin: 10px;
    min-height: 360px;
    padding: 28px 24px;
    width: auto;
  }
}
</style>
