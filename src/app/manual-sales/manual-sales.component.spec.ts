import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualSalesComponent } from './manual-sales.component';

describe('ManualSalesComponent', () => {
  let component: ManualSalesComponent;
  let fixture: ComponentFixture<ManualSalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualSalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
