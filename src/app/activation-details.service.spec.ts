import { TestBed } from '@angular/core/testing';

import { ActivationDetailsService } from './activation-details.service';

describe('ActivationDetailsService', () => {
  let service: ActivationDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivationDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
