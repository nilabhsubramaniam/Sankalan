import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { SeoService } from './core/services/seo.service';
import { JsonLdService } from './core/services/json-ld.service';
import { CursorComponent } from './shared/cursor/cursor.component';
import { StarWarsCrawlComponent } from './shared/components/star-wars-crawl/star-wars-crawl.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CursorComponent, StarWarsCrawlComponent],
  template: `
    <app-star-wars-crawl
      (dismissed)="crawlDone.set(true)"
      (naturalEnd)="onCrawlNaturalEnd()"
    />
    <app-cursor />
    <router-outlet />
  `,
  styles: [],
})
export class App implements OnInit {
  readonly crawlDone = signal(false);

  private readonly seo        = inject(SeoService);
  private readonly jsonLd     = inject(JsonLdService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router     = inject(Router);

  ngOnInit(): void {
    this.seo.initRouteListener(environment.siteUrl);
    if (isPlatformBrowser(this.platformId)) {
      this.jsonLd.injectAllDefaults();
    }
  }

  onCrawlNaturalEnd(): void {
    // Crawl played to completion — navigate to home
    this.router.navigate(['/']);
  }
}
