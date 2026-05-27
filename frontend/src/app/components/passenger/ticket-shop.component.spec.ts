import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { TicketShopComponent } from './ticket-shop.component';
import { WalletService } from '../../services/wallet.service';
import { TicketService } from '../../services/ticket.service';
import { Ticket, TicketDefinition } from '../../models/ticket.model';

const CATALOG: TicketDefinition[] = [
  { id: 'def-single-n', name: 'Bilet jednorazowy', price: 4, type: 'jednorazowy', category: 'normalny' },
  { id: 'def-single-u', name: 'Bilet jednorazowy', price: 2, type: 'jednorazowy', category: 'ulgowy' }
];

const FAKE_TICKET: Ticket = {
  id: 'TKT-FAKE1234',
  definitionId: 'def-single-n',
  name: 'Bilet jednorazowy',
  price: 4,
  type: 'jednorazowy',
  category: 'normalny',
  status: 'active',
  purchaseTime: Date.now()
};

class FakeTicketService {
  readonly catalog = signal<TicketDefinition[]>(CATALOG);
  readonly loadCatalog = jasmine.createSpy('loadCatalog');
  readonly purchase = jasmine
    .createSpy('purchase')
    .and.returnValue(of(FAKE_TICKET) as Observable<Ticket>);
}

class FakeWalletService {
  readonly refresh = jasmine.createSpy('refresh');
  readonly canAfford = jasmine.createSpy('canAfford').and.returnValue(true);
}

function buyButtons(fixture: ComponentFixture<TicketShopComponent>): HTMLButtonElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('article button'));
}

describe('TicketShopComponent', () => {
  let fixture: ComponentFixture<TicketShopComponent>;
  let component: TicketShopComponent;
  let tickets: FakeTicketService;
  let wallet: FakeWalletService;

  beforeEach(() => {
    tickets = new FakeTicketService();
    wallet = new FakeWalletService();
    TestBed.configureTestingModule({
      imports: [TicketShopComponent],
      providers: [
        { provide: TicketService, useValue: tickets },
        { provide: WalletService, useValue: wallet }
      ]
    });
    fixture = TestBed.createComponent(TicketShopComponent);
    component = fixture.componentInstance;
  });

  it('loads the catalog on init', () => {
    fixture.detectChanges();
    expect(tickets.loadCatalog).toHaveBeenCalled();
  });

  it('renders only normalny tickets by default', () => {
    fixture.detectChanges();
    const filtered = component.filteredCatalog();
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((d) => d.category === 'normalny')).toBeTrue();
  });

  it('switches the visible catalog when the ulgowy tab is clicked', () => {
    fixture.detectChanges();
    component.category.set('ulgowy');
    fixture.detectChanges();
    expect(component.filteredCatalog().every((d) => d.category === 'ulgowy')).toBeTrue();
  });

  it('disables the buy button and shows the empty-wallet label when broke', () => {
    wallet.canAfford.and.returnValue(false);
    fixture.detectChanges();
    const buttons = buyButtons(fixture);
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.every((b) => b.disabled)).toBeTrue();
    expect(buttons[0].textContent).toContain('Niewystarczające saldo');
  });

  it('enables the buy button when the wallet can afford the ticket', () => {
    wallet.canAfford.and.returnValue(true);
    fixture.detectChanges();
    const buttons = buyButtons(fixture);
    expect(buttons.every((b) => !b.disabled)).toBeTrue();
    expect(buttons[0].textContent).toContain('Kup za');
  });

  it('shows a success notice with the purchased ticket id', async () => {
    await component.buy(CATALOG[0]);
    expect(component.noticeKind()).toBe('success');
    expect(component.notice()).toContain('TKT-FAKE1234');
  });

  it('shows an error notice when the purchase fails', async () => {
    tickets.purchase.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 422, error: { message: 'Niewystarczające saldo' } }))
    );
    await component.buy(CATALOG[0]);
    expect(component.noticeKind()).toBe('error');
    expect(component.notice()).toBe('Niewystarczające saldo');
  });
});
