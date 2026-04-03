import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapportOnboardingComponent } from './rapport-onboarding-component';

describe('RapportOnboardingComponent', () => {
  let component: RapportOnboardingComponent;
  let fixture: ComponentFixture<RapportOnboardingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RapportOnboardingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RapportOnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
