/**
 * Resolve static asset URLs for the deployed site root.
 * Supports custom domain at / (practicecert.com) and legacy GitHub project pages (/repo-name/).
 */
const APP_ROUTE_SEGMENTS = new Set(["cert", "browse", "questions"]);

/**
 * Deployment root path: "/" for custom domain, "/aws-cert-master/" for project pages.
 * Set early by inline script in index.html as window.__DEPLOY_BASE__.
 */
export function getDeployBasePath() {
  if (typeof window.__DEPLOY_BASE__ === "string" && window.__DEPLOY_BASE__) {
    const b = window.__DEPLOY_BASE__;
    return b.endsWith("/") ? b : `${b}/`;
  }

  const path = window.location.pathname;
  const first = path.split("/").filter(Boolean)[0] ?? "";
  if (first && !APP_ROUTE_SEGMENTS.has(first) && path.startsWith(`/${first}`)) {
    return `/${first}/`;
  }
  return "/";
}

export function getSiteRoot() {
  const { origin } = window.location;
  return `${origin}${getDeployBasePath()}`;
}

/**
 * @param {string} relativePath e.g. data/exams-index.json
 */
export function resolveAssetPath(relativePath) {
  const clean = relativePath.replace(/^\//, "");
  return new URL(clean, getSiteRoot()).href;
}
