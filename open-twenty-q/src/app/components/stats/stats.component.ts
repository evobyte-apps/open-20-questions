import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NavigationEnd, Router } from '@angular/router';
import { Game } from 'src/app/models/game';
import { GameStats } from 'src/app/models/game-stats';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {

  private navigationSubscription;
  ds = new MatTableDataSource<Game>();
  displayedColumns: string[] = ['position', 'guessed', 'feedback'];
  data?: GameStats;

  constructor(private gameService: GameService, private router: Router) { 
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.getStats();
      }
    });
 
  }

  ngOnInit(): void {
    this.getStats();
  }

  getStats() {
    this.gameService.getStats().subscribe(data => {
      this.data = data;
      this.ds.data = data.latest_games;
    });
  }

  getPercentage(what?: number, of?: number): string {
    if (!what || !of) {
      return "0";
    }
    return (what / of * 100).toFixed(3);
  }
 
  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

}
