import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InquiryData } from './inquiry-data';

describe('InquiryData', () => {
  let component: InquiryData;
  let fixture: ComponentFixture<InquiryData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InquiryData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InquiryData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
