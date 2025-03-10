import { TestBed } from '@angular/core/testing';

import { TigoService} from './tigo.service';

describe('TigoPaymentProtocollService', () => {
  let service: TigoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TigoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
