import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Navigator } from './navigator';

describe('Navigator', () => {
  let component: Navigator;
  let fixture: ComponentFixture<Navigator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navigator],
    }).compileComponents();

    fixture = TestBed.createComponent(Navigator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
