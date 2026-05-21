import { resolveAssetPath } from "./paths.js";

/** @type {Promise<{ byQuestionKey?: Record<string, string> } | null> | null} */
let registryPromise = null;

/**
 * Slug registry for linking exam feedback to static study pages (built on deploy).
 * @returns {Promise<{ byQuestionKey?: Record<string, string> } | null>}
 */
export async function loadSlugRegistry() {
  if (!registryPromise) {
    registryPromise = fetch(resolveAssetPath("data/questions-slugs.json"))
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null);
  }
  return registryPromise;
}

/**
 * @param {{ byQuestionKey?: Record<string, string> } | null} registry
 * @param {string} certId
 * @param {string} questionId
 */
export function slugForQuestion(registry, certId, questionId) {
  if (!registry?.byQuestionKey) return null;
  return registry.byQuestionKey[`${certId}:${questionId}`] || null;
}
