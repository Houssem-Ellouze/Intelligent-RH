import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatureQrComponent } from './signature-qr-component';

describe('SignatureQrComponent', () => {
  let component: SignatureQrComponent;
  let fixture: ComponentFixture<SignatureQrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignatureQrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignatureQrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
