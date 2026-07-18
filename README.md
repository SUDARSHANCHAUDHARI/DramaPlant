# DramaPlant

DramaPlant is a cute, dependency-free interactive web toy about a small plant with very large feelings about water.

Drag the watering can above the plant, tilt it past 25°, and discover one of ten shuffled dramatic reactions. After six successful watering attempts, the plant can finally grow into a healthy flowering plant.

## Features

- Drag-and-drop watering can with pointer, touch, and keyboard support
- Independent tilt control and SVG collision detection
- Ten plant reactions, including an umbrella, escape legs, a temporary giant tree, and returned water
- Visible mood, watering-attempt count, trust progress, and recent reaction history
- SVG scenery and CSS-generated water particles with no external assets
- Generated Web Audio effects with a persistent sound toggle
- Responsive layout, live status announcements, visible focus states, and semantic controls
- `prefers-reduced-motion` support
- No build step or production dependencies

## Requirements

- Node.js 20 or newer
- pnpm 10

## Run locally

Because the project uses only static files, you can open `index.html` directly. A small local server is recommended so the manifest and asset paths behave exactly as they will on GitHub Pages:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Verify

Run the complete production-readiness check before committing or deploying:

```bash
pnpm verify
```

The verification command checks JavaScript syntax, required files, manifest metadata, local asset references, unique DOM IDs, JavaScript-to-DOM bindings, all ten reaction styles, security-sensitive browser APIs, CSP coverage, and key accessibility hooks.

## Controls

- **Mouse or touch:** drag the watering can, then use the tilt slider to pour.
- **Keyboard:** focus the watering can and use the arrow keys to move it. Press <kbd>Space</kbd> or <kbd>Enter</kbd> to pour and <kbd>Home</kbd> to return it to its starting position. Hold <kbd>Shift</kbd> with an arrow key to move farther.
- **Sound:** use the Sound button to enable or mute generated effects.
- **Reset:** clears attempts, mood, growth, and reaction history.

## Deploy to GitHub Pages

1. Push these files to a GitHub repository.
2. Open **Settings → Pages** in the repository.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder, then save.

The included `.nojekyll` file tells GitHub Pages to serve the static project directly. No GitHub Actions workflow or build command is required.

## Project structure

```text
DramaPlant/
├── AGENTS.md           # Repository-specific development instructions
├── CHANGELOG.md        # User-facing release history
├── index.html          # Semantic page and inline SVG artwork
├── styles.css          # Visual system, responsive layout, and animation
├── script.js           # Dragging, collision, reactions, particles, and audio
├── scripts/verify.mjs  # Dependency-free production verification
├── package.json        # Reproducible pnpm commands
├── favicon.svg         # Project icon
├── site.webmanifest    # Installable-site metadata
├── SECURITY.md         # Private vulnerability-reporting guidance
├── .nojekyll           # Direct GitHub Pages serving
└── README.md
```

## Release checklist

1. Run `pnpm verify` and confirm every check passes.
2. Confirm `git status --short` contains only intentional changes.
3. Push the verified commit to `main`.
4. Enable GitHub Pages from the repository root.
5. Perform a manual interaction check with mouse, keyboard, and a narrow mobile viewport.
6. Keep the previous commit available as the rollback point.

## License

MIT © 2026 Sudarshan Chaudhari
