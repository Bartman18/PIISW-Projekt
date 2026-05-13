import { TestBed } from '@angular/core/testing';
import { WalletService } from './wallet.service';

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WalletService);
  });

  it('starts with the default balance of 50 PLN', () => {
    expect(service.balance()).toBe(50);
  });

  describe('topUp', () => {
    it('adds the amount to the balance', () => {
      service.topUp(20);
      expect(service.balance()).toBe(70);
    });

    it('rounds the result to two decimals', () => {
      service.topUp(0.1);
      service.topUp(0.2);
      expect(service.balance()).toBe(50.3);
    });
  });

  describe('canAfford', () => {
    it('returns true when balance equals the amount', () => {
      expect(service.canAfford(50)).toBeTrue();
    });

    it('returns true when balance is greater than the amount', () => {
      expect(service.canAfford(49.99)).toBeTrue();
    });

    it('returns false when balance is below the amount', () => {
      expect(service.canAfford(50.01)).toBeFalse();
    });
  });

  describe('debit', () => {
    it('subtracts the amount and returns true when affordable', () => {
      const ok = service.debit(15.5);
      expect(ok).toBeTrue();
      expect(service.balance()).toBe(34.5);
    });

    it('leaves the balance untouched and returns false when not affordable', () => {
      const ok = service.debit(999);
      expect(ok).toBeFalse();
      expect(service.balance()).toBe(50);
    });

    it('allows debiting the whole balance down to zero', () => {
      expect(service.debit(50)).toBeTrue();
      expect(service.balance()).toBe(0);
      expect(service.canAfford(0.01)).toBeFalse();
    });
  });
});
