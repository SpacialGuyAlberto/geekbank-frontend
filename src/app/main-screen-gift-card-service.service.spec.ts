import { TestBed } from '@angular/core/testing';

import { MainScreenGiftCardService } from './main-screen-gift-card-service.service';
import {beforeEach, describe, it } from 'node:test';

describe('MainScreenGiftCardServiceService', () => {
  let service: MainScreenGiftCardServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainScreenGiftCardServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
function expect(service: MainScreenGiftCardServiceService) {
    throw new Error('Function not implemented.');
}

