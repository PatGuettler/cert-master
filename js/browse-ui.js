/** @type {Record<string, { sort: Record<string, number>; level?: Record<string, string>; label: string; metaSuffix: string; hint?: string }>} */
const VENDOR_BROWSE = {
  aws: {
    label: "AWS",
    metaSuffix: " in bank",
    sort: {
      "cloud-practitioner": 10,
      "ai-practitioner": 20,
      "solutions-architect-associate": 30,
      "developer-associate": 40,
      "machine-learning-engineer-associate": 50,
      "data-engineer-associate": 60,
      "cloudops-engineer-associate": 70,
      "database-specialty": 75,
      "machine-learning-specialty": 76,
      "solutions-architect-professional": 80,
      "devops-engineer-professional": 90,
      "generative-ai-developer-professional": 100,
      "advanced-networking-specialty": 110,
      "security-specialty": 120,
    },
    level: {
      "cloud-practitioner": "Foundational",
      "ai-practitioner": "Foundational",
      "solutions-architect-associate": "Associate",
      "developer-associate": "Associate",
      "machine-learning-engineer-associate": "Associate",
      "data-engineer-associate": "Associate",
      "cloudops-engineer-associate": "Associate",
      "database-specialty": "Specialty",
      "machine-learning-specialty": "Specialty",
      "solutions-architect-professional": "Professional",
      "devops-engineer-professional": "Professional",
      "generative-ai-developer-professional": "Professional",
      "advanced-networking-specialty": "Specialty",
      "security-specialty": "Specialty",
    },
  },
  azure: {
    label: "Microsoft Azure",
    metaSuffix: " in bank",
    sort: {
      "az-900": 10,
      "sc-900": 15,
      "dp-900": 20,
      "ai-900": 25,
      "az-104": 30,
      "az-204": 40,
      "az-500": 50,
      "az-305": 60,
      "az-400": 70,
    },
    level: {
      "az-900": "Fundamentals",
      "sc-900": "Fundamentals",
      "dp-900": "Fundamentals",
      "ai-900": "Fundamentals",
      "az-104": "Associate",
      "az-204": "Associate",
      "az-500": "Associate",
      "az-305": "Expert",
      "az-400": "Expert",
    },
  },
  google: {
    label: "Google Cloud",
    metaSuffix: " in bank",
    sort: {
      "cloud-digital-leader": 10,
      "associate-cloud-engineer": 20,
      "professional-cloud-architect": 30,
      "professional-data-engineer": 40,
      "professional-cloud-security-engineer": 50,
      "professional-cloud-devops-engineer": 60,
    },
    level: {
      "cloud-digital-leader": "Foundational",
      "associate-cloud-engineer": "Associate",
      "professional-cloud-architect": "Professional",
      "professional-data-engineer": "Professional",
      "professional-cloud-security-engineer": "Professional",
      "professional-cloud-devops-engineer": "Professional",
    },
  },
  keytraining: {
    label: "KeyTrain's Key Training",
    metaSuffix: " · cybersecurity scenarios",
    hint: "Hands-on security topics: identity, email, endpoint, network, compliance, and more.",
    sort: {
      "keytrain-identity-access": 10,
      "keytrain-email-security": 20,
      "keytrain-data-protection": 30,
      "keytrain-endpoint-security": 40,
      "keytrain-network-security": 50,
      "keytrain-system-hygiene": 60,
      "keytrain-application-security": 70,
      "keytrain-financial-security": 80,
      "keytrain-physical-security": 90,
      "keytrain-compliance-governance": 100,
    },
    level: {
      "keytrain-identity-access": "Identity & access",
      "keytrain-email-security": "Email",
      "keytrain-data-protection": "Data protection",
      "keytrain-endpoint-security": "Endpoint",
      "keytrain-network-security": "Network",
      "keytrain-system-hygiene": "System hygiene",
      "keytrain-application-security": "Application",
      "keytrain-financial-security": "Financial",
      "keytrain-physical-security": "Physical",
      "keytrain-compliance-governance": "Compliance",
    },
  },
  comptia: {
    label: "CompTIA",
    metaSuffix: " · includes acronym drill",
    hint: "Includes acronym study on each exam page.",
    sort: {
      "comptia-a-plus": 10,
      "comptia-network-plus": 20,
      "comptia-security-plus": 30,
      "comptia-cloud-plus": 35,
      "comptia-cysa-plus": 40,
      "comptia-data-plus": 45,
      "comptia-pentest-plus": 50,
      "comptia-server-plus": 55,
      "comptia-project-plus": 58,
      "comptia-linux-plus": 60,
    },
  },
};

const VENDOR_ORDER = ["keytraining", "aws", "azure", "google", "comptia"];

/**
 * @param {import('./cert-loader.js').ExamIndexEntry[]} exams
 * @param {Record<string, number>} sortMap
 * @param {string} vendor
 */
function filterAndSort(exams, sortMap, vendor) {
  return exams
    .filter((e) => (e.vendor ?? "aws") === vendor)
    .sort((a, b) => {
      const oa = sortMap[a.id] ?? 500;
      const ob = sortMap[b.id] ?? 500;
      if (oa !== ob) return oa - ob;
      return a.name.localeCompare(b.name);
    });
}

/**
 * @param {import('./cert-loader.js').ExamIndexEntry} exam
 * @param {string} query
 * @param {typeof VENDOR_BROWSE.aws} cfg
 */
function matchesSearch(exam, query, cfg) {
  if (!query) return true;
  const vendorKey = exam.vendor ?? "aws";
  const level = cfg.level?.[exam.id] ?? cfg.label;
  const hay = [exam.name, exam.code, exam.id, vendorKey, level, cfg.label]
    .join(" ")
    .toLowerCase();
  return hay.includes(query);
}

/**
 * @param {HTMLElement|null} grid
 * @param {import('./cert-loader.js').ExamIndexEntry[]} items
 * @param {typeof VENDOR_BROWSE.aws} cfg
 * @param {(certId: string) => void} onSelectCert
 */
function renderGrid(grid, items, cfg, onSelectCert) {
  if (!grid) return;
  grid.innerHTML = "";
  for (const exam of items) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "landing-cert-tile";
    tile.dataset.certId = exam.id;

    const level = document.createElement("span");
    level.className = "landing-cert-tile-level";
    level.textContent = cfg.level?.[exam.id] ?? cfg.label;

    const title = document.createElement("span");
    title.className = "landing-cert-tile-title";
    title.textContent = exam.name;

    const code = document.createElement("span");
    code.className = "landing-cert-tile-code";
    code.textContent = exam.code || exam.id;

    const meta = document.createElement("span");
    meta.className = "landing-cert-tile-meta";
    meta.textContent = `${exam.questionCount ?? "—"} questions${cfg.metaSuffix}`;

    tile.append(level, title, code, meta);
    tile.addEventListener("click", () => onSelectCert(exam.id));
    grid.appendChild(tile);
  }
}

/**
 * @param {import('./cert-loader.js').ExamIndexEntry[]} exams
 * @param {(certId: string) => void} onSelectCert
 */
export function renderBrowse(exams, onSelectCert) {
  const searchInput = document.getElementById("browse-search");
  const query = (searchInput?.value ?? "").trim().toLowerCase();
  const noResults = document.getElementById("browse-no-results");

  let anyVisible = false;

  for (const vendor of VENDOR_ORDER) {
    const cfg = VENDOR_BROWSE[vendor];
    const section = document.getElementById(`browse-${vendor}-section`);
    const countEl = document.getElementById(`browse-${vendor}-count`);
    const grid = document.getElementById(`browse-cert-grid-${vendor}`);
    const hintEl = section?.querySelector(".landing-hint");

    const filtered = filterAndSort(exams, cfg.sort, vendor).filter((e) =>
      matchesSearch(e, query, cfg)
    );

    if (countEl) countEl.textContent = String(filtered.length);
    if (section) {
      section.classList.toggle("hidden", filtered.length === 0);
      if (filtered.length > 0 && query) {
        section.open = true;
      }
    }
    if (hintEl && cfg.hint) hintEl.textContent = cfg.hint;

    if (filtered.length > 0) anyVisible = true;
    renderGrid(grid, filtered, cfg, onSelectCert);
  }

  noResults?.classList.toggle("hidden", anyVisible);
}

/**
 * @param {import('./cert-loader.js').ExamIndexEntry[]} exams
 * @param {(certId: string) => void} onSelectCert
 */
export function bindBrowseSearch(exams, onSelectCert) {
  const searchInput = document.getElementById("browse-search");
  if (!searchInput || searchInput.dataset.bound === "1") return;
  searchInput.dataset.bound = "1";
  searchInput.addEventListener("input", () => {
    renderBrowse(exams, onSelectCert);
  });
}

/** Remember which vendor sections are expanded (browse page). */
export function bindBrowseCollapse() {
  const key = "cert-master:browseOpen";
  for (const vendor of VENDOR_ORDER) {
    const el = document.getElementById(`browse-${vendor}-section`);
    if (!el || el.dataset.collapseBound === "1") continue;
    el.dataset.collapseBound = "1";
    try {
      const saved = JSON.parse(sessionStorage.getItem(key) || "{}");
      if (typeof saved[vendor] === "boolean") {
        el.open = saved[vendor];
      }
    } catch {
      /* ignore */
    }
    el.addEventListener("toggle", () => {
      try {
        const saved = JSON.parse(sessionStorage.getItem(key) || "{}");
        saved[vendor] = el.open;
        sessionStorage.setItem(key, JSON.stringify(saved));
      } catch {
        /* ignore */
      }
    });
  }
}
