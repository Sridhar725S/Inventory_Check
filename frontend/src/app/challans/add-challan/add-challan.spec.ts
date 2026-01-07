import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChallan } from './add-challan';

describe('AddChallan', () => {
  let component: AddChallan;
  let fixture: ComponentFixture<AddChallan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddChallan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddChallan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
