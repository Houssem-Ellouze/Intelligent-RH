import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparisonHistory } from './comparison-history';

describe('ComparisonHistory', () => {
  let component: ComparisonHistory;
  let fixture: ComponentFixture<ComparisonHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparisonHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparisonHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
