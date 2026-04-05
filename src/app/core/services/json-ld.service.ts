import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type SchemaType = 'Person' | 'WebSite' | 'SoftwareApplication' | 'BreadcrumbList';

@Injectable({ providedIn: 'root' })
export class JsonLdService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Nilabh Subramaniam',
    url: 'https://nilabhsubramaniam.in',
    image: 'https://nilabhsubramaniam.in/assets/avatar.jpg',
    sameAs: [
      'https://github.com/nilabhsubramaniam',
      'https://www.linkedin.com/in/nilabh-subramaniam-0912a7a0/',
    ],
    jobTitle: 'Full-Stack Developer',
    description: 'Full-stack developer specialising in Angular, TypeScript, and Go.',
    knowsAbout: ['Angular', 'TypeScript', 'Go', 'Three.js', 'Python', 'AI/LLM integration with Ollama and LangChain'],
  };

  private readonly webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sankalan',
    url: 'https://nilabhsubramaniam.in',
    description: 'Developer portfolio — projects, skills, and contact.',
    author: { '@type': 'Person', name: 'Nilabh Subramaniam' },
  };

  /** Inject structured data into <head> as a JSON-LD script tag */
  injectSchema(type: SchemaType, override?: Record<string, unknown>): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const existing = document.getElementById(`schema-${type}`);
    if (existing) existing.remove();

    const schema = this.getSchema(type, override);
    const script = document.createElement('script');
    script.id = `schema-${type}`;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  injectAllDefaults(): void {
    this.injectSchema('Person');
    this.injectSchema('WebSite');
  }

  private getSchema(
    type: SchemaType,
    override?: Record<string, unknown>
  ): Record<string, unknown> {
    const base =
      type === 'Person'
        ? this.personSchema
        : type === 'WebSite'
        ? this.webSiteSchema
        : {};
    return { ...base, ...override };
  }
}
