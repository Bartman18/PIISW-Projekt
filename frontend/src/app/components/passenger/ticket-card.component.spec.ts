import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketCardComponent } from './ticket-card.component';
import { Ticket } from '../../models/ticket.model';

const FIXED_NOW = new Date('2026-05-13T10:00:00Z').getTime();

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 'TKT-ABC12345',
    definitionId: 'def-single-n',
    name: 'Bilet jednorazowy',
    price: 4,
    type: 'jednorazowy',
    category: 'normalny',
    status: 'active',
    purchaseTime: new Date('2026-05-13T08:00:00Z').getTime(),
    ...overrides
  };
}

function render(ticket: Ticket): ComponentFixture<TicketCardComponent> {
  const fixture = TestBed.createComponent(TicketCardComponent);
  fixture.componentRef.setInput('ticket', ticket);
  fixture.detectChanges();
  return fixture;
}

describe('TicketCardComponent', () => {
  beforeEach(() => {
    spyOn(Date, 'now').and.returnValue(FIXED_NOW);
    TestBed.configureTestingModule({ imports: [TicketCardComponent] });
  });

  it('renders the ticket id and name', () => {
    const fixture = render(makeTicket());
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('TKT-ABC12345');
    expect(text).toContain('Bilet jednorazowy');
    fixture.destroy();
  });

  describe('statusLabel', () => {
    it('shows "aktywny" for an active ticket', () => {
      const fixture = render(makeTicket({ status: 'active' }));
      expect(fixture.componentInstance.statusLabel()).toBe('aktywny');
      fixture.destroy();
    });

    it('shows "skasowany" for a validated, still-valid ticket', () => {
      const fixture = render(
        makeTicket({
          status: 'validated',
          validationTime: FIXED_NOW,
          validUntil: FIXED_NOW + 60_000
        })
      );
      expect(fixture.componentInstance.statusLabel()).toBe('skasowany');
      fixture.destroy();
    });

    it('shows "wygasły" when validUntil is in the past', () => {
      const fixture = render(
        makeTicket({ status: 'validated', validUntil: FIXED_NOW - 1000 })
      );
      expect(fixture.componentInstance.isExpired()).toBeTrue();
      expect(fixture.componentInstance.statusLabel()).toBe('wygasły');
      fixture.destroy();
    });
  });

  describe('remainingLabel', () => {
    it('returns null when validUntil is not set', () => {
      const fixture = render(makeTicket());
      expect(fixture.componentInstance.remainingLabel()).toBeNull();
      fixture.destroy();
    });

    it('formats remaining time in minutes', () => {
      const fixture = render(
        makeTicket({ status: 'validated', validUntil: FIXED_NOW + 12 * 60_000 })
      );
      expect(fixture.componentInstance.remainingLabel()).toBe('12m');
      fixture.destroy();
    });

    it('formats remaining time in hours + minutes', () => {
      const fixture = render(
        makeTicket({ status: 'validated', validUntil: FIXED_NOW + (2 * 60 + 30) * 60_000 })
      );
      expect(fixture.componentInstance.remainingLabel()).toBe('2h 30m');
      fixture.destroy();
    });

    it('formats remaining time in days + hours + minutes', () => {
      const fixture = render(
        makeTicket({
          status: 'validated',
          validUntil: FIXED_NOW + (3 * 24 * 60 + 4 * 60 + 15) * 60_000
        })
      );
      expect(fixture.componentInstance.remainingLabel()).toBe('3d 4h 15m');
      fixture.destroy();
    });

    it('shows "wygasł" when validUntil is in the past', () => {
      const fixture = render(
        makeTicket({ status: 'validated', validUntil: FIXED_NOW - 10_000 })
      );
      expect(fixture.componentInstance.remainingLabel()).toBe('wygasł');
      fixture.destroy();
    });
  });

  describe('validUntilLabel', () => {
    it('shows a placeholder for a non-activated jednorazowy', () => {
      const fixture = render(makeTicket());
      expect(fixture.componentInstance.validUntilLabel()).toBe('jeden przejazd po skasowaniu');
      fixture.destroy();
    });

    it('shows the duration for a non-activated czasowy', () => {
      const fixture = render(
        makeTicket({ type: 'czasowy', durationMinutes: 30, validUntil: undefined })
      );
      expect(fixture.componentInstance.validUntilLabel()).toBe('po aktywacji: 30 min');
      fixture.destroy();
    });

    it('shows the validity in days for a non-activated okresowy', () => {
      const fixture = render(
        makeTicket({ type: 'okresowy', validityDays: 30, validUntil: undefined })
      );
      expect(fixture.componentInstance.validUntilLabel()).toBe('po aktywacji: 30 dni');
      fixture.destroy();
    });
  });

  it('clears the per-second interval on destroy', () => {
    const fixture = render(makeTicket());
    const clearSpy = spyOn(window, 'clearInterval').and.callThrough();
    fixture.destroy();
    expect(clearSpy).toHaveBeenCalled();
  });
});
