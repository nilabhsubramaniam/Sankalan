import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  HostListener,
  inject,
  signal,
  computed,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { PortfolioDataService } from '../../core/services/portfolio-data.service';
import { ThreeSceneService } from '../../three/scenes/particle-scene.service';
import type { Project } from '../../core/models/api.models';

@Component({
  selector: 'app-projects',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="projects-page">
      <!-- Starfield background (same as About, sun hidden) -->
      <canvas #bgCanvas class="projects-page__canvas" aria-hidden="true" role="presentation"></canvas>
      <div class="projects-page__overlay" aria-hidden="true"></div>

    <section class="section projects" aria-labelledby="projects-heading">
      <div class="container">
        <header class="section__header">
          <span class="section__label">My Work</span>
          <h1 id="projects-heading" class="section__title">Selected Projects</h1>
          <p class="section__subtitle">
            A curated selection of projects — each one a story of problem-solving
            and thoughtful engineering.
          </p>
        </header>

        <!-- Filter tabs -->
        <div class="projects__filters" role="tablist" aria-label="Filter projects">
          @for (f of filters; track f) {
            <button
              role="tab"
              class="projects__filter"
              [class.projects__filter--active]="activeFilter() === f"
              [attr.aria-selected]="activeFilter() === f"
              (click)="setFilter(f)"
            >{{ f }}</button>
          }
        </div>

        <!-- Grid -->
        <ul class="projects__grid" role="list" aria-live="polite">
          @for (project of filteredProjects(); track project.id) {
            <li>
              <article
                class="project-card"
                [class.project-card--featured]="project.featured"
                [attr.aria-label]="project.title + ' project'"
              >
                <div class="project-card__image">
                  <img
                    [src]="project.imageUrl"
                    [alt]="project.title + ' screenshot'"
                    width="600"
                    height="360"
                    loading="lazy"
                    (error)="onImgError($event)"
                  />
                  <div class="project-card__overlay" aria-hidden="true">
                    <p class="project-card__overlay-desc">{{ project.description }}</p>
                    <div class="project-card__actions">
                      @if (project.liveUrl) {
                        <a [href]="project.liveUrl" target="_blank" rel="noopener noreferrer"
                           class="btn btn--gold" aria-label="View {{ project.title }} live">
                          Live Demo
                        </a>
                      }
                      @if (project.repoUrl) {
                        <a [href]="project.repoUrl" target="_blank" rel="noopener noreferrer"
                           class="btn btn--outline" aria-label="View {{ project.title }} source code">
                          Source
                        </a>
                      }
                    </div>
                  </div>
                </div>
                <div class="project-card__body">
                  @if (project.featured) {
                    <span class="project-card__badge">Featured</span>
                  }
                  <h2 class="project-card__title">{{ project.title }}</h2>
                  <p class="project-card__desc">{{ project.description }}</p>
                  <ul class="project-card__tech" role="list" aria-label="Technologies used">
                    @for (tech of project.techStack; track tech) {
                      <li class="project-card__tech-item">{{ tech }}</li>
                    }
                  </ul>
                  <div class="project-card__links">
                    @if (project.repoUrl) {
                      <a [href]="project.repoUrl" target="_blank" rel="noopener noreferrer"
                         class="project-card__link" [attr.aria-label]="'View ' + project.title + ' on GitHub'">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.111-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                        </svg>
                        GitHub
                      </a>
                    }
                    @if (project.liveUrl) {
                      <a [href]="project.liveUrl" target="_blank" rel="noopener noreferrer"
                         class="project-card__link project-card__link--live" [attr.aria-label]="'View ' + project.title + ' live'">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15 3 21 3 21 9"/>
                          <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                        Live Demo
                      </a>
                    }
                  </div>
                </div>
              </article>
            </li>
          }
        </ul>
      </div>
    </section>
    </div>
  `,
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly platformId   = inject(PLATFORM_ID);
  private readonly threeScene   = inject(ThreeSceneService);
  private readonly data = inject(PortfolioDataService);
  readonly projects = toSignal(this.data.getProjects(), { initialValue: [] });
  readonly activeFilter = signal<string>('All');

  readonly filters = ['All', 'Featured'];

  readonly filteredProjects = computed<Project[]>(() => {
    const f = this.activeFilter();
    const all = this.projects();
    return f === 'Featured' ? all.filter((p) => p.featured) : all;
  });

  setFilter(f: string): void { this.activeFilter.set(f); }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.threeScene.init({ canvas: this.canvasRef.nativeElement, hideSun: true });
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (isPlatformBrowser(this.platformId)) {
      const el = this.canvasRef.nativeElement;
      this.threeScene.resize(el.clientWidth, el.clientHeight);
    }
  }

  ngOnDestroy(): void {
    this.threeScene.destroy();
  }
}
