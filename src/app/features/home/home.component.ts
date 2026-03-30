import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeroComponent } from './components/hero.component';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeroComponent],
  template: `<app-hero />`,
})
export class HomeComponent {}
