# Sankalan — Developer Portfolio

A modern, high-performance personal portfolio built with **Angular 21**, **Three.js**, and **GSAP**. Features an immersive SpaceX-inspired warp-star entry animation, editorial serif typography, a custom cursor, Server-Side Rendering (SSR), and a fully responsive design.

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
