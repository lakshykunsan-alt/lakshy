# Lakshy Chaudhary — Research Portfolio

The research portfolio at [lakshy.dev](https://lakshy.dev), built with React, TypeScript, Vite, Tailwind CSS and GSAP. It has a cinematic look — near-black with crimson accents, oversized condensed type (Anton, with Archivo and IBM Plex Mono) and real photography — plus an off-white light theme, and it is available in English, Korean and Hindi. Project pages use hash URLs (`#/projects/<slug>`), so they survive a refresh on GitHub Pages.

## Requirements

- Node.js 22 (used by the deployment workflow)
- npm

## Local development

```sh
npm install
npm run dev
```

## Checks and production build

```sh
npm run typecheck
npm run build
npm run preview
```

The production output is generated in `dist/`. Project details use URLs like `/#/projects/worldripple`; the hash route survives refreshes without server-side routing or a GitHub Pages rewrite. Relative asset paths support both the custom domain and a repository subpath.

## GitHub Pages deployment

1. Push this repository to GitHub and use the `main` branch (or update `.github/workflows/deploy.yml` if the deployment branch differs).
2. In repository settings, set Pages' source to **GitHub Actions**.
3. Configure `lakshy.dev` with the DNS records required by GitHub Pages and keep the `public/CNAME` file in place.
4. Push to `main` or run the **Deploy to GitHub Pages** workflow manually.

The workflow builds with Node.js 22 and publishes `dist/`. Vite's base path is `./`, so assets resolve on the custom domain and on a repository subpath. Metadata and canonical URL are configured for `https://lakshy.dev/`.

## Content editing

- **Structure and English text** live in `src/data.ts`: projects (with their photo, credit URL and related research areas), experience, education, certificates, research areas and the places in the journey.
- **Translations** live in `src/i18n.ts`. English is read from `data.ts`, while the Korean (`ko`) and Hindi (`hi`) blocks are written by hand. A fact change must be made in `data.ts` and in both translation blocks.
- **Languages** are picked from `?lang=en|ko|hi`, then the visitor's last choice (localStorage `lakshy-lang`), then the browser language. Korean and Hindi fonts load only when those languages are used.
- **Photos**: the project images in `public/images/` are credited Unsplash stock photos, labelled as such on the site. They are not research media. The portrait (`public/lakshy.jpg`) is 400×400, so the hero shows it at about that size; a larger original (1600 px or more on the long side) would let it grow.
- **Theme**: dark is the default. A visitor's choice is remembered under localStorage `lakshy-scheme` only after they press the toggle.
- **Unknown information stays out.** Journey dates may be blank, limitations are hidden while empty, and code or paper links appear only once a real URL is added to a project. Publications and field notes show an honest empty state until there is something to share. Nothing about results, metrics or affiliations is inferred.

## Accessibility and motion

The site keeps semantic content in the page, supports keyboard use with visible focus and a skip link, moves focus to the heading when a project opens, and restores the reading position when you go back. All animation respects `prefers-reduced-motion`. Cursor effects and scroll-linked parallax only run with a mouse (touch devices get the reveals without the drift), and the scrolling list of research areas has a pause button. Scroll reveals animate opacity only, so content stays reachable by keyboard and screen readers before it is revealed.
