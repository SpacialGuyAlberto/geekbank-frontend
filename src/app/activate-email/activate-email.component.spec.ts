import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateEmailComponent } from './activate-email.component';

describe('ActivateEmailComponent', () => {
  let component: ActivateEmailComponent;
  let fixture: ComponentFixture<ActivateEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivateEmailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivateEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
