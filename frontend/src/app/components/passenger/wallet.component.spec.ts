import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { WalletComponent } from './wallet.component';
import { WalletService } from '../../services/wallet.service';
import { PaymentService } from '../../services/payment.service';
import { WalletResponse } from '../../services/api.service';

class FakeWalletService {
  readonly balance = signal(50);
  readonly refresh = jasmine.createSpy('refresh');
  readonly topUp = jasmine
    .createSpy('topUp')
    .and.returnValue(of({ balance: 70 }) as Observable<WalletResponse>);
}

class FakePaymentService {
  readonly loading = signal(false);
  readonly message = signal('');
}

describe('WalletComponent', () => {
  let fixture: ComponentFixture<WalletComponent>;
  let component: WalletComponent;
  let wallet: FakeWalletService;

  beforeEach(() => {
    wallet = new FakeWalletService();
    TestBed.configureTestingModule({
      imports: [WalletComponent],
      providers: [
        { provide: WalletService, useValue: wallet },
        { provide: PaymentService, useValue: new FakePaymentService() }
      ]
    });
    fixture = TestBed.createComponent(WalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('refreshes the balance on init', () => {
    expect(wallet.refresh).toHaveBeenCalled();
  });

  it('shows the current wallet balance formatted to two decimals', () => {
    expect(fixture.nativeElement.textContent).toContain('50.00');
    expect(fixture.nativeElement.textContent).toContain('PLN');
  });

  it('reacts to balance changes from the service', () => {
    wallet.balance.set(65);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('65.00');
  });

  it('tops up via the wallet service and reports success', () => {
    component.topUp();
    expect(wallet.topUp).toHaveBeenCalledOnceWith(20);
    expect(component.lastTopUp()).toContain('Doładowano 20.00 PLN');
  });

  it('reports a failure message when the top-up errors', () => {
    wallet.topUp.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: {} }))
    );
    component.topUp();
    expect(component.lastTopUp()).toBe('Doładowanie nie powiodło się');
  });
});
