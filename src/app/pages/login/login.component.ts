import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from 'src/app/@core/services/auth.service';
/* import { SocialAuthService } from "angularx-social-login"; */
import { BehaviorSubject } from 'rxjs';
import { SnackbarMessageComponent } from '../../@theme/components/snackbar-message/snackbar-message.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common'

declare var grecaptcha: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  googleSignBtnTimeOut: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isBuffering: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private authService: AuthService,
    /* private socialAuthService: SocialAuthService, */
    public snackBar: MatSnackBar,
    @Inject(DOCUMENT) private _document: HTMLDocument,
    private router: Router) {
    window.scrollTo({ top: 0, left: 0 });


    // generate reCAPTCHAv3
    grecaptcha.ready(function () {
      grecaptcha.execute('6LeWCJIcAAAAAOnxff5PNKVienPIbkqpIL64ZVhG').then(function (token) {
        localStorage.setItem('reCAPTCHA', token);
      });
    });

  }

  ngOnInit(): void {
    setTimeout(() => this.googleSignBtnTimeOut.next(true), 500);
    //this.showCaptchaBadge();
    /*   this.socialAuthService.authState.subscribe( (user) => {
        
      }); */
  }

  async onSubmit() {
    const validateEmail = (email: string) => {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }

    let email = (<HTMLInputElement>document.getElementById('email')).value;
    let password = (<HTMLInputElement>document.getElementById('password')).value

    if (validateEmail(email) && password.length > 0) {
      function delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

      this.isBuffering.next(true);
      this.bufferTxt();
      await delay(200);
      this.authService.EmailPassLogin(email, password, this.getCAPTCHA()).subscribe(
        status => {
          if (!status) {
            this.isBuffering.next(false);
          } else if (status) {
            this.router.navigate(['/home']);
          }
        },
        error => {
          console.log(error);
          this.isBuffering.next(false);
        }
      );
    } else {
      this.messagWrongEntry();
    }

  }

  /* signInWithGoogle(): void {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
  } */

  getCAPTCHA() {
    if (localStorage.getItem('reCAPTCHA') !== null) {
      let reCAPTCHA = localStorage.getItem('reCAPTCHA');
      return reCAPTCHA;
    }
  }

  bufferTxt() {
    var statusTxt = ['submiting 🔑. . .', 'verifiy 🔒. . .', 'waiting for response 😴. . .'];
    var counter = 0;

    function count(num) {
      setTimeout(function () {
        document.getElementById('status-txt').innerText = statusTxt[counter++]
        if (num > 0) count(num - 1);
      }, 100);
    }
    count(2);

  }

  showCaptchaBadge() {
    let el = this._document.querySelectorAll('.grecaptcha-logo');

    if (el !== null || undefined) {
      el.item(0).classList.add('showBadge');
    }
  }

  messagWrongEntry() {
    this.snackBar.openFromComponent(SnackbarMessageComponent, {
      duration: 1700,
      data: {
        message: 'all fields are required',
      }
    });
  }

}
