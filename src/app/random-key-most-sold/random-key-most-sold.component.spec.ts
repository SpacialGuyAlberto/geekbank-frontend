import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomKeyMostSoldComponent } from './random-key-most-sold.component';

describe('RandomKeyMostSoldComponent', () => {
  let component: RandomKeyMostSoldComponent;
  let fixture: ComponentFixture<RandomKeyMostSoldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RandomKeyMostSoldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RandomKeyMostSoldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
