import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListChallan } from './list-challan';

describe('ListChallan', () => {
  let component: ListChallan;
  let fixture: ComponentFixture<ListChallan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListChallan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListChallan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
