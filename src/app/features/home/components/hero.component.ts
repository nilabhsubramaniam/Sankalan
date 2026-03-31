import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  inject,
  PLATFORM_ID,
  HostListener,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ThreeSceneService } from '../../../three/scenes/particle-scene.service';
import { AnimationService } from '../../../core/services/animation.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="hero" aria-label="Hero introduction">
      <canvas #threeCanvas class="hero__canvas" aria-hidden="true" role="presentation"></canvas>
      <div class="hero__overlay" aria-hidden="true"></div>

      <div class="hero__content container">

        <!-- Cycling phrase tag -->
        <p class="hero__tag" [class.is-leaving]="phraseOut()">
          {{ phrases[phraseIndex()] }}
        </p>

        <h1 class="hero__headline">
          Crafting interfaces<br /><em>worth experiencing.</em>
        </h1>

        <div class="hero__links">
          <a routerLink="/projects" class="hero__link" aria-label="View my projects">
            View Projects <span>↗</span>
          </a>
          <a routerLink="/contact" class="hero__link" aria-label="Get in touch">
            Get in Touch <span>↗</span>
          </a>
        </div>
      </div>

      <div class="hero__meta" aria-hidden="true">
        <span>Angular</span><span class="hero__meta-dot">·</span>
        <span>TypeScript</span><span class="hero__meta-dot">·</span>
        <span>Three.js</span><span class="hero__meta-dot">·</span>
        <span>Go</span>
      </div>

      <div class="hero__scroll" aria-label="Scroll down">
        <span class="hero__scroll-line"></span>
        <span class="hero__scroll-label">Scroll</span>
      </div>
    </section>
  `,
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly threeScene = inject(ThreeSceneService);
  private readonly animService = inject(AnimationService);
  private readonly platformId  = inject(PLATFORM_ID);

  // ── Cycling phrase ──────────────────────────────────────────────
  readonly phrases = [
    'Full-Stack Developer',
    'Angular · TypeScript',
    'Three.js · WebGL',
    'Go · REST APIs',
  ] as const;

  readonly phraseIndex = signal(0);
  readonly phraseOut   = signal(false);

  private phraseTimer?: ReturnType<typeof setInterval>;

  private cyclePhrase(): void {
    this.phraseOut.set(true);
    setTimeout(() => {
      this.phraseIndex.update(i => (i + 1) % this.phrases.length);
      this.phraseOut.set(false);
    }, 520);
  }

  // ─────────────────────────────────────────────────────────────────
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.threeScene.init({ canvas: this.canvasRef.nativeElement });
      this.animService.heroEntrance(this.canvasRef.nativeElement.parentElement!);
      this.phraseTimer = setInterval(() => this.cyclePhrase(), 3600);
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
    clearInterval(this.phraseTimer);
    this.threeScene.destroy();
  }
}
