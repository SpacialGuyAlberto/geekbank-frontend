import { TestBed } from '@angular/core/testing';

import {HighlightService} from "./highlights.service";

describe('HighlightsService', () => {
  let service: HighlightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HighlightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
