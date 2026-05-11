import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-md mx-auto mt-10">
      <div class="bg-white rounded-xl shadow p-8">
        <h1 class="text-3xl font-bold text-slate-800 mb-2">Logowanie</h1>
        <p class="text-slate-600 mb-6">Zaloguj się, aby przejść do aplikacji.</p>

        <form (ngSubmit)="submit()" #f="ngForm" class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-slate-700 mb-1">
              Login
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autocomplete="username"
              required
              [(ngModel)]="username"
              class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="np. pasazer"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 mb-1">
              Hasło
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              [(ngModel)]="password"
              class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          @if (error()) {
            <div class="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {{ error() }}
            </div>
          }

          <button
            type="submit"
            [disabled]="f.invalid"
            class="w-full bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-md transition"
          >
            Zaloguj się
          </button>
        </form>

        <div class="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500">
          <p class="font-semibold mb-1">Konta testowe (mock):</p>
          <ul class="space-y-0.5">
            <li><code>pasazer</code> / <code>pasazer</code> — pasażer</li>
            <li><code>bileter</code> / <code>bileter</code> — bileter</li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  username = '';
  password = '';
  readonly error = signal<string | null>(null);

  submit(): void {
    const user = this.auth.login(this.username, this.password);
    if (!user) {
      this.error.set('Nieprawidłowy login lub hasło.');
      return;
    }
    this.error.set(null);
    this.router.navigateByUrl(user.role === 'passenger' ? '/passenger' : '/inspector');
  }
}
