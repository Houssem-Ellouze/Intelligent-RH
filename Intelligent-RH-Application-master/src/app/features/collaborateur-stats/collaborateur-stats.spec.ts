import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaborateurStats } from './collaborateur-stats';

describe('CollaborateurStats', () => {
  let component: CollaborateurStats;
  let fixture: ComponentFixture<CollaborateurStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollaborateurStats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollaborateurStats);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
