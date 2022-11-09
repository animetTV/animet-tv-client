import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import 'hammerjs'
import { Subject } from 'rxjs/internal/Subject';
import { ApiService } from '../@core/services/api.service';

@Component({
  selector: 'pages',
  styleUrls: ['pages.component.scss'],
  template: `
  
      <div fxLayout="column" fxLayoutAlign="center">
        <router-outlet class="main-view" (click)="dismissSidebar()" ></router-outlet>
        <app-footer></app-footer>
      </div>

  `,
})
export class PagesComponent implements OnInit {

  openedSubject = new Subject<boolean>();
  NSFW_AGREEMENT: string;
  constructor(public dialog: MatDialog, public router: Router, public apiService: ApiService) { }

  ngOnInit(): void { }

  dismissSidebar() {
    this.openedSubject.next(false);
  }

  /* navbarSticky() {
    const navbar = document.getElementById('navbar');
    const sticky = navbar.offsetTop;

    if (window.pageYOffset >= sticky && !this.isMobile()) {
      navbar.classList.add('sticky');
    } else {
      navbar.classList.remove('sticky');
    }
  } */

}
