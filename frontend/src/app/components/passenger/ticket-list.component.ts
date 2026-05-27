import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../services/api.service';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket.model';
import { TicketCardComponent } from './ticket-card.component';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [FormsModule, TicketCardComponent],
  template: `
    <section class="space-y-4">
      <header class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-800">Moje bilety</h2>
        <span class="text-sm text-slate-500">{{ tickets.tickets().length }} szt.</span>
      </header>

      @if (notice(); as msg) {
        <p
          [class]="
            noticeKind() === 'success'
              ? 'text-sm px-3 py-2 rounded bg-green-100 text-green-800'
              : 'text-sm px-3 py-2 rounded bg-red-100 text-red-800'
          "
        >
          {{ msg }}
        </p>
      }

      @if (tickets.tickets().length === 0) {
        <p class="text-slate-500 italic">
          Nie masz jeszcze biletów. Przejdź do sklepu, aby kupić pierwszy.
        </p>
      } @else {
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (ticket of tickets.tickets(); track ticket.id) {
            <div class="flex flex-col gap-2">
              <app-ticket-card [ticket]="ticket" />

              @if (canActivate(ticket)) {
                @if (ticket.type === 'jednorazowy') {
                  @if (validatingId() !== ticket.id) {
                    <button
                      (click)="startValidation(ticket)"
                      class="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-lg transition"
                    >
                      Skasuj bilet
                    </button>
                  } @else {
                    <form
                      (submit)="$event.preventDefault(); confirmValidation(ticket)"
                      class="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col gap-2"
                    >
                      <label class="text-xs text-slate-600 font-medium">
                        ID pojazdu, w którym kasujesz bilet:
                      </label>
                      <input
                        [(ngModel)]="vehicleInput"
                        name="vehicleId"
                        required
                        minlength="1"
                        placeholder="np. TRAM-1234"
                        class="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <div class="flex gap-2">
                        <button
                          type="submit"
                          class="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 rounded-lg"
                        >
                          Potwierdź
                        </button>
                        <button
                          type="button"
                          (click)="cancelValidation()"
                          class="px-3 bg-slate-200 hover:bg-slate-300 rounded-lg"
                        >
                          Anuluj
                        </button>
                      </div>
                    </form>
                  }
                } @else {
                  <button
                    (click)="activate(ticket)"
                    [disabled]="pendingId() === ticket.id"
                    class="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-semibold py-2 rounded-lg transition"
                  >
                    @if (pendingId() === ticket.id) {
                      Aktywuję...
                    } @else {
                      Aktywuj bilet
                    }
                  </button>
                }
              }
            </div>
          }
        </div>
      }
    </section>
  `
})
export class TicketListComponent implements OnInit {
  readonly tickets = inject(TicketService);

  readonly validatingId = signal<string | null>(null);
  readonly pendingId = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  readonly noticeKind = signal<'success' | 'error'>('success');
  vehicleInput = '';

  ngOnInit(): void {
    this.tickets.loadTickets();
  }

  canActivate(ticket: Ticket): boolean {
    return ticket.status !== 'validated';
  }

  startValidation(ticket: Ticket): void {
    this.validatingId.set(ticket.id);
    this.vehicleInput = '';
  }

  cancelValidation(): void {
    this.validatingId.set(null);
    this.vehicleInput = '';
  }

  async confirmValidation(ticket: Ticket): Promise<void> {
    const vehicleId = this.vehicleInput.trim();
    if (!vehicleId) return;
    try {
      const updated = await firstValueFrom(this.tickets.validate(ticket.id, vehicleId));
      this.showNotice('success', `Bilet ${updated.id} skasowany w pojeździe ${updated.vehicleId}.`);
    } catch (err) {
      this.showNotice('error', apiErrorMessage(err, 'Błąd kasowania biletu'));
    }
    this.cancelValidation();
  }

  async activate(ticket: Ticket): Promise<void> {
    this.pendingId.set(ticket.id);
    try {
      const updated = await firstValueFrom(this.tickets.validate(ticket.id));
      const until = updated.validUntil
        ? new Date(updated.validUntil).toLocaleString('pl-PL')
        : '';
      this.showNotice('success', `Bilet ${updated.id} aktywowany. Ważny do ${until}.`);
    } catch (err) {
      this.showNotice('error', apiErrorMessage(err, 'Błąd aktywacji biletu'));
    } finally {
      this.pendingId.set(null);
    }
  }

  private showNotice(kind: 'success' | 'error', msg: string): void {
    this.noticeKind.set(kind);
    this.notice.set(msg);
    setTimeout(() => this.notice.set(null), 4000);
  }
}
