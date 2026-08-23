# DramaPlant

> A tiny interactive plant with very big feelings about being watered.

DramaPlant is a cute, dependency-free browser experience built with HTML, CSS, inline SVG, and vanilla JavaScript. Drag the watering can above the flowerpot, tilt it past 25°, and watch the plant respond with one of ten shuffled dramatic reactions. After six successful watering attempts, the plant can finally become a healthy flowering plant.

The project is designed for direct deployment to GitHub Pages without a build step, runtime dependencies, backend, or external asset hosting.

## Table of Contents

- [Highlights](#highlights)
- [Plant reactions](#plant-reactions)
- [Technology](#technology)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Controls](#controls)
- [Accessibility](#accessibility)
- [Privacy and security](#privacy-and-security)
- [Verify](#verify)
- [Deploy to GitHub Pages](#deploy-to-github-pages)
- [Project structure](#project-structure)
- [Release checklist](#release-checklist)
- [License](#license)
- [About](#about)

## Highlights

- Pointer and touch dragging with independent watering-can tilt
- Keyboard movement and pouring controls
- SVG-based collision detection between the can and plant
- Ten shuffled reactions without immediate repetition
- Visible mood, watering-attempt count, trust progress, and reaction history
- CSS-generated water particles and code-generated Web Audio effects
- Persistent sound preference with no analytics or account requirement
- Responsive room scene for desktop and mobile layouts
- Screen-reader announcements, semantic controls, and visible keyboard focus
- Reduced-motion behavior through `prefers-reduced-motion`
- Restrictive Content Security Policy and no external runtime requests
- Direct GitHub Pages deployment from the repository root

## Plant reactions

Every successful pour draws from a shuffled reaction deck:

1. Opens an emergency umbrella
2. Moves away from the water
3. Grows downward on principle
4. Becomes a giant tree briefly
5. Drinks every last drop
6. Displays a “Too much water” complaint
7. Shakes water from its leaves
8. Grows legs and attempts to escape
9. Shows a flower and quickly hides it
10. Gives the water back to the watering can

Once six watering attempts have earned enough trust, the **Let the plant bloom** control unlocks the permanent healthy flowering state.

## Technology

| Area | Implementation |
| --- | --- |
| Structure | Semantic HTML5 |
| Artwork | Inline SVG |
| Styling | Native CSS with responsive media queries |
| Interaction | Vanilla JavaScript and Pointer Events |
| Collision | SVG target bounds and rotated nozzle geometry |
| Sound | Web Audio API oscillators and generated noise |
| Persistence | `localStorage` for the sound preference only |
| Deployment | Static files served directly by GitHub Pages |
| Verification | Dependency-free Node.js release checks |

There are no production packages, frameworks, analytics SDKs, fonts, images, or audio files downloaded at runtime.

## Requirements

- Node.js 20 or newer for repository verification
- pnpm 10 for the documented commands
- A modern browser with Pointer Events, SVG, and Web Audio support

No dependency installation or compilation is required to run the site.

## Getting started

Clone the repository and enter the project directory:

```bash
git clone https://github.com/SUDARSHANCHAUDHARI/DramaPlant.git
cd DramaPlant
```

The repository is private before public release, so cloning requires access to the `SUDARSHANCHAUDHARI` GitHub account or an authorized collaborator account.

### Run locally

The site can be opened directly through `index.html`. A local static server is recommended so the manifest and relative paths behave like GitHub Pages:

```bash
python3 -m http.server 8080
```

Visit `http://localhost:8080`.

## Controls

| Input | Action |
| --- | --- |
| Mouse or touch drag | Move the watering can |
| Tilt slider | Rotate the can from 0° to 55° |
| Arrow keys | Move the focused watering can |
| Shift + Arrow key | Move the can a larger distance |
| Space or Enter | Tilt and pour from the focused can |
| Home | Return the can to its starting position |
| Sound button | Enable or mute generated effects |
| Reset button | Clear attempts, growth, mood, and reaction history |

A pour counts only when the can is tilted to at least 25° and the calculated nozzle position overlaps the plant’s watering target.

## Accessibility

DramaPlant includes:

- A skip link and semantic page landmarks
- Native buttons and a native range input
- Keyboard-operable watering-can movement and pouring
- Documented `aria-keyshortcuts` for the draggable can
- Polite live-region announcements for plant reactions and state changes
- Visible focus treatment for interactive elements
- Text-based mood and history so reactions are not communicated by animation alone
- A `prefers-reduced-motion: reduce` mode that shortens or removes nonessential motion
- Touch targets and layouts suitable for narrow mobile screens

## Privacy and security

DramaPlant has no backend, accounts, cookies, advertising, analytics, telemetry, or network API calls. It stores only the `dramaplant-sound` preference in the browser’s local storage.

The page includes a Content Security Policy restricting scripts and assets to the project itself, blocking network connections and embedded objects. Generated sounds are synthesized locally through Web Audio; the project does not access a microphone or record audio.

See [SECURITY.md](SECURITY.md) for private vulnerability-reporting instructions.

## Verify

Run the complete production-readiness gate before committing or deploying:

```bash
pnpm verify
```

Run the equivalent test command with:

```bash
pnpm test
```

Verification covers:

- JavaScript syntax
- Required production and documentation files
- Manifest metadata and project-safe relative paths
- Local asset existence
- Unique HTML IDs and JavaScript-to-DOM bindings
- All ten reaction definitions and CSS behaviors
- Unsafe dynamic HTML execution APIs
- Content Security Policy directives
- Keyboard, touch, live-region, and reduced-motion hooks

Visual and interaction changes should additionally receive a manual browser review using pointer, keyboard, sound-off, mobile-width, and reduced-motion configurations. Screenshots, recordings, and browser traces are not part of this project’s verification workflow.

## Deploy to GitHub Pages

DramaPlant deploys directly from source; no generated build directory or GitHub Actions workflow is required.

1. Push the verified commit to the `main` branch.
2. Open **Settings → Pages** in the GitHub repository.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose the `main` branch and `/ (root)` folder.
5. Save and wait for GitHub Pages to publish the site.
6. Manually verify dragging, keyboard controls, sound, mobile layout, and reduced motion on the deployed URL.

The `.nojekyll` file instructs GitHub Pages to serve the repository’s static files directly. Relative asset and manifest paths are compatible with a project Pages URL.

## Project structure

```text
DramaPlant/
├── .gitignore          # Secrets, local files, caches, and generated output
├── .nojekyll           # Direct GitHub Pages serving
├── AGENTS.md           # Repository-specific development instructions
├── CHANGELOG.md        # User-facing release history
├── LICENSE             # MIT license text
├── README.md           # Project documentation
├── SECURITY.md         # Vulnerability-reporting guidance
├── favicon.svg         # Standalone project icon
├── index.html          # Semantic page and inline SVG artwork
├── package.json        # Reproducible pnpm commands and version metadata
├── script.js           # State, dragging, collision, reactions, particles, and audio
├── scripts/
│   └── verify.mjs      # Dependency-free production verification
├── site.webmanifest    # Installable-site metadata
└── styles.css          # Visual system, animation, responsive and reduced-motion styles
```

## Release checklist

1. Run `pnpm verify` and confirm every check passes.
2. Confirm `git status --short` contains only intentional changes.
3. Review [CHANGELOG.md](CHANGELOG.md) and update the version when required.
4. Push the verified commit to `main`.
5. Perform the manual browser interaction review.
6. Enable GitHub Pages only after the private production candidate is approved.
7. Keep the previous commit available as the rollback point.

## License

DramaPlant is available under the [MIT License](LICENSE).

Copyright © 2026 Sudarshan Chaudhari. All rights reserved except as granted by the MIT License.

---

## About

I'm Sudarshan Chaudhari, a Senior Quality Engineer, Test Automation specialist, and AI systems builder based in Bangkok, Thailand.

I have 13+ years of experience in software quality engineering, working across SaaS, fintech, gaming, web, mobile, cloud, and digital signage platforms. My background combines hands-on test automation with QA leadership, test strategy, CI/CD, release quality, production investigation, and cross-platform validation.

Alongside my professional QA career, I run [SudarshanTechLabs](https://sudarshantechlabs.com/), my independent engineering and product lab where I design, build, test, and ship software across Android, web, AI, cybersecurity, developer tooling, and cross-platform applications.

### What I work on

- ⚙️ **Quality Engineering & Test Automation** — Playwright, Selenium, Cypress, Appium, API testing, automation frameworks, end-to-end testing, CI/CD, release gates, GitHub Actions, risk-based testing, and production validation
- 🤖 **AI Systems & Automation** — AI agents, multi-agent orchestration, MCP servers, AI-assisted QA, prompt tooling, developer workflows, automation systems, and Claude Code plugins
- 📱 **Mobile & Cross-Platform Applications** — Android applications built with Kotlin and Jetpack Compose, Google Play releases, automated build and publishing pipelines, and cross-platform development spanning iOS, web, Windows, and macOS
- 🌐 **Web Applications & Platforms** — Full-stack applications using Next.js, TypeScript, Firebase, Cloudflare, REST APIs, and modern web infrastructure
- 🛠️ **Developer Tooling & CLI Engineering** — Rust, Python, TypeScript, CLI utilities, multi-repository tooling, build automation, release tooling, and engineering productivity systems
- 🛡️ **Cybersecurity & Observability** — Threat detection, log analysis, security auditing, vulnerability assessment, monitoring, and security-focused developer tools
- 📺 **Digital Signage & Device Platforms** — Content validation, playback testing, device compatibility, production investigation, monitoring, and QA across diverse hardware and operating-system environments

My work sits at the intersection of quality engineering, automation, AI, and software development. I approach products with a QA mindset from the beginning: understanding failure modes, designing for testability, automating repetitive work, and building release confidence into the engineering process.

Through SudarshanTechLabs, I also build products and tools from idea to production, covering architecture, development, testing, CI/CD, release automation, monitoring, and ongoing maintenance.

🌐 [sudarshantechlabs.com](https://sudarshantechlabs.com/) · 💼 [LinkedIn](https://linkedin.com/in/sudarshan-chaudhari) · 🐙 [GitHub](https://github.com/SUDARSHANCHAUDHARI) · ✉️ [sunny.sudarshan@gmail.com](mailto:sunny.sudarshan@gmail.com)
