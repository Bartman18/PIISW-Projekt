import { Injectable, computed, signal } from '@angular/core';
import { Ticket, TicketCategory, TicketDefinition, TicketType } from '../models/ticket.model';

interface BaseTicket {
  baseId: string;
  name: string;
  basePrice: number;
  type: TicketType;
  durationMinutes?: number;
  validityDays?: number;
}

const BASE_TICKETS: readonly BaseTicket[] = [
  { baseId: 'test-1m', name: 'Bilet testowy 1-minutowy', basePrice: 0.5, type: 'czasowy', durationMinutes: 1 },
  { baseId: 'single', name: 'Bilet jednorazowy', basePrice: 4.0, type: 'jednorazowy' },
  { baseId: 'time-15m', name: 'Bilet czasowy 15-minutowy', basePrice: 3.0, type: 'czasowy', durationMinutes: 15 },
  { baseId: 'time-30m', name: 'Bilet czasowy 30-minutowy', basePrice: 4.5, type: 'czasowy', durationMinutes: 30 },
  { baseId: 'time-60m', name: 'Bilet czasowy 60-minutowy', basePrice: 6.0, type: 'czasowy', durationMinutes: 60 },
  { baseId: 'time-24h', name: 'Bilet czasowy 24h', basePrice: 15.0, type: 'czasowy', durationMinutes: 24 * 60 },
  { baseId: 'time-72h', name: 'Bilet czasowy 72h', basePrice: 30.0, type: 'czasowy', durationMinutes: 72 * 60 },
  { baseId: 'period-30', name: 'Bilet okresowy 30-dniowy', basePrice: 110.0, type: 'okresowy', validityDays: 30 },
  { baseId: 'period-90', name: 'Bilet okresowy 90-dniowy', basePrice: 280.0, type: 'okresowy', validityDays: 90 }
];

function buildCatalog(): TicketDefinition[] {
  const variants: TicketCategory[] = ['normalny', 'ulgowy'];
  return BASE_TICKETS.flatMap((t) =>
    variants.map<TicketDefinition>((category) => ({
      id: `def-${t.baseId}-${category === 'normalny' ? 'n' : 'u'}`,
      name: t.name,
      type: t.type,
      category,
      price: category === 'ulgowy' ? +(t.basePrice / 2).toFixed(2) : t.basePrice,
      durationMinutes: t.durationMinutes,
      validityDays: t.validityDays
    }))
  );
}

@Injectable({ providedIn: 'root' })
export class TicketService {
  readonly catalog = signal<TicketDefinition[]>(buildCatalog());

  private readonly _tickets = signal<Ticket[]>([]);
  readonly tickets = this._tickets.asReadonly();

  readonly activeTickets = computed(() =>
    this._tickets().filter((t) => t.status === 'active' || t.status === 'validated')
  );

  findById(id: string): Ticket | undefined {
    return this._tickets().find((t) => t.id === id);
  }

  createFromDefinition(def: TicketDefinition): Ticket {
    const ticket: Ticket = {
      id: 'TKT-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
      definitionId: def.id,
      name: def.name,
      price: def.price,
      type: def.type,
      category: def.category,
      status: 'active',
      purchaseTime: Date.now(),
      durationMinutes: def.durationMinutes,
      validityDays: def.validityDays
    };
    this._tickets.update((list) => [...list, ticket]);
    return ticket;
  }

  validate(ticketId: string, vehicleId?: string): Ticket | undefined {
    let updated: Ticket | undefined;
    this._tickets.update((list) =>
      list.map((t) => {
        if (t.id !== ticketId) return t;
        if (t.status === 'validated') return t;
        if (t.type === 'jednorazowy' && !vehicleId) return t;

        const now = Date.now();
        let validUntil = t.validUntil;
        if (t.type === 'czasowy' && t.durationMinutes) {
          validUntil = now + t.durationMinutes * 60_000;
        } else if (t.type === 'okresowy' && t.validityDays) {
          validUntil = now + t.validityDays * 24 * 60 * 60_000;
        }

        updated = {
          ...t,
          status: 'validated',
          validationTime: now,
          vehicleId: t.type === 'jednorazowy' ? vehicleId : t.vehicleId,
          validUntil
        };
        return updated;
      })
    );
    return updated;
  }
}
