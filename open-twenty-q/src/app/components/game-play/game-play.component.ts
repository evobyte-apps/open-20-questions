import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { GameQuestion } from 'src/app/models/game-question';
import { GameWithGameQuestions } from 'src/app/models/game-with-gamequestions';
import { GameEndState, GameService } from 'src/app/services/game.service';

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

  constructor(private route: ActivatedRoute, private gameService: GameService) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const gameIdFromRoute = routeParams.get('gameId') as string;
  
    this.getGameDetails(gameIdFromRoute);
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
}
