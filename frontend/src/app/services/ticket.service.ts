import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { Ticket, TicketDefinition } from '../models/ticket.model';
import { ApiService } from './api.service';
import { PaymentService } from './payment.service';
import { WalletService } from './wallet.service';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly api = inject(ApiService);
  private readonly wallet = inject(WalletService);
  private readonly payment = inject(PaymentService);

  private readonly _catalog = signal<TicketDefinition[]>([]);
  readonly catalog = this._catalog.asReadonly();

  private readonly _tickets = signal<Ticket[]>([]);
  readonly tickets = this._tickets.asReadonly();

  readonly activeTickets = computed(() =>
    this._tickets().filter((t) => t.status === 'active' || t.status === 'validated')
  );

  loadCatalog(): void {
    this.api.getCatalog().subscribe((catalog) => this._catalog.set(catalog));
  }

  loadTickets(): void {
    this.api.getTickets().subscribe((tickets) => this._tickets.set(tickets));
  }

  purchase(definitionId: string): Observable<Ticket> {
    this.payment.begin('Przetwarzanie zakupu biletu...');
    return this.api.purchaseTicket(definitionId).pipe(
      tap(() => {
        this.loadTickets();
        this.wallet.refresh();
      }),
      finalize(() => this.payment.end())
    );
  }

  validate(ticketId: string, vehicleId?: string): Observable<Ticket> {
    return this.api.validateTicket(ticketId, vehicleId).pipe(tap(() => this.loadTickets()));
  }
}
