import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceData } from './invoice-data';

describe('InvoiceData', () => {
  let component: InvoiceData;
  let fixture: ComponentFixture<InvoiceData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
