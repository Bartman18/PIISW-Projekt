import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { WalletService } from './wallet.service';
import { API_BASE_URL } from './api.constants';

const WALLET_URL = `${API_BASE_URL}/passenger/wallet`;
const TOPUP_URL = `${API_BASE_URL}/passenger/wallet/topup`;

describe('WalletService', () => {
  let service: WalletService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(WalletService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('starts at zero before loading', () => {
    expect(service.balance()).toBe(0);
  });

  it('refresh loads the balance from the backend', () => {
    service.refresh();
    const req = httpMock.expectOne(WALLET_URL);
    expect(req.request.method).toBe('GET');
    req.flush({ balance: 50 });
    expect(service.balance()).toBe(50);
  });

  it('topUp posts the amount and updates the balance', () => {
    service.topUp(20).subscribe();
    const req = httpMock.expectOne(TOPUP_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ amount: 20 });
    req.flush({ balance: 70 });
    expect(service.balance()).toBe(70);
  });

  it('canAfford reflects the current balance', () => {
    service.refresh();
    httpMock.expectOne(WALLET_URL).flush({ balance: 50 });
    expect(service.canAfford(50)).toBeTrue();
    expect(service.canAfford(50.01)).toBeFalse();
  });
});
