import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeFireDetailsComponent } from './free-fire-details.component';

describe('FreeFireDetailsComponent', () => {
  let component: FreeFireDetailsComponent;
  let fixture: ComponentFixture<FreeFireDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreeFireDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreeFireDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
