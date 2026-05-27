import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { TicketListComponent } from './ticket-list.component';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket.model';

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 'TKT-TEST1234',
    definitionId: 'def-single-n',
    name: 'Bilet jednorazowy',
    price: 4,
    type: 'jednorazowy',
    category: 'normalny',
    status: 'active',
    purchaseTime: Date.now(),
    ...overrides
  };
}

class FakeTicketService {
  readonly tickets = signal<Ticket[]>([]);
  readonly loadTickets = jasmine.createSpy('loadTickets');
  readonly validate = jasmine
    .createSpy('validate')
    .and.returnValue(of(makeTicket()) as Observable<Ticket>);
}

describe('TicketListComponent', () => {
  let fixture: ComponentFixture<TicketListComponent>;
  let component: TicketListComponent;
  let tickets: FakeTicketService;

  beforeEach(() => {
    tickets = new FakeTicketService();
    TestBed.configureTestingModule({
      imports: [TicketListComponent],
      providers: [{ provide: TicketService, useValue: tickets }]
    });
    fixture = TestBed.createComponent(TicketListComponent);
    component = fixture.componentInstance;
  });

  it('loads tickets on init', () => {
    fixture.detectChanges();
    expect(tickets.loadTickets).toHaveBeenCalled();
  });

  it('shows the empty-state message when there are no tickets', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nie masz jeszcze biletów');
    expect(fixture.nativeElement.textContent).toContain('0 szt.');
  });

  describe('jednorazowy', () => {
    it('opens the vehicle-input form when "Skasuj bilet" is clicked', () => {
      const ticket = makeTicket();
      tickets.tickets.set([ticket]);
      fixture.detectChanges();

      component.startValidation(ticket);
      fixture.detectChanges();

      expect(component.validatingId()).toBe(ticket.id);
      expect(fixture.nativeElement.querySelector('input[name="vehicleId"]')).not.toBeNull();
    });

    it('does nothing when confirmValidation is called without a vehicleId', async () => {
      const ticket = makeTicket();
      component.startValidation(ticket);
      component.vehicleInput = '   ';
      await component.confirmValidation(ticket);
      expect(tickets.validate).not.toHaveBeenCalled();
    });

    it('shows a success notice after a confirmed validation', async () => {
      const ticket = makeTicket();
      const validated = makeTicket({ id: ticket.id, status: 'validated', vehicleId: 'BUS-9' });
      tickets.validate.and.returnValue(of(validated));

      component.startValidation(ticket);
      component.vehicleInput = 'BUS-9';
      await component.confirmValidation(ticket);

      expect(tickets.validate).toHaveBeenCalledWith(ticket.id, 'BUS-9');
      expect(component.noticeKind()).toBe('success');
      expect(component.notice()).toContain('BUS-9');
      expect(component.validatingId()).toBeNull();
    });

    it('shows an error notice when validation fails', async () => {
      const ticket = makeTicket();
      tickets.validate.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'Bilet został już skasowany' } }))
      );
      component.startValidation(ticket);
      component.vehicleInput = 'TRAM-1';
      await component.confirmValidation(ticket);
      expect(component.noticeKind()).toBe('error');
      expect(component.notice()).toBe('Bilet został już skasowany');
    });

    it('clears the form when cancelValidation is called', () => {
      component.validatingId.set('TKT-TEST1234');
      component.vehicleInput = 'BUS-1';
      component.cancelValidation();
      expect(component.validatingId()).toBeNull();
      expect(component.vehicleInput).toBe('');
    });
  });

  describe('czasowy / okresowy', () => {
    it('activates a czasowy ticket without requiring a vehicleId', async () => {
      const ticket = makeTicket({ type: 'czasowy' });
      const validUntil = Date.now() + 30 * 60_000;
      tickets.validate.and.returnValue(
        of(makeTicket({ id: ticket.id, type: 'czasowy', status: 'validated', validUntil }))
      );

      await component.activate(ticket);

      expect(tickets.validate).toHaveBeenCalledWith(ticket.id);
      expect(component.noticeKind()).toBe('success');
      expect(component.notice()).toContain('aktywowany');
      expect(component.pendingId()).toBeNull();
    });
  });

  describe('canActivate', () => {
    it('returns false for a validated ticket', () => {
      expect(component.canActivate(makeTicket({ status: 'validated' }))).toBeFalse();
    });

    it('returns true for an active ticket', () => {
      expect(component.canActivate(makeTicket({ status: 'active' }))).toBeTrue();
    });
  });
});
