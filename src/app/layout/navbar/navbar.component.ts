import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  HostListener,
  PLATFORM_ID,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

interface NavItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header
      role="banner"
      class="navbar"
      [class.navbar--open]="isMenuOpen()"
    >
      <nav class="navbar__inner container" aria-label="Main navigation">
        <!-- Logo -->
        <a routerLink="/" class="navbar__logo" aria-label="Sankalan — home">
          <span class="navbar__logo-text">SANKALAN</span>
        </a>

        <!-- Desktop links -->
        <ul class="navbar__links" role="list">
          @for (item of navItems; track item.path) {
            <li>
              <a
                [routerLink]="item.path"
                routerLinkActive="navbar__link--active"
                [routerLinkActiveOptions]="{ exact: item.path === '/' }"
                class="navbar__link"
              >{{ item.label }}</a>
            </li>
          }
        </ul>

        <!-- Hamburger -->
        <button
          class="navbar__hamburger"
          [class.navbar__hamburger--open]="isMenuOpen()"
          (click)="toggleMenu()"
          [attr.aria-expanded]="isMenuOpen()"
          aria-controls="mobile-menu"
          aria-label="Toggle navigation"
        >
          <span></span><span></span><span></span>
        </button>
      </nav>

      <!-- Mobile menu -->
      <div
        id="mobile-menu"
        class="navbar__mobile"
        [class.navbar__mobile--open]="isMenuOpen()"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <ul role="list">
          @for (item of navItems; track item.path) {
            <li>
              <a
                [routerLink]="item.path"
                routerLinkActive="active"
                (click)="closeMenu()"
                class="navbar__mobile-link"
              >{{ item.label }}</a>
            </li>
          }
        </ul>
      </div>
    </header>
  `,
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private readonly platformId = inject(PLATFORM_ID);

  readonly isScrolled = signal(false);
  readonly isMenuOpen = signal(false);

  readonly navItems: NavItem[] = [
    { label: 'Home',     path: '/'        },
    { label: 'About',    path: '/about'   },
    { label: 'Projects', path: '/projects'},
    { label: 'Skills',   path: '/skills'  },
    { label: 'Contact',  path: '/contact' },
  ];

  @HostListener('window:scroll')
  onScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled.set(window.scrollY > 60);
    }
  }

  toggleMenu(): void { this.isMenuOpen.update((v) => !v); }
  closeMenu(): void  { this.isMenuOpen.set(false); }
}
