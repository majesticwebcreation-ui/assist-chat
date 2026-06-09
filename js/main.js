const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("relaydesk-theme", theme);
  $$(".theme-toggle").forEach((button) => {
    button.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    button.textContent = theme === "dark" ? "☾" : "☼";
  });
}

function initTheme() {
  const stored = localStorage.getItem("relaydesk-theme");
  const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  applyTheme(stored || preferred);
  $$(".theme-toggle").forEach((button) => {
    button.addEventListener("click", () => applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  });
}

function animateCounters() {
  $$(".count-up").forEach((node) => {
    const target = Number(node.dataset.target || node.textContent.replace(/\D/g, ""));
    if (!target) return;
    let current = 0;
    const step = Math.max(1, Math.round(target / 42));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      node.textContent = node.dataset.suffix ? `${current}${node.dataset.suffix}` : current.toLocaleString();
    }, 18);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  animateCounters();
});
