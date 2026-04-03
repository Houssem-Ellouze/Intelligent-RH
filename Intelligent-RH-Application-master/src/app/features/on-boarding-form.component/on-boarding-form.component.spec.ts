import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBoardingFormComponent } from './on-boarding-form.component';

describe('OnBoardingFormComponent', () => {
  let component: OnBoardingFormComponent;
  let fixture: ComponentFixture<OnBoardingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBoardingFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBoardingFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
