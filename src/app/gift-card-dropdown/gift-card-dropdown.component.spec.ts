import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiftCardDropdownComponent } from './gift-card-dropdown.component';

describe('GiftCardDropdownComponent', () => {
  let component: GiftCardDropdownComponent;
  let fixture: ComponentFixture<GiftCardDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiftCardDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GiftCardDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
