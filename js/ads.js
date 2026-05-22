/**
 * Fixed bottom ad bar on all app views (including during exams).
 * Configure in data/ads-config.json.
 */

/** @type {object|null} */
let config = null;
/** @type {boolean} */
let scriptLoaded = false;
/** @type {boolean} */
let adRendered = false;

const adSlot = document.getElementById("ad-slot");
const adContainer = document.getElementById("ad-container");

import { resolveAssetPath } from "./paths.js";

/** True when AdSense is unlikely to work (local preview, file://, etc.). */
function isAdSenseSkippedHost() {
  const h = location.hostname;
  if (!h || h === "localhost" || h === "127.0.0.1" || h === "[::1]") return true;
  if (location.protocol === "file:") return true;
  return false;
}

/**
 * @returns {Promise<object|null>}
 */
async function loadAdsConfig() {
  if (config) return config;
  try {
    const res = await fetch(resolveAssetPath("data/ads-config.json"), {
      cache: "no-store",
    });
    if (!res.ok) return null;
    config = await res.json();
    return config;
  } catch {
    return null;
  }
}

function applyBarLayout() {
  adSlot?.classList.add("ad-slot--bar");
}

/**
 * @param {object} cfg
 */
function renderCustomAd(cfg) {
  if (!adContainer || !cfg.custom?.href || !cfg.custom?.text) return;

  const label = cfg.custom.label ?? "Study link";
  const link = document.createElement("a");
  link.className = "ad-custom-link";
  link.href = cfg.custom.href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = cfg.custom.text;

  const caption = document.createElement("span");
  caption.className = "ad-slot-label";
  caption.textContent = label;

  adContainer.replaceChildren(caption, link);
  adRendered = true;
}

/**
 * @param {object} cfg
 */
function loadAdSenseScript(client) {
  if (scriptLoaded || document.querySelector('script[data-adsense="true"]')) {
    scriptLoaded = true;
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    script.crossOrigin = "anonymous";
    script.dataset.adsense = "true";
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("AdSense script failed to load"));
    document.head.appendChild(script);
  });
}

/**
 * @param {object} cfg
 */
async function renderAdSense(cfg) {
  if (!adContainer || !cfg.adsense?.client || !cfg.adsense?.slot) return;

  await loadAdSenseScript(cfg.adsense.client);

  const ins = document.createElement("ins");
  ins.className = "adsbygoogle";
  ins.style.display = "block";
  ins.setAttribute("data-ad-client", cfg.adsense.client);
  ins.setAttribute("data-ad-slot", cfg.adsense.slot);
  ins.setAttribute("data-ad-format", cfg.adsense.format ?? "horizontal");
  if (cfg.adsense.fullWidthResponsive !== false) {
    ins.setAttribute("data-full-width-responsive", "true");
  }

  adContainer.replaceChildren(ins);

  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
    adRendered = true;
  } catch (err) {
    console.warn("AdSense push failed:", err);
  }
}

/**
 * @param {object} cfg
 * @param {string} reason
 */
function tryCustomFallback(cfg, reason) {
  if (!cfg.custom?.href || !cfg.custom?.text) return;
  if (isAdSenseSkippedHost()) {
    console.info(
      "AdSense skipped on local/dev host; showing custom link if configured.",
    );
  } else {
    console.info(`AdSense unavailable (${reason}); using custom fallback.`);
  }
  renderCustomAd(cfg);
}

export async function initAds() {
  const cfg = await loadAdsConfig();
  if (!cfg?.enabled) return;

  applyBarLayout();

  if (cfg.provider === "custom") {
    renderCustomAd(cfg);
  } else if (cfg.provider === "adsense") {
    if (isAdSenseSkippedHost()) {
      tryCustomFallback(cfg, "local development");
    } else {
      try {
        await renderAdSense(cfg);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        tryCustomFallback(
          cfg,
          msg.includes("failed to load") ? "script blocked or unreachable" : msg,
        );
      }
    }
  }

  if (adRendered && adSlot) {
    adSlot.classList.remove("hidden");
    adSlot.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-ad-bar");
  }
}

/** @deprecated Kept for callers; bar is always visible when enabled. */
export function updateAdVisibility(_visible) {
  if (!adSlot || !config?.enabled || !adRendered) return;
  adSlot.classList.remove("hidden");
  adSlot.setAttribute("aria-hidden", "false");
  document.body.classList.add("has-ad-bar");
}
