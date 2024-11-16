import { TestBed } from '@angular/core/testing';

import { TigoPaymentService } from './tigo-payment.service';

describe('TigoPaymentService', () => {
  let service: TigoPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TigoPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
