import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

const STORAGE_KEY = 'piisw.user';

describe('AuthService', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
  });

  function getService(): AuthService {
    return TestBed.inject(AuthService);
  }

  it('starts logged out', () => {
    const service = getService();
    expect(service.user()).toBeNull();
    expect(service.role()).toBeNull();
  });

  describe('login', () => {
    it('logs in a passenger with correct credentials', () => {
      const service = getService();
      const user = service.login('pasazer', 'pasazer');
      expect(user).not.toBeNull();
      expect(user?.role).toBe('passenger');
      expect(service.user()?.username).toBe('pasazer');
      expect(service.is('passenger')).toBeTrue();
      expect(service.is('inspector')).toBeFalse();
    });

    it('logs in an inspector with correct credentials', () => {
      const service = getService();
      const user = service.login('bileter', 'bileter');
      expect(user?.role).toBe('inspector');
      expect(service.role()).toBe('inspector');
    });

    it('is case-insensitive on the username', () => {
      const service = getService();
      const user = service.login('  PaSaZeR  ', 'pasazer');
      expect(user).not.toBeNull();
      expect(user?.username).toBe('pasazer');
    });

    it('rejects a wrong password', () => {
      const service = getService();
      const user = service.login('pasazer', 'wrong');
      expect(user).toBeNull();
      expect(service.user()).toBeNull();
    });

    it('rejects an unknown account', () => {
      const service = getService();
      expect(service.login('admin', 'admin')).toBeNull();
    });
  });

  describe('persistence', () => {
    it('persists the logged-in user to sessionStorage', () => {
      const service = getService();
      service.login('pasazer', 'pasazer');
      TestBed.tick();
      const raw = sessionStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!)).toEqual(
        jasmine.objectContaining({ username: 'pasazer', role: 'passenger' })
      );
    });

    it('restores the user from sessionStorage on init', () => {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ username: 'bileter', displayName: 'Jan Nowak', role: 'inspector' })
      );
      const service = getService();
      expect(service.user()?.username).toBe('bileter');
      expect(service.role()).toBe('inspector');
    });

    it('ignores corrupted sessionStorage data', () => {
      sessionStorage.setItem(STORAGE_KEY, '{not json');
      const service = getService();
      expect(service.user()).toBeNull();
    });

    it('ignores stored data with an invalid role', () => {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ username: 'x', displayName: 'X', role: 'admin' })
      );
      const service = getService();
      expect(service.user()).toBeNull();
    });
  });

  describe('logout', () => {
    it('clears the user and the persisted entry', () => {
      const service = getService();
      service.login('pasazer', 'pasazer');
      TestBed.tick();
      service.logout();
      TestBed.tick();
      expect(service.user()).toBeNull();
      expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });
});
