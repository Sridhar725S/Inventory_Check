import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteditemList } from './wasteditem-list';

describe('WasteditemList', () => {
  let component: WasteditemList;
  let fixture: ComponentFixture<WasteditemList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WasteditemList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WasteditemList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
