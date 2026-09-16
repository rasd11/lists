import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionEditor } from './section-editor';

describe('SectionEditor', () => {
  let component: SectionEditor;
  let fixture: ComponentFixture<SectionEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionEditor],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionEditor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
