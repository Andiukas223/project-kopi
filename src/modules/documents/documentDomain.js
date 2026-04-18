export function documentSourceType(record = {}) {
  return String(
    record.sourceType ||
    record.generatedFile?.sourceType ||
    record.generatedFile?.fileRecord?.sourceType ||
    record.generatedFile?.fileRecord?.meta?.sourceType ||
    ""
  ).toLowerCase();
}

export function isTemplateSourceRecord(record = {}) {
  const sourceType = documentSourceType(record);
  const type = String(record.type || record.documentType || "").toLowerCase();
  const hasSourceDocumentContext = Boolean(
    record.workActId ||
    record.defectActId ||
    record.commercialOfferDraftId ||
    record.jobId ||
    record.quotationId ||
    ["work-act", "defect-act", "commercial-offer"].includes(sourceType)
  );

  if (sourceType === "template" && !hasSourceDocumentContext) return true;
  if (type === "template document" && !hasSourceDocumentContext) return true;
  if (record.templateRecordId && !hasSourceDocumentContext) return true;
  return false;
}

export function isDocumentRepositoryRecord(record = {}) {
  return !isTemplateSourceRecord(record);
}
