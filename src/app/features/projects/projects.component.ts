import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PortfolioDataService } from '../../core/services/portfolio-data.service';
import type { Project } from '../../core/models/api.models';

@Component({
  selector: 'app-projects',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
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
                  />
                  <div class="project-card__overlay" aria-hidden="true">
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
                </div>
              </article>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
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
}
