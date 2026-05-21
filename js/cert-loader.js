/**
 * @typedef {Object} ExamIndexEntry
 * @property {string} id
 * @property {string} name
 * @property {string} code
 * @property {string} [vendor]
 * @property {string} dataFile
 * @property {number} [questionCount]
 */

/**
 * @typedef {Object} DomainResource
 * @property {string} title
 * @property {string} url
 */

/**
 * @typedef {Object} Domain
 * @property {string} id
 * @property {string} name
 * @property {number} weight
 * @property {DomainResource[]} resources
 */

/**
 * @typedef {Object} QuestionOption
 * @property {string} id
 * @property {string} text
 */

/**
 * @typedef {Object} Question
 * @property {string} id
 * @property {string} domain
 * @property {'multiple-choice'|'multiple-response'} type
 * @property {boolean} [scored]
 * @property {string} text
 * @property {QuestionOption[]} options
 * @property {string[]} correct
 * @property {string} [explanation]
 * @property {DomainResource[]} [docs]
 */

/**
 * @typedef {Object} ExamConfig
 * @property {number} totalQuestions
 * @property {number} scoredQuestions
 * @property {number} timeLimitMinutes
 * @property {number} passingScore
 * @property {number} maxScore
 */

/**
 * @typedef {Object} CertData
 * @property {string} id
 * @property {string} name
 * @property {string} code
 * @property {ExamConfig} exam
 * @property {Domain[]} domains
 * @property {Question[]} questions
 * @property {string} [vendor]
 * @property {import('./acronym-engine.js').AcronymEntry[]} [acronyms]
 */

const indexCache = { data: /** @type {ExamIndexEntry[]|null} */ (null) };
const certCache = new Map();

import { resolveAssetPath } from "./paths.js";

/** @deprecated Use loadExamIndex — kept for compatibility */
export const loadRegistry = loadExamIndex;

/**
 * Load the exam list from data/exams-index.json (built from data/exams/*.json).
 * @param {{ reload?: boolean }} [opts]
 * @returns {Promise<ExamIndexEntry[]>}
 */
export async function loadExamIndex(opts = {}) {
  if (!opts.reload && indexCache.data) return indexCache.data;

  const res = await fetch(resolveAssetPath("data/exams-index.json"), {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(
      "Failed to load exam index (data/exams-index.json). Check the file is present in the repo."
    );
  }
  const json = await res.json();
  if (!Array.isArray(json.exams)) {
    throw new Error("Invalid exams-index.json: missing exams array");
  }
  indexCache.data = json.exams;
  return indexCache.data;
}

/**
 * @param {string} certId
 * @param {{ reload?: boolean }} [opts]
 * @returns {Promise<CertData>}
 */
export async function loadCert(certId, opts = {}) {
  if (!opts.reload && certCache.has(certId)) return certCache.get(certId);

  const index = await loadExamIndex(opts);
  const entry = index.find((c) => c.id === certId);
  if (!entry) {
    throw new Error(
      `Unknown exam "${certId}". Add data/exams/<name>.json and rebuild the index.`
    );
  }

  const res = await fetch(resolveAssetPath(entry.dataFile), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load ${entry.name} (${entry.dataFile})`);
  }
  const data = await res.json();
  if (data.id !== certId) {
    console.warn(
      `Exam file id "${data.id}" does not match index id "${certId}"`
    );
  }
  certCache.set(certId, data);
  return data;
}

/**
 * Clear cached index and exam data (e.g. after index refresh).
 */
export function clearExamCaches() {
  indexCache.data = null;
  certCache.clear();
}

/**
 * CLF-C02 domain weights → per-exam question counts (largest remainder).
 * @param {Domain[]} domains
 * @param {number} total
 * @returns {Record<string, number>}
 */
export function allocateByDomainWeight(domains, total) {
  /** @type {{ id: string, floor: number, remainder: number }[]} */
  const parts = domains.map((d) => {
    const quota = (d.weight / 100) * total;
    const floor = Math.floor(quota);
    return { id: d.id, floor, remainder: quota - floor };
  });

  const result = Object.fromEntries(parts.map((p) => [p.id, p.floor]));
  let assigned = parts.reduce((sum, p) => sum + p.floor, 0);
  const byRemainder = [...parts].sort((a, b) => b.remainder - a.remainder);

  let i = 0;
  while (assigned < total) {
    const part = byRemainder[i % byRemainder.length];
    result[part.id]++;
    assigned++;
    i++;
  }

  return result;
}

/**
 * @param {CertData} cert
 * @returns {{ domainId: string, name: string, required: number, available: number }[]}
 */
export function getDomainPoolStatus(cert) {
  const counts = allocateByDomainWeight(cert.domains, cert.exam.totalQuestions);
  /** @type {Record<string, number>} */
  const available = {};
  for (const q of cert.questions) {
    available[q.domain] = (available[q.domain] ?? 0) + 1;
  }
  return cert.domains.map((d) => ({
    domainId: d.id,
    name: d.name,
    required: counts[d.id] ?? 0,
    available: available[d.id] ?? 0,
  }));
}

/**
 * @param {Record<string, { attempts: number, correct: number }>} weakMap
 * @param {string} questionId
 */
function questionAccuracy(weakMap, questionId) {
  const s = weakMap[questionId];
  if (!s || s.attempts === 0) return 0.5;
  return s.correct / s.attempts;
}

/**
 * Bias pool toward lower-accuracy questions, then shuffle within tiers.
 * @param {Question[]} pool
 * @param {Record<string, { attempts: number, correct: number }>} weakMap
 */
function sortPoolByWeakness(pool, weakMap) {
  const copy = [...pool];
  copy.sort((a, b) => questionAccuracy(weakMap, a.id) - questionAccuracy(weakMap, b.id));
  const chunk = Math.max(1, Math.ceil(copy.length / 3));
  const tiers = [];
  for (let i = 0; i < copy.length; i += chunk) {
    const slice = copy.slice(i, i + chunk);
    shuffle(slice);
    tiers.push(...slice);
  }
  return tiers.length ? tiers : copy;
}

/**
 * Build one exam: domain-weighted random sample, scored/unscored split, shuffled order and options.
 * @param {CertData} cert
 * @param {{ certId?: string, weakMap?: Record<string, { attempts: number, correct: number }> }} [opts]
 * @returns {Question[]}
 */
export function selectExamQuestions(cert, opts = {}) {
  const weakMap = opts.weakMap ?? {};
  const total = cert.exam.totalQuestions;
  const unscoredCount = total - cert.exam.scoredQuestions;
  const perDomain = allocateByDomainWeight(cert.domains, total);

  /** @type {Record<string, Question[]>} */
  const byDomain = {};
  for (const q of cert.questions) {
    (byDomain[q.domain] ??= []).push(q);
  }

  const usedIds = new Set();
  /** @type {Question[]} */
  const selected = [];

  for (const domain of cert.domains) {
    const need = perDomain[domain.id] ?? 0;
    let pool = (byDomain[domain.id] ?? []).filter((q) => !usedIds.has(q.id));
    if (Object.keys(weakMap).length > 0) {
      pool = sortPoolByWeakness(pool, weakMap);
    }
    const picked = sampleWithoutReplacement(pool, need);
    for (const q of picked) {
      usedIds.add(q.id);
      selected.push(q);
    }
  }

  if (selected.length < total) {
    const remainder = cert.questions.filter((q) => !usedIds.has(q.id));
    const extra = sampleWithoutReplacement(remainder, total - selected.length);
    for (const q of extra) {
      usedIds.add(q.id);
      selected.push(q);
    }
  }

  shuffle(selected);
  let examSet = selected.slice(0, total).map(prepareQuestionForExam);

  const unscoredIndices = pickRandomIndices(examSet.length, unscoredCount);
  examSet = examSet.map((q, index) => ({
    ...q,
    scored: !unscoredIndices.has(index),
  }));

  return examSet;
}

const DRILL_MAX = 20;

/**
 * @param {CertData} cert
 * @param {string[]} missedIds
 * @param {Record<string, { attempts: number, correct: number }>} weakMap
 * @returns {Question[]}
 */
export const WORKSHOP_MAX = 12;

/**
 * One sampled question per domain for guided workshops (immediate feedback).
 * @param {CertData} cert
 */
export function selectWorkshopQuestions(cert) {
  /** @type {Record<string, Question[]>} */
  const byDomain = {};
  for (const q of cert.questions) {
    (byDomain[q.domain] ??= []).push(q);
  }

  /** @type {Question[]} */
  const selected = [];
  for (const domain of cert.domains) {
    const pool = byDomain[domain.id] ?? [];
    if (!pool.length) continue;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    selected.push(prepareQuestionForExam(pick));
  }

  shuffle(selected);
  return selected.slice(0, WORKSHOP_MAX);
}

export function selectDrillQuestions(cert, missedIds, weakMap = {}) {
  const bank = new Map(cert.questions.map((q) => [q.id, q]));
  /** @type {Question[]} */
  let pool = missedIds.map((id) => bank.get(id)).filter(Boolean);

  if (pool.length < 10) {
    const extras = cert.questions
      .filter((q) => !pool.some((p) => p.id === q.id))
      .sort(
        (a, b) => questionAccuracy(weakMap, a.id) - questionAccuracy(weakMap, b.id)
      )
      .slice(0, DRILL_MAX - pool.length);
    pool = [...pool, ...extras];
  }

  shuffle(pool);
  return pool.slice(0, DRILL_MAX).map(prepareQuestionForExam);
}

/**
 * @param {CertData} cert
 * @param {Record<string, { attempts: number, correct: number }>} weakMap
 * @returns {{ domainId: string, name: string, weight: number, accuracy: number|null, isWeakest: boolean }[]}
 */
export function getDomainAccuracySummary(cert, weakMap) {
  /** @type {Record<string, { attempts: number, correct: number }>} */
  const byDomain = {};
  for (const q of cert.questions) {
    const s = weakMap[q.id];
    if (!s) continue;
    if (!byDomain[q.domain]) byDomain[q.domain] = { attempts: 0, correct: 0 };
    byDomain[q.domain].attempts += s.attempts;
    byDomain[q.domain].correct += s.correct;
  }

  const rows = cert.domains.map((d) => {
    const agg = byDomain[d.id];
    const accuracy =
      agg && agg.attempts >= 5
        ? Math.round((agg.correct / agg.attempts) * 100)
        : null;
    return {
      domainId: d.id,
      name: d.name,
      weight: d.weight,
      accuracy,
      isWeakest: false,
    };
  });

  const withAcc = rows.filter((r) => r.accuracy !== null);
  if (withAcc.length > 0) {
    const min = Math.min(...withAcc.map((r) => r.accuracy ?? 100));
    for (const r of rows) {
      if (r.accuracy === min) r.isWeakest = true;
    }
  }

  return rows;
}

/**
 * @param {Question} question
 * @returns {Question}
 */
function prepareQuestionForExam(question) {
  const options = [...question.options];
  shuffle(options);
  return {
    ...question,
    options,
  };
}

/**
 * @param {Question[]} pool
 * @param {number} n
 */
function sampleWithoutReplacement(pool, n) {
  const copy = [...pool];
  shuffle(copy);
  return copy.slice(0, Math.min(n, copy.length));
}

/**
 * @param {number} size
 * @param {number} pick
 */
function pickRandomIndices(size, pick) {
  const indices = Array.from({ length: size }, (_, i) => i);
  shuffle(indices);
  return new Set(indices.slice(0, pick));
}

/**
 * @param {unknown[]} arr
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
