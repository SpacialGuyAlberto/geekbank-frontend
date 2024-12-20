import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilteredPageComponent } from './filtered-page.component';

describe('FilteredPageComponent', () => {
  let component: FilteredPageComponent;
  let fixture: ComponentFixture<FilteredPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilteredPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilteredPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
