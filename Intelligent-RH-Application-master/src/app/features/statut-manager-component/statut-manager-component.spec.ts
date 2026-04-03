import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatutManagerComponent } from './statut-manager-component';

describe('StatutManagerComponent', () => {
  let component: StatutManagerComponent;
  let fixture: ComponentFixture<StatutManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatutManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatutManagerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
