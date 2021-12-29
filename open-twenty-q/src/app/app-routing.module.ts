import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntityComponent } from './components/entity/entity.component';
import { GamePlayComponent } from './components/game-play/game-play.component';
import { GameComponent } from './components/game/game.component';
import { QuestionComponent } from './components/question/question.component';
import { StatsComponent } from './components/stats/stats.component';

const routes: Routes = [
  {
    path: '',
    component: StatsComponent,
  },
  {
    path: 'game',
    component: GameComponent,
  },
  {
    path: 'game/:gameId',
    component: GamePlayComponent,
  },
  {
    path: 'question',
    component: QuestionComponent,
  },
  {
    path: 'entity',
    component: EntityComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
