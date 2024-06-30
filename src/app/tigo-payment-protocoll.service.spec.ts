import { TestBed } from '@angular/core/testing';

import { TigoPaymentProtocollService } from './tigo-payment-protocoll.service';

describe('TigoPaymentProtocollService', () => {
  let service: TigoPaymentProtocollService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TigoPaymentProtocollService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
