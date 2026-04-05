import {
  Directive,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  inject,
  Input,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AnimationService, AnimationPreset } from '../../core/services/animation.service';

@Directive({
  selector: '[appScrollAnimate]',
  standalone: true,
})
export class ScrollAnimateDirective implements AfterViewInit, OnDestroy {
  @Input() animPreset: AnimationPreset = 'fadeUp';
  @Input() animStagger = 0.12;
  @Input() animStart = 'top 85%';

  private readonly el          = inject(ElementRef);
  private readonly anim        = inject(AnimationService);
  private readonly platformId  = inject(PLATFORM_ID);
  private timerId?: ReturnType<typeof setTimeout>;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Defer one tick so @for children are fully rendered before querying
    this.timerId = setTimeout(() => {
      this.anim.animateOnScroll({
        trigger: this.el.nativeElement as Element,
        preset: this.animPreset,
        stagger: this.animStagger,
        start: this.animStart,
      });
    }, 0);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timerId);
    this.anim.killAll();
  }
}
