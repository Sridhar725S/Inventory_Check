import { TestBed } from '@angular/core/testing';

import { Quotations } from './quotations';

describe('Quotations', () => {
  let service: Quotations;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Quotations);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
