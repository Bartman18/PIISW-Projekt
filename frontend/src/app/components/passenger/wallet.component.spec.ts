import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WalletComponent } from './wallet.component';
import { WalletService } from '../../services/wallet.service';
import { PaymentService, PaymentResult } from '../../services/payment.service';

describe('WalletComponent', () => {
  let fixture: ComponentFixture<WalletComponent>;
  let component: WalletComponent;
  let wallet: WalletService;
  let payment: PaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [WalletComponent] });
    fixture = TestBed.createComponent(WalletComponent);
    component = fixture.componentInstance;
    wallet = TestBed.inject(WalletService);
    payment = TestBed.inject(PaymentService);
    fixture.detectChanges();
  });

  it('shows the current wallet balance formatted to two decimals', () => {
    expect(fixture.nativeElement.textContent).toContain('50.00');
    expect(fixture.nativeElement.textContent).toContain('PLN');
  });

  it('reacts to balance changes from the service', () => {
    wallet.topUp(15);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('65.00');
  });

  it('calls payment.process and then wallet.topUp(20) on top-up click', async () => {
    const result: PaymentResult = { success: true, transactionId: 'TX-TEST123' };
    spyOn(payment, 'process').and.resolveTo(result);
    const topUpSpy = spyOn(wallet, 'topUp').and.callThrough();
    await component.topUp();
    expect(payment.process).toHaveBeenCalledOnceWith(20, jasmine.any(String));
    expect(topUpSpy).toHaveBeenCalledOnceWith(20);
    expect(component.lastTopUp()).toContain('TX-TEST123');
  });

  it('does not credit the wallet when payment fails', async () => {
    spyOn(payment, 'process').and.resolveTo({ success: false, transactionId: 'TX-X' });
    const topUpSpy = spyOn(wallet, 'topUp');
    await component.topUp();
    expect(topUpSpy).not.toHaveBeenCalled();
    expect(component.lastTopUp()).toBeNull();
  });
});
