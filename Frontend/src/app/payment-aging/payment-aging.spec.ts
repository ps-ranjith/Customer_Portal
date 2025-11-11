import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentAging } from './payment-aging';

describe('PaymentAging', () => {
  let component: PaymentAging;
  let fixture: ComponentFixture<PaymentAging>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentAging]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentAging);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
