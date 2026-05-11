import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { TicketService } from '../../services/ticket.service';
import { VerificationResult } from '../../models/ticket.model';

@Component({
  selector: 'app-verification-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="grid lg:grid-cols-2 gap-6">
      <form
        (submit)="$event.preventDefault(); verify()"
        class="bg-white rounded-xl shadow border border-slate-200 p-6 space-y-4"
      >
        <h2 class="text-lg font-semibold text-slate-800">Formularz kontroli</h2>

        <label class="block">
          <span class="text-sm font-medium text-slate-700">ID biletu</span>
          <input
            [(ngModel)]="ticketId"
            name="ticketId"
            required
            placeholder="TKT-XXXXXXXX"
            class="mt-1 w-full font-mono border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>

        <label class="block">
          <span class="text-sm font-medium text-slate-700">ID pojazdu</span>
          <input
            [(ngModel)]="vehicleId"
            name="vehicleId"
            required
            placeholder="np. TRAM-1234"
            class="mt-1 w-full font-mono border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>

        <button
          type="submit"
          [disabled]="!canSubmit || pending()"
          class="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
        >
          @if (pending()) {
            Weryfikacja...
          } @else {
            Sprawdź bilet
          }
        </button>

        @if (tickets.tickets().length > 0) {
          <details class="text-xs text-slate-600">
            <summary class="cursor-pointer hover:text-slate-800">
              Pokaż ID dostępnych biletów (demo)
            </summary>
            <ul class="mt-2 font-mono space-y-0.5">
              @for (t of tickets.tickets(); track t.id) {
                <li>
                  <button
                    type="button"
                    (click)="ticketId = t.id"
                    class="text-brand-700 hover:underline"
                  >
                    {{ t.id }}
                  </button>
                  – {{ t.type }} ({{ t.status }})
                </li>
              }
            </ul>
          </details>
        }
      </form>

      <div class="flex">
        @if (result(); as r) {
          <div
            [class]="
              r.valid
                ? 'flex-1 rounded-xl shadow-lg p-6 bg-green-50 border-2 border-green-400'
                : 'flex-1 rounded-xl shadow-lg p-6 bg-red-50 border-2 border-red-400'
            "
            role="alert"
            aria-live="polite"
          >
            <div class="flex items-center gap-3">
              <span class="text-5xl" aria-hidden="true">{{ r.valid ? '✅' : '⛔' }}</span>
              <div>
                <p [class]="r.valid ? 'text-3xl font-bold text-green-700' : 'text-3xl font-bold text-red-700'">
                  {{ r.valid ? 'BILET WAŻNY' : 'BILET NIEWAŻNY' }}
                </p>
                <p class="text-sm mt-1" [class]="r.valid ? 'text-green-800' : 'text-red-800'">
                  {{ r.message }}
                </p>
              </div>
            </div>
            @if (r.ticket; as t) {
              <dl class="grid grid-cols-2 gap-y-1 text-sm mt-4 text-slate-700">
                <dt class="font-medium">Bilet:</dt>
                <dd class="text-right">{{ t.name }}</dd>
                <dt class="font-medium">Typ:</dt>
                <dd class="text-right uppercase">{{ t.type }}</dd>
                <dt class="font-medium">Status:</dt>
                <dd class="text-right">{{ t.status }}</dd>
                @if (t.vehicleId) {
                  <dt class="font-medium">Skasowany w pojeździe:</dt>
                  <dd class="text-right font-mono">{{ t.vehicleId }}</dd>
                }
              </dl>
            }
          </div>
        } @else {
          <div
            class="flex-1 rounded-xl border-2 border-dashed border-slate-300 p-6 text-center text-slate-500 grid place-items-center"
          >
            <p>Wynik weryfikacji pojawi się tutaj.</p>
          </div>
        }
      </div>
    </section>
  `
})
export class VerificationFormComponent {
  private readonly api = inject(ApiService);
  readonly tickets = inject(TicketService);

  ticketId = '';
  vehicleId = '';

  readonly pending = signal(false);
  readonly result = signal<VerificationResult | null>(null);

  get canSubmit(): boolean {
    return this.ticketId.trim().length > 0 && this.vehicleId.trim().length > 0;
  }

  async verify(): Promise<void> {
    const id = this.ticketId.trim();
    const veh = this.vehicleId.trim();
    if (!id || !veh) return;
    this.pending.set(true);
    this.result.set(null);
    try {
      const res = await firstValueFrom(this.api.verifyTicket(id, veh));
      this.result.set(res);
    } catch (err) {
      this.result.set({
        valid: false,
        message: err instanceof Error ? err.message : 'Błąd weryfikacji'
      });
    } finally {
      this.pending.set(false);
    }
  }
}
