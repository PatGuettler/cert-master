import { resolveAssetPath } from "./paths.js";
import { questionPageUrl } from "./routes.js";

/** @type {Record<string, unknown>|null} */
let registryCache = null;

export async function loadQuestionSlugRegistry() {
  if (registryCache) return registryCache;
  try {
    const res = await fetch(resolveAssetPath("data/questions-slugs.json"));
    if (!res.ok) return null;
    registryCache = await res.json();
    return registryCache;
  } catch {
    return null;
  }
}

/**
 * @param {Record<string, unknown>|null} registry
 * @param {string} certId
 * @param {string} questionId
 */
export function getQuestionSlug(registry, certId, questionId) {
  if (!registry?.byQuestionKey) return null;
  const key = `${certId}:${questionId}`;
  return registry.byQuestionKey[key] ?? null;
}

/**
 * @param {Record<string, unknown>|null} registry
 * @param {string} certId
 * @param {string} questionId
 */
export function getQuestionPageHref(registry, certId, questionId) {
  const slug = getQuestionSlug(registry, certId, questionId);
  return slug ? questionPageUrl(slug) : null;
}
