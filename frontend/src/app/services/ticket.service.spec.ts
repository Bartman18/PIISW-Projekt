import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TicketService } from './ticket.service';
import { Ticket, TicketDefinition } from '../models/ticket.model';
import { API_BASE_URL } from './api.constants';

const CATALOG_URL = `${API_BASE_URL}/catalog`;
const TICKETS_URL = `${API_BASE_URL}/passenger/tickets`;
const WALLET_URL = `${API_BASE_URL}/passenger/wallet`;
const PURCHASE_URL = `${API_BASE_URL}/passenger/tickets/purchase`;

const SAMPLE_DEF: TicketDefinition = {
  id: 'def-single-n',
  name: 'Bilet jednorazowy',
  price: 4,
  type: 'jednorazowy',
  category: 'normalny'
};

const SAMPLE_TICKET: Ticket = {
  id: 'TKT-ABC123',
  definitionId: 'def-single-n',
  name: 'Bilet jednorazowy',
  price: 4,
  type: 'jednorazowy',
  category: 'normalny',
  status: 'active',
  purchaseTime: Date.now()
};

describe('TicketService', () => {
  let service: TicketService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(TicketService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loadCatalog populates the catalog signal', () => {
    service.loadCatalog();
    httpMock.expectOne(CATALOG_URL).flush([SAMPLE_DEF]);
    expect(service.catalog().map((d) => d.id)).toEqual(['def-single-n']);
  });

  it('loadTickets populates the tickets signal', () => {
    service.loadTickets();
    httpMock.expectOne(TICKETS_URL).flush([SAMPLE_TICKET]);
    expect(service.tickets().length).toBe(1);
  });

  it('purchase posts the definition and refreshes tickets and wallet', () => {
    let purchased: Ticket | undefined;
    service.purchase('def-single-n').subscribe((t) => (purchased = t));

    const purchaseReq = httpMock.expectOne(PURCHASE_URL);
    expect(purchaseReq.request.method).toBe('POST');
    expect(purchaseReq.request.body).toEqual({ definitionId: 'def-single-n' });
    purchaseReq.flush(SAMPLE_TICKET);

    httpMock.expectOne(TICKETS_URL).flush([SAMPLE_TICKET]);
    httpMock.expectOne(WALLET_URL).flush({ balance: 46 });

    expect(purchased?.id).toBe('TKT-ABC123');
    expect(service.tickets().length).toBe(1);
  });

  it('validate posts the vehicleId and refreshes tickets', () => {
    const validated = { ...SAMPLE_TICKET, status: 'validated' as const, vehicleId: 'TRAM-1' };
    service.validate('TKT-ABC123', 'TRAM-1').subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/passenger/tickets/TKT-ABC123/validate`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ vehicleId: 'TRAM-1' });
    req.flush(validated);

    httpMock.expectOne(TICKETS_URL).flush([validated]);
    expect(service.tickets()[0].status).toBe('validated');
  });
});
