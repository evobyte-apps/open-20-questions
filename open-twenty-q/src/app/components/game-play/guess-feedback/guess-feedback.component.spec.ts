import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuessFeedbackComponent } from './guess-feedback.component';

describe('GuessFeedbackComponent', () => {
  let component: GuessFeedbackComponent;
  let fixture: ComponentFixture<GuessFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GuessFeedbackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GuessFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
