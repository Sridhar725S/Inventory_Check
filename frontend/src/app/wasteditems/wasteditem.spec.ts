import { TestBed } from '@angular/core/testing';

import { Wasteditem } from './wasteditem';

describe('Wasteditem', () => {
  let service: Wasteditem;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Wasteditem);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
