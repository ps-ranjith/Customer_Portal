import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditDebitMemo } from './credit-debit-memo';

describe('CreditDebitMemo', () => {
  let component: CreditDebitMemo;
  let fixture: ComponentFixture<CreditDebitMemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditDebitMemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditDebitMemo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
