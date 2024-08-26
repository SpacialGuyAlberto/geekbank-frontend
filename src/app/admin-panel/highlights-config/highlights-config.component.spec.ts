import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighlightsConfigComponent } from './highlights-config.component';

describe('HighlightsConfigComponent', () => {
  let component: HighlightsConfigComponent;
  let fixture: ComponentFixture<HighlightsConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HighlightsConfigComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HighlightsConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
