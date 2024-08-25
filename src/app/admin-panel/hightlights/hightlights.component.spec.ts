import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HightlightsComponent } from './hightlights.component';

describe('HightlightsComponent', () => {
  let component: HightlightsComponent;
  let fixture: ComponentFixture<HightlightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HightlightsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HightlightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
