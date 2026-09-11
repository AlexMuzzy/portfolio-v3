import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { compile } from 'tailwindcss';

const source = readFileSync(new URL('../src/scripts/theme.js', import.meta.url), 'utf8');

function page({ saved = null, dark = false, blocked = false, home = false } = {}) {
  const listeners = {};
  const on = (name, callback) => { listeners[name] = callback; };
  const root = { dataset: {} };
  const picker = { value: '', matches: selector => selector === '[data-theme-select]' };
  const control = { hidden: true };
  const meta = { content: '', dataset: { light: home ? '#0c1b2e' : '#ffffff', dark: '#0c1b2e' } };
  const system = { matches: dark, addEventListener: (_, callback) => { listeners.system = callback; } };
  const storage = {
    getItem: () => { if (blocked) throw Error('Storage blocked'); return saved; },
    setItem: (_, value) => { if (blocked) throw Error('Storage blocked'); saved = value; },
    removeItem: () => { if (blocked) throw Error('Storage blocked'); saved = null; },
  };
  const document = {
    documentElement: root,
    querySelector: () => meta,
    querySelectorAll: selector => selector === '[data-theme-select]' ? [picker] : [control],
    addEventListener: on,
  };
  vm.runInNewContext(source, { document, localStorage: storage, window: { matchMedia: () => system, addEventListener: on } });
  return {
    root, picker, control, meta,
    choose(value) { picker.value = value; listeners.change({ target: picker }); },
    system(dark) { system.matches = dark; listeners.system(); },
    saved: () => saved,
    external(value) { saved = value; listeners.storage({ key: 'portfolio-theme', storageArea: storage }); },
    clear() { saved = null; listeners.storage({ key: null, storageArea: storage }); },
  };
}

const automatic = page({ dark: true });
assert.equal(automatic.root.dataset.theme, 'dark', 'system theme applies before paint');
assert.equal(automatic.picker.value, 'system');
automatic.system(false);
assert.equal(automatic.root.dataset.theme, 'light');
automatic.choose('dark');
assert.equal(automatic.saved(), 'dark');
automatic.system(false);
assert.equal(automatic.root.dataset.theme, 'dark', 'explicit choice beats system');
assert.equal(automatic.meta.content, '#0c1b2e');
assert.equal(page({ saved: automatic.saved() }).root.dataset.theme, 'dark', 'choice survives navigation');
automatic.choose('system');
assert.equal(automatic.saved(), null);
assert.equal(automatic.root.dataset.theme, 'light');
automatic.external('dark');
assert.equal(automatic.picker.value, 'dark', 'other tabs synchronize');
automatic.clear();
assert.equal(automatic.root.dataset.theme, 'light');
assert.equal(page({ saved: 'invalid', dark: true }).root.dataset.theme, 'dark');
const restricted = page({ blocked: true });
restricted.choose('dark');
assert.equal(restricted.root.dataset.theme, 'dark', 'storage failures do not break selection');
assert.equal(page({ home: true }).meta.content, '#0c1b2e', 'hero keeps its navy browser chrome');
console.log('Theme checks passed: system, overrides, persistence, synchronization and blocked storage.');

const theme = readFileSync(new URL('../src/styles/theme.css', import.meta.url), 'utf8');
const global = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const variant = global.match(/@custom-variant dark[^;]+;/)[0];
const { build } = await compile(`${theme}\n${variant}\n@tailwind utilities;`);
const utilities = build(['bg-background', 'text-muted', 'border-border', 'rounded-control', 'dark:bg-surface']);
for (const expected of ['.bg-background', '.text-muted', '.border-border', '.rounded-control', '.dark\\:bg-surface']) {
  assert.ok(utilities.includes(expected), `Missing Tailwind utility: ${expected}`);
}
assert.ok(utilities.includes("[data-theme='dark']"), 'dark utilities must follow the manual theme selector');
console.log('Tailwind checks passed: semantic utilities and selector-based dark variants.');

// Check the solid content surfaces; this does not audit the animated canvas.
function luminance(hex) {
  const linear = hex.slice(1).match(/../g).map(pair => {
    const channel = parseInt(pair, 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}
function contrast(a, b) {
  const [low, high] = [luminance(a), luminance(b)].sort((a, b) => a - b);
  return (high + 0.05) / (low + 0.05);
}
const palette = {};
for (const selector of [':root', ":root[data-theme='dark']"]) {
  const block = theme.split(`${selector} {`)[1].split('}')[0];
  Object.assign(palette, Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[\da-f]{6});/gi)].map(match => [match[1], match[2]])));
  for (const background of ['background', 'surface']) {
    for (const foreground of ['foreground', 'muted', 'accent']) {
      assert.ok(contrast(palette[foreground], palette[background]) >= 4.5, `${selector}: ${foreground}/${background} must meet AA text contrast`);
    }
    assert.ok(contrast(palette.focus, palette[background]) >= 3, `${selector}: focus indicator contrast`);
  }
}
console.log('Content colour checks passed: AA text contrast in both themes and 3:1 focus contrast.');
