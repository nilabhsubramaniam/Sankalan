import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { PortfolioDataService } from '../../core/services/portfolio-data.service';
import type { Skill } from '../../core/models/api.models';

type SkillCategory = Skill['category'] | 'all';

@Component({
  selector: 'app-skills',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <section class="section skills" aria-labelledby="skills-heading">
      <div class="container">
        <header class="section__header">
          <span class="section__label">Expertise</span>
          <h1 id="skills-heading" class="section__title">Skills &amp; Technologies</h1>
          <p class="section__subtitle">
            Tools and technologies I work with day-to-day to build production-grade software.
          </p>
        </header>

        <!-- Category tabs -->
        <div class="skills__tabs" role="tablist" aria-label="Skill categories">
          @for (cat of categories; track cat.value) {
            <button
              role="tab"
              class="skills__tab"
              [class.skills__tab--active]="activeCategory() === cat.value"
              [attr.aria-selected]="activeCategory() === cat.value"
              (click)="setCategory(cat.value)"
            >{{ cat.label }}</button>
          }
        </div>

        <!-- Skills grid -->
        <ul class="skills__grid" role="list" aria-live="polite">
          @for (skill of filteredSkills(); track skill.id) {
            <li>
              <div
                class="skill-card fade-in"
                [attr.aria-label]="skill.name + ' — ' + skill.years + ' years experience'"
              >
                <div class="skill-card__header">
                  <span class="skill-card__name">{{ skill.name }}</span>
                  <span class="skill-card__level" aria-hidden="true">{{ skill.years }} yrs</span>
                </div>
                <div
                  class="skill-card__bar"
                  role="progressbar"
                  [attr.aria-valuenow]="skill.years"
                  aria-valuemin="0"
                  aria-valuemax="10"
                >
                  <div
                    class="skill-card__fill"
                    [style.width.%]="proficiencyPct(skill.years)"
                  ></div>
                </div>
                <span class="skill-card__category">{{ skill.category }}</span>
              </div>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styleUrl: './skills.component.scss',
})
export class SkillsComponent {
  private readonly data = inject(PortfolioDataService);
  readonly skills = toSignal(this.data.getSkills(), { initialValue: [] });
  readonly activeCategory = signal<SkillCategory>('all');

  readonly categories: { label: string; value: SkillCategory }[] = [
    { label: 'All',      value: 'all'      },
    { label: 'Frontend', value: 'frontend' },
    { label: 'Backend',  value: 'backend'  },
    { label: 'DevOps',   value: 'devops'   },
    { label: 'Tools',    value: 'tools'    },
  ];

  readonly filteredSkills = computed<Skill[]>(() => {
    const cat = this.activeCategory();
    const all = this.skills();
    return cat === 'all' ? all : all.filter((s) => s.category === cat);
  });

  setCategory(cat: SkillCategory): void { this.activeCategory.set(cat); }

  /** Convert years of experience to a 0–100 bar width (capped at 10 yrs = 100 %) */
  proficiencyPct(years: number): number { return Math.min(years * 10, 100); }
}
