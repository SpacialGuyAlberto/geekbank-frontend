import { TestBed } from '@angular/core/testing';

import { ManualOrderService } from './manual-order.service';

describe('ManualOrderService', () => {
  let service: ManualOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManualOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
