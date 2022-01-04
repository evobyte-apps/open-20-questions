import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { NavigationEnd, Router } from '@angular/router';
import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';
import { Entity } from 'src/app/models/entity';
import { NewQuestionWithAnswers } from 'src/app/models/new-question-with-answers';
import { Question } from 'src/app/models/question';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {

  private navigationSubscription;

  autocompleteControl = new FormControl();
  filteredQuestions: Question[] = [];
  randomEntities: Entity[] = [];
  buttons: object[] = [];
  ds = new MatTableDataSource();
  displayedColumns: string[] = ['entity', 'answers'];

  newQuestionWithAnswers: NewQuestionWithAnswers;
  submitted: boolean = false;

  isLoadingAutocomplete = false;
  errorAutocomplete = '';

  isLoadingRandoms = false;
  errorRandoms = '';

  isLoadingQuestion = false;
  errorQuestion = '';

  constructor(private router: Router, private gameService: GameService) { 

    this.newQuestionWithAnswers = {
      text: '',
      answers: [],
    }

    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };

    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.router.navigated = false;
      }
    });
  }

  ngOnInit(): void {

    this.autocompleteControl.valueChanges      
    .pipe(
      debounceTime(500),
      tap(() => {
        this.filteredQuestions = [];
        this.isLoadingAutocomplete = true;
      }),
      switchMap(value => this.gameService.getQuestionsForAutoComplete(value)
        .pipe(
          finalize(() => {
            this.isLoadingAutocomplete = false;
          }),
        )
      )
    )
    .subscribe(data => {
      this.filteredQuestions = data;
      this.errorAutocomplete = '';
    },
    error => {
      this.errorAutocomplete = error.statusText;
      this.isLoadingAutocomplete = false;
    },
    () => {
      this.isLoadingAutocomplete = false;
    });

    this.getRandomEntities();
  }

  getRandomEntities() {
    this.isLoadingRandoms = true;
    this.gameService.getRandomEntitiesForQuestion().subscribe(data => {
      this.ds.data = data;

      for (var i = 0; i < data.length; ++i) {
        this.newQuestionWithAnswers.answers.push({
          id_entity: data[i].id,
          answer: '',
        });
      }

      this.errorRandoms = '';
    },
    error => {
      this.errorRandoms = error.statusText;
      this.isLoadingRandoms = false;
    },
    () => {
      this.isLoadingRandoms = false;
    });
  }

  recordAnswer(index: number, answer: string) {
    this.newQuestionWithAnswers.answers[index].answer = answer;
  }

  submitQuestion() {
    this.isLoadingQuestion = true;
    this.newQuestionWithAnswers.text = this.autocompleteControl.value;
    this.gameService.submitNewQuestion(this.newQuestionWithAnswers).subscribe(data => {
      this.submitted = true;
      this.errorQuestion = '';
    },
    error => {
      this.errorQuestion = 'Make sure you have answered the question for all the given entities.';
      this.isLoadingQuestion = false;
    },
    () => {
      this.isLoadingQuestion = false;
    });
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }
}
