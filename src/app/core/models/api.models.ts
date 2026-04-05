// ============================================================
// API Models — Future Go backend contracts
// ============================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription?: string;
  techStack: string[];
  imageUrl: string;
  liveUrl?: string;
  repoUrl?: string;
  featured: boolean;
  order: number;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'devops' | 'tools' | 'ai' | 'other';
  icon: string;
  years: number; // years of experience
  featured: boolean;
}

export interface TimelineEntry {
  id: string;
  year: string;
  title: string;
  company: string;
  description: string;
  type: 'work' | 'education' | 'achievement';
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  url: string;
  badge: string;
}

export interface Hackathon {
  id: string;
  name: string;
  event: string;
  description: string;
  techStack: string[];
  repoUrl: string;
  year: string;
}

export interface SeoMeta {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonicalUrl?: string;
  noIndex?: boolean;
}
