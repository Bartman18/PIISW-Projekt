import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Ticket, TicketDefinition, VerificationResult } from '../models/ticket.model';
import { PaymentService } from './payment.service';
import { TicketService } from './ticket.service';
import { WalletService } from './wallet.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly tickets = inject(TicketService);
  private readonly wallet = inject(WalletService);
  private readonly payment = inject(PaymentService);

  purchaseTicket(ticketTypeId: string): Promise<Ticket> {
    const def = this.tickets.catalog().find((c) => c.id === ticketTypeId);
    if (!def) return Promise.reject(new Error('Nieznany typ biletu'));
    if (!this.wallet.canAfford(def.price)) {
      return Promise.reject(new Error('Niewystarczające saldo'));
    }
    return this.payment.process(def.price, 'Przetwarzanie zakupu biletu...').then((res) => {
      if (!res.success) throw new Error('Płatność odrzucona');
      this.wallet.debit(def.price);
      return this.tickets.createFromDefinition(def);
    });
  }

  validateTicket(ticketId: string, vehicleId?: string): Observable<Ticket> {
    const updated = this.tickets.validate(ticketId, vehicleId);
    if (!updated) {
      return throwError(() => new Error('Biletu nie można aktywować')).pipe(delay(400));
    }
    return of(updated).pipe(delay(400));
  }

  verifyTicket(ticketId: string, vehicleId: string): Observable<VerificationResult> {
    const ticket = this.tickets.findById(ticketId);
    if (!ticket) {
      return of({ valid: false, message: `Bilet ${ticketId} nie istnieje w systemie.` }).pipe(
        delay(500)
      );
    }
    const result = this.evaluate(ticket, vehicleId);
    return of({ ...result, ticket }).pipe(delay(500));
  }

  getCatalog(): TicketDefinition[] {
    return this.tickets.catalog();
  }

  private evaluate(ticket: Ticket, vehicleId: string): VerificationResult {
    const now = Date.now();
    switch (ticket.type) {
      case 'okresowy': {
        if (ticket.status !== 'validated' || !ticket.validUntil) {
          return { valid: false, message: 'Bilet okresowy nie został aktywowany.' };
        }
        if (now <= ticket.validUntil) {
          return {
            valid: true,
            message: `Bilet okresowy ważny do ${new Date(ticket.validUntil).toLocaleString('pl-PL')}.`
          };
        }
        return { valid: false, message: 'Bilet okresowy stracił ważność.' };
      }
      case 'jednorazowy': {
        if (ticket.status !== 'validated') {
          return { valid: false, message: 'Bilet jednorazowy nie został skasowany.' };
        }
        if (ticket.vehicleId !== vehicleId) {
          return {
            valid: false,
            message: `Bilet skasowany w innym pojeździe (${ticket.vehicleId ?? 'brak'}).`
          };
        }
        return { valid: true, message: 'Bilet jednorazowy ważny w tym pojeździe.' };
      }
      case 'czasowy': {
        if (ticket.status !== 'validated' || !ticket.validUntil) {
          return { valid: false, message: 'Bilet czasowy nie został skasowany.' };
        }
        if (now <= ticket.validUntil) {
          const remainingMin = Math.ceil((ticket.validUntil - now) / 60000);
          return {
            valid: true,
            message: `Bilet czasowy ważny do ${new Date(ticket.validUntil).toLocaleString('pl-PL')} (jeszcze ${remainingMin} min).`
          };
        }
        return {
          valid: false,
          message: `Bilet czasowy stracił ważność (${new Date(ticket.validUntil).toLocaleString('pl-PL')}).`
        };
      }
    }
  }
}
