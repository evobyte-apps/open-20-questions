import { ThrowStmt } from '@angular/compiler';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Game } from 'src/app/models/game';
import { GameQuestion } from 'src/app/models/game-question';
import { GameStageResult } from 'src/app/models/game-stage-result';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'answer-questions',
  templateUrl: './answer-questions.component.html',
  styleUrls: ['./answer-questions.component.scss']
})
export class AnswerQuestionsComponent implements OnInit {

  @Input() answeredQuestions: GameQuestion[] = [];
  @Input() unAnsweredQuestion?: GameQuestion;
  @Output() unAnsweredQuestionChange = new EventEmitter<GameQuestion>();

  @Input() game?: Game;
  @Output() gameChange = new EventEmitter<Game>();

  

  @Input() questionHistoryDs!: MatTableDataSource<GameQuestion>;

  isLoading = false;
  error = '';

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
  }

  submitAnswer(answer: string): void {
    if (!this.unAnsweredQuestion) {
      return;
    }
    this.isLoading = true;
    this.gameService.submitGameQuestionAnswer(this.unAnsweredQuestion.id, answer).subscribe(
      (gameStageResult: GameStageResult) => {

        if (this.unAnsweredQuestion) {
          this.unAnsweredQuestion.answer = answer;
          this.answeredQuestions.splice(0, 0, {...this.unAnsweredQuestion});
          this.unAnsweredQuestion = gameStageResult.next_gamequestion;
        }
        
        this.game = gameStageResult.game_with_new_info;
        this.gameChange.emit(this.game);

        this.unAnsweredQuestionChange.emit(this.unAnsweredQuestion);
        this.questionHistoryDs.data = this.answeredQuestions;
        this.error = '';
      },
      error => {
        this.error = error.statusText;
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      });
  }
}
