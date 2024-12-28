import { TestBed } from '@angular/core/testing';

import { SalesMetricsService } from './sales-metrics.service';

describe('SalesMetricsService', () => {
  let service: SalesMetricsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesMetricsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
