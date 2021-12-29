import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Entity } from 'src/app/models/entity';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
  styleUrls: ['./entity.component.scss']
})
export class EntityComponent implements OnInit {
  entities: Entity[] = [];
  totalRows = 0;
  pageSize = 15;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 15, 25, 50];

  displayedColumns: string[] = ['name', 'created'];
  ds: MatTableDataSource<Entity> = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isLoading = false;
  error = '';

  constructor(private gameService: GameService) { }


  ngAfterViewInit() {
    this.ds.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {

    this.isLoading = true;
    this.gameService.getEntities(this.currentPage + 1, this.pageSize).subscribe(
      data => {
        this.ds.data = data.results;
        // ugly hack but I couldn't find another way in the time I spent on it.
        setTimeout(() => {
          this.paginator.pageIndex = this.currentPage;
          this.paginator.length = data.count;
        }, 0);
        this.error = '';
      },
      error => {
        this.error = error.statusText;
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      });
  }

  pageChanged(event: PageEvent) {
    console.log({event});
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadData();
  }

}
