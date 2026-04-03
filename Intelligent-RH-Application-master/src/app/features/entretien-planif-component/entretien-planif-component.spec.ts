import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntretienPlanifComponent } from './entretien-planif-component';

describe('EntretienPlanifComponent', () => {
  let component: EntretienPlanifComponent;
  let fixture: ComponentFixture<EntretienPlanifComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntretienPlanifComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntretienPlanifComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
