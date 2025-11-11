import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverallSales } from './overall-sales';

describe('OverallSales', () => {
  let component: OverallSales;
  let fixture: ComponentFixture<OverallSales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverallSales]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverallSales);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
