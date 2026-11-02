# neu_skunkworks_website

A static website for NEU AI Skunkworks. No build step required.

## Contents

- `index.html` - main landing page
- `projects.html` - current and past projects
- `manifesto.html` - mission statement or manifesto
- `people.html` - crew roster, institutional dossier, and contact
- `events.html` - events and conversational intake terminal
- `scripts/main.js` - site behavior (clock, mobile nav, crew TOC, theme zones)
- `scripts/events.js` - events page behavior
- `scripts/intake.js` - intake terminal on events page
- `styles/` - CSS for tokens, base, layout, components, and per-page styles
- `assets/` - logos and favicon

## Theme

The site is white with a deep green accent by default. While a section tagged
`data-theme-zone="dark"` is in view, the page switches to black with a green
glow, then back to white once it scrolls out. On the home page the layers and
operations sections are dark zones.

- Colors live in `styles/tokens.css`: the default theme on `:root`, the dark
  theme on `:root[data-theme="dark"]`. Use the tokens (`--paper`, `--ink`,
  `--accent`, plus `--accent-rgb` / `--paper-rgb` for `rgba()`) instead of
  hardcoded colors so both themes work.
- The scroll switch is the "theme zones" block at the end of `scripts/main.js`.
- To make another section dark, add `data-theme-zone="dark"` to it.

## Local Preview

Open any `.html` file directly in your browser, or use a simple local server.

```powershell
cd d:\Projects\ai-skunkworks
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Deploying

The site is plain static files, so it deploys to Vercel as-is. Import the
GitHub repo, set the framework preset to "Other", and leave the build command
and output directory empty.

## Notes

- Add any assets, tooling, or environment files to `.gitignore` as needed.
- Local dev servers cache CSS and JS; hard-refresh after editing styles.
