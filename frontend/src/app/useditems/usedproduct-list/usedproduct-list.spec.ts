import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsedproductList } from './usedproduct-list';

describe('UsedproductList', () => {
  let component: UsedproductList;
  let fixture: ComponentFixture<UsedproductList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsedproductList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsedproductList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
