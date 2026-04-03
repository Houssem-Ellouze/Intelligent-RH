import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingListComponent } from './onboarding-list.component';

describe('OnboardingListComponent', () => {
  let component: OnboardingListComponent;
  let fixture: ComponentFixture<OnboardingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
