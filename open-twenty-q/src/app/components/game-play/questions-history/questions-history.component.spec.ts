import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionsHistoryComponent } from './questions-history.component';

describe('QuestionsHistoryComponent', () => {
  let component: QuestionsHistoryComponent;
  let fixture: ComponentFixture<QuestionsHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionsHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionsHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
