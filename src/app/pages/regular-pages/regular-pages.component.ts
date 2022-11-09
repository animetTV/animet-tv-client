import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { SnackbarMessageComponent } from 'src/app/@theme/components/snackbar-message/snackbar-message.component';
import { environment } from 'src/environments/environment';

declare var confetti: Function;

@Component({
    selector: 'app-regular-pages ',
    templateUrl: './regular-pages.component.html',
    styleUrls: ['./regular-pages.component.scss']
})
export class RegularPagesComponent {
  isShowAdsChecked:boolean = this.getShowAdsState();
    constructor(
        public snackBar: MatSnackBar,
        private titleService: Title
    ) {
      this.titleService.setTitle('About & Donate');
      window.scroll({ behavior: 'auto', left: 0, top: 0 });
    }

    copyBTCaddress() {
        let selBox = document.createElement('textarea');
          selBox.style.position = 'fixed';
          selBox.style.left = '0';
          selBox.style.top = '0';
          selBox.style.opacity = '0';
          selBox.value = '1sYPBuEcnKk5ETePmNXw9tikqisdgnk5B ';
          document.body.appendChild(selBox);
          selBox.focus();
          selBox.select();
          document.execCommand('copy');
          document.body.removeChild(selBox);
  
          this.snackbarMessage('BTC address copied to clipboard! Thank You 🥳 ', 4000);
          this.donationConfetti();
    }

    copyAnimetTVLink() {
      let selBox = document.createElement('textarea');
      selBox.style.position = 'fixed';
      selBox.style.left = '0';
      selBox.style.top = '0';
      selBox.style.opacity = '0';
      selBox.value = environment.baseUrl;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand('copy');
      document.body.removeChild(selBox);

      this.snackbarMessage('Copied to clipboard! Thank You 🥳 ', 4000);
      this.donationConfetti();
    }
  
    snackbarMessage(_message: string, _duration: number = 1000){
      this.snackBar.openFromComponent(SnackbarMessageComponent, {
        duration: _duration,
        data: {
          message: _message
        }
      })
     }


   donationConfetti() {
    // do this for 4 seconds
    var duration = 3 * 1000;
    var end = Date.now() + duration;

    (function frame() {
      // launch a few confetti from the left edge
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      // and launch a few from the right edge
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      // keep going until we are out of time
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
   }

   getShowAdsState() {
    if (localStorage.getItem('isShowAdsChecked') === null) {
      localStorage.setItem('isShowAdsChecked', 'true');
    } 
    let isShowAdsChecked = localStorage.getItem('isShowAdsChecked');
    return (JSON.parse(isShowAdsChecked) === true);
  }

  postToggleAdChange() {
    let currentState = this.getShowAdsState();
    currentState = !currentState;
    this.isShowAdsChecked = currentState;
    localStorage.setItem('isShowAdsChecked',`${currentState}`); 
    this.reloadCurrentRoute()
  }

  reloadCurrentRoute() {
    window.location.reload();
}
}
