import { TestBed } from '@angular/core/testing';

import { Challan } from './challan';

describe('Challan', () => {
  let service: Challan;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Challan);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
