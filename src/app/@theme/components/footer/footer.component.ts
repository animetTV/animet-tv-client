import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SnackbarMessageComponent } from '../snackbar-message/snackbar-message.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';

declare var confetti: Function;

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent  {
  showFooter: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );
  constructor(
    public router: Router,
    public snackBar: MatSnackBar,
    private renderer2: Renderer2,
    private breakpointObserver: BreakpointObserver,
    @Inject(DOCUMENT) private _document
  ) {
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url.includes('/quick-bites')) {
          this.showFooter.next(false);
        }
      });
  }

  copyBTCaddress() {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = '1sYPBuEcnKk5ETePmNXw9tikqisdgnk5B';
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    this.snackbarMessage(
      'BTC address copied to clipboard! Thank You 🥳 ',
      4000
    );
    this.donationConfetti();
    this.router.navigate(['/donation']);
  }

  snackbarMessage(_message: string, _duration: number = 1000) {
    this.snackBar.openFromComponent(SnackbarMessageComponent, {
      duration: _duration,
      data: {
        message: _message,
      },
    });
  }

  donationConfetti() {
    // do this for 4 seconds
    var duration = 4 * 1000;
    var end = Date.now() + duration;

    (function frame() {
      // launch a few confetti from the left edge
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      // and launch a few from the right edge
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      // keep going until we are out of time
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }

  getShowDiscordWidget() {
    if (localStorage.getItem('isDiscordWidget') === null) {
      localStorage.setItem('isDiscordWidget', 'false');
    }
    let isDiscordWidget = localStorage.getItem('isDiscordWidget');
    return JSON.parse(isDiscordWidget) === true;
  }

  reloadCurrentRoute() {
    window.location.reload();
  }
}
