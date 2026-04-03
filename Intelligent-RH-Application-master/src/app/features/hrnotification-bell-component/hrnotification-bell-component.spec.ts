import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HRNotificationBellComponent } from './hrnotification-bell-component';

describe('HRNotificationBellComponent', () => {
  let component: HRNotificationBellComponent;
  let fixture: ComponentFixture<HRNotificationBellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HRNotificationBellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HRNotificationBellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
