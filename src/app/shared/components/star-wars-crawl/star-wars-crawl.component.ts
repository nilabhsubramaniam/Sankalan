import {
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Star Wars–style opening crawl intro overlay.
 * Shows once per session (stored in sessionStorage).
 * Emits (dismissed) when the user clicks Skip or the animation ends.
 */
@Component({
  selector: 'app-star-wars-crawl',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        class="sw-overlay"
        [class.sw-overlay--fade-out]="fadingOut()"
        (click)="skip()"
        role="dialog"
        aria-modal="true"
        aria-label="Opening crawl intro"
      >
        <!-- Phase 1: classic blue "A long time ago…" text -->
        <p class="sw-ago">
          A long time ago in a stack far,&nbsp;far away&hellip;
        </p>

        <!-- Phase 2: SANKALAN logo flash -->
        <div class="sw-logo" aria-hidden="true">
          <span class="sw-logo__text">SANKALAN</span>
        </div>

        <!-- Phase 3: perspective crawl -->
        <div class="sw-stage" aria-hidden="true">
          <div class="sw-crawl">

            <p class="sw-crawl__title">Episode&nbsp;I</p>
            <p class="sw-crawl__subtitle">THE DEVELOPER STRIKES</p>

            <p>
              The galaxy of web development is in turmoil.
              Legacy codebases have spread across the front-end
              systems, leaving chaos in their wake.
            </p>

            <p>
              A daring Full-Stack Engineer known as
              <strong>Nilabh</strong>, armed with Angular and the
              ancient Go programming language, sets out to craft
              interfaces worth experiencing.
            </p>

            <p>
              Having mastered the arcane arts of Three.js particle
              systems, server-side rendering, and pixel-perfect
              design, he now seeks to bring order to the
              universe — one component at a time.
            </p>

            <p>
              His portfolio — code-named <strong>SANKALAN</strong>
              — stands as a testament to clean architecture,
              performance, and the relentless pursuit of the
              perfect user experience.
            </p>

            <p>
              Scroll down, young Padawan, and witness the
              power of the fully operational portfolio&hellip;
            </p>

          </div>
        </div>

        <!-- Skip hint -->
        <button class="sw-skip" (click)="skip()" aria-label="Skip intro">
          SKIP INTRO &nbsp;&#9658;
        </button>
      </div>
    }
  `,
  styles: [`
    /* ─── Overlay ──────────────────────────────────────────────── */
    .sw-overlay {
      position: fixed;
      inset: 0;
      z-index: 100000;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      font-family: 'News Cycle', 'Arial Narrow', sans-serif;
      cursor: pointer;
      transition: opacity 1.2s ease;
    }

    .sw-overlay--fade-out {
      opacity: 0;
      pointer-events: none;
    }

    /* ─── Phase 1 — "A long time ago…" ─────────────────────────── */
    .sw-ago {
      position: absolute;
      color: #4bd5ee;           /* classic Star Wars cyan-blue */
      font-size: clamp(1rem, 2.4vw, 1.6rem);
      font-weight: 400;
      letter-spacing: 0.05em;
      text-align: center;
      max-width: 640px;
      padding: 0 2rem;

      /* Fade in → hold → fade out; total 6 s, then hidden forever */
      animation: sw-ago-fade 6s ease forwards;
    }

    @keyframes sw-ago-fade {
      0%   { opacity: 0; }
      15%  { opacity: 1; }
      70%  { opacity: 1; }
      100% { opacity: 0; }
    }

    /* ─── Phase 2 — SANKALAN logo ───────────────────────────────── */
    .sw-logo {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;

      /* Start after "ago" text finishes (6 s), run for 5 s */
      animation: sw-logo-anim 5s 6s ease forwards;
      opacity: 0;
    }

    .sw-logo__text {
      color: #ffe81f;            /* Star Wars gold */
      font-size: clamp(3rem, 12vw, 9rem);
      font-weight: 900;
      letter-spacing: 0.18em;
      text-align: center;
      line-height: 1;

      /* Shrink into perspective as if flying away */
      display: block;
      transform-origin: center center;
    }

    @keyframes sw-logo-anim {
      0%   { opacity: 0; transform: scale(1.8);   }
      20%  { opacity: 1; transform: scale(1);     }
      70%  { opacity: 1; transform: scale(0.55);  }
      100% { opacity: 0; transform: scale(0.2);   }
    }

    /* ─── Phase 3 — Perspective crawl stage ────────────────────── */
    .sw-stage {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      overflow: hidden;

      /* Perspective vanishing-point in the upper-centre */
      perspective: 420px;
      perspective-origin: 50% 10%;

      /* Fade-in mask at top so text disappears into "space" */
      -webkit-mask-image: linear-gradient(
        to bottom,
        transparent 0%,
        transparent 12%,
        black 28%,
        black 100%
      );
      mask-image: linear-gradient(
        to bottom,
        transparent 0%,
        transparent 12%,
        black 28%,
        black 100%
      );

      /* Start after logo finishes: 6 + 5 = 11 s */
      animation: sw-stage-appear 1s 11s ease forwards;
      opacity: 0;
    }

    @keyframes sw-stage-appear {
      to { opacity: 1; }
    }

    /* ─── Crawl text block ──────────────────────────────────────── */
    .sw-crawl {
      width: min(640px, 86vw);
      padding-bottom: 20vh;
      text-align: justify;
      hyphens: auto;

      /* The key 3-D tilt */
      transform: rotateX(22deg);
      transform-origin: center bottom;

      /* Scroll from offscreen-bottom to beyond the top.
         Starts at 11 s, runs ~52 s */
      animation: sw-crawl-scroll 52s 11s linear forwards;
      will-change: transform;
    }

    @keyframes sw-crawl-scroll {
      from { transform: rotateX(22deg) translateY(100vh);  }
      to   { transform: rotateX(22deg) translateY(-520%);  }
    }

    /* ─── Typography inside crawl ───────────────────────────────── */
    .sw-crawl p,
    .sw-crawl__title,
    .sw-crawl__subtitle {
      color: #ffe81f;
      text-shadow: 0 0 18px rgba(255, 232, 31, 0.35);
      margin: 0 0 1.4em;
      line-height: 1.55;
    }

    .sw-crawl p {
      font-size: clamp(0.9rem, 2.2vw, 1.25rem);
      font-weight: 400;
    }

    .sw-crawl p strong {
      font-weight: 700;
      color: #fff8d0;
    }

    .sw-crawl__title {
      font-size: clamp(0.7rem, 1.6vw, 0.95rem);
      font-weight: 700;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      text-align: center;
      margin-bottom: 0.4em;
    }

    .sw-crawl__subtitle {
      font-size: clamp(1.2rem, 3.5vw, 2rem);
      font-weight: 900;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      text-align: center;
      margin-bottom: 2em;
    }

    /* ─── Skip button ───────────────────────────────────────────── */
    .sw-skip {
      position: absolute;
      bottom: clamp(1.2rem, 3vh, 2rem);
      right: clamp(1.2rem, 3vw, 2.5rem);
      background: transparent;
      border: 1px solid rgba(255, 232, 31, 0.35);
      color: rgba(255, 232, 31, 0.6);
      font-family: inherit;
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      padding: 0.5em 1em;
      cursor: pointer;
      transition: color 0.2s ease, border-color 0.2s ease;
      z-index: 1;

      &:hover, &:focus-visible {
        color: #ffe81f;
        border-color: rgba(255, 232, 31, 0.7);
        outline: none;
      }
    }

    /* ─── Reduced motion ────────────────────────────────────────── */
    @media (prefers-reduced-motion: reduce) {
      .sw-overlay { animation: none; }
      .sw-ago, .sw-logo, .sw-stage, .sw-crawl { animation: none !important; }
    }
  `],
})
export class StarWarsCrawlComponent implements OnInit, OnDestroy {
  @Output() dismissed = new EventEmitter<void>();

  protected readonly visible    = signal(false);
  protected readonly fadingOut  = signal(false);

  private readonly platformId   = inject(PLATFORM_ID);
  private dismissTimer?: ReturnType<typeof setTimeout>;

  // Total animation length in ms: 11s delay + 52s crawl + 1.5s buffer
  private readonly TOTAL_MS = (11 + 52 + 1.5) * 1000;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (sessionStorage.getItem('sw-crawl-seen')) {
      this.dismissed.emit();
      return;
    }

    this.visible.set(true);

    this.dismissTimer = setTimeout(() => this.dismiss(), this.TOTAL_MS);
  }

  skip(): void {
    this.dismiss();
  }

  private dismiss(): void {
    if (!this.visible()) return;
    sessionStorage.setItem('sw-crawl-seen', '1');
    this.fadingOut.set(true);
    setTimeout(() => {
      this.visible.set(false);
      this.dismissed.emit();
    }, 1200);
  }

  ngOnDestroy(): void {
    clearTimeout(this.dismissTimer);
  }
}
