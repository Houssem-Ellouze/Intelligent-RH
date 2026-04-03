import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TalentSearchComponent } from './talent-search-component';

describe('TalentSearchComponent', () => {
  let component: TalentSearchComponent;
  let fixture: ComponentFixture<TalentSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TalentSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TalentSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
