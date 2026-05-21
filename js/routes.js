/**
 * Path-based routes for SEO-friendly URLs on GitHub Pages (with 404.html fallback).
 * Legacy hash routes (#cert/..., #browse) are normalized to paths on load.
 */
import { getSiteRoot } from "./paths.js";
import { KEYTRAIN_WORKSHOP_IDS } from "./workshops/keytrain-workshop-content.js";

/**
 * @returns {string} Pathname prefix for the app, e.g. /cert-master/
 */
export function getAppBasePath() {
  return new URL(getSiteRoot()).pathname;
}

/**
 * App-relative path without leading/trailing slashes, e.g. cert/cloud-practitioner
 */
export function getAppSubpath() {
  const base = getAppBasePath();
  let p = window.location.pathname;
  if (p.startsWith(base)) {
    p = p.slice(base.length);
  } else if (base !== "/" && p.endsWith(base.replace(/\/$/, ""))) {
    p = "";
  }
  return p.replace(/^\/+|\/+$/g, "");
}

/**
 * @param {string} subpath e.g. cert/cloud-practitioner or browse
 */
export function appPathUrl(subpath = "") {
  const base = getSiteRoot().replace(/\/$/, "");
  if (!subpath) return `${base}/`;
  const clean = subpath.replace(/^\/+|\/+$/g, "");
  return `${base}/${clean}/`;
}

/**
 * @param {string} slug
 */
export function questionPageUrl(slug) {
  return appPathUrl(`questions/${slug}`);
}

/**
 * @param {import('./cert-loader.js').ExamIndexEntry[]} exams
 * @param {string[]} [keytrainIds]
 * @returns {{ type: string, certId?: string, keytrainId?: string }}
 */
export function parseRoute(exams, keytrainIds = []) {
  const parts = getAppSubpath().split("/").filter(Boolean);

  if (parts[0] === "browse") return { type: "browse" };

  if (parts[0] === "keytrain") {
    if (!parts[1]) return { type: "keytrain-hub" };
    if (parts[1] === "workshops") return { type: "keytrain-workshops" };
    if (parts[1] === "workshop" && parts[2]) {
      if (!KEYTRAIN_WORKSHOP_IDS.includes(parts[2])) return { type: "keytrain-hub" };
      return { type: "keytrain-workshop", certId: parts[2] };
    }
    if (!keytrainIds.includes(parts[1])) return { type: "keytrain-hub" };
    if (parts[2] === "certificate") {
      return { type: "keytrain-certificate", keytrainId: parts[1] };
    }
    return { type: "keytrain-cert", keytrainId: parts[1] };
  }

  if (parts[0] === "key-training") {
    if (!parts[1]) return { type: "keytrain-hub" };
    if (parts[1] === "workshops") return { type: "keytrain-workshops" };
    if (parts[1] === "workshop" && parts[2]) {
      if (!KEYTRAIN_WORKSHOP_IDS.includes(parts[2])) return { type: "keytrain-hub" };
      return { type: "keytrain-workshop", certId: parts[2] };
    }
    return { type: "keytrain-hub" };
  }

  if (parts[0] === "cert" && parts[1]) {
    if (!exams.some((e) => e.id === parts[1])) return { type: "landing" };
    if (parts[2] === "acronyms") {
      return { type: "acronyms", certId: parts[1] };
    }
    return { type: "cert", certId: parts[1] };
  }

  if (parts[0] === "questions") {
    return { type: "landing" };
  }

  const raw = window.location.hash.replace(/^#/, "").trim();
  if (!raw) return { type: "landing" };
  if (raw === "browse") return { type: "browse" };

  const hashParts = raw.split("/").filter(Boolean);
  if (hashParts[0] === "cert" && hashParts[1]) {
    if (!exams.some((e) => e.id === hashParts[1])) return { type: "landing" };
    if (hashParts[2] === "acronyms") {
      return { type: "acronyms", certId: hashParts[1] };
    }
    return { type: "cert", certId: hashParts[1] };
  }

  const legacyId = hashParts[0];
  if (legacyId && exams.some((e) => e.id === legacyId)) {
    return { type: "cert", certId: legacyId };
  }

  return { type: "landing" };
}

/**
 * @param {import('./cert-loader.js').ExamIndexEntry[]} exams
 */
export function normalizeLegacyRoutes(exams) {
  const sub = getAppSubpath();
  if (sub.startsWith("questions/")) return;

  if (sub === "key-training" || sub.startsWith("key-training/")) {
    const rest = sub.replace(/^key-training\/?/, "");
    history.replaceState(null, "", appPathUrl(rest ? `keytrain/${rest}` : "keytrain"));
    return;
  }

  const raw = window.location.hash.replace(/^#/, "").trim();
  if (!raw) return;

  if (raw === "browse") {
    history.replaceState(null, "", appPathUrl("browse"));
    window.location.hash = "";
    return;
  }

  if (raw.startsWith("cert/")) {
    history.replaceState(null, "", appPathUrl(raw));
    window.location.hash = "";
    return;
  }

  const legacyId = raw.split("/")[0];
  if (legacyId && exams.some((e) => e.id === legacyId)) {
    history.replaceState(null, "", appPathUrl(`cert/${legacyId}`));
    window.location.hash = "";
  }
}

export function navigateHome() {
  history.pushState(null, "", appPathUrl());
}

export function navigateBrowse() {
  history.pushState(null, "", appPathUrl("browse"));
}

export function navigateKeytrainHub() {
  history.pushState(null, "", appPathUrl("keytrain"));
}

export function navigateKeytrainWorkshops() {
  history.pushState(null, "", appPathUrl("keytrain/workshops"));
}

/**
 * @param {string} certId
 */
export function navigateKeytrainWorkshop(certId) {
  history.pushState(null, "", appPathUrl(`keytrain/workshop/${certId}`));
}

/**
 * @param {string} keytrainId
 * @param {string} [sub]
 */
export function navigateKeytrainCert(keytrainId, sub = "") {
  const path = sub ? `keytrain/${keytrainId}/${sub}` : `keytrain/${keytrainId}`;
  history.pushState(null, "", appPathUrl(path));
}

/**
 * @param {string} certId
 * @param {string} [sub]
 */
export function navigateCert(certId, sub = "") {
  const path = sub ? `cert/${certId}/${sub}` : `cert/${certId}`;
  history.pushState(null, "", appPathUrl(path));
}

export function isBrowsePathActive() {
  const sub = getAppSubpath();
  return sub === "browse" || window.location.hash.replace(/^#/, "") === "browse";
}

export function isKeytrainHubPathActive() {
  return getAppSubpath() === "keytrain";
}

export function isKeytrainWorkshopsPathActive() {
  return getAppSubpath() === "keytrain/workshops";
}
