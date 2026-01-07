import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUsedproduct } from './add-usedproduct';

describe('AddUsedproduct', () => {
  let component: AddUsedproduct;
  let fixture: ComponentFixture<AddUsedproduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUsedproduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUsedproduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
