import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { PortfolioDataService } from '../../core/services/portfolio-data.service';
import type { TimelineEntry } from '../../core/models/api.models';

@Component({
  selector: 'app-about',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <article class="about">
      <!-- Bio -->
      <section class="section" aria-labelledby="about-heading">
        <div class="container">
          <div class="about__bio">
            <div class="about__bio-text">
              <p class="section__label">About Me</p>
              <h1 id="about-heading" class="about__name">
                Hi, I'm <span class="text-gradient">Your Name</span>
              </h1>
              <p class="about__desc">
                A full-stack developer passionate about building scalable, beautiful
                digital experiences. I specialise in Angular, TypeScript, and Go —
                shipping products that are fast, accessible, and maintainable.
              </p>
              <p class="about__desc">
                When I'm not coding, I'm exploring generative art with Three.js,
                contributing to open-source, or writing about web architecture.
              </p>
            </div>
            <div class="about__avatar" aria-hidden="true">
              <div class="about__avatar-ring"></div>
              <img
                src="/assets/avatar.jpg"
                alt="Your Name — Full-Stack Developer"
                width="320"
                height="320"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Timeline -->
      <section class="section" aria-labelledby="timeline-heading">
        <div class="container">
          <header class="section__header">
            <span class="section__label">My Journey</span>
            <h2 id="timeline-heading" class="section__title">Experience &amp; Education</h2>
          </header>
          <ol class="timeline" aria-label="Career timeline">
            @for (entry of timeline(); track entry.id) {
              <li class="timeline__item fade-in" [attr.data-type]="entry.type">
                <time class="timeline__year" [attr.datetime]="entry.year">{{ entry.year }}</time>
                <div class="timeline__dot" aria-hidden="true"></div>
                <div class="timeline__body">
                  <h3 class="timeline__title">{{ entry.title }}</h3>
                  <p class="timeline__company">{{ entry.company }}</p>
                  <p class="timeline__desc">{{ entry.description }}</p>
                </div>
              </li>
            }
          </ol>
        </div>
      </section>
    </article>
  `,
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  private readonly data = inject(PortfolioDataService);
  readonly timeline = toSignal(this.data.getTimeline(), { initialValue: [] });
}
