/**
 * @typedef {Object} CertRegistryEntry
 * @property {string} id
 * @property {string} name
 * @property {string} code
 * @property {string} dataFile
 * @property {boolean} available
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
 */

const registryCache = { data: /** @type {CertRegistryEntry[]|null} */ (null) };
const certCache = new Map();

/**
 * @param {string} basePath
 */
function resolvePath(basePath) {
  const base = document.querySelector("base")?.href ?? window.location.href;
  return new URL(basePath, base).href;
}

export async function loadRegistry() {
  if (registryCache.data) return registryCache.data;
  const res = await fetch(resolvePath("data/certs-registry.json"));
  if (!res.ok) throw new Error("Failed to load certification registry");
  const json = await res.json();
  registryCache.data = json.certs;
  return registryCache.data;
}

/**
 * @param {string} certId
 * @returns {Promise<CertData>}
 */
export async function loadCert(certId) {
  if (certCache.has(certId)) return certCache.get(certId);

  const registry = await loadRegistry();
  const entry = registry.find((c) => c.id === certId);
  if (!entry) throw new Error(`Unknown certification: ${certId}`);
  if (!entry.available) throw new Error(`${entry.name} is not available yet`);

  const res = await fetch(resolvePath(entry.dataFile));
  if (!res.ok) throw new Error(`Failed to load ${entry.name} questions`);
  const data = await res.json();
  certCache.set(certId, data);
  return data;
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
 * @returns {{ domainId: string, required: number, available: number }[]}
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
 * Build one exam: domain-weighted random sample, 50 scored / 15 unscored, shuffled order and options.
 * @param {CertData} cert
 * @returns {Question[]}
 */
export function selectExamQuestions(cert) {
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
    const pool = (byDomain[domain.id] ?? []).filter((q) => !usedIds.has(q.id));
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
