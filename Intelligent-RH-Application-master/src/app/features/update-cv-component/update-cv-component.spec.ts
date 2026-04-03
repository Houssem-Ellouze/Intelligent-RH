import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCvComponent } from './update-cv-component';

describe('UpdateCvComponent', () => {
  let component: UpdateCvComponent;
  let fixture: ComponentFixture<UpdateCvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateCvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateCvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
