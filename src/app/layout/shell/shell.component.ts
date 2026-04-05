import {
  Component,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <app-navbar />
    <main id="main-content" [class.transitioning]="isTransitioning()">
      <router-outlet />
    </main>
    <app-footer />
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    main  { flex: 1; }
    .skip-link {
      position: absolute;
      top: -100%;
      left: 1rem;
      padding: 0.5rem 1rem;
      background: var(--color-accent);
      color: var(--color-text-inverse);
      border-radius: var(--radius-md);
      font-weight: var(--weight-semibold);
      z-index: var(--z-toast);
      transition: top var(--transition-fast);
      &:focus { top: 1rem; }
    }
    main.transitioning { opacity: 0.6; pointer-events: none; transition: opacity 200ms ease; }
  `],
})
export class ShellComponent {
  private readonly router = inject(Router);

  readonly isTransitioning = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationStart || e instanceof NavigationEnd),
      map((e) => e instanceof NavigationStart),
      startWith(false)
    ),
    { initialValue: false }
  );
}
