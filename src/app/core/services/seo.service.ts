import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';

import type { SeoMeta } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly defaultSeo: SeoMeta = {
    title: 'Sankalan — Developer Portfolio',
    description:
      'Full-stack developer portfolio showcasing projects, skills, and open-source contributions.',
    keywords: ['developer', 'portfolio', 'angular', 'typescript', 'fullstack'],
    ogImage: '/assets/og-default.jpg',
    ogType: 'website',
  };

  /** Call once from AppComponent.ngOnInit() */
  initRouteListener(baseUrl: string): void {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        mergeMap((route) => route.data)
      )
      .subscribe((data) => {
        const meta: Partial<SeoMeta> = data['meta'] ?? {};
        const pageTitle = data['title'] ?? this.defaultSeo.title;
        this.updateMeta({
          ...this.defaultSeo,
          ...meta,
          title: typeof pageTitle === 'string' ? pageTitle : this.defaultSeo.title,
          canonicalUrl: `${baseUrl}${this.router.url}`,
        });
      });
  }

  updateMeta(config: Partial<SeoMeta>): void {
    const merged: SeoMeta = { ...this.defaultSeo, ...config };

    // Title
    this.title.setTitle(merged.title);

    // Standard meta
    this.setTag('description', merged.description);
    if (merged.keywords?.length) {
      this.setTag('keywords', merged.keywords.join(', '));
    }

    // Robots
    this.setTag('robots', merged.noIndex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    this.setProperty('og:title', merged.title);
    this.setProperty('og:description', merged.description);
    this.setProperty('og:type', merged.ogType ?? 'website');
    if (merged.ogImage) this.setProperty('og:image', merged.ogImage);
    if (merged.canonicalUrl) this.setProperty('og:url', merged.canonicalUrl);

    // Twitter Card
    this.setName('twitter:card', 'summary_large_image');
    this.setName('twitter:title', merged.title);
    this.setName('twitter:description', merged.description);
    if (merged.ogImage) this.setName('twitter:image', merged.ogImage);

    // Canonical link
    if (merged.canonicalUrl && isPlatformBrowser(this.platformId)) {
      this.updateCanonical(merged.canonicalUrl);
    }
  }

  private setTag(name: string, content: string): void {
    this.meta.updateTag({ name, content });
  }

  private setProperty(property: string, content: string): void {
    this.meta.updateTag({ property, content });
  }

  private setName(name: string, content: string): void {
    this.meta.updateTag({ name, content });
  }

  private updateCanonical(url: string): void {
    const head = document.getElementsByTagName('head')[0];
    let el: HTMLLinkElement | null = head.querySelector('link[rel="canonical"]');
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      head.appendChild(el);
    }
    el.setAttribute('href', url);
  }
}
