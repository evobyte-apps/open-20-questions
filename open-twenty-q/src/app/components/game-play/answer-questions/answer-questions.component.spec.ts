import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerQuestionsComponent } from './answer-questions.component';

describe('AnswerQuestionsComponent', () => {
  let component: AnswerQuestionsComponent;
  let fixture: ComponentFixture<AnswerQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnswerQuestionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
