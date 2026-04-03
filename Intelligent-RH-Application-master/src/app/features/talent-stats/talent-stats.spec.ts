import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TalentStats } from './talent-stats';

describe('TalentStats', () => {
  let component: TalentStats;
  let fixture: ComponentFixture<TalentStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TalentStats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TalentStats);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
