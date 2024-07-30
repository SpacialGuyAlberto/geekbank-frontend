import { TestBed } from '@angular/core/testing';

import { TelegramListenerService } from './telegram-listener.service';

describe('TelegramListenerService', () => {
  let service: TelegramListenerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TelegramListenerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
