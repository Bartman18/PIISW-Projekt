import { TestBed } from '@angular/core/testing';
import { TicketService } from './ticket.service';
import { TicketDefinition } from '../models/ticket.model';

function findDef(service: TicketService, id: string): TicketDefinition {
  const def = service.catalog().find((d) => d.id === id);
  if (!def) throw new Error(`Test setup: missing catalog entry ${id}`);
  return def;
}

describe('TicketService', () => {
  let service: TicketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketService);
  });

  describe('catalog', () => {
    it('exposes both normalny and ulgowy variants for every base ticket', () => {
      const ids = service.catalog().map((d) => d.id);
      expect(ids).toContain('def-single-n');
      expect(ids).toContain('def-single-u');
    });

    it('halves the price for the ulgowy variant', () => {
      const normal = findDef(service, 'def-single-n');
      const reduced = findDef(service, 'def-single-u');
      expect(normal.price).toBe(4);
      expect(reduced.price).toBe(2);
    });
  });

  describe('createFromDefinition', () => {
    it('appends a new active ticket with a generated TKT- id', () => {
      const def = findDef(service, 'def-single-n');
      const ticket = service.createFromDefinition(def);
      expect(ticket.id).toMatch(/^TKT-[A-Z0-9]+$/);
      expect(ticket.status).toBe('active');
      expect(ticket.definitionId).toBe(def.id);
      expect(service.tickets().length).toBe(1);
      expect(service.tickets()[0].id).toBe(ticket.id);
    });

    it('keeps every ticket id unique across many purchases', () => {
      const def = findDef(service, 'def-single-n');
      const ids = new Set<string>();
      for (let i = 0; i < 25; i++) ids.add(service.createFromDefinition(def).id);
      expect(ids.size).toBe(25);
    });
  });

  describe('activeTickets', () => {
    it('returns active and validated tickets', () => {
      const def = findDef(service, 'def-single-n');
      const a = service.createFromDefinition(def);
      const b = service.createFromDefinition(def);
      service.validate(b.id, 'BUS-1');
      expect(service.activeTickets().map((t) => t.id)).toEqual(
        jasmine.arrayWithExactContents([a.id, b.id])
      );
    });
  });

  describe('validate – jednorazowy', () => {
    it('requires a vehicleId, otherwise leaves the ticket active', () => {
      const def = findDef(service, 'def-single-n');
      const ticket = service.createFromDefinition(def);
      const result = service.validate(ticket.id);
      expect(result).toBeUndefined();
      expect(service.findById(ticket.id)?.status).toBe('active');
    });

    it('marks the ticket validated and stores the vehicleId', () => {
      const def = findDef(service, 'def-single-n');
      const ticket = service.createFromDefinition(def);
      const updated = service.validate(ticket.id, 'TRAM-7');
      expect(updated?.status).toBe('validated');
      expect(updated?.vehicleId).toBe('TRAM-7');
      expect(updated?.validationTime).toBeDefined();
    });

    it('is a no-op when called twice on the same ticket', () => {
      const def = findDef(service, 'def-single-n');
      const ticket = service.createFromDefinition(def);
      service.validate(ticket.id, 'TRAM-7');
      const again = service.validate(ticket.id, 'TRAM-9');
      expect(again).toBeUndefined();
      expect(service.findById(ticket.id)?.vehicleId).toBe('TRAM-7');
    });
  });

  describe('validate – czasowy', () => {
    it('sets validUntil to now + durationMinutes', () => {
      jasmine.clock().install();
      const fixedNow = new Date('2026-05-13T10:00:00Z');
      jasmine.clock().mockDate(fixedNow);

      const def = findDef(service, 'def-time-30m-n');
      const ticket = service.createFromDefinition(def);
      const updated = service.validate(ticket.id);

      expect(updated?.status).toBe('validated');
      expect(updated?.validUntil).toBe(fixedNow.getTime() + 30 * 60_000);
      expect(updated?.vehicleId).toBeUndefined();

      jasmine.clock().uninstall();
    });
  });

  describe('validate – okresowy', () => {
    it('sets validUntil to now + validityDays', () => {
      jasmine.clock().install();
      const fixedNow = new Date('2026-05-13T10:00:00Z');
      jasmine.clock().mockDate(fixedNow);

      const def = findDef(service, 'def-period-30-n');
      const ticket = service.createFromDefinition(def);
      const updated = service.validate(ticket.id);

      expect(updated?.status).toBe('validated');
      expect(updated?.validUntil).toBe(fixedNow.getTime() + 30 * 24 * 60 * 60_000);

      jasmine.clock().uninstall();
    });
  });

  describe('findById', () => {
    it('returns undefined for an unknown id', () => {
      expect(service.findById('TKT-NOPE')).toBeUndefined();
    });
  });
});
