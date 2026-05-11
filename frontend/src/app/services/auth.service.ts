import { Injectable, computed, effect, signal } from '@angular/core';
import { Role } from '../models/ticket.model';

const STORAGE_KEY = 'piisw.user';

export interface AuthUser {
  username: string;
  displayName: string;
  role: Role;
}

interface MockAccount extends AuthUser {
  password: string;
}

const MOCK_ACCOUNTS: readonly MockAccount[] = [
  { username: 'pasazer', password: 'pasazer', displayName: 'Anna Kowalska', role: 'passenger' },
  { username: 'bileter', password: 'bileter', displayName: 'Jan Nowak', role: 'inspector' }
];

function readInitialUser(): AuthUser | null {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthUser;
    if (
      parsed &&
      typeof parsed.username === 'string' &&
      typeof parsed.displayName === 'string' &&
      (parsed.role === 'passenger' || parsed.role === 'inspector')
    ) {
      return parsed;
    }
  } catch {
    // ignore corrupted storage
  }
  return null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<AuthUser | null>(readInitialUser());
  readonly user = this._user.asReadonly();
  readonly role = computed(() => this._user()?.role ?? null);

  constructor() {
    effect(() => {
      const user = this._user();
      if (typeof sessionStorage === 'undefined') return;
      if (user) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    });
  }

  login(username: string, password: string): AuthUser | null {
    const account = MOCK_ACCOUNTS.find(
      (a) => a.username === username.trim().toLowerCase() && a.password === password
    );
    if (!account) return null;
    const user: AuthUser = {
      username: account.username,
      displayName: account.displayName,
      role: account.role
    };
    this._user.set(user);
    return user;
  }

  logout(): void {
    this._user.set(null);
  }

  is(role: Role): boolean {
    return this._user()?.role === role;
  }
}
