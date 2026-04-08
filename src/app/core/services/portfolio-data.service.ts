import { inject, Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Observable, of } from 'rxjs';
import type { Project, Skill, TimelineEntry, ContactForm, Certification, Hackathon } from '../models/api.models';

// ─── Static mock data (Phase 1) ──────────────────────────────
// Replace each `of(MOCK_*)` call with `this.api.get<T>(...)` when Go backend is ready.

const MOCK_PROJECTS: Project[] = [
  // ── UI projects with GitHub repos ────────────────────────────
  {
    id: '1', slug: 'sankalan', title: 'Sankalan — Developer Portfolio',
    description: 'High-performance Angular SSR portfolio with Three.js solar scene, GSAP animations, and a Star Wars crawl intro.',
    techStack: ['Angular 19', 'TypeScript', 'Three.js', 'GSAP', 'SCSS', 'Go'],
    imageUrl: '/assets/projects/portfolio.svg', featured: true, order: 1,
    repoUrl: 'https://github.com/nilabhsubramaniam/Sankalan', createdAt: '2026-01-01',
  },
  {
    id: '6', slug: 'tantuka', title: 'Tantuka — Saree E-Commerce Frontend',
    description: 'Next.js 14 storefront for Tantuka, a premium Indian saree marketplace. Features state-based product browsing across all 28+ Indian states, PWA support, cart/auth flows, and premium Framer Motion animations — connects to the Kapas Go backend.',
    longDescription: 'Complete React/Tailwind/Framer Motion UI covering product listing, detail, cart, checkout, and auth pages. Includes a service worker for PWA offline support, Google Maps integration for store locator, and a GitHub Actions workflow for automated deployment to GitHub Pages.',
    techStack: ['Next.js 14', 'React 18', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'PWA'],
    imageUrl: '/assets/projects/tantuka.png', featured: true, order: 2,
    repoUrl: 'https://github.com/nilabhsubramaniam/Tantuka',
    liveUrl: 'https://nilabhsubramaniam.github.io/Tantuka/',
    createdAt: '2025-12-03',
  },
  {
    id: '7', slug: 'ida', title: 'IDA — Interactive Resume Builder',
    description: 'Angular 19 resume builder with a drag-and-drop section editor, multiple professional templates (Modern, Creative, Academic), live theme picker, PDF/shareable-link export, and an immersive Three.js starfield background.',
    longDescription: 'Built entirely with standalone Angular 19 components, IDA features a self-contained shared UI library (resume fields, modals, toggles), JWT-guarded routes, an HTTP interceptor, and a Go + PostgreSQL backend. Deployed to GitHub Pages via automated CI/CD.',
    techStack: ['Angular 19', 'TypeScript', 'SCSS', 'Three.js', 'Go', 'PostgreSQL'],
    imageUrl: '/assets/projects/ida.png', featured: true, order: 3,
    repoUrl: 'https://github.com/nilabhsubramaniam/ida',
    liveUrl: 'https://nilabhsubramaniam.github.io/ida/#/ida/',
    createdAt: '2025-06-14',
  },
  {
    id: '8', slug: 'kapaat', title: 'Kapaat — Tantuka Admin Panel',
    description: 'Angular 21 admin panel for the Tantuka e-commerce backend. JWT login, protected routes, analytics dashboard, user management, and product management — all with SSR enabled and a clean dark-sidebar UI.',
    techStack: ['Angular 21', 'TypeScript', 'SCSS', 'SSR', 'JWT'],
    imageUrl: '/assets/projects/kapaat.png', featured: true, order: 4,
    repoUrl: 'https://github.com/nilabhsubramaniam/kapaat',
    createdAt: '2025-12-07',
  },
  {
    id: '9', slug: 'echelon-cuisine', title: 'Echelon Cuisine — Restaurant Website',
    description: 'Next.js 14 restaurant website with daily specials, catering section, Google Maps store locator, and a polished Tailwind CSS UI.',
    techStack: ['Next.js 14', 'TypeScript', 'Tailwind CSS'],
    imageUrl: '/assets/projects/echelon-cuisine.png', featured: false, order: 5,
    repoUrl: 'https://github.com/nilabhsubramaniam/echelon-cuisine',
    createdAt: '2024-10-03',
  },
  // ── Backend projects with GitHub repos ───────────────────────
  {
    id: '4', slug: 'kapas', title: 'Kapas — Tantuka E-Commerce Backend',
    description: 'Production-grade e-commerce backend for Tantuka, a premium Indian saree marketplace. Handles the full order lifecycle — cart to delivery — with multi-warehouse inventory, real-time logistics tracking, Razorpay payments, admin analytics, and a 25-table PostgreSQL schema.',
    longDescription: 'Kapas (meaning "cotton" in Hindi) is a scalable Go backend powering Tantuka. Features include JWT auth with role management (Customer / Admin / Vendor), Redis-cached shopping cart, Razorpay webhook integration, Shiprocket/Delhivery shipping APIs, automated returns & refunds, coupon engine, full-text product search, Swagger/OpenAPI 3.0 docs, and a Dockerised dev/prod setup.',
    techStack: ['Go', 'Gin', 'GORM', 'PostgreSQL', 'Redis', 'Docker', 'Razorpay', 'Swagger/OpenAPI', 'JWT'],
    imageUrl: '/assets/projects/kapas.svg', featured: true, order: 6,
    repoUrl: 'https://github.com/nilabhsubramaniam/kapas',
    createdAt: '2025-12-03',
  },
  {
    id: '5', slug: 'arthaledger', title: 'ArthaLedger — Personal Finance API',
    description: 'Self-hosted personal finance REST API in Go. Multi-account tracking, keyword-based auto-categorisation, budgets with live spend calculations, smart budget alerts, and monthly/trend/CSV financial reports — 102 unit tests across all service layers.',
    longDescription: 'A production-quality Go backend with a strict Handler → Service → Repository architecture and zero globals. Features: atomic balance updates on every transaction, 16 seeded system categories, keyword rules engine for auto-categorisation, budget thresholds firing at 80 % and 100 % utilisation, JTI blacklisting on logout (Redis), bcrypt cost-12 passwords, and four versioned PostgreSQL migrations.',
    techStack: ['Go', 'Gin', 'GORM', 'PostgreSQL', 'Redis', 'JWT', 'Swagger/OpenAPI', 'Docker', 'golang-migrate'],
    imageUrl: '/assets/projects/arthaledger.svg', featured: true, order: 7,
    repoUrl: 'https://github.com/nilabhsubramaniam/ArthaLedger',
    createdAt: '2026-03-24',
  },
  // ── Company projects ──────────────────────────────────────────
  {
    id: '10', slug: 'amasol', title: 'IT Observability Platform — amasol',
    description: 'Enterprise Angular front-end for amasol\'s IT observability suite — dashboards covering Usability, Observability, Detectability and IT-Reliability for T-Systems, EWE, FI-TS and other enterprise clients.',
    techStack: ['Angular', 'TypeScript', 'SCSS', 'REST API', 'Dynatrace'],
    imageUrl: '/assets/projects/amasol.svg', featured: false, order: 8,
    liveUrl: 'https://amasol.com/',
    createdAt: '2022-01-01',
  },
  {
    id: '2', slug: 'renewbuy-insurance', title: 'Insurance Platform — Renewbuy',
    description: 'End-to-end insurance journey (Life, Health, Motor, Travel, Corporate) with SSO-SDK, NGINX deployment and Angular performance revamp.',
    techStack: ['Angular 12', 'Angular Material', 'Bootstrap', 'NGINX', 'SSO SDK'],
    imageUrl: '/assets/projects/renewbuy.svg', featured: false, order: 9,
    liveUrl: 'https://www.renewbuy.com/',
    createdAt: '2018-07-01',
  },
  {
    id: '3', slug: 'finatwork', title: 'intelligent. — Finatwork',
    description: 'Mutual fund investment platform with tax optimisation, insurance, estate planning and financial health dashboard.',
    techStack: ['AngularJS', 'JavaScript', 'REST API'],
    imageUrl: '/assets/projects/finatwork.svg', featured: false, order: 10,
    liveUrl: 'https://www.finatwork.com/',
    createdAt: '2016-05-01',
  },
];

const MOCK_SKILLS: Skill[] = [
  // Frontend
  { id: '1',  name: 'Angular',           category: 'frontend', icon: 'fa-brands fa-angular',       years: 8,  featured: true  },
  { id: '2',  name: 'TypeScript',        category: 'frontend', icon: 'fa-brands fa-js',             years: 6,  featured: true  },
  { id: '3',  name: 'Three.js',          category: 'frontend', icon: 'fa-solid fa-cube',            years: 1,  featured: true  },
  { id: '4',  name: 'SCSS / CSS',        category: 'frontend', icon: 'fa-brands fa-sass',           years: 8,  featured: false },
  { id: '5',  name: 'JavaScript',        category: 'frontend', icon: 'fa-brands fa-square-js',      years: 8,  featured: false },
  { id: '16', name: 'Bootstrap',         category: 'frontend', icon: 'fa-brands fa-bootstrap',      years: 7,  featured: false },
  { id: '17', name: 'Angular Material',  category: 'frontend', icon: 'fa-solid fa-palette',         years: 6,  featured: false },
  // Backend
  { id: '6',  name: 'Go',            category: 'backend',  icon: 'fa-solid fa-server',          years: 1,  featured: true  },
  { id: '7',  name: 'FastAPI',       category: 'backend',  icon: 'fa-solid fa-bolt',            years: 1,  featured: true  },
  { id: '8',  name: 'Python',        category: 'backend',  icon: 'fa-brands fa-python',         years: 1,  featured: true  },
  { id: '9',  name: 'PostgreSQL',    category: 'backend',  icon: 'fa-solid fa-database',        years: 1,  featured: false },
  // AI / LLM
  { id: '10', name: 'Ollama (LLM)',  category: 'ai',       icon: 'fa-solid fa-brain',           years: 1,  featured: true  },
  { id: '11', name: 'LangChain',     category: 'ai',       icon: 'fa-solid fa-link',            years: 1,  featured: false },
  { id: '12', name: 'Vector DB',     category: 'ai',       icon: 'fa-solid fa-magnifying-glass', years: 1,  featured: true  },
  // DevOps / Tools
  { id: '13', name: 'Docker',        category: 'devops',   icon: 'fa-brands fa-docker',         years: 1,  featured: false },
  { id: '14', name: 'NGINX',         category: 'devops',   icon: 'fa-solid fa-shield-halved',   years: 1,  featured: false },
  { id: '15', name: 'Git',           category: 'devops',   icon: 'fa-brands fa-git-alt',        years: 8,  featured: false },
];

const MOCK_TIMELINE: TimelineEntry[] = [
  {
    id: '1', year: 'Sep 2022–Present', title: 'Software Developer',
    company: 'Amasol, Gurugram',
    description: 'Developing web applications for a Service Level Management (SLM) platform using Angular. Building and maintaining dashboards, workflows and reporting modules backed by PostgreSQL, with Java-based backend services and Docker-based deployments.',
    type: 'work',
  },
  {
    id: '2', year: '2018–2022', title: 'Software Developer',
    company: 'Renewbuy, Gurugram',
    description: 'Built end-to-end insurance journeys (Life, Health, Motor, Travel, Corporate) using Angular 8–12. Architected SSO-SDK used across the full Renewbuy platform. Led performance revamp and deployment via NGINX.',
    type: 'work',
  },
  {
    id: '3', year: 'Jan–May 2018', title: 'Software Developer',
    company: 'BPRISE, Mumbai',
    description: 'Developed advertiser & publisher panel using AngularJS and REST APIs. Built beacon-based user interest tracking for ad targeting.',
    type: 'work',
  },
  {
    id: '4', year: '2016–2017', title: 'Software Developer',
    company: 'Finatwork Wealth Services, Bangalore',
    description: 'Built "intelligent." — a mutual fund investment, tax optimisation, insurance and estate planning platform in AngularJS.',
    type: 'work',
  },
  {
    id: '5', year: '2015–2016', title: 'Trainee Developer',
    company: 'Filantindia, Mumbai',
    description: 'Developed a pharmaceutical website to help patients and doctors understand medicines, built with JavaScript, HTML5, CSS and Bootstrap.',
    type: 'work',
  },
  {
    id: '6', year: '2015', title: 'B.Tech — Computer Science Engineering',
    company: 'NMIMS College, Mumbai',
    description: 'Bachelor of Technology in Computer Science Engineering.',
    type: 'education',
  },
  {
    id: '7', year: '2010', title: 'Higher Secondary (12th)',
    company: "Leeds Asian School, Patna",
    description: 'Completed Class XII from Leeds Asian School, Patna.',
    type: 'education',
  },
  {
    id: '8', year: '2008', title: 'Secondary School (10th)',
    company: "St. Karen's Secondary School, Patna",
    description: "Completed Class X from St. Karen's Secondary School, Patna.",
    type: 'education',
  },
];

const MOCK_CERTIFICATIONS: Certification[] = [
  {
    id: '1',
    name: 'Cybersecurity Specialization',
    issuer: 'Coursera',
    year: '2024',
    url: 'https://www.coursera.org/account/accomplishments/specialization/certificate/TV0BCNT5M3XS',
    badge: 'cybersecurity',
  },
];

const MOCK_HACKATHONS: Hackathon[] = [
  {
    id: '1',
    name: 'AI-Powered RAG Chatbot',
    event: 'Internal Hackathon 2024',
    description: 'Built a Retrieval-Augmented Generation chatbot using Python, Ollama (Llama 3), ChromaDB vector store and a FastAPI backend. The bot ingests internal documents and answers queries with cited sources.',
    techStack: ['Python', 'Ollama', 'ChromaDB', 'LangChain', 'FastAPI', 'Angular'],
    repoUrl: 'https://github.com/tamraj-93/chakra',
    year: '2024',
  },
];

@Injectable({ providedIn: 'root' })
export class PortfolioDataService {
  private readonly api = inject(ApiService);

  getProjects(): Observable<Project[]> {
    return of(MOCK_PROJECTS);
  }

  getSkills(): Observable<Skill[]> {
    return of(MOCK_SKILLS);
  }

  getTimeline(): Observable<TimelineEntry[]> {
    return of(MOCK_TIMELINE);
  }

  getCertifications(): Observable<Certification[]> {
    return of(MOCK_CERTIFICATIONS);
  }

  getHackathons(): Observable<Hackathon[]> {
    return of(MOCK_HACKATHONS);
  }

  submitContact(form: ContactForm): Observable<{ success: boolean }> {
    return this.api.post<{ success: boolean }>('/contact', form);
  }
}
