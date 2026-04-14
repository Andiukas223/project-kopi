import { bugReports, users } from "./data.js";
import { state } from "./state.js";

const FEEDBACK_API = "/api/documents/feedback/reports";

let renderAppCallback = null;
let drawing = false;
let lastPoint = null;
let selecting = false;
let selectionStart = null;
let selectionPointerId = null;

export function bindFeedback(renderApp) {
  renderAppCallback = renderApp;

  document.addEventListener("click", handleFeedbackClick);
  document.addEventListener("change", (event) => { void handleFeedbackChange(event); });
  document.addEventListener("input", handleFeedbackInput);
  document.addEventListener("pointerdown", handleSelectionPointerDown);
  document.addEventListener("pointermove", handleSelectionPointerMove);
  document.addEventListener("pointerup", handleSelectionPointerUp);
  document.addEventListener("pointercancel", cancelSelectionPointer);
  document.addEventListener("pointerdown", handleCanvasPointerDown);
  document.addEventListener("pointermove", handleCanvasPointerMove);
  document.addEventListener("pointerup", stopDrawing);
  document.addEventListener("pointercancel", stopDrawing);
  window.addEventListener("resize", queueCanvasSync);

  queueFeedbackBackendLoad();
}

async function handleFeedbackClick(event) {
  const open = event.target.closest("[data-feedback-open]");
  if (open) {
    event.preventDefault();
    await openFeedbackSnipping(open);
    return;
  }

  const selectionCancel = event.target.closest("[data-feedback-selection-cancel]");
  if (selectionCancel) {
    closeFeedbackReporter();
    return;
  }

  const cancel = event.target.closest("[data-feedback-cancel]");
  if (cancel) {
    closeFeedbackReporter();
    return;
  }

  const clear = event.target.closest("[data-feedback-clear]");
  if (clear) {
    clearFeedbackDrawing();
    return;
  }

  const annotateToggle = event.target.closest("[data-feedback-annotate-toggle]");
  if (annotateToggle) {
    syncFeedbackDraftFromDom();
    if (state.feedbackAnnotating) {
      state.feedbackScreenshotDataUrl = await composeAnnotatedScreenshot();
    }
    state.feedbackAnnotating = !state.feedbackAnnotating;
    renderFeedback();
    queueCanvasSync();
    return;
  }

  const save = event.target.closest("[data-feedback-save]");
  if (save) {
    await saveFeedbackReport();
    return;
  }

  const refresh = event.target.closest("[data-feedback-refresh]");
  if (refresh) {
    await loadFeedbackReports({ force: true });
    return;
  }

  const select = event.target.closest("[data-feedback-select]");
  if (select && state.role === "admin") {
    state.selectedBugReportId = select.dataset.feedbackSelect;
    renderFeedback();
    return;
  }

  const status = event.target.closest("[data-feedback-status]");
  if (status && state.role === "admin") {
    const [id, nextStatus] = status.dataset.feedbackStatus.split(":");
    await updateBugReport(id, { status: nextStatus });
    return;
  }

  const nav = event.target.closest("[data-nav]");
  const role = event.target.closest("[data-role]");
  if (nav?.dataset.nav === "admin" || role) {
    queueFeedbackBackendLoad();
  }
}

async function handleFeedbackChange(event) {
  if (event.target.matches("[data-feedback-status-filter]")) {
    state.feedbackStatusFilter = event.target.value;
    renderFeedback();
    return;
  }

  if (event.target.matches("[data-feedback-assignee-filter]")) {
    state.feedbackAssigneeFilter = event.target.value;
    renderFeedback();
    return;
  }

  if (event.target.matches("[data-feedback-assignee]") && state.role === "admin") {
    await updateBugReport(event.target.dataset.feedbackAssignee, { assignee: event.target.value });
  }
}

function handleFeedbackInput(event) {
  if (event.target.id === "feedback-comment") {
    state.feedbackCommentDraft = event.target.value;
  }
}

async function openFeedbackSnipping(button) {
  state.feedbackSavedNotice = "";
  state.feedbackError = "";
  state.feedbackOpen = false;
  state.feedbackSelecting = false;
  state.feedbackAnnotating = false;
  state.feedbackScreenshotDataUrl = "";
  state.feedbackCaptureDataUrl = "";
  state.feedbackCommentDraft = "";

  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Preparing snip...";

  try {
    state.feedbackCaptureDataUrl = await captureCurrentScreen();
  } catch (error) {
    state.feedbackCaptureDataUrl = fallbackScreenshot(error);
  } finally {
    state.feedbackSelecting = true;
    renderFeedback();
    button.disabled = false;
    button.textContent = originalText;
  }
}

function closeFeedbackReporter() {
  state.feedbackOpen = false;
  state.feedbackSelecting = false;
  state.feedbackAnnotating = false;
  state.feedbackCaptureDataUrl = "";
  state.feedbackScreenshotDataUrl = "";
  state.feedbackCommentDraft = "";
  state.feedbackError = "";
  selecting = false;
  selectionStart = null;
  selectionPointerId = null;
  renderFeedback();
}

function clearFeedbackDrawing() {
  const canvas = document.getElementById("feedback-annotation-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

async function saveFeedbackReport() {
  syncFeedbackDraftFromDom();
  const errorEl = document.querySelector("[data-feedback-error]");
  const comment = String(state.feedbackCommentDraft || "").trim();

  if (!comment) {
    if (errorEl) errorEl.textContent = "Short comment is required.";
    return;
  }

  const screenshot = await composeAnnotatedScreenshot();
  const payload = {
    comment,
    screenshot,
    rawScreenshot: state.feedbackScreenshotDataUrl,
    createdBy: currentUserName(),
    role: state.role,
    page: state.page,
    context: feedbackContext()
  };

  try {
    const report = await createFeedbackReport(payload);
    mergeFeedbackReport(report);
    state.selectedBugReportId = report.id;
    state.feedbackBackendStatus = `Backend saved ${report.id}`;
  } catch (error) {
    if (errorEl) errorEl.textContent = error.message || "Feedback backend unavailable.";
    state.feedbackBackendStatus = "Backend save failed";
    return;
  }

  state.feedbackOpen = false;
  state.feedbackSelecting = false;
  state.feedbackAnnotating = false;
  state.feedbackCaptureDataUrl = "";
  state.feedbackScreenshotDataUrl = "";
  state.feedbackCommentDraft = "";
  state.feedbackError = "";
  state.feedbackSavedNotice = "Issue sent to admin.";
  renderFeedback();
}

async function loadFeedbackReports({ force = false } = {}) {
  if (state.role !== "admin") return;
  if (!force && state.feedbackBackendStatus === "Backend synced") return;

  try {
    const response = await fetch(FEEDBACK_API, {
      headers: { "X-VM-Role": state.role }
    });
    const result = await readJsonResponse(response, "Could not load feedback reports");
    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Could not load feedback reports.");
    }

    bugReports.splice(0, bugReports.length, ...(result.reports || []));
    if (state.selectedBugReportId && !bugReports.some((item) => item.id === state.selectedBugReportId)) {
      state.selectedBugReportId = null;
    }
    state.feedbackBackendStatus = "Backend synced";
  } catch (error) {
    state.feedbackBackendStatus = error.message || "Feedback backend unavailable.";
  }

  renderFeedback();
}

async function createFeedbackReport(payload) {
  const response = await fetch(FEEDBACK_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-VM-Role": state.role
    },
    body: JSON.stringify(payload)
  });
  const result = await readJsonResponse(response, "Could not save feedback report");
  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Could not save feedback report.");
  }
  return result.report;
}

async function updateBugReport(id, patch) {
  try {
    const response = await fetch(`${FEEDBACK_API}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-VM-Role": state.role
      },
      body: JSON.stringify({ ...patch, by: currentUserName() })
    });
    const result = await readJsonResponse(response, "Could not update feedback report");
    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Could not update feedback report.");
    }

    mergeFeedbackReport(result.report);
    state.feedbackBackendStatus = "Backend synced";
  } catch (error) {
    state.feedbackBackendStatus = error.message || "Feedback backend unavailable.";
  }

  renderFeedback();
}

async function readJsonResponse(response, fallbackMessage) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    const compactText = text.replace(/\s+/g, " ").trim().slice(0, 180);
    const status = [response.status, response.statusText].filter(Boolean).join(" ");
    throw new Error(`${fallbackMessage}. Server returned ${status || "a non-JSON response"}${compactText ? `: ${compactText}` : "."}`);
  }
}

function mergeFeedbackReport(report) {
  const index = bugReports.findIndex((item) => item.id === report.id);
  if (index >= 0) bugReports.splice(index, 1, report);
  else bugReports.unshift(report);
}

function queueFeedbackBackendLoad() {
  window.setTimeout(() => {
    void loadFeedbackReports({ force: true });
  }, 0);
}

function handleSelectionPointerDown(event) {
  if (!state.feedbackSelecting) return;
  const surface = event.target.closest("[data-feedback-snipping-surface]");
  if (!surface || event.target.closest("[data-feedback-selection-cancel]")) return;

  event.preventDefault();
  surface.setPointerCapture?.(event.pointerId);
  selecting = true;
  selectionPointerId = event.pointerId;
  selectionStart = { x: event.clientX, y: event.clientY };
  updateSelectionBox(rectFromPoints(selectionStart, selectionStart));
}

function handleSelectionPointerMove(event) {
  if (!selecting || !state.feedbackSelecting || event.pointerId !== selectionPointerId) return;
  event.preventDefault();
  updateSelectionBox(rectFromPoints(selectionStart, { x: event.clientX, y: event.clientY }));
}

async function handleSelectionPointerUp(event) {
  if (!selecting || !state.feedbackSelecting || event.pointerId !== selectionPointerId) return;
  event.preventDefault();

  const rect = rectFromPoints(selectionStart, { x: event.clientX, y: event.clientY });
  selecting = false;
  selectionStart = null;
  selectionPointerId = null;

  if (rect.width < 24 || rect.height < 24) {
    state.feedbackError = "Drag a larger area to capture.";
    renderFeedback();
    return;
  }

  state.feedbackScreenshotDataUrl = await cropScreenshot(state.feedbackCaptureDataUrl, rect);
  state.feedbackCaptureDataUrl = "";
  state.feedbackSelecting = false;
  state.feedbackOpen = true;
  state.feedbackAnnotating = true;
  state.feedbackError = "";
  renderFeedback();
  queueCanvasSync();
}

function cancelSelectionPointer() {
  selecting = false;
  selectionStart = null;
  selectionPointerId = null;
}

function rectFromPoints(a, b) {
  const left = Math.max(0, Math.min(a.x, b.x));
  const top = Math.max(0, Math.min(a.y, b.y));
  const right = Math.min(window.innerWidth, Math.max(a.x, b.x));
  const bottom = Math.min(window.innerHeight, Math.max(a.y, b.y));
  return {
    left,
    top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top)
  };
}

function updateSelectionBox(rect) {
  const box = document.querySelector("[data-feedback-selection-box]");
  if (!box) return;
  box.hidden = false;
  box.style.left = `${rect.left}px`;
  box.style.top = `${rect.top}px`;
  box.style.width = `${rect.width}px`;
  box.style.height = `${rect.height}px`;
}

async function cropScreenshot(dataUrl, rect) {
  const image = await loadImage(dataUrl);
  const scaleX = (image.naturalWidth || image.width) / Math.max(1, window.innerWidth);
  const scaleY = (image.naturalHeight || image.height) / Math.max(1, window.innerHeight);
  const sourceX = Math.max(0, Math.round(rect.left * scaleX));
  const sourceY = Math.max(0, Math.round(rect.top * scaleY));
  const sourceW = Math.max(1, Math.round(rect.width * scaleX));
  const sourceH = Math.max(1, Math.round(rect.height * scaleY));

  const canvas = document.createElement("canvas");
  canvas.width = sourceW;
  canvas.height = sourceH;
  canvas.getContext("2d").drawImage(image, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);
  return canvas.toDataURL("image/png");
}

function handleCanvasPointerDown(event) {
  if (event.target.id !== "feedback-annotation-canvas") return;
  event.preventDefault();

  const canvas = event.target;
  syncCanvasSize();
  canvas.setPointerCapture?.(event.pointerId);
  drawing = true;
  lastPoint = canvasPoint(canvas, event);
}

function handleCanvasPointerMove(event) {
  if (!drawing || event.target.id !== "feedback-annotation-canvas") return;
  event.preventDefault();

  const canvas = event.target;
  const point = canvasPoint(canvas, event);
  const ctx = canvas.getContext("2d");
  const lineWidth = Math.max(5, canvas.width * 0.006);

  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--issue-red").trim() || "#d71920";
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(lastPoint.x, lastPoint.y);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();

  lastPoint = point;
}

function stopDrawing() {
  drawing = false;
  lastPoint = null;
}

function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function queueCanvasSync() {
  if (!state.feedbackOpen || !state.feedbackAnnotating) return;
  requestAnimationFrame(syncCanvasSize);
}

function syncFeedbackDraftFromDom() {
  const commentEl = document.getElementById("feedback-comment");
  if (commentEl) state.feedbackCommentDraft = commentEl.value;
}

function syncCanvasSize() {
  const image = document.getElementById("feedback-screenshot-img");
  const canvas = document.getElementById("feedback-annotation-canvas");
  if (!image || !canvas) return;

  if (!image.complete || !image.naturalWidth) {
    image.addEventListener("load", syncCanvasSize, { once: true });
    return;
  }

  if (canvas.width !== image.naturalWidth || canvas.height !== image.naturalHeight) {
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    clearFeedbackDrawing();
  }
}

async function composeAnnotatedScreenshot() {
  const baseDataUrl = state.feedbackScreenshotDataUrl;
  const overlay = document.getElementById("feedback-annotation-canvas");
  const base = await loadImage(baseDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = base.naturalWidth || base.width;
  canvas.height = base.naturalHeight || base.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(base, 0, 0, canvas.width, canvas.height);
  if (overlay) {
    ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
  }
  return canvas.toDataURL("image/png");
}

async function captureCurrentScreen() {
  if (shouldUseNativeScreenCapture()) {
    try {
      return await captureWithDisplayMedia();
    } catch (error) {
      console.warn("Screen capture unavailable; using DOM snapshot fallback.", error);
    }
  }

  try {
    return await captureDomSnapshot();
  } catch (error) {
    console.warn("DOM screenshot fallback unavailable; using diagnostic capture.", error);
    return fallbackScreenshot(error);
  }
}

function shouldUseNativeScreenCapture() {
  const userAgent = navigator.userAgent || "";
  return !navigator.webdriver
    && !userAgent.includes("HeadlessChrome")
    && !!navigator.mediaDevices?.getDisplayMedia
    && window.isSecureContext;
}

async function captureWithDisplayMedia() {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      cursor: "always",
      displaySurface: "browser"
    },
    audio: false,
    preferCurrentTab: true,
    selfBrowserSurface: "include"
  });

  try {
    const video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    await video.play();
    await waitForVideoFrame(video);

    const width = video.videoWidth || window.innerWidth;
    const height = video.videoHeight || window.innerHeight;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, width, height);
    if (canvasLooksBlank(canvas)) {
      await waitForVideoFrame(video);
      ctx.drawImage(video, 0, 0, width, height);
    }
    return canvas.toDataURL("image/png");
  } finally {
    stream.getTracks().forEach((track) => track.stop());
  }
}

function waitForVideoFrame(video) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => finish(reject, new Error("Screen capture frame timed out.")), 5000);

    function finish(done, value) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      done(value);
    }

    function waitForPaintedFrame() {
      if (!video.videoWidth || !video.videoHeight) return;

      if (typeof video.requestVideoFrameCallback === "function") {
        video.requestVideoFrameCallback(() => finish(resolve));
        return;
      }

      requestAnimationFrame(() => requestAnimationFrame(() => finish(resolve)));
    }

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      waitForPaintedFrame();
      return;
    }

    video.addEventListener("loadeddata", waitForPaintedFrame, { once: true });
    video.addEventListener("canplay", waitForPaintedFrame, { once: true });
    video.addEventListener("error", () => finish(reject, new Error("Screen capture video could not load.")), { once: true });
  });
}

async function captureDomSnapshot() {
  const width = Math.max(1, window.innerWidth);
  const height = Math.max(1, window.innerHeight);
  const bodyClone = document.body.cloneNode(true);
  const theme = document.documentElement.dataset.theme || state.theme || "light";
  const bodyStyle = getComputedStyle(document.body);
  const background = bodyStyle.backgroundColor || "#f6f8fb";

  bodyClone.querySelectorAll("script, [data-feedback-ignore], .feedback-overlay").forEach((node) => node.remove());
  syncControlValues(document.body, bodyClone);

  const html = `
    <html xmlns="http://www.w3.org/1999/xhtml" data-theme="${theme}">
      <head>
        <style>
          ${collectStyleText()}
          html, body { width:${width}px; height:${height}px; margin:0; overflow:hidden; background:${background}; }
          * { box-sizing:border-box; }
        </style>
      </head>
      <body>${bodyClone.innerHTML}</body>
    </html>
  `;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <foreignObject width="100%" height="100%">${html}</foreignObject>
    </svg>
  `;

  const image = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, 3500);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/png");
}

function syncControlValues(liveRoot, cloneRoot) {
  const liveControls = [...liveRoot.querySelectorAll("input, textarea, select")];
  const cloneControls = [...cloneRoot.querySelectorAll("input, textarea, select")];

  liveControls.forEach((live, index) => {
    const clone = cloneControls[index];
    if (!clone) return;

    if (live.tagName === "TEXTAREA") {
      clone.textContent = live.value;
      return;
    }

    if (live.tagName === "SELECT") {
      [...clone.options].forEach((option) => {
        option.selected = option.value === live.value;
      });
      return;
    }

    if (live.type === "checkbox" || live.type === "radio") {
      if (live.checked) clone.setAttribute("checked", "checked");
      else clone.removeAttribute("checked");
      return;
    }

    clone.setAttribute("value", live.value);
  });
}

function collectStyleText() {
  return [...document.styleSheets].map((sheet) => {
    try {
      return [...sheet.cssRules].map((rule) => rule.cssText).join("\n");
    } catch {
      return "";
    }
  }).join("\n");
}

function fallbackScreenshot(error) {
  const width = Math.max(800, window.innerWidth || 800);
  const height = Math.max(500, window.innerHeight || 500);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const rootStyle = getComputedStyle(document.documentElement);
  const bg = rootStyle.getPropertyValue("--bg").trim() || "#f6f8fb";
  const text = rootStyle.getPropertyValue("--text").trim() || "#1f2a37";

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = text;
  ctx.font = "24px Arial";
  ctx.fillText("Screenshot fallback", 40, 70);
  ctx.font = "16px Arial";
  ctx.fillText(`Page: ${state.page}`, 40, 110);
  ctx.fillText(`Role: ${state.role}`, 40, 138);
  ctx.fillText(`Reason: ${error?.message || "Browser capture failed"}`, 40, 166);
  return canvas.toDataURL("image/png");
}

function canvasLooksBlank(canvas) {
  let sample;
  try {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    sample = ctx.getImageData(0, 0, Math.max(1, Math.min(canvas.width, 64)), Math.max(1, Math.min(canvas.height, 64))).data;
  } catch {
    return false;
  }

  let min = 255;
  let max = 0;

  for (let index = 0; index < sample.length; index += 4) {
    const alpha = sample[index + 3];
    if (alpha < 8) continue;

    const luminance = Math.round((sample[index] * 299 + sample[index + 1] * 587 + sample[index + 2] * 114) / 1000);
    min = Math.min(min, luminance);
    max = Math.max(max, luminance);
    if (max - min > 8) return false;
  }

  return true;
}

function loadImage(src, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timer = setTimeout(() => reject(new Error("Screenshot image load timed out.")), timeoutMs);
    image.onload = () => {
      clearTimeout(timer);
      resolve(image);
    };
    image.onerror = () => {
      clearTimeout(timer);
      reject(new Error("Could not load screenshot image."));
    };
    image.src = src;
  });
}

function feedbackContext() {
  return {
    url: window.location.href,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    selectedDocumentId: state.selectedDocumentId || "",
    selectedTemplateId: state.selectedTemplateId || "",
    selectedServiceJobId: state.selectedServiceJobId || "",
    selectedWorkActId: state.selectedWorkActId || "",
    selectedEquipmentId: state.selectedEquipmentId || "",
    templateGenTab: state.templateGenTab || ""
  };
}

function currentUserName() {
  const exactAdmin = state.role === "admin" ? users.find((user) => user.roles.includes("admin")) : null;
  const user = exactAdmin || users.find((item) => item.roles.includes(state.role));
  return user?.name || state.role;
}

function renderFeedback() {
  if (renderAppCallback) renderAppCallback();
}
