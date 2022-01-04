import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Game } from 'src/app/models/game';
import { GameEntity } from 'src/app/models/game-entity';
import { GameQuestion } from 'src/app/models/game-question';
import { GameStageResult } from 'src/app/models/game-stage-result';
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
  unAnsweredQuestion?: GameQuestion;
  game?: Game;
  answeredQuestions: GameQuestion[] = [];
  ds = new MatTableDataSource<GameQuestion>();

  topCandidates?: GameEntity[] = [];

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
        gameStageResult: GameStageResult,
      }; 
      this.unAnsweredQuestion = state.gameStageResult.next_gamequestion;
      this.game = state.gameStageResult.game_with_new_info;
      if (this.game) {
        this.game.top_candidates = state.gameStageResult.top_candidates;
      }
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
        this.game = {
          ...gameDetails,
        }
        this.gameWithGameQuestions = gameDetails;
        this.unAnsweredQuestion = this.gameWithGameQuestions.gamequestion_set
          .filter(gameQuestion => !gameQuestion.answer)[0];
        if (!this.unAnsweredQuestion && this.gameWithGameQuestions.guessed) {

          if (this.gameWithGameQuestions.feedback_entity) {
            this.gameEndState = GameEndState.FeedbackEntitySubmitted;
          } else if (this.gameWithGameQuestions.feedback_entity) {
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
