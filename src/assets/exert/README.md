# Exert mobile screenshots

Captured from the running Exert development build on the iPhone 17 Pro Max simulator. Original PNG captures; no generated or retouched UI. The simulator status bar was temporarily standardised to 9:41 and the Expo tools overlay was suppressed for the capture session. Status-bar overrides were cleared afterward.

## Placement

- Homepage: use 01-home.png as one compact, upright phone image beside the existing Exert summary. Link the project entry to /projects/exert/. Keep the portfolio hero focused on Alex.
- Detail page: use 02-program.png, 03-workout.png and 04-history.png as a Plan → Log → Review sequence, each with one short caption. Three columns on wide screens; stacked figures on narrow screens. Keep screenshots large enough to understand, with optional links to the originals.
- Use 05-muscle-coverage.png as optional supporting material beside the analytics paragraph, or save it for a later product update. It is less visually strong with the current sparse dataset.
- Preserve the real screen proportions. A subtle CSS border and corner radius is sufficient; avoid perspective tilts and heavy device mockups that make text harder to read.
- Keep explanations in HTML, not only inside screenshots. Write concise alt text describing each screen's purpose. Do not claim accessibility based on screenshot appearance.
- When integrating, import these source PNGs through Astro Image/Picture to generate responsive WebP/AVIF output with explicit dimensions. Lazy-load images below the fold. Do not serve every full-resolution original on initial load.

These images contain development-build account and training data. Program ratings and usage counts visible in them are illustrative UI data, not evidence of product adoption. No existing completed workout was edited; the empty workout opened during capture was discarded.

## Files and captions

- `01-home.png` — **Home:** Your next session and weekly consistency, at a glance.
- `02-program.png` — **Plan:** Find a program and see how the training is structured.
- `03-workout.png` — **Log:** Record sets, reps and weight during a session.
- `04-history.png` — **Review:** Look back over your training calendar and completed sessions.
- `05-muscle-coverage.png` — **Muscle coverage:** Compare weekly training volume across muscle groups.

## Integration reference

https://docs.astro.build/en/guides/images/

The homepage renders the Home screenshot beside its Exert summary. The detail page renders Program, Workout and History as a Plan → Log → Review sequence, with three columns from 900px and stacked figures below. Images use Astro-generated responsive WebP sources, explicit dimensions and lazy loading. Muscle coverage remains unused supporting material. No deployment was performed.
