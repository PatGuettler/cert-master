/**
 * Drawer open/close for static SEO pages (about, contact, privacy, etc.).
 * Main app uses menu.js with full SPA navigation.
 */

const menuBtn = document.getElementById("menu-btn");
const overlay = document.getElementById("drawer-overlay");
const drawer = document.getElementById("drawer");

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
  if (drawer?.classList.contains("open")) closeDrawer();
  else openDrawer();
});

overlay?.addEventListener("click", closeDrawer);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawer();
});

drawer?.querySelectorAll("a.drawer-nav-btn").forEach((link) => {
  link.addEventListener("click", () => closeDrawer());
});
