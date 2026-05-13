import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TicketListComponent } from './ticket-list.component';
import { ApiService } from '../../services/api.service';
import { TicketService } from '../../services/ticket.service';
import { Ticket, TicketDefinition } from '../../models/ticket.model';

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

describe('TicketListComponent', () => {
  let fixture: ComponentFixture<TicketListComponent>;
  let component: TicketListComponent;
  let api: ApiService;
  let ticketsService: TicketService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TicketListComponent] });
    fixture = TestBed.createComponent(TicketListComponent);
    component = fixture.componentInstance;
    api = TestBed.inject(ApiService);
    ticketsService = TestBed.inject(TicketService);
  });

  it('shows the empty-state message when there are no tickets', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nie masz jeszcze biletów');
    expect(fixture.nativeElement.textContent).toContain('0 szt.');
  });

  describe('jednorazowy', () => {
    it('opens the vehicle-input form when "Skasuj bilet" is clicked', () => {
      const def = ticketsService.catalog().find((d) => d.id === 'def-single-n') as TicketDefinition;
      const ticket = ticketsService.createFromDefinition(def);
      fixture.detectChanges();

      component.startValidation(ticket);
      fixture.detectChanges();

      expect(component.validatingId()).toBe(ticket.id);
      expect(fixture.nativeElement.querySelector('input[name="vehicleId"]')).not.toBeNull();
    });

    it('does nothing when confirmValidation is called without a vehicleId', async () => {
      const def = ticketsService.catalog().find((d) => d.id === 'def-single-n') as TicketDefinition;
      const ticket = ticketsService.createFromDefinition(def);
      const validateSpy = spyOn(api, 'validateTicket');
      component.startValidation(ticket);
      component.vehicleInput = '   ';
      await component.confirmValidation(ticket);
      expect(validateSpy).not.toHaveBeenCalled();
    });

    it('shows a success notice after a confirmed validation', async () => {
      const def = ticketsService.catalog().find((d) => d.id === 'def-single-n') as TicketDefinition;
      const ticket = ticketsService.createFromDefinition(def);
      const validated = makeTicket({ id: ticket.id, status: 'validated', vehicleId: 'BUS-9' });
      spyOn(api, 'validateTicket').and.returnValue(of(validated));

      component.startValidation(ticket);
      component.vehicleInput = 'BUS-9';
      await component.confirmValidation(ticket);

      expect(api.validateTicket).toHaveBeenCalledWith(ticket.id, 'BUS-9');
      expect(component.noticeKind()).toBe('success');
      expect(component.notice()).toContain('BUS-9');
      expect(component.validatingId()).toBeNull();
    });

    it('shows an error notice when validation fails', async () => {
      const ticket = makeTicket();
      spyOn(api, 'validateTicket').and.returnValue(
        throwError(() => new Error('Biletu nie można aktywować'))
      );
      component.startValidation(ticket);
      component.vehicleInput = 'TRAM-1';
      await component.confirmValidation(ticket);
      expect(component.noticeKind()).toBe('error');
      expect(component.notice()).toBe('Biletu nie można aktywować');
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
      const def = ticketsService.catalog().find((d) => d.id === 'def-time-30m-n') as TicketDefinition;
      const ticket = ticketsService.createFromDefinition(def);
      const validUntil = Date.now() + 30 * 60_000;
      spyOn(api, 'validateTicket').and.returnValue(
        of(makeTicket({ id: ticket.id, type: 'czasowy', status: 'validated', validUntil }))
      );

      await component.activate(ticket);

      expect(api.validateTicket).toHaveBeenCalledWith(ticket.id);
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
