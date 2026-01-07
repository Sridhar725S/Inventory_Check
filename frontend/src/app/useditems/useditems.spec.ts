import { TestBed } from '@angular/core/testing';

import { Useditems } from './useditems';

describe('Useditems', () => {
  let service: Useditems;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Useditems);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
