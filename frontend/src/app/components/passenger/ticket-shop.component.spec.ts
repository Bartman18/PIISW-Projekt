import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketShopComponent } from './ticket-shop.component';
import { ApiService } from '../../services/api.service';
import { WalletService } from '../../services/wallet.service';
import { TicketService } from '../../services/ticket.service';
import { Ticket, TicketDefinition } from '../../models/ticket.model';

function buyButtons(fixture: ComponentFixture<TicketShopComponent>): HTMLButtonElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('article button'));
}

describe('TicketShopComponent', () => {
  let fixture: ComponentFixture<TicketShopComponent>;
  let component: TicketShopComponent;
  let api: ApiService;
  let wallet: WalletService;
  let tickets: TicketService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TicketShopComponent] });
    fixture = TestBed.createComponent(TicketShopComponent);
    component = fixture.componentInstance;
    api = TestBed.inject(ApiService);
    wallet = TestBed.inject(WalletService);
    tickets = TestBed.inject(TicketService);
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
    spyOn(wallet, 'canAfford').and.returnValue(false);
    fixture.detectChanges();
    const buttons = buyButtons(fixture);
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.every((b) => b.disabled)).toBeTrue();
    expect(buttons[0].textContent).toContain('Niewystarczające saldo');
  });

  it('enables the buy button when the wallet can afford the ticket', () => {
    spyOn(wallet, 'canAfford').and.returnValue(true);
    fixture.detectChanges();
    const buttons = buyButtons(fixture);
    expect(buttons.every((b) => !b.disabled)).toBeTrue();
    expect(buttons[0].textContent).toContain('Kup za');
  });

  it('shows a success notice with the purchased ticket id', async () => {
    const def: TicketDefinition = tickets.catalog()[0];
    const fakeTicket: Ticket = {
      id: 'TKT-FAKE1234',
      definitionId: def.id,
      name: def.name,
      price: def.price,
      type: def.type,
      category: def.category,
      status: 'active',
      purchaseTime: Date.now()
    };
    spyOn(api, 'purchaseTicket').and.resolveTo(fakeTicket);
    await component.buy(def);
    expect(component.noticeKind()).toBe('success');
    expect(component.notice()).toContain('TKT-FAKE1234');
  });

  it('shows an error notice when the purchase fails', async () => {
    spyOn(api, 'purchaseTicket').and.rejectWith(new Error('Niewystarczające saldo'));
    await component.buy(tickets.catalog()[0]);
    expect(component.noticeKind()).toBe('error');
    expect(component.notice()).toBe('Niewystarczające saldo');
  });
});
