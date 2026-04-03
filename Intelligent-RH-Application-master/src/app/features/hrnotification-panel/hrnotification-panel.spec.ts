import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HRNotificationPanel } from './hrnotification-panel';

describe('HRNotificationPanel', () => {
  let component: HRNotificationPanel;
  let fixture: ComponentFixture<HRNotificationPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HRNotificationPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HRNotificationPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
