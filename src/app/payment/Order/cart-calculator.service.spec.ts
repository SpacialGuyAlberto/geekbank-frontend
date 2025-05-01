import { TestBed } from '@angular/core/testing';

import { CartCalculatorService } from './cart-calculator.service';

describe('CartCalculatorService', () => {
  let service: CartCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartCalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
