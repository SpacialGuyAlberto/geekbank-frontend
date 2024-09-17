import { TestBed } from '@angular/core/testing';

import { BackgroundAnimationService } from './background-animation.service';

describe('BackgroundAnimationService', () => {
  let service: BackgroundAnimationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackgroundAnimationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
