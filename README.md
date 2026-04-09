# Sankalan — Developer Portfolio

> **संकलन** *(Sanskrit)* — a collection; a compilation of works.

A high-performance, full-stack personal portfolio built with **Angular 21 SSR**, **Three.js**, and **GSAP**. Deployed on **Fly.io** with Server-Side Rendering intact and a live contact form powered by **Resend**.

Live: **[sankalan.fly.dev](https://sankalan.fly.dev)**

---

## What this project is

Sankalan is a developer portfolio that doubles as a production-grade Angular SSR application — not just a static site. It was built to showcase 10+ years of full-stack work while also being a demonstration of the stack itself:

- **Angular 21 SSR** on a real Express server (not prerendered static HTML)
- **Three.js starfield** backgrounds across every page, computed on the GPU with `UnrealBloomPass`
- **GSAP + ScrollTrigger** animations on scroll
- **Live contact form** — submissions are delivered to email via Resend's API
- **SEO-first** — `SeoService` + `JsonLdService` inject correct `<title>`, meta, Open Graph, Twitter Card, canonical URLs and JSON-LD structured data (`Person` + `WebSite`) per route, served from the server
- **CI/CD** — GitHub Actions builds and deploys to Fly.io on every push to `main`

---

## Pages

| Route | Content |
|---|---|
| `/` | Hero — Three.js warp-star animation, name, title, CTA |
| `/about` | Career timeline (2015 → present), skills grid, certifications, hackathon |
| `/projects` | 10 projects across frontend, backend and enterprise client work |
| `/contact` | Two-column layout — info panel + live email form |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (standalone components, SSR via `@angular/ssr`) |
| Language | TypeScript (strict mode) |
| Styling | SCSS with CSS custom property design tokens |
| 3D / WebGL | Three.js 0.183 + `UnrealBloomPass` post-processing |
| Animations | GSAP 3 + ScrollTrigger |
| Email | Resend (Node.js SDK) |
| Server | Express.js (Angular SSR host + `/api/*` endpoints) |
| Deployment | Fly.io (Docker, Singapore region) |
| CI/CD | GitHub Actions — build + `flyctl deploy --remote-only` |
| Fonts | Cormorant Garamond (display serif), Inter (sans), JetBrains Mono |
| SEO | `SeoService`, `JsonLdService`, `sitemap.xml`, `robots.txt` |
| Linting | ESLint + Angular ESLint + Prettier |

---

## Projects featured

| # | Project | Stack |
|---|---|---|
| 1 | **Sankalan** — this portfolio | Angular 21, Three.js, GSAP, SSR |
| 2 | **Tantuka** — saree e-commerce frontend | Next.js 14, Tailwind, Framer Motion |
| 3 | **IDA** — interactive resume builder | Angular 19, Three.js, Go, PostgreSQL |
| 4 | **Kapaat** — Tantuka admin panel | Angular 21, SSR, JWT |
| 5 | **Echelon Cuisine** — restaurant website | Next.js 14, Tailwind |
| 6 | **Kapas** — Tantuka e-commerce backend | Go, Gin, PostgreSQL, Redis, Razorpay |
| 7 | **ArthaLedger** — personal finance API | Go, Gin, PostgreSQL, Redis, 102 unit tests |
| 8 | **IT Observability Platform** — amasol | Angular, Dynatrace (enterprise) |
| 9 | **Insurance Platform** — Renewbuy | Angular 12, SSO-SDK, NGINX |
| 10 | **intelligent.** — Finatwork | AngularJS, financial planning |

---

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── interceptors/    # HTTP logging interceptor
│   │   ├── models/          # TypeScript domain interfaces (Project, Skill, TimelineEntry…)
│   │   └── services/        # SEO, JSON-LD, API, animations, portfolio data (mock → Go backend)
│   ├── features/
│   │   ├── home/            # Hero — Three.js warp-star canvas + GSAP entrance
│   │   ├── about/           # Career timeline, skills, certifications, hackathon
│   │   ├── projects/        # Project card grid with hover overlays
│   │   └── contact/         # Reactive form → POST /api/contact → Resend
│   ├── layout/
│   │   ├── navbar/          # Transparent minimal navbar
│   │   ├── footer/          # Social links footer
│   │   └── shell/           # Route shell with skip-link
│   ├── shared/
│   │   └── cursor/          # Custom circular cursor (mix-blend-mode: exclusion)
│   └── three/
│       └── scenes/          # particle-scene.service.ts — shared Three.js starfield
├── environments/            # Dev / production environment config
└── styles/
    ├── tokens/              # _colors.scss, _spacing.scss, _typography.scss
    ├── base/                # _reset.scss, _mixins.scss
    └── components/          # _utilities.scss
```

---

## Architecture notes

- **Mock-first, backend-ready** — all data lives in `PortfolioDataService` as typed mock arrays. Every method returns an `Observable<T>` matching Go backend contracts defined in `api.models.ts`. Switching to a real API is a one-line change per method.
- **SSR** — the app ships with `outputMode: "server"`, meaning Angular renders HTML on the server for every request. This gives real first-paint content for crawlers and users alike, unlike prerendering.
---

## Getting Started

### Prerequisites
- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Development server

```bash
npm start
```

Open `http://localhost:4200`.

### SSR dev server

```bash
npm run build:prod
npm run serve:ssr
```

Open `http://localhost:4000`.

### Production build

```bash
npm run build:prod
```

Output: `dist/sankalan/`

---

## Deployment

The app is deployed on **Fly.io** as a Docker container.

### One-time setup

```bash
# Install flyctl
iwr https://fly.io/install.ps1 -useb | iex

# Log in and create the app
fly auth login
fly apps create sankalan

# Set the Resend API key as a Fly secret
fly secrets set RESEND_API_KEY=re_xxxx -a sankalan
```

Add `FLY_API_TOKEN` (output of `fly auth token`) to your GitHub repo → **Settings → Secrets → Actions**.

### Auto-deploy

Every push to `main` triggers `.github/workflows/deploy.yml` which builds the app and runs `flyctl deploy --remote-only`.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm start` | Angular dev server |
| `npm run build:prod` | Production build with SSR |
| `npm run serve:ssr` | Serve the SSR build locally |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Prettier write |
| `npm run format:check` | CI-safe format check |

---

## SEO

- Per-route `<title>` + `<meta description>` via `SeoService`
- Open Graph + Twitter Card tags
- Canonical `<link>` per route
- JSON-LD structured data (`Person` + `WebSite` schemas)
- `robots.txt` + `sitemap.xml`
- Full SSR — search engines receive rendered HTML, not a blank shell

---

## License

MIT


---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (standalone, SSR via `@angular/ssr`) |
| Language | TypeScript (strict mode) |
| Styling | SCSS with CSS custom properties design tokens |
| 3D / WebGL | Three.js 0.183 + UnrealBloomPass |
| Animations | GSAP + ScrollTrigger |
| Fonts | Cormorant Garamond (serif display), Inter (sans), JetBrains Mono |
| SEO | SeoService, JsonLdService (Person + WebSite schema), sitemap, robots.txt |
| Linting | ESLint + Angular ESLint + Prettier |

---

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── interceptors/    # HTTP logging interceptor
│   │   ├── models/          # TypeScript domain interfaces
│   │   └── services/        # SEO, JSON-LD, API, animations, portfolio data
│   ├── features/
│   │   ├── home/            # Hero section (Three.js warp-star canvas)
│   │   ├── about/           # Timeline
│   │   ├── projects/        # Project card grid
│   │   ├── skills/          # Skill progress bars
│   │   └── contact/         # Reactive form
│   ├── layout/
│   │   ├── navbar/          # Transparent minimal navbar
│   │   ├── footer/          # Social links footer
│   │   └── shell/           # Route shell with skip-link
│   ├── shared/
│   │   └── cursor/          # Custom circular cursor (mix-blend-mode: exclusion)
│   └── three/
│       └── scenes/          # particle-scene.service.ts — warp star field
├── environments/            # Dev / production API base URLs
└── styles/
    ├── tokens/              # _colors.scss, _spacing.scss, _typography.scss
    ├── base/                # _reset.scss, _mixins.scss
    └── components/          # _utilities.scss
```

---

## Getting Started

### Prerequisites
- Node.js 22+
- npm 10+

### Install dependencies

```bash
npm install
```

### Development server

```bash
npm start
# or
ng serve
```

Open `http://localhost:4200`. The app reloads automatically on changes.

### SSR development server

```bash
npm run serve:ssr
```

### Production build

```bash
npm run build:prod
```

Artefacts are written to `dist/sankalan/`.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm start` | Angular dev server |
| `npm run build:prod` | Production build with SSR prerender |
| `npm run serve:ssr` | Serve the SSR build locally |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Prettier format check |
| `npm run format:check` | CI-safe format check (no write) |

---

## SEO Features

- Per-route `<title>` + `<meta description>` via `SeoService`
- Open Graph + Twitter Card tags
- Canonical `<link>` per route
- JSON-LD structured data (`Person` + `WebSite` schemas)
- `robots.txt` + `sitemap.xml`
- SSR prerendering of all 5 routes for instant first paint

---

## License

MIT


## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
