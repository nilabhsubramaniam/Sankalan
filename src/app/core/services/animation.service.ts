import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export type AnimationPreset = 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scaleIn';

interface ScrollAnimOptions {
  trigger: string | Element;
  preset?: AnimationPreset;
  delay?: number;
  stagger?: number;
  start?: string;
  targets?: string;
}

@Injectable({ providedIn: 'root' })
export class AnimationService {
  private readonly platformId = inject(PLATFORM_ID);
  private registered = false;

  private ensureRegistered(): void {
    if (!this.registered && isPlatformBrowser(this.platformId)) {
      gsap.registerPlugin(ScrollTrigger);
      this.registered = true;
    }
  }

  /** Animate a container's .fade-in children on scroll */
  animateOnScroll(options: ScrollAnimOptions): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.ensureRegistered();

    const {
      trigger,
      preset = 'fadeUp',
      delay = 0,
      stagger = 0.12,
      start = 'top 85%',
      targets = '.fade-in, .slide-in-left, .slide-in-right',
    } = options;

    const from = this.getFrom(preset);
    gsap.from(`${trigger instanceof Element ? '' : trigger} ${targets}`, {
      ...from,
      duration: 0.8,
      delay,
      stagger,
      ease: 'power3.out',
      scrollTrigger: {
        trigger,
        start,
        toggleActions: 'play none none none',
      },
    });
  }

  /** Hero entrance animation — runs immediately */
  heroEntrance(container: Element): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.ensureRegistered();

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero__label',    { y: 14, opacity: 0, duration: 0.55, delay: 0.5 })
      .from('.hero__headline', { y: 60, opacity: 0, duration: 1.1  }, '-=0.2')
      .from('.hero__links',    { y: 20, opacity: 0, duration: 0.6  }, '-=0.4')
      .from('.hero__meta',     { opacity: 0, duration: 0.6 }, '-=0.2')
      .from('.hero__scroll',   { opacity: 0, duration: 0.5 }, '-=0.3');
  }

  /** Animate progress bars (skills) when they enter viewport */
  animateProgressBars(selector = '.skill-card__fill'): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.ensureRegistered();

    document.querySelectorAll<HTMLElement>(selector).forEach((bar) => {
      const targetWidth = bar.style.width;
      bar.style.width = '0%';
      ScrollTrigger.create({
        trigger: bar,
        start: 'top 90%',
        onEnter: () => {
          gsap.to(bar, { width: targetWidth, duration: 1.2, ease: 'power2.out' });
        },
        once: true,
      });
    });
  }

  /** Refresh ScrollTrigger (call after route changes) */
  refresh(): void {
    if (isPlatformBrowser(this.platformId) && this.registered) {
      ScrollTrigger.refresh();
    }
  }

  /** Kill all ScrollTrigger instances (call on component destroy) */
  killAll(): void {
    if (isPlatformBrowser(this.platformId) && this.registered) {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    }
  }

  private getFrom(preset: AnimationPreset): gsap.TweenVars {
    const map: Record<AnimationPreset, gsap.TweenVars> = {
      fadeUp:    { y: 30,  opacity: 0 },
      fadeIn:    { opacity: 0          },
      slideLeft: { x: -40, opacity: 0  },
      slideRight:{ x: 40,  opacity: 0  },
      scaleIn:   { scale: 0.9, opacity: 0 },
    };
    return map[preset];
  }
}
