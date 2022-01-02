import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { GameQuestion } from 'src/app/models/game-question';
import { GameWithGameQuestions } from 'src/app/models/game-with-gamequestions';
import { GameEndState, GameService } from 'src/app/services/game.service';
import { QuestionsHistoryComponent } from './questions-history/questions-history.component';

@Component({
  selector: 'app-game-play',
  templateUrl: './game-play.component.html',
  styleUrls: ['./game-play.component.scss']
})
export class GamePlayComponent implements OnInit {

  gameWithGameQuestions!: GameWithGameQuestions;
  unAnsweredQuestion!: GameQuestion;
  answeredQuestions: GameQuestion[] = [];
  ds = new MatTableDataSource<GameQuestion>();

  gameEndState: GameEndState = GameEndState.AwaitingGuessAnswer;

  isLoading = false;
  error = '';

  receivedState = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private gameService: GameService) { 

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.receivedState = true;
      const state = navigation.extras.state as {
        unansweredQuestion: GameQuestion,
      }; 
      this.unAnsweredQuestion = state?.unansweredQuestion;
    }

  }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const gameIdFromRoute = routeParams.get('gameId') as string;
  
    if (!this.receivedState) {
      this.getGameDetails(gameIdFromRoute);
    }
  }

  getGameDetails(gameId: string): void {
    this.isLoading = true;
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
          .filter(gameQuestion => gameQuestion.answer);

        this.ds.data = this.answeredQuestions;
        this.error = '';
      },
      (error) => {
        this.error = error.statusText;
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      });
  }
}
