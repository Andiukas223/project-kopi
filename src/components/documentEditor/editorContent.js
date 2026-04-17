export const EDITOR_CONTENT_FORMAT = "umo-html";

export function createEditorSnapshot(content = {}) {
  const html = String(content.html || content.content || "");
  const text = String(content.text || htmlToPlainText(html));
  const json = content.json === undefined ? null : content.json;

  return {
    format: content.format || EDITOR_CONTENT_FORMAT,
    html,
    text,
    json,
    updatedAt: content.updatedAt || new Date().toISOString()
  };
}

export function htmlToPlainText(html = "") {
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;|&apos;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normaliseEditorMergeFields(fields = []) {
  if (!Array.isArray(fields)) return [];
  return fields
    .map((field) => {
      const key = String(field?.key || "").trim();
      if (!key) return null;
      return {
        key,
        label: String(field.label || key),
        token: String(field.token || `{d.${key}}`),
        required: Boolean(field.required),
        example: String(field.example || ""),
        description: String(field.description || "")
      };
    })
    .filter(Boolean);
}
