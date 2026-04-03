import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentAnalyzerService } from './document-analyzer-service';

describe('DocumentAnalyzerService', () => {
  let component: DocumentAnalyzerService;
  let fixture: ComponentFixture<DocumentAnalyzerService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentAnalyzerService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentAnalyzerService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
