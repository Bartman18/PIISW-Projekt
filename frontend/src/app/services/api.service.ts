import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket, TicketDefinition, VerificationResult } from '../models/ticket.model';
import { API_BASE_URL } from './api.constants';

export interface LoginResponse {
  token: string;
  username: string;
  displayName: string;
  role: 'PASSENGER' | 'INSPECTOR';
}

export interface WalletResponse {
  balance: number;
}

export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (body && typeof body === 'object' && typeof body.message === 'string') {
      return body.message;
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, { username, password });
  }

  getWallet(): Observable<WalletResponse> {
    return this.http.get<WalletResponse>(`${API_BASE_URL}/passenger/wallet`);
  }

  topUp(amount: number): Observable<WalletResponse> {
    return this.http.post<WalletResponse>(`${API_BASE_URL}/passenger/wallet/topup`, { amount });
  }

  getCatalog(): Observable<TicketDefinition[]> {
    return this.http.get<TicketDefinition[]>(`${API_BASE_URL}/catalog`);
  }

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${API_BASE_URL}/passenger/tickets`);
  }

  purchaseTicket(definitionId: string): Observable<Ticket> {
    return this.http.post<Ticket>(`${API_BASE_URL}/passenger/tickets/purchase`, { definitionId });
  }

  validateTicket(ticketId: string, vehicleId?: string): Observable<Ticket> {
    return this.http.post<Ticket>(
      `${API_BASE_URL}/passenger/tickets/${ticketId}/validate`,
      { vehicleId: vehicleId ?? null }
    );
  }

  verifyTicket(ticketId: string, vehicleId: string): Observable<VerificationResult> {
    return this.http.get<VerificationResult>(`${API_BASE_URL}/inspector/verify`, {
      params: { ticketId, vehicleId }
    });
  }
}
