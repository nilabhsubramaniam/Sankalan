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
  { id: '1',  name: 'Angular',       category: 'frontend', icon: 'angular',     level: 95, featured: true  },
  { id: '2',  name: 'TypeScript',    category: 'frontend', icon: 'typescript',  level: 92, featured: true  },
  { id: '3',  name: 'Three.js',      category: 'frontend', icon: 'threejs',     level: 80, featured: true  },
  { id: '4',  name: 'SCSS / CSS',    category: 'frontend', icon: 'sass',        level: 90, featured: false },
  { id: '5',  name: 'JavaScript',    category: 'frontend', icon: 'javascript',  level: 90, featured: false },
  // Backend
  { id: '6',  name: 'Go',            category: 'backend',  icon: 'go',          level: 75, featured: true  },
  { id: '7',  name: 'FastAPI',       category: 'backend',  icon: 'fastapi',     level: 72, featured: true  },
  { id: '8',  name: 'Python',        category: 'backend',  icon: 'python',      level: 75, featured: true  },
  { id: '9',  name: 'PostgreSQL',    category: 'backend',  icon: 'postgresql',  level: 72, featured: false },
  // AI / LLM
  { id: '10', name: 'Ollama (LLM)',  category: 'ai',       icon: 'ollama',      level: 68, featured: true  },
  { id: '11', name: 'LangChain',     category: 'ai',       icon: 'langchain',   level: 62, featured: false },
  { id: '12', name: 'Vector DB',     category: 'ai',       icon: 'vectordb',    level: 65, featured: true  },
  // DevOps / Tools
  { id: '13', name: 'Docker',        category: 'devops',   icon: 'docker',      level: 70, featured: false },
  { id: '14', name: 'NGINX',         category: 'devops',   icon: 'nginx',       level: 75, featured: false },
  { id: '15', name: 'Git',           category: 'devops',   icon: 'git',         level: 88, featured: false },
];

const MOCK_TIMELINE: TimelineEntry[] = [
  {
    id: '1', year: 'Sep 2022–Present', title: 'Software Developer',
    company: 'Amasol, Gurugram',
    description: 'Building enterprise-grade web applications with Angular. Working with PostgreSQL databases, Docker containerization, and integrating AI/LLM capabilities using Python, Ollama and LangChain.',
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
];

const MOCK_CERTIFICATIONS: Certification[] = [
  {
    id: '1',
    name: 'Machine Learning Specialization',
    issuer: 'Coursera — DeepLearning.AI / Stanford',
    year: '2024',
    url: 'https://www.coursera.org/specializations/machine-learning-introduction',
    badge: 'ml',
  },
  {
    id: '2',
    name: 'Deep Learning Specialization',
    issuer: 'Coursera — DeepLearning.AI',
    year: '2024',
    url: 'https://www.coursera.org/specializations/deep-learning',
    badge: 'dl',
  },
  {
    id: '3',
    name: 'Python for Everybody Specialization',
    issuer: 'Coursera — University of Michigan',
    year: '2023',
    url: 'https://www.coursera.org/specializations/python',
    badge: 'python',
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
