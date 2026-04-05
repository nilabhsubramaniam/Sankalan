import { inject, Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Observable, of } from 'rxjs';
import type { Project, Skill, TimelineEntry, ContactForm, Certification, Hackathon } from '../models/api.models';

// ─── Static mock data (Phase 1) ──────────────────────────────
// Replace each `of(MOCK_*)` call with `this.api.get<T>(...)` when Go backend is ready.

const MOCK_PROJECTS: Project[] = [
  {
    id: '1', slug: 'sankalan', title: 'Sankalan — Developer Portfolio',
    description: 'High-performance Angular SSR portfolio with Three.js solar scene, GSAP animations, and a Star Wars crawl intro.',
    techStack: ['Angular 19', 'TypeScript', 'Three.js', 'GSAP', 'SCSS', 'Go'],
    imageUrl: '/assets/projects/portfolio.jpg', featured: true, order: 1,
    repoUrl: 'https://github.com/nilabhsubramaniam/Sankalan', createdAt: '2026-01-01',
  },
  {
    id: '2', slug: 'renewbuy-insurance', title: 'Insurance Platform — Renewbuy',
    description: 'End-to-end insurance journey (Life, Health, Motor, Travel, Corporate) with SSO-SDK, NGINX deployment and Angular performance revamp.',
    techStack: ['Angular 12', 'Angular Material', 'Bootstrap', 'NGINX', 'SSO SDK'],
    imageUrl: '/assets/projects/renewbuy.jpg', featured: true, order: 2,
    createdAt: '2018-07-01',
  },
  {
    id: '3', slug: 'finatwork', title: 'intelligent. — Finatwork',
    description: 'Mutual fund investment platform with tax optimisation, insurance, estate planning and financial health dashboard.',
    techStack: ['AngularJS', 'JavaScript', 'REST API'],
    imageUrl: '/assets/projects/finatwork.jpg', featured: false, order: 3,
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
    console.log('[ContactForm mock submit]', form);
    return of({ success: true });
  }
}
