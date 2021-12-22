import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'open-twenty-q';

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
}
