import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InferiorFilterComponent } from './inferior-filter.component';

describe('InferiorFilterComponent', () => {
  let component: InferiorFilterComponent;
  let fixture: ComponentFixture<InferiorFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InferiorFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InferiorFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
