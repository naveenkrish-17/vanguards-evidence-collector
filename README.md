# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## Evidence Collector - Quick Start

This project includes an `EvidenceForm` to capture frontend or backend feature test information and export it as a PDF.

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

The form is available on the app root. When you fill fields and click `Export evidence (PDF)`, the form will be captured and downloaded as a PDF.

## Deploy to GitHub Pages

This repo is configured to deploy the built `dist` folder to GitHub Pages using the `gh-pages` package.

1. Ensure the project is committed to a GitHub repo (e.g., `origin` remote exists).
2. Install the new dev dependency:

```bash
npm install --save-dev gh-pages
```

3. Deploy (this runs `npm run build` then publishes `dist`):

```bash
npm run deploy
```

4. In your GitHub repo settings -> Pages, set the source to `gh-pages` branch (if not set automatically).

Notes:
- The Vite `base` is already set to `./` to allow relative asset paths on GitHub Pages.
- If your repository has a project page path (username.github.io/repo), this setup will work. For user/organization pages (username.github.io) you may want `base: '/'` instead.
