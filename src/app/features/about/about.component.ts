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

@Component({
  selector: 'app-about',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="about-page">
      <!-- Starfield background (same as home, sun hidden) -->
      <canvas #bgCanvas class="about-page__canvas" aria-hidden="true" role="presentation"></canvas>
      <div class="about-page__overlay" aria-hidden="true"></div>

    <article class="about">

      <!-- ── Bio ──────────────────────────────────────────────── -->
      <section class="section" aria-labelledby="about-heading">
        <div class="container">
          <div class="about__bio">

            <div class="about__bio-text">
              <p class="section__label">About Me</p>
              <h1 id="about-heading" class="about__name">
                Hi, I'm <span class="text-gradient">Nilabh Subramaniam</span>
              </h1>
              <p class="about__desc">
                A Frontend Engineer with <strong>8.5+ years</strong> of experience building
                scalable, high-performance web applications. I specialise in Angular, TypeScript,
                and SCSS — shipping products that are fast, accessible, and maintainable.
              </p>
              <p class="about__desc">
                Beyond the frontend, I actively explore AI/ML — working with LLMs via Ollama,
                vector databases like ChromaDB, and LangChain to build intelligent,
                context-aware applications.
              </p>
              <div class="about__meta-row">
                <span class="about__meta-chip">📍 Gurugram, Haryana</span>
                <span class="about__meta-chip">📞 +91 9158364522</span>
                <span class="about__meta-chip">🎓 B.Tech — NMIMS Mumbai</span>
                <span class="about__meta-chip">🌐 English · Hindi · Maithili</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Skills ──────────────────────────────────────────── -->
      <section class="section" aria-labelledby="skills-heading">
        <div class="container">
          <header class="section__header">
            <span class="section__label">Expertise</span>
            <h2 id="skills-heading" class="section__title">Technical Skills</h2>
          </header>

          <div class="skills-grid">
            <div class="skill-group">
              <h3 class="skill-group__title">Frontend</h3>
              <ul class="skill-list">
                @for (s of frontendSkills(); track s.id) {
                  <li class="skill-pill">
                    <i class="skill-pill__icon {{ s.icon }}" aria-hidden="true"></i>
                    <span class="skill-pill__name">{{ s.name }}</span>
                    <span class="skill-pill__years">{{ s.years }} yr{{ s.years === 1 ? '' : 's' }}</span>
                  </li>
                }
              </ul>
            </div>

            <div class="skill-group">
              <h3 class="skill-group__title">Backend &amp; DevOps</h3>
              <ul class="skill-list">
                @for (s of backendSkills(); track s.id) {
                  <li class="skill-pill">
                    <i class="skill-pill__icon {{ s.icon }}" aria-hidden="true"></i>
                    <span class="skill-pill__name">{{ s.name }}</span>
                    <span class="skill-pill__years">{{ s.years }} yr{{ s.years === 1 ? '' : 's' }}</span>
                  </li>
                }
              </ul>
            </div>

            <div class="skill-group skill-group--ai">
              <h3 class="skill-group__title">AI / LLM</h3>
              <ul class="skill-list">
                @for (s of aiSkills(); track s.id) {
                  <li class="skill-pill skill-pill--ai">
                    <i class="skill-pill__icon {{ s.icon }}" aria-hidden="true"></i>
                    <span class="skill-pill__name">{{ s.name }}</span>
                    <span class="skill-pill__years">{{ s.years }} yr{{ s.years === 1 ? '' : 's' }}</span>
                  </li>
                }
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Experience & Education timeline ─────────────────── -->
      <section class="section" aria-labelledby="timeline-heading">
        <div class="container">
          <header class="section__header">
            <span class="section__label">My Journey</span>
            <h2 id="timeline-heading" class="section__title">Experience &amp; Education</h2>
          </header>
          <ol class="timeline" aria-label="Career timeline">
            @for (entry of timeline(); track entry.id) {
              <li class="timeline__item" [attr.data-type]="entry.type">
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

      <!-- ── Certifications ─────────────────────────────────── -->
      <section class="section" aria-labelledby="certs-heading">
        <div class="container">
          <header class="section__header">
            <span class="section__label">Learning</span>
            <h2 id="certs-heading" class="section__title">Certifications</h2>
          </header>
          <ul class="cert-list">
            @for (cert of certifications(); track cert.id) {
              <li class="cert-card">
                <div class="cert-card__body">
                  <p class="cert-card__issuer">{{ cert.issuer }}</p>
                  <h3 class="cert-card__name">{{ cert.name }}</h3>
                  <p class="cert-card__year">{{ cert.year }}</p>
                </div>
                <a
                  class="cert-card__link"
                  [href]="cert.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  [attr.aria-label]="'View ' + cert.name + ' certificate'"
                >
                  View Certificate ↗
                </a>
              </li>
            }
          </ul>
        </div>
      </section>

      <!-- ── Hackathons ─────────────────────────────────────── -->
      <section class="section" aria-labelledby="hackathons-heading">
        <div class="container">
          <header class="section__header">
            <span class="section__label">Building</span>
            <h2 id="hackathons-heading" class="section__title">Hackathons &amp; Side Projects</h2>
          </header>
          <ul class="hack-list">
            @for (hack of hackathons(); track hack.id) {
              <li class="hack-card">
                <div class="hack-card__header">
                  <div>
                    <p class="hack-card__event">{{ hack.event }} · {{ hack.year }}</p>
                    <h3 class="hack-card__name">{{ hack.name }}</h3>
                  </div>
                  <a
                    class="hack-card__github"
                    [href]="hack.repoUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View on GitHub"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.111-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                    GitHub
                  </a>
                </div>
                <p class="hack-card__desc">{{ hack.description }}</p>
                <ul class="hack-card__stack" aria-label="Tech stack">
                  @for (tech of hack.techStack; track tech) {
                    <li class="hack-card__tag">{{ tech }}</li>
                  }
                </ul>
              </li>
            }
          </ul>
        </div>
      </section>

      <!-- ── Hobbies ──────────────────────────────────────────── -->
      <section class="section" aria-labelledby="hobbies-heading">
        <div class="container">
          <header class="section__header">
            <span class="section__label">Beyond Code</span>
            <h2 id="hobbies-heading" class="section__title">Hobbies &amp; Interests</h2>
          </header>

          <div class="hobbies-wrapper">

            <!-- Travelling -->
            <div class="hobby-block">
              <h3 class="hobby-block__title">
                <i class="fa-solid fa-plane-departure" aria-hidden="true"></i> Travelling
              </h3>

              <!-- Filter chips -->
              <div class="travel-filters" role="group" aria-label="Filter by state">
                @for (state of travelStates; track state) {
                  <button
                    class="travel-filter-chip"
                    [class.travel-filter-chip--active]="travelFilter() === state"
                    (click)="setTravelFilter(state)"
                    [attr.aria-pressed]="travelFilter() === state"
                  >{{ state }}</button>
                }
              </div>

              <div class="travel-grid">
                @for (photo of filteredTravelPhotos(); track photo.id) {
                  <figure class="travel-card">
                    <div class="travel-card__frame">
                      <img
                        [src]="photo.src"
                        [alt]="photo.label"
                        class="travel-card__img"
                        loading="lazy"
                        (error)="onTravelImgError($event)"
                      />
                      <div class="travel-card__placeholder" aria-hidden="true">
                        <i class="fa-solid fa-camera"></i>
                      </div>
                    </div>
                    <figcaption class="travel-card__caption">
                      <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
                      {{ photo.label }}
                    </figcaption>
                  </figure>
                }
              </div>
            </div>

            <!-- Gaming -->
            <div class="hobby-block">
              <h3 class="hobby-block__title">
                <i class="fa-solid fa-gamepad" aria-hidden="true"></i> Gaming
              </h3>
              <ul class="game-list">
                <li class="game-chip"><i class="fa-solid fa-crosshairs" aria-hidden="true"></i> Halo</li>
                <li class="game-chip"><i class="fa-solid fa-dungeon" aria-hidden="true"></i> Enter the Gungeon</li>
                <li class="game-chip"><i class="fa-brands fa-jedi-order" aria-hidden="true"></i> Star Wars</li>
              </ul>
            </div>

            <!-- Outdoor & Fitness -->
            <div class="hobby-block">
              <h3 class="hobby-block__title">
                <i class="fa-solid fa-person-running" aria-hidden="true"></i> Outdoor &amp; Fitness
              </h3>
              <ul class="outdoor-list">
                <li class="outdoor-card">
                  <i class="fa-solid fa-table-tennis-paddle-ball outdoor-card__icon" aria-hidden="true"></i>
                  <span>Badminton</span>
                </li>
                <li class="outdoor-card">
                  <i class="fa-solid fa-bicycle outdoor-card__icon" aria-hidden="true"></i>
                  <span>Cycling</span>
                </li>
                <li class="outdoor-card">
                  <i class="fa-solid fa-dumbbell outdoor-card__icon" aria-hidden="true"></i>
                  <span>Gym &amp; Workout</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      <!-- ── Location ─────────────────────────────────────────── -->
      <section class="section" aria-labelledby="location-heading">
        <div class="container">
          <header class="section__header">
            <span class="section__label">Where I Am</span>
            <h2 id="location-heading" class="section__title">Location</h2>
          </header>
          <div class="location-grid">

            <div class="location-card">
              <div class="location-card__header">
                <i class="fa-solid fa-briefcase" aria-hidden="true"></i>
                <div>
                  <p class="location-card__type">Correspondence</p>
                  <h3 class="location-card__city">Gurugram, Haryana</h3>
                </div>
              </div>
              <div class="location-card__map">
                <iframe
                  title="Gurugram location map"
                  src="https://maps.google.com/maps?q=Gurugram,Haryana,India&z=13&output=embed&hl=en"
                  width="100%" height="220" loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  aria-label="Map showing Gurugram, Haryana">
                </iframe>
              </div>
            </div>

            <div class="location-card">
              <div class="location-card__header">
                <i class="fa-solid fa-house" aria-hidden="true"></i>
                <div>
                  <p class="location-card__type">Permanent</p>
                  <h3 class="location-card__city">Patna, Bihar</h3>
                </div>
              </div>
              <div class="location-card__map">
                <iframe
                  title="Patna location map"
                  src="https://maps.google.com/maps?q=Patna,Bihar,India&z=13&output=embed&hl=en"
                  width="100%" height="220" loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  aria-label="Map showing Patna, Bihar">
                </iframe>
              </div>
            </div>

          </div>
        </div>
      </section>

    </article>
    </div>
  `,
  styleUrl: './about.component.scss',
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly data        = inject(PortfolioDataService);
  private readonly threeScene  = inject(ThreeSceneService);
  private readonly platformId  = inject(PLATFORM_ID);

  readonly timeline       = toSignal(this.data.getTimeline(),       { initialValue: [] });
  readonly certifications = toSignal(this.data.getCertifications(), { initialValue: [] });
  readonly hackathons     = toSignal(this.data.getHackathons(),     { initialValue: [] });

  private readonly allSkills = toSignal(this.data.getSkills(), { initialValue: [] });

  readonly frontendSkills = () => this.allSkills().filter(s => s.category === 'frontend');
  readonly backendSkills  = () => this.allSkills().filter(s => s.category === 'backend' || s.category === 'devops');
  readonly aiSkills       = () => this.allSkills().filter(s => s.category === 'ai');

  private readonly travelFallbackSrc = '/assets/hobbies/travel-4.jpg';

  readonly travelStates = ['All', 'Bihar', 'Gujarat', 'Himachal Pradesh', 'Kerala'] as const;
  readonly travelFilter  = signal<string>('All');

  readonly travelPhotos = [
    // Bihar
    { id:  1, src: '/assets/hobbies/Travel-Bihar.JPG',               label: 'Bihar'            },
    { id:  2, src: '/assets/hobbies/Travel-Bihar-2.jpeg',            label: 'Bihar'            },
    { id:  3, src: '/assets/hobbies/Travel-Bihar-3.jpeg',            label: 'Bihar'            },
    { id:  4, src: '/assets/hobbies/Travel-Bihar-4.jpg',             label: 'Bihar'            },
    // Gujarat
    { id:  5, src: '/assets/hobbies/Travel-Gujrat.jpeg',             label: 'Gujarat'          },
    { id:  6, src: '/assets/hobbies/Travel-Gujrat-1.jpeg',           label: 'Gujarat'          },
    { id:  7, src: '/assets/hobbies/Travel-Gujrat-2.jpeg',           label: 'Gujarat'          },
    { id:  8, src: '/assets/hobbies/Travel-Gujrat-3.jpeg',           label: 'Gujarat'          },
    { id:  9, src: '/assets/hobbies/Travel-Gujrat-4.jpeg',           label: 'Gujarat'          },
    { id: 10, src: '/assets/hobbies/Travel-Gujrat-5.jpeg',           label: 'Gujarat'          },
    { id: 11, src: '/assets/hobbies/Travel-Gujrat-6.jpeg',           label: 'Gujarat'          },
    { id: 12, src: '/assets/hobbies/Travel-Gujrat-7.jpeg',           label: 'Gujarat'          },
    { id: 13, src: '/assets/hobbies/Travel-Gujrat-8.jpeg',           label: 'Gujarat'          },
    { id: 14, src: '/assets/hobbies/Travel-Gujrat-9.jpeg',           label: 'Gujarat'          },
    { id: 15, src: '/assets/hobbies/Travel-Gujrat-10.jpeg',          label: 'Gujarat'          },
    { id: 16, src: '/assets/hobbies/Travel-Gujrat-11.jpeg',          label: 'Gujarat'          },
    { id: 17, src: '/assets/hobbies/Travel-Gujrat-12.jpeg',          label: 'Gujarat'          },
    { id: 18, src: '/assets/hobbies/Travel-Gujrat-13.jpeg',          label: 'Gujarat'          },
    { id: 19, src: '/assets/hobbies/Travel-Gujrat-14.jpeg',          label: 'Gujarat'          },
    { id: 20, src: '/assets/hobbies/Travel-Gujrat-15.jpeg',          label: 'Gujarat'          },
    // Himachal Pradesh
    { id: 21, src: '/assets/hobbies/Travel-HimachalPradesh.jpeg',    label: 'Himachal Pradesh' },
    { id: 22, src: '/assets/hobbies/Travel-Himachal-pradesh-2.jpeg', label: 'Himachal Pradesh' },
    { id: 23, src: '/assets/hobbies/Travel-Himachal-Pradesh-3.jpeg', label: 'Himachal Pradesh' },
    { id: 24, src: '/assets/hobbies/Travel-Himachal-Pradesh-4.jpeg', label: 'Himachal Pradesh' },
    { id: 25, src: '/assets/hobbies/Travel-Himachal-Pradesh-5.jpeg', label: 'Himachal Pradesh' },
    { id: 26, src: '/assets/hobbies/Travel-Himachal-Pradesh-6.jpeg', label: 'Himachal Pradesh' },
    { id: 27, src: '/assets/hobbies/Travel-Himachal-Pradesh-7.jpeg', label: 'Himachal Pradesh' },
    // Kerala
    { id: 28, src: '/assets/hobbies/Travel-Kerla.jpeg',              label: 'Kerala'           },
    { id: 29, src: '/assets/hobbies/Travel-Kerla-1.jpeg',            label: 'Kerala'           },
    { id: 30, src: '/assets/hobbies/Travel-Kerla-2.jpeg',            label: 'Kerala'           },
    { id: 31, src: '/assets/hobbies/Travel-Kerla-3.jpeg',            label: 'Kerala'           },
    { id: 32, src: '/assets/hobbies/Travel-Kerla-4.jpeg',            label: 'Kerala'           },
  ];

  readonly filteredTravelPhotos = computed(() => {
    const f = this.travelFilter();
    return f === 'All' ? this.travelPhotos : this.travelPhotos.filter(p => p.label === f);
  });

  setTravelFilter(state: string): void {
    this.travelFilter.set(state);
  }

  onTravelImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== this.travelFallbackSrc) {
      img.src = this.travelFallbackSrc;
    }
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
