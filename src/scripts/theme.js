// Inlined in <head> by the layout: apply the theme before the page is painted.
(() => {
  const key = 'portfolio-theme';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const normalize = value => value === 'light' || value === 'dark' ? value : 'system';
  function readPreference(fallback = 'system') {
    try { return normalize(localStorage.getItem(key)); } catch { return fallback; }
  }
  let preference = readPreference();

  function apply() {
    const theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    root.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = meta.dataset[theme];
    document.querySelectorAll('[data-theme-select]').forEach(select => { select.value = preference; });
    document.querySelectorAll('[data-theme-control]').forEach(control => { control.hidden = false; });
  }
  apply();
  document.addEventListener('DOMContentLoaded', apply);
  system.addEventListener('change', apply);
  document.addEventListener('change', event => {
    if (!event.target?.matches?.('[data-theme-select]')) return;
    preference = normalize(event.target.value);
    try {
      if (preference === 'system') localStorage.removeItem(key);
      else localStorage.setItem(key, preference);
    } catch { /* Keep the in-memory preference when storage is unavailable. */ }
    apply();
  });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = readPreference(preference);
    apply();
  });
  window.addEventListener('pageshow', () => {
    preference = readPreference(preference);
    apply();
  });
})();
