import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col">
      <header class="bg-brand-700 text-white shadow">
        <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-2 font-bold text-lg">
            <span class="inline-block w-6 h-6 rounded bg-white text-brand-700 grid place-items-center">B</span>
            PIISW – System Biletów
          </a>
          @if (auth.user(); as user) {
            <div class="flex items-center gap-3 text-sm">
              <span class="px-2 py-1 bg-brand-900/40 rounded">
                {{ user.displayName }} · <strong class="uppercase">{{ user.role }}</strong>
              </span>
              <button
                (click)="logout()"
                class="px-3 py-1 bg-white/10 hover:bg-white/20 rounded transition"
              >
                Wyloguj
              </button>
            </div>
          }
        </div>
      </header>
      <main class="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <router-outlet />
      </main>
      <footer class="text-center text-xs text-slate-500 py-4">
        © 2026 PIISW – Aplikacja demonstracyjna
      </footer>
    </div>
  `
})
export class AppComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
