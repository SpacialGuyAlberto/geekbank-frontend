import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RazergoldComponent } from './razergold.component';

describe('RazergoldComponent', () => {
  let component: RazergoldComponent;
  let fixture: ComponentFixture<RazergoldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RazergoldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RazergoldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
