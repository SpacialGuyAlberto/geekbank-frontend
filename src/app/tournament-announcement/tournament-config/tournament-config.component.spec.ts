import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentConfigComponent } from './tournament-config.component';

describe('TournamentConfigComponent', () => {
  let component: TournamentConfigComponent;
  let fixture: ComponentFixture<TournamentConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TournamentConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
