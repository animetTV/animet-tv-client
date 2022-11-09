import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/@core/services/auth.service';

declare var grecaptcha: any;

@Component({
    selector: 'app-password-reset',
    templateUrl: './password-reset.component.html',
    styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent {
    StepOne: BehaviorSubject<boolean> = new BehaviorSubject(true);
    StepTwo: BehaviorSubject<boolean> = new BehaviorSubject(false);
    invalidUrl: BehaviorSubject<boolean> = new BehaviorSubject(false);
    passwordResetUserEmail: BehaviorSubject<string> = new BehaviorSubject(null);

    constructor(
        @Inject(DOCUMENT) private _document: HTMLDocument, 
        private authService: AuthService,
        private route: ActivatedRoute
        ) {
        //this.showCaptchaBadge();

        this.route.params.subscribe(
            params => {
              if(params['token'] && params['token'].length > 0) {
                this.authService.ValidatePasswordResetToken(params['token']).subscribe(
                    isToken => {
                        if (isToken) {
                            // Token valid allow password reset
                            this.StepOne.next(false);
                            this.StepTwo.next(true);
                            
                            this.authService.passwordResetUserEmail.subscribe(
                                email => {
                                    if (email) {
                                        this.passwordResetUserEmail.next(email);
                                    }
                                }
                            )
                        } else if (!isToken) {
                            // Token not valid or expired
                            this.StepOne.next(false);
                            this.invalidUrl.next(true);
                        }
                    }
                )
              } 
            }
          );
    }
    showCaptchaBadge() {
        let el = this._document.querySelectorAll('.grecaptcha-logo');
    
        if (el) {
          el.item(0).classList.add('showBadge');
        }
    }

    onSend() {
        const validateEmail = (email : string) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }
        
        let email = (<HTMLInputElement>document.getElementById('email')).value;

        if (validateEmail(email)) { 
            grecaptcha.ready(function() {
                grecaptcha.execute('6LeWCJIcAAAAAOnxff5PNKVienPIbkqpIL64ZVhG', {action: 'submit'}).then(function(token) {
                    localStorage.setItem('reCAPTCHA', token);
                });
            });
            
            this.authService.PasswordForgot(email, this.getCAPTCHA()).subscribe(
                isEmailSent => {
                    if (isEmailSent) {
                        // next step
                    }
                },
                error => {
                    console.log(error);
                }
            )
        }
    }

    onSendNewPassword() {
        let newPassword = (<HTMLInputElement>document.getElementById('new-password')).value
        
        if (newPassword.length > 6) {
            this.route.params.subscribe(
                params => {
                    console.log(params['token']);
                    
                    if(params['token'] && params['token'].length > 0) {
                        let _token = params['token'];
                        this.authService.NewPasswordSubmit(newPassword,_token).subscribe(
                            result => {
                                if (result) {
                                    // password changed
                                } else {
                                    // error
                                    this.StepTwo.next(false);
                                    this.invalidUrl.next(true);
                                }
                            }
                        )
                    }
                }
            )
        }
    }

    getCAPTCHA() {
        if (localStorage.getItem('reCAPTCHA') !== null) {
          let reCAPTCHA = localStorage.getItem('reCAPTCHA');
          return reCAPTCHA;
        }
      }
}
