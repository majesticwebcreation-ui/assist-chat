# RelayDesk Static SaaS Demo

RelayDesk is an original static-first SaaS web app and landing page for an AI customer-support agent product. It includes a marketing page, dashboard, demo data, simulated CRUD, charts, lead capture, human handoff, billing settings, widget customization, and a front-end chat widget.

## Folder Structure

```text
.
├── index.html
├── app.html
├── assets/
│   └── logo.svg
├── css/
│   └── styles.css
├── js/
│   ├── main.js
│   └── app.js
└── data/
    └── demo.json
```

## Run Locally

Open `index.html` directly in a browser, or run a static server from this folder:

```powershell
python -m http.server 4173
```

Then visit `http://localhost:4173/`.

## Upload To GitHub

1. Create a new GitHub repository.
2. Commit this folder:

```powershell
git init
git add .
git commit -m "Build RelayDesk static SaaS demo"
git branch -M main
git remote add origin https://github.com/YOUR-USER/YOUR-REPO.git
git push -u origin main
```

3. For GitHub Pages, open repository settings, choose Pages, set the source to the `main` branch, and save.

## Host On Hostinger

1. Open Hostinger hPanel and choose your website.
2. Go to File Manager or use Git deployment if enabled.
3. Upload the contents of this folder into `public_html`.
4. In Domains, point or connect your domain to the hosting plan.
5. Confirm `index.html` loads and `app.html` is reachable from the header CTAs.

## Update Branding And Content

- Replace `assets/logo.svg` with your own mark.
- Edit colors in `css/styles.css` under `:root`.
- Update marketing copy in `index.html`.
- Update dashboard demo entities in `data/demo.json`.
- Adjust the chat widget script snippet in `app.html` under Settings/Billing.

## Replace Demo Data Later

The dashboard loads `data/demo.json` with `fetch()` and falls back to bundled in-memory data if opened directly from a browser that blocks file fetches. To connect real APIs later:

1. Replace `loadData()` in `js/app.js` with authenticated API calls.
2. Store agents, sources, conversations, leads, usage, and widget settings in your backend.
3. Replace mock save handlers with `POST`, `PATCH`, and `DELETE` requests.
4. Keep the static UI shell and progressively wire each view to live data.
