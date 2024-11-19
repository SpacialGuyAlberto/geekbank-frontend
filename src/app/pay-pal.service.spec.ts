import { TestBed } from '@angular/core/testing';

import { PayPalService } from './pay-pal.service';

describe('PayPalService', () => {
  let service: PayPalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PayPalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
