import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { API_URL } from '../constants';
import { Game } from '../models/game';
import { GameQuestion } from '../models/game-question';
import { GameWithGameQuestions } from '../models/game-with-gamequestions';
import { Entity } from '../models/entity';
import { Question } from '../models/question';
import { NewQuestionWithAnswers } from '../models/new-question-with-answers';
import { GameStats } from '../models/game-stats';
import { PaginatedEntity } from '../models/paginated-entity';
import { GameStageResult } from '../models/game-stage-result';

export enum GameEndState {
  AwaitingGuessAnswer = 'awaitingGuessAnswer',
  GuessAnsweredAffirmative = 'guessAnsweredAffirmative',
  AwaitingFeedbackEntity = 'awaitingFeedbackEntity',
  FeedbackEntitySubmitted = 'feedbackEntitySubmitted',
}

@Injectable()
export class GameService {
  constructor(private http: HttpClient) {}


  startGame(): Observable<GameStageResult> {
    return this.http.post<GameStageResult>(`${API_URL}/game/`, {});
  }

  getGameDetails(id?: string): Observable<GameWithGameQuestions> {
    return this.http.get<GameWithGameQuestions>(`${API_URL}/game/${id}`);
  }

  submitGameQuestionAnswer(gameQuestionId: string, answer: string): Observable<GameStageResult> {
    return this.http.post<GameStageResult>(`${API_URL}/gamequestion/${gameQuestionId}/`, 
      {answer: answer});
  }

  provideGuessFeedback(gameId?: string, feedback_entity={}): Observable<GameWithGameQuestions> {
      return this.http.post<GameWithGameQuestions>(`${API_URL}/game/${gameId}/submitfeedback/`, feedback_entity);
  }

  getEntitiesForAutoComplete(query: string): Observable<Entity[]> {
    return this.http.post<Entity[]>(`${API_URL}/entity/autocomplete/`, { 'text': query });
  }

  getQuestionsForAutoComplete(query: string): Observable<Question[]> {
    return this.http.post<Question[]>(`${API_URL}/question/autocomplete/`, { 'text': query });
  }

  getRandomEntitiesForQuestion(): Observable<Entity[]> {
    return this.http.get<Entity[]>(`${API_URL}/question/`);
  }

  submitNewQuestion(newQuestionWithAnswers: NewQuestionWithAnswers) {
    return this.http.post<NewQuestionWithAnswers>(`${API_URL}/question/`, newQuestionWithAnswers);
  }

  getStats(): Observable<GameStats> {
    return this.http.get<GameStats>(`${API_URL}/game/stats/`);
  }

  getEntities(page: number, pageSize: number): Observable<PaginatedEntity<Entity>> {
    return this.http.get<PaginatedEntity<Entity>>(`${API_URL}/entity/?page=${page}&page_size=${pageSize}`);
  }

}