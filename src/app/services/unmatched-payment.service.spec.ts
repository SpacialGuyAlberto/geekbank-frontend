import { TestBed } from '@angular/core/testing';

import { UnmatchedPaymentService } from './unmatched-payment.service';

describe('UnmatchedPaymentService', () => {
  let service: UnmatchedPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnmatchedPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
