import { inject, Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Observable, of } from 'rxjs';
import type { Project, Skill, TimelineEntry, ContactForm } from '../models/api.models';

// ─── Static mock data (Phase 1) ──────────────────────────────
// Replace each `of(MOCK_*)` call with `this.api.get<T>(...)` when Go backend is ready.

const MOCK_PROJECTS: Project[] = [
  {
    id: '1', slug: 'portfolio', title: 'Developer Portfolio',
    description: 'High-performance Angular portfolio with Three.js and GSAP animations.',
    techStack: ['Angular', 'TypeScript', 'Three.js', 'GSAP', 'SCSS'],
    imageUrl: '/assets/projects/portfolio.jpg', featured: true, order: 1,
    repoUrl: 'https://github.com/yourusername/sankalan', createdAt: '2026-01-01',
  },
  {
    id: '2', slug: 'go-api', title: 'Go REST API',
    description: 'High-throughput REST API built with Go, Gin, and PostgreSQL.',
    techStack: ['Go', 'Gin', 'PostgreSQL', 'Docker', 'Redis'],
    imageUrl: '/assets/projects/go-api.jpg', featured: true, order: 2,
    createdAt: '2025-08-01',
  },
];

const MOCK_SKILLS: Skill[] = [
  { id: '1', name: 'Angular',     category: 'frontend', icon: 'angular',     level: 95, featured: true  },
  { id: '2', name: 'TypeScript',  category: 'frontend', icon: 'typescript',  level: 92, featured: true  },
  { id: '3', name: 'Three.js',    category: 'frontend', icon: 'threejs',     level: 78, featured: true  },
  { id: '4', name: 'Go',          category: 'backend',  icon: 'go',          level: 82, featured: true  },
  { id: '5', name: 'Node.js',     category: 'backend',  icon: 'nodejs',      level: 85, featured: false },
  { id: '6', name: 'PostgreSQL',  category: 'backend',  icon: 'postgresql',  level: 75, featured: false },
  { id: '7', name: 'Docker',      category: 'devops',   icon: 'docker',      level: 70, featured: false },
  { id: '8', name: 'SCSS',        category: 'frontend', icon: 'sass',        level: 90, featured: false },
];

const MOCK_TIMELINE: TimelineEntry[] = [
  { id: '1', year: '2026', title: 'Senior Frontend Engineer', company: 'TechCorp', description: 'Led Angular migration and performance initiatives.', type: 'work' },
  { id: '2', year: '2024', title: 'Full-Stack Engineer', company: 'StartupXYZ', description: 'Built product features in Angular + Go microservices.', type: 'work' },
  { id: '3', year: '2022', title: 'B.Tech Computer Science', company: 'University of Delhi', description: 'Graduated with distinction.', type: 'education' },
];

@Injectable({ providedIn: 'root' })
export class PortfolioDataService {
  private readonly api = inject(ApiService);

  getProjects(): Observable<Project[]> {
    // TODO: return this.api.get<Project[]>('/projects');
    return of(MOCK_PROJECTS);
  }

  getSkills(): Observable<Skill[]> {
    // TODO: return this.api.get<Skill[]>('/skills');
    return of(MOCK_SKILLS);
  }

  getTimeline(): Observable<TimelineEntry[]> {
    // TODO: return this.api.get<TimelineEntry[]>('/timeline');
    return of(MOCK_TIMELINE);
  }

  submitContact(form: ContactForm): Observable<{ success: boolean }> {
    // TODO: return this.api.post<{ success: boolean }>('/contact', form);
    console.log('[ContactForm mock submit]', form);
    return of({ success: true });
  }
}
