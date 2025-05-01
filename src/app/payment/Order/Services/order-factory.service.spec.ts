import { TestBed } from '@angular/core/testing';

import { OrderFactoryService } from './order-factory.service';

describe('OrderFactoryService', () => {
  let service: OrderFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
