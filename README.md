# Alex Musgrove — portfolio first version

Astro static generation, with a personal hero, experience, one compact side-project entry, about/contact, and `/projects/exert/`.

## Run

Requires Bun 1.4.0 or later. Bun manages dependencies and runs the project scripts; `bunfig.toml` also enables the Bun runtime for tools with Node shebangs.

```sh
bun install --frozen-lockfile
bun run dev
bun run build
bun run check
bun run preview
```

Commit `bun.lock` with dependency changes. Use `bun add <package>` or `bun add -d <package>` to add dependencies; use `bun install` after editing `package.json`. The lockfile was migrated from npm to preserve existing dependency versions.

## Content sources

- Career history, current role, location and education are condensed from [Alex’s July 2026 CV](https://docs.google.com/document/d/1kOYFaN8vbx26-V1UzpMhuWWYbaVtwOs8FOni2AG-ApY/edit). The Intuit entry separates company tenure from the January 2026 promotion to senior.
- Exert’s overview and private-beta status are based on [exert-app.com](https://www.exert-app.com/), the running iOS simulator build (Home, Library and Progress), and the local `exert-monorepo` source. The engineering summary is grounded in the mobile workout draft persistence, SQLite completed-workout storage and sync worker, plus the mobile/web/server package manifests. The homepage stays brief with one Home screenshot; `/projects/exert/` contains the product and implementation details and a Plan → Log → Review image sequence. The screenshots show development-build data and are labelled accordingly. Original captures and placement notes live in `src/assets/exert`; rendered pages use responsive, lazy-loaded WebP images.
- Social URLs and portrait come from portfolio-v2. Phone and email details from the CV are not included on the site.

## Tailwind and themes

Tailwind CSS 4 uses the official `@tailwindcss/vite` plugin in `astro.config.mjs`. No React runtime or legacy Tailwind configuration file is required.

- `src/styles/theme.css` defines the semantic palette, font, type scale, spacing and radii. Edit the light `:root` and dark `[data-theme='dark']` values here.
- `src/styles/global.css` imports Tailwind and the tokens, then preserves the portfolio's component styles. Utilities are the final cascade layer, so they can override component styles without increasing specificity.
- `src/scripts/theme.js` is inlined in the shared layout's head to choose the theme before paint. The footer’s Page theme selector offers System, Light and Dark; System is the default. Explicit preferences use the `portfolio-theme` localStorage key, synchronize across tabs, and work in memory if storage is blocked. Without JavaScript, the page remains readable in its default light theme and the selector stays hidden.
- The particle hero deliberately keeps its navy surface in both themes. The theme control lives in the footer, where its effect is visible, rather than over the fixed hero. All readable sections, project pages, the footer and the 404 page use the shared light/dark palette.

Use semantic utilities when adding components; their colours adapt automatically:

```astro
<section class="bg-surface text-foreground border border-border rounded-control p-6">
  <h2 class="text-section font-semibold">A section title</h2>
  <p class="mt-4 text-muted">Supporting copy.</p>
  <a class="mt-4 inline-block text-accent" href="/projects/exert/">Project details</a>
</section>
```

Core utilities: `bg-background`, `bg-surface`, `text-foreground`, `text-muted`, `text-accent`, `border-border`, `outline-focus`, `font-sans`, `max-w-content`, `py-section`, `rounded-control`, `text-title`, and `text-section`. Tailwind's usual spacing, responsive and state utilities remain available. Use `dark:*` only for theme-specific structural or visual exceptions; it follows the same `data-theme` setting. Keep dynamic utility names as complete literal strings so Tailwind can detect them.

## Design and performance

All page content is rendered to HTML at build time. There is no client-side React runtime. The full-viewport hero progressively loads one Three.js point cloud: a flowing silver-blue loop, formed from 24,000 particles (9,000 on mobile), with shader-driven movement and a local pointer disturbance. It needs no model or texture downloads. The header overlays the hero; native scrolling reveals the existing experience, projects and about sections.

Pause motion is keyboard accessible. Reduced motion renders a still formation; touch input never captures gestures or blocks page scrolling. The renderer caps pixel density at 1.5 and suspends rendering offscreen or while the tab is hidden. A quiet navy background remains if WebGL is unavailable. The former Blender sculpture source and export are retained as design assets but are not loaded by the homepage.

`SITE_URL` can override the private preview's default canonical origin. Set `SITE_URL=https://www.alexmuzzy.dev` when building a future public deployment. The sitemap and robots file use the same configured origin. No domain settings or portfolio-v2 source are changed by this project.

The `.openai/hosting.json` file holds private preview hosting metadata. `dist/` is portable static output and can also be hosted on GitHub Pages or another static host.

## Validation

`bun run check` checks TypeScript and runs the theme behaviour checks plus a Tailwind utility-generation check. `bun run build` generates all three static pages. Browser rendering, interaction QA and Lighthouse measurement are excluded at the user's request.
