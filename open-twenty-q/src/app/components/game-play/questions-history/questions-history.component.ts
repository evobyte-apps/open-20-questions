import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { GameQuestion } from 'src/app/models/game-question';

@Component({
  selector: 'questions-history',
  templateUrl: './questions-history.component.html',
  styleUrls: ['./questions-history.component.scss']
})
export class QuestionsHistoryComponent implements OnInit {

  @Input() ds!: MatTableDataSource<GameQuestion>;
  displayedColumns: string[] = ['position', 'question', 'answer', 'entropy'];

  constructor() { }

  ngOnInit(): void {
  }

}
