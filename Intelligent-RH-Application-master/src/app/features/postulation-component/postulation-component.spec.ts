import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostulationComponent } from './postulation-component';

describe('PostulationComponent', () => {
  let component: PostulationComponent;
  let fixture: ComponentFixture<PostulationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostulationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostulationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
