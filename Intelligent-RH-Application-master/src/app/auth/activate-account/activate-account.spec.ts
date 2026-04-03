import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateAccount } from './activate-account';

describe('ActivateAccount', () => {
  let component: ActivateAccount;
  let fixture: ComponentFixture<ActivateAccount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivateAccount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivateAccount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
