import { TestBed } from '@angular/core/testing';

import { FreeFireProductService } from './free-fire-product.service';

describe('FreeFireProductService', () => {
  let service: FreeFireProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreeFireProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
