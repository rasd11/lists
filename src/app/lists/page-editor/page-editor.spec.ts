import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageEditor } from './page-editor';

describe('PageEditor', () => {
  let component: PageEditor;
  let fixture: ComponentFixture<PageEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageEditor],
    }).compileComponents();

    fixture = TestBed.createComponent(PageEditor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
