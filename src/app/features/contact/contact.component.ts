import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  HostListener,
  inject,
  signal,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { PortfolioDataService } from '../../core/services/portfolio-data.service';
import { ThreeSceneService } from '../../three/scenes/particle-scene.service';
import type { ContactForm } from '../../core/models/api.models';

@Component({
  selector: 'app-contact',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="contact-page">
      <!-- Starfield background -->
      <canvas #bgCanvas class="contact-page__canvas" aria-hidden="true" role="presentation"></canvas>
      <div class="contact-page__overlay" aria-hidden="true"></div>

    <section class="section contact" aria-labelledby="contact-heading">
      <div class="container">
        <header class="section__header contact__header">
          <span class="section__label">Get In Touch</span>
          <h1 id="contact-heading" class="section__title contact__title">Let's Work Together</h1>
          <p class="section__subtitle">
            Open to full-time roles, freelance projects, and interesting collaborations.
          </p>
        </header>

        <!-- Two-column layout -->
        <div class="contact__layout">

          <!-- Left: info panel -->
          <aside class="contact__info" aria-label="Contact information">
            @for (item of infoItems; track item.label) {
              <div class="contact__info-item">
                <div class="contact__info-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="item.iconPath" />
                  </svg>
                </div>
                <div class="contact__info-text">
                  <span class="contact__info-label">{{ item.label }}</span>
                  @if (item.href) {
                    <a [href]="item.href" target="_blank" rel="noopener noreferrer"
                       class="contact__info-link">{{ item.value }}</a>
                  } @else {
                    <span class="contact__info-value">{{ item.value }}</span>
                  }
                </div>
              </div>
            }
          </aside>

          <!-- Right: form -->
          <form
            [formGroup]="form"
            (ngSubmit)="onSubmit()"
            class="contact__form"
            aria-label="Contact form"
            novalidate
          >
            <div class="form-row">
              <div class="form-field">
                <label class="form-label" for="name">Full Name <span aria-hidden="true">*</span></label>
                <input
                  id="name"
                  type="text"
                  formControlName="name"
                  class="form-input"
                  [class.form-input--error]="isInvalid('name')"
                  placeholder="Type your name"
                  autocomplete="name"
                  [attr.aria-describedby]="isInvalid('name') ? 'name-error' : null"
                  [attr.aria-invalid]="isInvalid('name')"
                />
                @if (isInvalid('name')) {
                  <span id="name-error" class="form-error" role="alert">Name is required.</span>
                }
              </div>
              <div class="form-field">
                <label class="form-label" for="email">Email <span aria-hidden="true">*</span></label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="form-input"
                  [class.form-input--error]="isInvalid('email')"
                  placeholder="Type your email"
                  autocomplete="email"
                  [attr.aria-describedby]="isInvalid('email') ? 'email-error' : null"
                  [attr.aria-invalid]="isInvalid('email')"
                />
                @if (isInvalid('email')) {
                  <span id="email-error" class="form-error" role="alert">
                    {{ emailErrorMsg() }}
                  </span>
                }
              </div>
            </div>

            <div class="form-field">
              <label class="form-label" for="subject">Subject <span aria-hidden="true">*</span></label>
              <input
                id="subject"
                type="text"
                formControlName="subject"
                class="form-input"
                [class.form-input--error]="isInvalid('subject')"
                placeholder="Type a subject"
                [attr.aria-invalid]="isInvalid('subject')"
              />
            </div>

            <div class="form-field">
              <label class="form-label" for="message">Message <span aria-hidden="true">*</span></label>
              <textarea
                id="message"
                formControlName="message"
                class="form-input form-textarea"
                [class.form-input--error]="isInvalid('message')"
                placeholder="Type your message…"
                rows="6"
                [attr.aria-describedby]="isInvalid('message') ? 'message-error' : null"
                [attr.aria-invalid]="isInvalid('message')"
              ></textarea>
              @if (isInvalid('message')) {
                <span id="message-error" class="form-error" role="alert">
                  Message must be at least 20 characters.
                </span>
              }
            </div>

            @if (submitStatus() === 'success') {
              <div class="form-success" role="status" aria-live="polite">
                ✓ Message sent! I'll get back to you soon.
              </div>
            }
            @if (submitStatus() === 'error') {
              <div class="form-error-banner" role="alert">
                Something went wrong. Please try again.
              </div>
            }

            <button
              type="submit"
              class="btn btn--gold contact__submit"
              [disabled]="form.invalid || submitStatus() === 'loading'"
              [attr.aria-busy]="submitStatus() === 'loading'"
            >
              @if (submitStatus() === 'loading') {
                Sending…
              } @else {
                Send Message
              }
            </button>
          </form>
        </div>
      </div>
    </section>
    </div>
  `,
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly threeScene = inject(ThreeSceneService);
  private readonly fb = inject(FormBuilder);
  private readonly data = inject(PortfolioDataService);

  readonly submitStatus = signal<'idle' | 'loading' | 'success' | 'error'>('idle');

  readonly form = this.fb.group({
    name:    ['', [Validators.required, Validators.minLength(2)]],
    email:   ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(20)]],
  });

  readonly infoItems: { label: string; value: string; iconPath: string; href?: string }[] = [
    { label: 'Email',    value: 'nilabhsubramaniam@gmail.com',               href: 'mailto:nilabhsubramaniam@gmail.com', iconPath: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75' },
    { label: 'Location', value: 'Gurugram, Haryana, India',                  iconPath: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z' },
    { label: 'LinkedIn', value: 'linkedin.com/in/nilabhsubramaniam',          href: 'https://www.linkedin.com/in/nilabhsubramaniam', iconPath: 'M16.5 8.25a6 6 0 016 6v7.5h-4.5v-7.5a1.5 1.5 0 00-1.5-1.5 1.5 1.5 0 00-1.5 1.5v7.5H10.5v-7.5a6 6 0 016-6zM3.75 20.25h4.5v-12h-4.5v12zM6 6.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z' },
    { label: 'GitHub',   value: 'github.com/nilabhsubramaniam',               href: 'https://github.com/nilabhsubramaniam', iconPath: 'M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.111-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z' },
    { label: 'Status',   value: 'Open to opportunities',                      iconPath: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field) as AbstractControl;
    return ctrl.invalid && ctrl.touched;
  }

  emailErrorMsg(): string {
    const ctrl = this.form.get('email')!;
    if (ctrl.hasError('required')) return 'Email is required.';
    if (ctrl.hasError('email')) return 'Please enter a valid email.';
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitStatus.set('loading');
    this.data.submitContact(this.form.getRawValue() as ContactForm).subscribe({
      next: () => {
        this.submitStatus.set('success');
        this.form.reset();
      },
      error: () => this.submitStatus.set('error'),
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      requestAnimationFrame(() => {
        this.threeScene.init({ canvas: this.canvasRef.nativeElement, hideSun: true });
      });
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
