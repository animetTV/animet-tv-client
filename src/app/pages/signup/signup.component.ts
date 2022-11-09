import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SnackbarMessageComponent } from 'src/app/@theme/components/snackbar-message/snackbar-message.component';
import { AuthService } from '../../@core/services/auth.service';

declare var confetti: Function;
declare var grecaptcha: any;

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, AfterViewInit {
  isBuffering: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private authService: AuthService,
    public snackBar: MatSnackBar,
    private router: Router,
    @Inject(DOCUMENT) private _document: HTMLDocument,) {
    window.scrollTo({ top: 0, left: 0 });

    // generate reCAPTCHAv3
    /* grecaptcha.ready(function() {
     grecaptcha.execute('6LeWCJIcAAAAAOnxff5PNKVienPIbkqpIL64ZVhG').then(function(token) {
       localStorage.setItem('reCAPTCHA', token);
     })
   }); */
  }

  async onSubmit() {
    this.refreshCaptchav3();
    await delay(200);

    const validateEmail = (email: string) => {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }

    function delay(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    let email = (<HTMLInputElement>document.getElementById('email')).value;
    let password = (<HTMLInputElement>document.getElementById('password')).value

    if (validateEmail(email) && password.length > 3) {
      this.isBuffering.next(true);
      await delay(250);

      this.authService.EmailPassSignUp(email, password, this.getCAPTCHA()).subscribe(
        status => {
          if (!status) {
            this.isBuffering.next(false);
          } else if (status) {
            this.router.navigate(['/login']);

          }
        },
        error => {
          console.log(error);
          this.isBuffering.next(false);
        }
      );

    } else {
      this.snackBar.openFromComponent(SnackbarMessageComponent, {
        duration: 1700,
        data: {
          message: 'all fields are required',
        }
      });
    }
  }

  getCAPTCHA() {
    if (localStorage.getItem('reCAPTCHA') !== null) {
      let reCAPTCHA = localStorage.getItem('reCAPTCHA');
      return reCAPTCHA;
    }
  }

  showCaptchaBadge() {
    let el = this._document.querySelectorAll('.grecaptcha-logo');
    if (el !== null) {
      el.item(0).classList.add('showBadge');
    }
  }


  donationConfetti() {
    // do this for 4 seconds
    var duration = 3 * 1000;
    var end = Date.now() + duration;

    (function frame() {
      // launch a few confetti from the left edge
      confetti({
        particleCount: 3,
        angle: 55,
        spread: 55,
        origin: { x: 0 }
      });
      // and launch a few from the right edge
      confetti({
        particleCount: 3,
        angle: 125,
        spread: 55,
        origin: { x: 1 }
      });

      // keep going until we are out of time
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }

  snackbarMessage(_message: string, _duration: number = 1000) {
    this.snackBar.openFromComponent(SnackbarMessageComponent, {
      duration: _duration,
      data: {
        message: _message
      }
    })
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


  ngOnInit(): void {
    // generate reCAPTCHAv3
    grecaptcha.ready(function () {
      grecaptcha.execute('6LeWCJIcAAAAAOnxff5PNKVienPIbkqpIL64ZVhG').then(function (token) {
        localStorage.setItem('reCAPTCHA', token);
      })
    });
  }

  refreshCaptchav3() {
    grecaptcha.ready(function () {
      grecaptcha.execute('6LeWCJIcAAAAAOnxff5PNKVienPIbkqpIL64ZVhG').then(function (token) {
        localStorage.setItem('reCAPTCHA', token);
      })
    });
  }

  ngAfterViewInit(): void {
    //this.showCaptchaBadge();
  }
}
