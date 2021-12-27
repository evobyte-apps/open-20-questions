import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { GameQuestion } from 'src/app/models/game-question';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  private navigationSubscription;
  isLoading: boolean = true;
  error = ''; 

  constructor(private route: ActivatedRoute, private router: Router, private gameService: GameService) { 
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.startGame();
      }
    });
 
  }

  ngOnInit(): void {
  
  }

  startGame() {
    this.gameService.startGame().subscribe(
      (data: GameQuestion) => {
        this.isLoading = false;
        this.router.navigate(['/game/' + data.game.id]);
        this.error = '';
      },
      error => {
        this.isLoading = false;
        this.error = error.statusText;
      }
    )
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

}
