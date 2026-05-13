import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { passengerGuard } from './passenger.guard';

function runGuard(guard: CanActivateFn): boolean | UrlTree {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;
  return TestBed.runInInjectionContext(() => guard(route, state)) as boolean | UrlTree;
}

describe('passengerGuard', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('grants access when the user is a passenger', () => {
    TestBed.inject(AuthService).login('pasazer', 'pasazer');
    expect(runGuard(passengerGuard)).toBeTrue();
  });

  it('redirects an inspector to /login', () => {
    TestBed.inject(AuthService).login('bileter', 'bileter');
    const result = runGuard(passengerGuard);
    expect(result).toEqual(TestBed.inject(Router).createUrlTree(['/login']));
  });

  it('redirects an anonymous visitor to /login', () => {
    const result = runGuard(passengerGuard);
    expect(result).toEqual(TestBed.inject(Router).createUrlTree(['/login']));
  });
});
