# ericknoess.github.io

Professional profile of **Erick Noé Sánchez Sánchez**, Tech-Enabled Operations Leader & Biotech Engineer.

**Live site:** https://ericknoess.github.io

A single static page: measured results, core capabilities with linked evidence, career timeline, skills and education. Every figure on the page is either taken verbatim from the CV or calculated from dates, never typed by hand.

## Stack

- Plain HTML, CSS and JavaScript (ES modules). No framework, no build step, no npm dependencies.
- [GSAP 3.15.0](https://gsap.com) (core, ScrollTrigger, SplitText), self-hosted in `vendor/gsap/`, for decorative animations only.
- [IBM Plex Sans and Mono](https://github.com/IBM/plex), self-hosted in `fonts/` (Latin subset).
- Hosted on GitHub Pages from the `master` branch.

## Project structure

```
index.html            Page shell: metadata, Content Security Policy, loading and error states
404.html              Custom "page not found" (absolute paths: served at any missing URL)
content/profile.json  The only data source for the page
css/                  Design tokens, layout and print styles
js/main.js            Loads and validates the data, renders each section
js/lib/               Validation, derived figures, formatting and a safe DOM helper
js/render/            One module per section
js/anim.js            Animations (optional layer)
tests/                Automated checks (Node.js built-in test runner)
```

## Run locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. The page loads `content/profile.json` with `fetch`, so it must be served over HTTP rather than opened as a file.

## Tests

Uses the Node.js built-in test runner (tested with Node.js 26).

```sh
node --test
```

The tests check:

- **Data:** the data model, cross-references between capabilities and the achievements they cite, and calculated figures (years of experience, leadership periods, team sizes).
- **Fidelity:** the published metrics match the CV verbatim, and every number in a capability appears in its evidence.
- **Assets:** all scripts, styles, fonts and images are local and exist.
- **Privacy:** no private files or excluded personal data are published, and images carry no metadata.

## Editing content

All content lives in `content/profile.json`. Each item records its `source`. Items with `"approved": false` are hidden from the page until they are reviewed. Run the tests after every change: the page shows an error state if the data is invalid, and the tests catch that before publishing.

## Design principles

- **Accessible:** WCAG 2.1 AA, semantic landmarks, visible focus and full text alternatives for every figure.
- **Robust:** the content stays visible without JavaScript animations, with "reduce motion" enabled, and when printed.
- **Private by default:** strict Content Security Policy, no third-party requests, no cookies or analytics, and `noindex` so the page is reached by direct link only.

## Third-party licenses

- GSAP: [Standard "no charge" license](https://gsap.com/standard-license).
- IBM Plex: SIL Open Font License 1.1 (see `fonts/OFL.txt`).
