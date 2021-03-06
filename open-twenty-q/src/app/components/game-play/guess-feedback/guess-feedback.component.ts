import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';
import { Game } from 'src/app/models/game';
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
  @Input() game?: Game;
  @Input() questionHistoryDs!: MatTableDataSource<GameQuestion>;


  autocompleteControl = new FormControl();
  filteredEntities: any;

  isLoadingAutocomplete = false;
  isLoadingGuessFeedback = false;
  isLoadingReveal = false;
  errorAutocomplete = '';
  errorGuessFeedback = '';
  errorReveal = '';

  constructor(private route: ActivatedRoute, private gameService: GameService) { }

  ngOnInit(): void {

    this.autocompleteControl.valueChanges      
    .pipe(
      debounceTime(500),
      tap(() => {
        this.filteredEntities = [];
        this.errorAutocomplete = '';
        this.isLoadingAutocomplete = true;
      }),
      switchMap(value => this.gameService.getEntitiesForAutoComplete(value)
        .pipe(
          finalize(() => {
            this.isLoadingAutocomplete = false;
          }),
        )
      )
    )
    .subscribe(data => {
      this.filteredEntities = data;
      this.errorAutocomplete = '';
    },
    error => {
      this.errorAutocomplete = error.statusText;
    });
  }

  provideGuessFeedback(correctGuess: boolean): void {
    if (correctGuess) {
      this.isLoadingGuessFeedback = true;
      this.errorGuessFeedback = '';
      this.gameService.provideGuessFeedback(
        this.game?.id, 
        this.game?.guessed).subscribe(
          (data) => {
            this.gameEndState = GameEndState.GuessAnsweredAffirmative;
            this.questionHistoryDs.data = data.gamequestion_set;
            this.errorGuessFeedback = '';
          },
          error => {
            this.errorGuessFeedback = error.statusText;
            this.isLoadingGuessFeedback = false;
          },
          () => {
            this.isLoadingGuessFeedback = false;
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

    this.errorReveal = '';
    this.isLoadingReveal = true;
    this.gameService.provideGuessFeedback(
      this.game?.id,
      toSubmit).subscribe(
        (data) => {
          this.gameEndState = GameEndState.FeedbackEntitySubmitted;
          if (this.game) {          
            this.game.feedback_entity = toSubmit;
          }
          this.questionHistoryDs.data = data.gamequestion_set;
          this.errorReveal = '';
        }, 
        error => {
          this.errorReveal = error.statusText;
          this.isLoadingReveal = false;
        },
        () => {
          this.isLoadingReveal = false;
        });
  }

  displayFn(entity: any): string {
    return entity ? entity.name : undefined;
  }
}
