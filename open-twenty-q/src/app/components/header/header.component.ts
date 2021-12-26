import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(public router: Router) {
  }

  getColorForPath(path: string) {
    const routerUrl = this.router.url;

    if (path === '/') {
      if (routerUrl === path)
        return 'accent';
      return '';
    }

    if (routerUrl.includes(path)) {
      return 'accent';
    }

    return '';
  }

  ngOnInit(): void {
  }

}
