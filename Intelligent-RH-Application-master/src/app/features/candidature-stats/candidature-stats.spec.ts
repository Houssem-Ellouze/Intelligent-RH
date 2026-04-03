import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatureStats } from './candidature-stats';

describe('CandidatureStats', () => {
  let component: CandidatureStats;
  let fixture: ComponentFixture<CandidatureStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidatureStats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidatureStats);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
