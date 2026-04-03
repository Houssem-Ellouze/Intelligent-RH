import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareTalentsComponent } from './compare-talents-component';

describe('CompareTalentsComponent', () => {
  let component: CompareTalentsComponent;
  let fixture: ComponentFixture<CompareTalentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareTalentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompareTalentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
