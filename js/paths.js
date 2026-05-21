/**
 * Resolve static asset URLs for the deployed site root.
 * Custom domains (e.g. practicecert.com) always use "/".
 * GitHub project pages use "/cert-master/" or "/aws-cert-master/" only.
 */
const APP_ROUTE_SEGMENTS = new Set([
  "cert",
  "browse",
  "questions",
  "keytrain",
  "key-training",
]);
const PROJECT_ROOT_SEGMENTS = new Set(["aws-cert-master", "cert-master"]);

/**
 * @returns {boolean}
 */
function isGitHubPagesHost() {
  const host = window.location.hostname.toLowerCase();
  return host === "github.io" || host.endsWith(".github.io");
}

/**
 * Detect deploy root from the current URL (runs once at page load in index.html).
 * @returns {string} Path ending with "/", e.g. "/" or "/cert-master/"
 */
export function detectDeployBasePath() {
  if (!isGitHubPagesHost()) {
    return "/";
  }

  const first = window.location.pathname.split("/").filter(Boolean)[0] ?? "";
  if (PROJECT_ROOT_SEGMENTS.has(first)) {
    return `/${first}/`;
  }
  return "/";
}

/**
 * Deployment root path. Set window.__DEPLOY_BASE__ in index.html before modules load.
 * @returns {string}
 */
export function getDeployBasePath() {
  if (typeof window.__DEPLOY_BASE__ === "string" && window.__DEPLOY_BASE__) {
    const b = window.__DEPLOY_BASE__;
    return b.endsWith("/") ? b : `${b}/`;
  }
  return detectDeployBasePath();
}

export function getSiteRoot() {
  const { origin } = window.location;
  const base = getDeployBasePath();
  return new URL(base, origin).href;
}

/**
 * @param {string} relativePath e.g. data/exams-index.json
 */
export function resolveAssetPath(relativePath) {
  const clean = relativePath.replace(/^\//, "");
  return new URL(clean, getSiteRoot()).href;
}
