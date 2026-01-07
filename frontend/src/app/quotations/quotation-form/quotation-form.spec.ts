import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationForm } from './quotation-form';

describe('QuotationForm', () => {
  let component: QuotationForm;
  let fixture: ComponentFixture<QuotationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotationForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
