import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfDeliveryComponent } from './list-of-delivery';

describe('ListOfDeliveryComponent', () => {
  let component: ListOfDeliveryComponent;
  let fixture: ComponentFixture<ListOfDeliveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListOfDeliveryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListOfDeliveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
