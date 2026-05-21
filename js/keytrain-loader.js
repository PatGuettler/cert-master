import { loadExamIndex, loadCert } from "./cert-loader.js";
import { resolveAssetPath } from "./paths.js";

/** @typedef {Object} KeytrainEntry
 * @property {string} id
 * @property {string} examId
 * @property {string} certificateTitle
 * @property {string} [level]
 */

/** @typedef {KeytrainEntry & { name: string, code: string, vendor?: string, questionCount?: number }} KeytrainCertSummary */

let indexCache = null;

/**
 * @returns {Promise<{ brand: string, tagline: string, certifications: KeytrainEntry[] }>}
 */
export async function loadKeytrainIndex() {
  if (indexCache) return indexCache;
  const res = await fetch(resolveAssetPath("data/keytrain-index.json"), {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Could not load KeyTrain catalog (${res.status})`);
  indexCache = await res.json();
  return indexCache;
}

/**
 * @param {import('./cert-loader.js').ExamIndexEntry[]} exams
 * @returns {Promise<KeytrainCertSummary[]>}
 */
export async function loadKeytrainCatalog(exams) {
  const index = await loadKeytrainIndex();
  const byId = new Map(exams.map((e) => [e.id, e]));
  const out = [];
  for (const kt of index.certifications) {
    const exam = byId.get(kt.examId);
    if (!exam) continue;
    out.push({
      ...kt,
      name: exam.name,
      code: exam.code,
      vendor: exam.vendor,
      questionCount: exam.questionCount,
    });
  }
  return out;
}

/**
 * @param {string} keytrainId
 * @param {import('./cert-loader.js').ExamIndexEntry[]} exams
 */
export async function loadKeytrainProgram(keytrainId, exams) {
  const index = await loadKeytrainIndex();
  const entry = index.certifications.find((c) => c.id === keytrainId);
  if (!entry) throw new Error("KeyTrain certification not found");
  const examMeta = exams.find((e) => e.id === entry.examId);
  if (!examMeta) throw new Error("Linked practice exam not found");
  const cert = await loadCert(entry.examId);
  return {
    keytrain: entry,
    brand: index.brand,
    tagline: index.tagline,
    examMeta,
    cert,
  };
}
