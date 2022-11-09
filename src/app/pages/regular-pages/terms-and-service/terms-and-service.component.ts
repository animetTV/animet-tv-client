import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-terms-and-service',
  templateUrl: './terms-and-service.component.html',
  styleUrls: ['./terms-and-service.component.scss']
})
export class TermsAndServiceComponent{

  constructor( private titleService: Title
    ) {
      this.titleService.setTitle('Terms of Use - animet.tv');
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    }
}
