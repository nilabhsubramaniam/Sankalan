import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { SeoService } from './core/services/seo.service';
import { JsonLdService } from './core/services/json-ld.service';
import { CursorComponent } from './shared/cursor/cursor.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CursorComponent],
  template: `<app-cursor /><router-outlet />`,
  styles: [],
})
export class App implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly jsonLd = inject(JsonLdService);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.seo.initRouteListener(environment.siteUrl);
    if (isPlatformBrowser(this.platformId)) {
      this.jsonLd.injectAllDefaults();
    }
  }
}
