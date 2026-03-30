import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { PortfolioDataService } from '../../core/services/portfolio-data.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <section class="section contact" aria-labelledby="contact-heading">
      <div class="container">
        <header class="section__header">
          <span class="section__label">Get In Touch</span>
          <h1 id="contact-heading" class="section__title">Let's Work Together</h1>
          <p class="section__subtitle">
            Open to full-time roles, freelance projects, and interesting collaborations.
          </p>
        </header>

        <div class="contact__layout">
          <!-- Info panel -->
          <aside class="contact__info" aria-label="Contact information">
            @for (item of infoItems; track item.label) {
              <div class="contact__info-item">
                <div class="contact__info-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="item.iconPath" />
                  </svg>
                </div>
                <div>
                  <p class="contact__info-label">{{ item.label }}</p>
                  <p class="contact__info-value">{{ item.value }}</p>
                </div>
              </div>
            }
          </aside>

          <!-- Form -->
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
                  placeholder="John Doe"
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
                  placeholder="john@example.com"
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
                placeholder="Project Collaboration"
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
                placeholder="Tell me about your project..."
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
  `,
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly data = inject(PortfolioDataService);

  readonly submitStatus = signal<'idle' | 'loading' | 'success' | 'error'>('idle');

  readonly form = this.fb.group({
    name:    ['', [Validators.required, Validators.minLength(2)]],
    email:   ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(20)]],
  });

  readonly infoItems = [
    { label: 'Email',    value: 'hello@sankalan.dev',     iconPath: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75' },
    { label: 'Location', value: 'New Delhi, India',        iconPath: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z' },
    { label: 'Status',   value: 'Open to opportunities',  iconPath: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
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
    this.data.submitContact(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.submitStatus.set('success');
        this.form.reset();
      },
      error: () => this.submitStatus.set('error'),
    });
  }
}
