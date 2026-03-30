import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Custom circular cursor — inspired by richardmattka.com
 * Visible only on precise-pointer devices (desktop).
 * Uses mix-blend-mode: exclusion so it appears white on dark
 * backgrounds and inverts on light elements.
 */
@Component({
  selector: 'app-cursor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cursor" #cursorEl>
      <div class="cursor__ring"></div>
      <div class="cursor__dot"></div>
    </div>
  `,
  styles: [`
    :host { pointer-events: none; }

    .cursor {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 99999;
      pointer-events: none;
      will-change: transform;
      mix-blend-mode: exclusion;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .cursor__ring {
      width: 28px;
      height: 28px;
      border: 1px solid rgba(255, 255, 255, 0.85);
      border-radius: 50%;
      transition: transform 0.25s ease, border-color 0.2s ease;
    }

    .cursor__dot {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 3px;
      height: 3px;
      background: #fff;
      border-radius: 50%;
      transform: translate(-50%, -50%);
    }

    /* Only show on hover-capable, fine-pointer devices */
    @media (hover: none), (pointer: coarse) {
      .cursor { display: none !important; }
    }
  `],
})
export class CursorComponent implements OnInit, OnDestroy {
  private readonly el    = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);

  private cursor!: HTMLElement;
  private ring!: HTMLElement;
  private rafId?: number;

  // Target and current positions (lerp)
  private tx = -80; private ty = -80;
  private cx = -80; private cy = -80;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.cursor = this.el.nativeElement.querySelector('.cursor') as HTMLElement;
    this.ring   = this.cursor.querySelector('.cursor__ring') as HTMLElement;

    // Position off-screen initially so the ring doesn't flash at (0,0)
    this.cursor.style.opacity = '0';

    document.addEventListener('mousemove',  this.onMove);
    document.documentElement.addEventListener('mouseleave', this.onLeave);
    document.addEventListener('mouseover',  this.onHover);

    this.loop();
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    document.removeEventListener('mousemove',  this.onMove);
    document.documentElement.removeEventListener('mouseleave', this.onLeave);
    document.removeEventListener('mouseover',  this.onHover);
  }

  private readonly onMove = (e: MouseEvent): void => {
    this.tx = e.clientX;
    this.ty = e.clientY;
    // On first move snap the lerp position so ring doesn't sweep from off-screen
    if (this.cx < 0) {
      this.cx = this.tx;
      this.cy = this.ty;
    }
    this.cursor.style.opacity = '1';
  };

  private readonly onLeave = (): void => {
    this.cursor.style.opacity = '0';
  };

  private readonly onHover = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;
    if (target.closest('a, button, [role="button"], [tabindex]')) {
      this.ring.style.transform    = 'scale(1.7)';
      this.ring.style.borderColor  = 'rgba(255,255,255,0.5)';
    } else {
      this.ring.style.transform    = 'scale(1)';
      this.ring.style.borderColor  = 'rgba(255,255,255,0.85)';
    }
  };

  private loop(): void {
    this.rafId = requestAnimationFrame(() => this.loop());
    // Gentle lerp — ring trails slightly behind the mouse
    this.cx += (this.tx - this.cx) * 0.14;
    this.cy += (this.ty - this.cy) * 0.14;
    this.cursor.style.transform = `translate(${this.cx - 14}px, ${this.cy - 14}px)`;
  }
}
