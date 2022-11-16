import { Injectable } from '@angular/core';
import { User } from '../../types/interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
/* import { SocialAuthService } from "angularx-social-login"; */
import { SocialUser } from "angularx-social-login";
import { Router } from '@angular/router';
import { SnackbarMessageComponent } from 'src/app/@theme/components/snackbar-message/snackbar-message.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { timeout } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    DEFAULT_HEADERS = new HttpHeaders({'Content-Type':'application/json; charset=utf-8'});

    /* password reset user data */
    public passwordResetUserEmail: BehaviorSubject<string> = new BehaviorSubject(null);

    /* user || guest state */
    public isUser: boolean = false;
    public isUser_Change: BehaviorSubject<boolean> = new BehaviorSubject(false);

    /* Regular Sign In */
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;
    
    /* Google Sing In */
    private currentGoogleUserSubject:BehaviorSubject<SocialUser>;
    public currentGoogleUser: Observable<SocialUser>;

    constructor( private http: HttpClient,/*  socialAuthService: SocialAuthService, */ public router: Router, public snackBar: MatSnackBar,) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
        this.setIsUser();

        this.isUser_Change.subscribe(
            newstate => {
                this.isUser = newstate;
            }
        )

        this.currentGoogleUserSubject = new BehaviorSubject<SocialUser>(JSON.parse(localStorage.getItem('currentGoogleSignIn')));
        this.currentGoogleUser = this.currentGoogleUserSubject.asObservable();
    }


    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    public get currentGoogleUserValue(): SocialUser {
        return this.currentGoogleUserSubject.value;
    }


    setIsUser() {
        let token = JSON.parse(localStorage.getItem('currentUser'));
        if (token && token !== null) {
            this.isUser_Change.next(true);
        } else {
            this.isUser_Change.next(false);
        }

    }

    EmailPassLogin(_email: string, _password, _token: string):Observable<boolean>{
        var subject = new Subject<boolean>();
        
        let body = {
            email: _email,
            password: _password,
            token: _token
        }

        this.http.post<any>(environment.apiUrl + 'api/user/login' , body ).pipe(timeout(3000)).subscribe(
            result => {
                if (result.success) {
                    const user: User = {
                        accountID: result.user.accountID,
                        token: result.token,
                    } 

                    localStorage.setItem('currentUser', JSON.stringify(result.token));
                    this.currentUserSubject.next(user);
                    this.setIsUser();   
                    // user logged in redirect
                    subject.next(true);
                } else {
                    this.snackbarMessage('wrong password or email try again', 1800);
                    subject.next(false);
                }
            },
            error => {
                console.log(error);
                this.router.navigateByUrl('/home', { skipLocationChange: true }).then(() => {
                    this.router.navigate(['/login']);
                }); 
                this.snackbarMessage(error.error.msg, 6000)
                subject.next(false);
            });

            return subject.asObservable();
    }

    EmailPassSignUp(_email: string, _password: string, _token: string): Observable<boolean>{
        var subject = new Subject<boolean>();
        
        let body = {
            email: _email,
            password: _password,
            token: _token
        }
        this.http.post<any>(environment.apiUrl + 'api/user/register' , body, { headers: this.DEFAULT_HEADERS }).pipe(timeout(4500)).subscribe(
            result => {  
                if (result.success) {
                    subject.next(true);
                    this.snackbarMessage(result.msg, 2500)
                } else {
                    subject.next(false);
                    this.snackbarMessage('fail to register', 1500)
                }
            },
            error => {
                console.log(error);
                if (error.hasOwnProperty('error') && error.error.hasOwnProperty('msg')) {
                    this.snackbarMessage(error.error.msg, 7000)
                } else {
                    this.snackbarMessage(error.message, 7000)
                }
                subject.next(false);
            }
        );

        return subject.asObservable();
    }

   /*  GoogleSignIn(googleSocialUser: SocialUser) {
        localStorage.setItem('currentGoogleSignIn', JSON.stringify(googleSocialUser));
        this.currentGoogleUserSubject.next(googleSocialUser);
    } */

    PasswordForgot(_email: string, _token: string):Observable<boolean> {
        var subject = new Subject<boolean>();

        let body = {
            email: _email,
            token: _token
        }

        this.http.post<any>(environment.apiUrl + 'api/user/forgot', body, { headers: this.DEFAULT_HEADERS}).subscribe(
            result => {   
                if (result.success) {
                    // email is valid and email has been sent
                    this.snackbarMessage('email has been sent please check inbox or spam folder');
                    subject.next(true);
                } else {
                    this.snackbarMessage(result.msg, 3000);
                }
            },
            error => {
                console.log(error.error.msg);
                subject.next(false);
            }
        );

        return subject.asObservable();
    }

    ValidatePasswordResetToken(_token: string):Observable<boolean> {
        var subject = new Subject<boolean>();
        this.http.get<any>(environment.apiUrl + 'api/user/reset/' + _token, { headers: this.DEFAULT_HEADERS}).subscribe(
            result => {                
                if (result.success) {
                    this.passwordResetUserEmail.next(result.email);
                    subject.next(true);
                }
            },
            error => {
                subject.next(false);
                console.log(error.error.msg);
                this.snackbarMessage(error.error.msg, 6000);
            }
        );

        return subject.asObservable();
    }

    NewPasswordSubmit(_newPassword: string, _token: string) {
        var subject = new Subject<boolean>();
        
        let body = {
            password: _newPassword,
        }

        this.http.post<any>(environment.apiUrl + 'api/user/reset/'+ _token, body, { headers: this.DEFAULT_HEADERS }).subscribe(
            result => {
                if (result.success) {
                    subject.next(true);
                    this.snackbarMessage('Password successfully changed', 3000);
                    this.router.navigate(['/login']);
                }
            },
            error => {
                subject.next(false);
                console.log(error.error.msg);
                this.snackbarMessage(error.error.msg, 6000);
            }
        );

        return subject.asObservable();
    }

    logout(){
        // remove user from localStorage
        localStorage.removeItem('currentUser');
        this.setIsUser();
        this.router.navigate(['home']);

        // remove google Sign in token
        localStorage.removeItem('currentGoogleSignIn');
        this.currentUserSubject.next(null);

        this.isUser_Change.next(false);
    }

    snackbarMessage(_message: string, _duration: number = 1500){
        this.snackBar.openFromComponent(SnackbarMessageComponent, {
          duration: _duration,
          data: {
            message: _message
          }
        })
       }


}