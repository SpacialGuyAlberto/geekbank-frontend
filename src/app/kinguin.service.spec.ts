import { TestBed } from '@angular/core/testing';

import { KinguinService } from './kinguin.service';

describe('KinguinService', () => {
  let service: KinguinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KinguinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
