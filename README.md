# AI Skunkworks / Unit–47

Northeastern student-led AI research group site: a static, multi-page front end with shared chrome (classification banner, sticky nav, footer) and no build step. Open the HTML files directly or serve the folder with any static file server.

## Run locally

From the project root:

```bash
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

Or open `index.html` in your browser (relative asset paths work when served from the repo root).

## Structure

```
ai-skunkworks/
├── index.html
├── projects.html
├── manifesto.html
├── people.html
├── events.html
├── scripts/
│   └── main.js
└── styles/
    ├── tokens.css
    ├── base.css
    ├── components.css
    ├── layout.css
    ├── pages-index.css
    ├── pages-events.css
    └── pages-projects.css
```

## Deploying to GitHub Pages

1. Push the repo to GitHub.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose branch **main** and folder **/ (root)**.
5. Save. The site will be served from the repo root after the next deploy.

The `.nojekyll` file at the repo root tells GitHub Pages not to run Jekyll (so paths and static assets behave as expected).

## Conventions

- **Class names:** BEM-style blocks such as `site-sticky-nav__*` and `site-footer__*`.
- **Theming:** Use CSS custom properties from `styles/tokens.css`; avoid hardcoded colors except the classification banner red (`#ff3a3a`).
- **Active nav:** Set `aria-current="page"` on the current page’s link in each HTML file. There is no client-side routing.
