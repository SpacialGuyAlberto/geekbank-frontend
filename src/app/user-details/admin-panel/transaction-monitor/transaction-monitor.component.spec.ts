import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionMonitorComponent } from './transaction-monitor.component';

describe('TransactionMonitorComponent', () => {
  let component: TransactionMonitorComponent;
  let fixture: ComponentFixture<TransactionMonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionMonitorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
