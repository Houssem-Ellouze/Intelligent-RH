import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileScore } from './profile-score';

describe('ProfileScore', () => {
  let component: ProfileScore;
  let fixture: ComponentFixture<ProfileScore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileScore]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileScore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
