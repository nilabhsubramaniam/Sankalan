import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  inject,
  Input,
} from '@angular/core';
import { AnimationService, AnimationPreset } from '../../core/services/animation.service';

/**
 * Usage: <section appScrollAnimate [animPreset]="'fadeUp'" [animStagger]="0.1">
 *   Put .fade-in class on children to animate them.
 */
@Directive({
  selector: '[appScrollAnimate]',
  standalone: true,
})
export class ScrollAnimateDirective implements OnInit, OnDestroy {
  @Input() animPreset: AnimationPreset = 'fadeUp';
  @Input() animStagger = 0.12;
  @Input() animStart = 'top 85%';

  private readonly el = inject(ElementRef);
  private readonly anim = inject(AnimationService);

  ngOnInit(): void {
    this.anim.animateOnScroll({
      trigger: this.el.nativeElement as Element,
      preset: this.animPreset,
      stagger: this.animStagger,
      start: this.animStart,
    });
  }

  ngOnDestroy(): void {
    this.anim.killAll();
  }
}
