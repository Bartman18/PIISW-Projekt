import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter
} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Role } from '../models/ticket.model';
import { passengerGuard } from './passenger.guard';

function seedSession(role: Role): void {
  sessionStorage.setItem(
    'piisw.session',
    JSON.stringify({ token: 't', user: { username: 'u', displayName: 'U', role } })
  );
}

function runGuard(guard: CanActivateFn): boolean | UrlTree {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;
  return TestBed.runInInjectionContext(() => guard(route, state)) as boolean | UrlTree;
}

describe('passengerGuard', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
  });

  it('grants access when the user is a passenger', () => {
    seedSession('passenger');
    expect(runGuard(passengerGuard)).toBeTrue();
  });

  it('redirects an inspector to /login', () => {
    seedSession('inspector');
    const result = runGuard(passengerGuard);
    expect(result).toEqual(TestBed.inject(Router).createUrlTree(['/login']));
  });

  it('redirects an anonymous visitor to /login', () => {
    const result = runGuard(passengerGuard);
    expect(result).toEqual(TestBed.inject(Router).createUrlTree(['/login']));
  });
});
