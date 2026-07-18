# DramaPlant repository guidance

These instructions apply to the entire repository.

## Architecture

- The production site is dependency-free HTML, CSS, inline SVG, and vanilla JavaScript.
- `index.html` owns semantic structure and SVG artwork.
- `styles.css` owns layout, visuals, animation, responsive behavior, and reduced-motion behavior.
- `script.js` owns interaction state, collision detection, reactions, particles, audio, and accessibility announcements.
- GitHub Pages serves the repository root directly; there is no generated production bundle.

## Engineering rules

- Preserve keyboard, touch, pointer, screen-reader, and reduced-motion behavior when changing interactions.
- Keep external runtime dependencies and network requests out unless a feature clearly requires them.
- Do not introduce unsafe HTML injection APIs for reaction copy or history entries.
- Keep relative asset paths compatible with GitHub project Pages.
- Do not add or change GitHub Actions workflows without Sudarshan's explicit approval.

## Verification

Run the single release gate before committing or deploying:

```bash
pnpm verify
```

For interaction or visual changes, also perform a manual review with pointer, keyboard, sound off, and reduced motion enabled. Do not create screenshots, recordings, or browser traces.
