import { TestBed } from '@angular/core/testing';

import { FreeFireGiftCardService } from './free-fire-gift-card.service';

describe('FreeFireGiftCardService', () => {
  let service: FreeFireGiftCardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreeFireGiftCardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
