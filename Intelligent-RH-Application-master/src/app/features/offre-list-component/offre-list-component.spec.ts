import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffreListComponent } from './offre-list-component';

describe('OffreListComponent', () => {
  let component: OffreListComponent;
  let fixture: ComponentFixture<OffreListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffreListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffreListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
