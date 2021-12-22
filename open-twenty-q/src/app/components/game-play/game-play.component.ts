import { DataSource } from '@angular/cdk/collections';
import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Observable, pipe } from 'rxjs';
import { debounceTime, finalize, map, startWith, switchMap, tap } from 'rxjs/operators';
import { Entity } from 'src/app/models/entity';
import { GameQuestion } from 'src/app/models/game-question';
import { GameWithGameQuestions } from 'src/app/models/game-with-gamequestions';
import { GameService } from 'src/app/services/game.service';

enum GameEndState {
  AwaitingGuessAnswer = 'awaitingGuessAnswer',
  GuessAnsweredAffirmative = 'guessAnsweredAffirmative',
  AwaitingFeedbackEntity = 'awaitingFeedbackEntity',
  FeedbackEntitySubmitted = 'feedbackEntitySubmitted',
}

@Component({
  selector: 'app-game-play',
  templateUrl: './game-play.component.html',
  styleUrls: ['./game-play.component.scss']
})
export class GamePlayComponent implements OnInit {

  gameWithGameQuestions!: GameWithGameQuestions;
  unAnsweredQuestion!: GameQuestion;
  answeredQuestions!: GameQuestion[];
  ds = new MatTableDataSource();

  displayedColumns: string[] = ['position', 'question', 'answer', 'entropy'];

  gameEndState: GameEndState = GameEndState.AwaitingGuessAnswer;

  autocompleteControl = new FormControl();
  filteredEntities: any;

  constructor(private route: ActivatedRoute, private gameService: GameService) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const gameIdFromRoute = routeParams.get('gameId') as string;
  
    this.getGameDetails(gameIdFromRoute);

    this.autocompleteControl.valueChanges      
      .pipe(
        debounceTime(500),
        tap(() => {
          this.filteredEntities = [];
          // this.isLoading = true;
        }),
        switchMap(value => this.gameService.getEntitiesForAutoComplete(value)
          .pipe(
            finalize(() => {
              // this.isLoading = false
            }),
          )
        )
      )
      .subscribe(data => {
        this.filteredEntities = data;
      });
  }

  getGameDetails(gameId: string): void {
    this.gameService.getGameDetails(gameId).subscribe(
      (gameDetails: GameWithGameQuestions) => {
        this.gameWithGameQuestions = gameDetails;
        this.unAnsweredQuestion = this.gameWithGameQuestions.gamequestion_set
          .filter(gameQuestion => !gameQuestion.answer)[0];
        if (!this.unAnsweredQuestion && this.gameWithGameQuestions.guessed) {
          this.unAnsweredQuestion = {
            'id': '-1',
            'game': {
              'id': this.gameWithGameQuestions.id,
              'guessed': this.gameWithGameQuestions.guessed,
              'feedback_entity': this.gameWithGameQuestions.feedback_entity
            },
            'question': undefined,
            'answer': undefined,
            'entropy': undefined,
          }

          if (this.gameWithGameQuestions.feedback_entity) {
            this.gameEndState = GameEndState.FeedbackEntitySubmitted;
          } else if (this.unAnsweredQuestion.game.feedback_entity) {
            this.gameEndState = GameEndState.GuessAnsweredAffirmative;
          } else {
            this.gameEndState = GameEndState.AwaitingGuessAnswer;
          }
        }

        this.answeredQuestions = this.gameWithGameQuestions.gamequestion_set
          .filter(gameQuestion => gameQuestion.answer)
          .sort(gameQuestion => -gameQuestion.id);

        this.ds.data = this.answeredQuestions;
      });


  }

  submitAnswer(answer: string): void {
    this.gameService.submitGameQuestionAnswer(this.unAnsweredQuestion.id, answer).subscribe(
      (gameQuestion: GameQuestion) => {


        this.unAnsweredQuestion.answer = answer;
        this.answeredQuestions.splice(0, 0, {...this.unAnsweredQuestion});
        this.unAnsweredQuestion = {...gameQuestion};

        this.ds.data = this.answeredQuestions;
      })
  }

  provideGuessFeedback(correctGuess: boolean): void {
    if (correctGuess) {
      this.gameService.provideGuessFeedback(
        this.unAnsweredQuestion.game.id, 
        this.unAnsweredQuestion.game.guessed).subscribe(
          (data) => {
            this.gameEndState = GameEndState.GuessAnsweredAffirmative;
          });
    } else {
      this.gameEndState = GameEndState.AwaitingFeedbackEntity;
    }
  }

  submitReveal(): void {
    var toSubmit = {'name': this.autocompleteControl.value, 'id': '-1', 'created': new Date()};
    if ('id' in {...this.autocompleteControl.value}) {
      toSubmit = this.autocompleteControl.value;
    }

    this.gameService.provideGuessFeedback(
      this.unAnsweredQuestion.game.id,
      toSubmit).subscribe(
        (data) => {
          this.gameEndState = GameEndState.FeedbackEntitySubmitted;
          this.unAnsweredQuestion.game.feedback_entity = toSubmit;
        });
  }

  displayFn(entity: any): string {
    return entity ? entity.name : undefined;
  }
}
