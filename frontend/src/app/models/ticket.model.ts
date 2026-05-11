export type TicketType = 'jednorazowy' | 'czasowy' | 'okresowy';

export type TicketCategory = 'normalny' | 'ulgowy';

export type TicketStatus = 'active' | 'validated' | 'expired';

export type Role = 'passenger' | 'inspector';

export interface TicketDefinition {
  id: string;
  name: string;
  price: number;
  type: TicketType;
  category: TicketCategory;
  durationMinutes?: number;
  validityDays?: number;
}

export interface Ticket {
  id: string;
  definitionId: string;
  name: string;
  price: number;
  type: TicketType;
  category: TicketCategory;
  status: TicketStatus;
  purchaseTime: number;
  durationMinutes?: number;
  validityDays?: number;
  validationTime?: number;
  vehicleId?: string;
  validUntil?: number;
}

export interface VerificationResult {
  valid: boolean;
  message: string;
  ticket?: Ticket;
}
