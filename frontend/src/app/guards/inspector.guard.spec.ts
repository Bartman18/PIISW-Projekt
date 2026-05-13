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
import { inspectorGuard } from './inspector.guard';

function runGuard(guard: CanActivateFn): boolean | UrlTree {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;
  return TestBed.runInInjectionContext(() => guard(route, state)) as boolean | UrlTree;
}

describe('inspectorGuard', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('grants access when the user is an inspector', () => {
    TestBed.inject(AuthService).login('bileter', 'bileter');
    expect(runGuard(inspectorGuard)).toBeTrue();
  });

  it('redirects a passenger to /login', () => {
    TestBed.inject(AuthService).login('pasazer', 'pasazer');
    const result = runGuard(inspectorGuard);
    expect(result).toEqual(TestBed.inject(Router).createUrlTree(['/login']));
  });

  it('redirects an anonymous visitor to /login', () => {
    const result = runGuard(inspectorGuard);
    expect(result).toEqual(TestBed.inject(Router).createUrlTree(['/login']));
  });
});
