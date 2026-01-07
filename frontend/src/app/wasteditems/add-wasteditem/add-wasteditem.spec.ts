import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWasteditem } from './add-wasteditem';

describe('AddWasteditem', () => {
  let component: AddWasteditem;
  let fixture: ComponentFixture<AddWasteditem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddWasteditem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddWasteditem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
