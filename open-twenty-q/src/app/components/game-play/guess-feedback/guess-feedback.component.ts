import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';
import { GameQuestion } from 'src/app/models/game-question';
import { GameService } from 'src/app/services/game.service';

enum GameEndState {
  AwaitingGuessAnswer = 'awaitingGuessAnswer',
  GuessAnsweredAffirmative = 'guessAnsweredAffirmative',
  AwaitingFeedbackEntity = 'awaitingFeedbackEntity',
  FeedbackEntitySubmitted = 'feedbackEntitySubmitted',
}

@Component({
  selector: 'guess-feedback',
  templateUrl: './guess-feedback.component.html',
  styleUrls: ['./guess-feedback.component.scss']
})
export class GuessFeedbackComponent implements OnInit {

  @Input() gameEndState!: GameEndState;
  @Input() unAnsweredQuestion!: GameQuestion;

  autocompleteControl = new FormControl();
  filteredEntities: any;

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
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
    var toSubmit = {
      'name': this.autocompleteControl.value, 
      'id': '-1', 
      'created': new Date()
    };
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