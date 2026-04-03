import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatForm } from './candidat-form';

describe('CandidatForm', () => {
  let component: CandidatForm;
  let fixture: ComponentFixture<CandidatForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidatForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidatForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
