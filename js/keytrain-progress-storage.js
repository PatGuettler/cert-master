/**
 * KeyTrain workshop completion and progress aggregates (localStorage).
 */
import { APP_SLUG } from "./config.js";
import { KEYTRAIN_CATEGORIES, TRAINING_LEVELS } from "./workshops/keytrain-catalog.js";
import { getHistory } from "./storage.js";
import { getKeytrainIssuance } from "./keytrain-storage.js";

const PROGRESS_KEY = `${APP_SLUG}:keytrainProgress`;

/**
 * @typedef {Object} WorkshopProgressRecord
 * @property {string} categoryId
 * @property {string} level
 * @property {number} correct
 * @property {number} total
 * @property {number} percent
 * @property {string} completedAt
 * @property {number} attempts
 * @property {number} [bestPercent]
 */

/**
 * @returns {Record<string, WorkshopProgressRecord>}
 */
function allWorkshopProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    return typeof data?.workshops === "object" && data.workshops ? data.workshops : {};
  } catch {
    return {};
  }
}

/**
 * @param {Record<string, WorkshopProgressRecord>} workshops
 */
function writeWorkshopProgress(workshops) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify({ workshops }));
}

/**
 * @param {string} categoryId
 * @param {string} level
 */
export function workshopProgressKey(categoryId, level) {
  return `${categoryId}:${level}`;
}

/**
 * @param {string} categoryId
 * @param {string} level
 * @returns {WorkshopProgressRecord|null}
 */
export function getWorkshopProgress(categoryId, level) {
  return allWorkshopProgress()[workshopProgressKey(categoryId, level)] ?? null;
}

/**
 * @param {string} categoryId
 * @param {string} level
 * @param {{ correct: number, total: number }} stats
 */
export function recordWorkshopCompletion(categoryId, level, stats) {
  const key = workshopProgressKey(categoryId, level);
  const store = allWorkshopProgress();
  const prev = store[key];
  const total = Math.max(1, stats.total);
  const percent = Math.round((stats.correct / total) * 100);
  const bestPercent = Math.max(percent, prev?.bestPercent ?? 0);

  store[key] = {
    categoryId,
    level,
    correct: stats.correct,
    total,
    percent,
    bestPercent,
    completedAt: new Date().toISOString(),
    attempts: (prev?.attempts ?? 0) + 1,
  };
  writeWorkshopProgress(store);
}

/** @returns {WorkshopProgressRecord[]} */
export function listAllWorkshopProgress() {
  return Object.values(allWorkshopProgress()).sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
}

/**
 * @param {import('./cert-loader.js').ExamIndexEntry[]} [examIndex]
 */
export function buildKeytrainProgressSummary(examIndex = []) {
  const workshops = allWorkshopProgress();
  const totalSlots = KEYTRAIN_CATEGORIES.length * TRAINING_LEVELS.length;
  let completedSlots = 0;
  let scoreSum = 0;
  let scoreCount = 0;

  for (const cat of KEYTRAIN_CATEGORIES) {
    for (const level of TRAINING_LEVELS) {
      const rec = workshops[workshopProgressKey(cat.id, level)];
      if (rec) {
        completedSlots += 1;
        const pct = rec.bestPercent ?? rec.percent;
        scoreSum += pct;
        scoreCount += 1;
      }
    }
  }

  const keytrainingExams = examIndex.filter((e) => e.vendor === "keytraining");
  let practiceAttempts = 0;
  let practicePassed = 0;
  let practiceBest = 0;

  for (const exam of keytrainingExams) {
    const history = getHistory(exam.id).filter((e) => e.type !== "drill" && e.type !== "workshop");
    practiceAttempts += history.length;
    practicePassed += history.filter((e) => e.passed).length;
    for (const h of history) {
      const s = h.scaledScore ?? h.percent ?? 0;
      if (s > practiceBest) practiceBest = s;
    }
  }

  let certsEarned = 0;
  for (const cat of KEYTRAIN_CATEGORIES) {
    if (getKeytrainIssuance(cat.id)?.passed) certsEarned += 1;
  }

  return {
    totalSlots,
    completedSlots,
    workshopAvgPercent: scoreCount > 0 ? Math.round(scoreSum / scoreCount) : null,
    practiceAttempts,
    practicePassed,
    practiceBest,
    certsEarned,
    categoryCount: KEYTRAIN_CATEGORIES.length,
  };
}

/**
 * @param {string} categoryId
 * @param {import('./cert-loader.js').ExamIndexEntry[]} [examIndex]
 */
export function buildCategoryProgressDetail(categoryId, examIndex = []) {
  const workshops = allWorkshopProgress();
  /** @type {Record<string, WorkshopProgressRecord|null>} */
  const byLevel = {};
  for (const level of TRAINING_LEVELS) {
    byLevel[level] = workshops[workshopProgressKey(categoryId, level)] ?? null;
  }

  const examEntry = examIndex.find((e) => e.id === categoryId && e.vendor === "keytraining");
  const practiceHistory = getHistory(categoryId).filter(
    (e) => e.type !== "drill" && e.type !== "workshop"
  );
  const drills = getHistory(categoryId).filter((e) => e.type === "drill");
  const workshopsHistory = getHistory(categoryId).filter((e) => e.type === "workshop");

  const latestPractice = practiceHistory[0];
  const passedCount = practiceHistory.filter((e) => e.passed).length;
  const cert = getKeytrainIssuance(categoryId);

  return {
    categoryId,
    byLevel,
    examEntry,
    practiceHistory,
    drills,
    workshopsHistory,
    latestPractice,
    passedCount,
    cert,
  };
}
