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

  getHomeColor() {
    if (this.router.url === '/') {
      return 'accent';
    }
    return '';
  }

  isActive(path: string) {
    const routerUrl = this.router.url;

    if (path === '/') {
      if (routerUrl === path)
        return true;
      return false;
    }

    if (routerUrl.includes(path)) {
      return true;
    }

    return false;
  }

  ngOnInit(): void {
  }

}
