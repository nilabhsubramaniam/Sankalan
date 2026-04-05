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

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.threeScene.init({ canvas: this.canvasRef.nativeElement });
      this.animService.heroEntrance(this.canvasRef.nativeElement.parentElement!);
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
