import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService, AuthUser } from './auth.service';
import { API_BASE_URL } from './api.constants';

const STORAGE_KEY = 'piisw.session';
const LOGIN_URL = `${API_BASE_URL}/auth/login`;

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('starts logged out', () => {
    expect(service.user()).toBeNull();
    expect(service.role()).toBeNull();
    expect(service.token()).toBeNull();
  });

  it('logs in, stores the token and lowercases the role', () => {
    let user: AuthUser | undefined;
    service.login('  PaSaZeR  ', 'pasazer').subscribe((u) => (user = u));

    const req = httpMock.expectOne(LOGIN_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'PaSaZeR', password: 'pasazer' });
    req.flush({ token: 'jwt-1', username: 'pasazer', displayName: 'Anna Kowalska', role: 'PASSENGER' });

    expect(user?.role).toBe('passenger');
    expect(service.token()).toBe('jwt-1');
    expect(service.user()?.username).toBe('pasazer');
    expect(service.is('passenger')).toBeTrue();
    expect(service.is('inspector')).toBeFalse();
  });

  it('persists the session to sessionStorage', () => {
    service.login('bileter', 'bileter').subscribe();
    httpMock
      .expectOne(LOGIN_URL)
      .flush({ token: 'jwt-2', username: 'bileter', displayName: 'Jan Nowak', role: 'INSPECTOR' });

    const raw = sessionStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual(
      jasmine.objectContaining({
        token: 'jwt-2',
        user: jasmine.objectContaining({ username: 'bileter', role: 'inspector' })
      })
    );
  });

  it('restores a stored session on init', () => {
    TestBed.resetTestingModule();
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: 'jwt-3',
        user: { username: 'bileter', displayName: 'Jan Nowak', role: 'inspector' }
      })
    );
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    const restored = TestBed.inject(AuthService);
    expect(restored.user()?.username).toBe('bileter');
    expect(restored.token()).toBe('jwt-3');
  });

  it('rejects a wrong password and stays logged out', () => {
    let errored = false;
    service.login('pasazer', 'wrong').subscribe({ error: () => (errored = true) });
    httpMock
      .expectOne(LOGIN_URL)
      .flush({ message: 'Błędny login lub hasło' }, { status: 401, statusText: 'Unauthorized' });

    expect(errored).toBeTrue();
    expect(service.user()).toBeNull();
    expect(service.token()).toBeNull();
  });

  it('logs out and clears the persisted session', () => {
    service.login('pasazer', 'pasazer').subscribe();
    httpMock
      .expectOne(LOGIN_URL)
      .flush({ token: 'jwt', username: 'pasazer', displayName: 'Anna Kowalska', role: 'PASSENGER' });

    service.logout();
    expect(service.user()).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
