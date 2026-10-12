# Lakshy Chaudhary — Research Portfolio

A responsive research portfolio for Lakshy Chaudhary, built with React, TypeScript, Vite, Tailwind CSS, and GSAP. The site uses a restrained dark/light theme, a typographic hero, scroll-linked research storytelling, an accessible journey gallery, a searchable project index, and static project-detail routes using the URL hash so they remain refresh-safe on GitHub Pages.

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

The workflow builds with Node.js 22 and publishes `dist/`. Vite's base path is `/`, appropriate for the custom domain. Metadata and canonical URL are configured for `https://lakshy.dev/`.

## Content editing

Project content, experience, education, certifications, skills, research areas, and editable journey entries are in `src/data.ts`. Unknown journey dates intentionally remain blank. Add code or paper destinations to a project only after a real URL has been confirmed; link controls are hidden when destinations are absent. Publication, research-note, and CV areas remain honest empty states until real material is supplied.

Journey panels are typographic rather than fabricated photography; add real image URLs and alt text only when owner-supplied media is available. All projects are presented as ongoing. No results, publication claims, project-specific limitations, metrics, or external accounts are inferred.

## Accessibility and motion

The site keeps semantic content in the page, supports keyboard access and visible focus, includes a skip link and reduced-motion behavior, and uses native scrolling. Desktop project pinning and pointer parallax are disabled for reduced-motion preferences; the pinned showcase becomes a normal list on smaller screens. Theme preference is stored locally when browser storage is available.
