import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { tap, finalize } from 'rxjs/operators';

export const loggingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const start = Date.now();
  // TODO: Attach auth token when Go backend is integrated:
  // const token = inject(AuthService).token();
  // req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  return next(req).pipe(
    tap({
      error: (err) =>
        console.error(`[HTTP] ${req.method} ${req.url}`, err.status, err.message),
    }),
    finalize(() => {
      const elapsed = Date.now() - start;
      if (elapsed > 1000) {
        console.warn(`[HTTP] Slow request: ${req.method} ${req.url} — ${elapsed}ms`);
      }
    })
  );
};
