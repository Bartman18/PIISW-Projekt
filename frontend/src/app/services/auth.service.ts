import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Role } from '../models/ticket.model';
import { ApiService } from './api.service';

const STORAGE_KEY = 'piisw.session';

export interface AuthUser {
  username: string;
  displayName: string;
  role: Role;
}

interface StoredSession {
  token: string;
  user: AuthUser;
}

function readInitialSession(): StoredSession | null {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredSession;
    if (
      parsed &&
      typeof parsed.token === 'string' &&
      parsed.user &&
      typeof parsed.user.username === 'string' &&
      typeof parsed.user.displayName === 'string' &&
      (parsed.user.role === 'passenger' || parsed.user.role === 'inspector')
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
  private readonly api = inject(ApiService);

  private readonly _session = signal<StoredSession | null>(readInitialSession());
  readonly user = computed(() => this._session()?.user ?? null);
  readonly role = computed(() => this._session()?.user.role ?? null);

  token(): string | null {
    return this._session()?.token ?? null;
  }

  login(username: string, password: string): Observable<AuthUser> {
    return this.api.login(username.trim(), password).pipe(
      map((res) => {
        const session: StoredSession = {
          token: res.token,
          user: {
            username: res.username,
            displayName: res.displayName,
            role: res.role.toLowerCase() as Role
          }
        };
        return session;
      }),
      tap((session) => {
        this._session.set(session);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      }),
      map((session) => session.user)
    );
  }

  logout(): void {
    this._session.set(null);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  is(role: Role): boolean {
    return this.role() === role;
  }
}
