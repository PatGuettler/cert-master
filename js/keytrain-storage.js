import { APP_SLUG } from "./config.js";

const ISSUED_KEY = `${APP_SLUG}:keytrainIssued`;

/** @returns {Record<string, object>} */
function allIssued() {
  try {
    const raw = localStorage.getItem(ISSUED_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    return typeof data === "object" && data ? data : {};
  } catch {
    return {};
  }
}

/**
 * @param {string} keytrainId
 * @returns {object|null}
 */
export function getKeytrainIssuance(keytrainId) {
  return allIssued()[keytrainId] ?? null;
}

/**
 * @param {string} keytrainId
 * @param {object} record
 */
export function saveKeytrainIssuance(keytrainId, record) {
  const store = allIssued();
  store[keytrainId] = record;
  localStorage.setItem(ISSUED_KEY, JSON.stringify(store));
}

/**
 * @param {string} keytrainId
 */
export function clearKeytrainIssuance(keytrainId) {
  const store = allIssued();
  delete store[keytrainId];
  localStorage.setItem(ISSUED_KEY, JSON.stringify(store));
}

export function makeCertificateId() {
  const part = Math.random().toString(36).slice(2, 8).toUpperCase();
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `KT-${date}-${part}`;
}
