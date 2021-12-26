import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GameComponent } from './components/game/game.component';
import { MatBadgeModule } from '@angular/material/badge';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatGridListModule } from '@angular/material/grid-list';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { RouterModule, RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { GameService } from './services/game.service';
import { GamePlayComponent } from './components/game-play/game-play.component';
import { QuestionComponent } from './components/question/question.component';
import { AnswerQuestionsComponent } from './components/game-play/answer-questions/answer-questions.component';
import { GuessFeedbackComponent } from './components/game-play/guess-feedback/guess-feedback.component';
import { QuestionsHistoryComponent } from './components/game-play/questions-history/questions-history.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { StatsComponent } from './components/stats/stats.component';


@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    GamePlayComponent,
    QuestionComponent,
    AnswerQuestionsComponent,
    GuessFeedbackComponent,
    QuestionsHistoryComponent,
    HeaderComponent,
    FooterComponent,
    StatsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    RouterModule,

    HttpClientModule,

    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatToolbarModule,
    MatCardModule,
    MatTableModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatCheckboxModule,
    MatRadioModule,
    MatGridListModule,

    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [GameService],
  bootstrap: [AppComponent]
})
export class AppModule { }
