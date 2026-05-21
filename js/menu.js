import { loadSettings, saveSettings } from "./storage.js";

/**
 * @param {Object} opts
 * @param {() => string} opts.getActiveCertId
 * @param {import('./config.js').ExamSettings} opts.settings
 * @param {(settings: import('./config.js').ExamSettings) => void} opts.onSettingsChange
 * @param {() => void} opts.onNavigateHome
 * @param {() => void} opts.onNavigateBrowse
 * @param {() => void} opts.onNavigateDashboard
 * @param {() => void} opts.onNavigateKeytrain
 */
export function initMenu({
  getActiveCertId,
  settings,
  onSettingsChange,
  onNavigateHome,
  onNavigateBrowse,
  onNavigateKeytrain,
  onNavigateDashboard,
}) {
  pruneLegacyDrawerNav();

  const menuBtn = document.getElementById("menu-btn");
  const overlay = document.getElementById("drawer-overlay");
  const drawer = document.getElementById("drawer");
  const timeLimitToggle = document.getElementById("opt-time-limit");
  const feedbackToggle = document.getElementById("opt-feedback");
  const docLinksToggle = document.getElementById("opt-doc-links");

  function openDrawer() {
    menuBtn?.setAttribute("aria-expanded", "true");
    overlay?.classList.add("open");
    drawer?.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    menuBtn?.setAttribute("aria-expanded", "false");
    overlay?.classList.remove("open");
    drawer?.classList.remove("open");
    document.body.style.overflow = "";
  }

  menuBtn?.addEventListener("click", () => {
    const open = drawer?.classList.contains("open");
    if (open) closeDrawer();
    else openDrawer();
  });

  overlay?.addEventListener("click", closeDrawer);

  document.getElementById("drawer-nav-home")?.addEventListener("click", () => {
    onNavigateHome();
    closeDrawer();
  });

  document.getElementById("drawer-nav-browse")?.addEventListener("click", () => {
    onNavigateBrowse();
    closeDrawer();
  });

  document.getElementById("drawer-nav-keytrain")?.addEventListener("click", () => {
    onNavigateKeytrain();
    closeDrawer();
  });

  document.getElementById("drawer-nav-dashboard")?.addEventListener("click", () => {
    onNavigateDashboard();
    closeDrawer();
  });

  if (timeLimitToggle) timeLimitToggle.checked = settings.timeLimitEnabled;
  if (feedbackToggle) feedbackToggle.checked = settings.immediateFeedback;
  if (docLinksToggle) docLinksToggle.checked = settings.showDocLinks;

  function emitSettings() {
    const next = {
      timeLimitEnabled: timeLimitToggle?.checked ?? true,
      immediateFeedback: feedbackToggle?.checked ?? false,
      showDocLinks: docLinksToggle?.checked ?? true,
    };
    saveSettings(getActiveCertId(), next);
    onSettingsChange(next);
  }

  [timeLimitToggle, feedbackToggle, docLinksToggle].forEach((el) => {
    el?.addEventListener("change", emitSettings);
  });

  function refreshSettings(newSettings) {
    settings = newSettings;
    if (timeLimitToggle) timeLimitToggle.checked = settings.timeLimitEnabled;
    if (feedbackToggle) feedbackToggle.checked = settings.immediateFeedback;
    if (docLinksToggle) docLinksToggle.checked = settings.showDocLinks;
  }

  return { closeDrawer, refreshSettings };
}

/** Remove duplicate KeyTrain entries from older HTML builds. */
function pruneLegacyDrawerNav() {
  const nav = document.querySelector(".drawer-nav");
  if (!nav) return;

  nav.querySelector("#drawer-nav-key-training")?.remove();
  nav.querySelector("#drawer-nav-keytrain-cert")?.remove();

  const keytrainBtns = nav.querySelectorAll("#drawer-nav-keytrain");
  for (let i = 1; i < keytrainBtns.length; i++) {
    keytrainBtns[i].remove();
  }
}
