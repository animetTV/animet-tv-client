import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ContinueWatching_ItemAdd, ItemRequest, Profile, UserLists } from 'src/app/types/interface';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { SnackbarMessageComponent } from 'src/app/@theme/components/snackbar-message/snackbar-message.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from './api.service';


@Injectable({
    providedIn: 'root'
})
export class UserService {
    private userToken: string;
    listEdit: boolean = false;
    listEdit_change: BehaviorSubject<boolean> = new BehaviorSubject(false);

    cached_continue_watching: BehaviorSubject<any> = new BehaviorSubject(null);
    cached_user_profile: BehaviorSubject<Profile> = new BehaviorSubject(null);
    isMobile: BehaviorSubject<boolean> = new BehaviorSubject(false);
    profileAvatarChanged: BehaviorSubject<boolean> = new BehaviorSubject(null);
    isNSFWClient: BehaviorSubject<boolean> = new BehaviorSubject(this.getStorageNSFW());
    constructor(
        private http: HttpClient,
        private authService: AuthService,
        public router: Router,
        public snackBar: MatSnackBar,
        private apiService: ApiService
    ) {
        this.authService.isUser_Change.subscribe(
            isLoggedIn => {
                if (!isLoggedIn) {
                    this.isNSFWClient.next(false);
                }
            }
        )
    }

    getStorageNSFW() {
        if (localStorage.getItem('NSFW') !== null) {
          let NSFW = localStorage.getItem('NSFW');
          return JSON.parse(NSFW) === true;
        } else {
          localStorage.setItem("NSFW", "false");
          return false;
        }
      }

    public getUserList() {
        this.userToken = JSON.parse(localStorage.getItem('currentUser'));
        const httpOptions = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.userToken
            }
        }

        return this.http.get<UserLists>(environment.apiUrl + 'api/user/list', httpOptions);
    }

    public getUserProfile() {
        this.userToken = JSON.parse(localStorage.getItem('currentUser'));
        const httpOptions = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.userToken
            }
        }
        return this.http.get<any>(environment.apiUrl + 'api/user/profile', httpOptions);
    }

    public getUserContinueWatching() {
        this.userToken = JSON.parse(localStorage.getItem('currentUser'));
        const httpOptions = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.userToken
            }
        }
        return this.http.get<any>(environment.apiUrl + 'api/user/continue-watching', httpOptions);
    }


    public addItemToListByTitle() {
        this.userToken = JSON.parse(localStorage.getItem('currentUser'));

        const httpOptions = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.userToken
            }
        }
        const _animeTitle = localStorage.getItem('animeTitle');
        const _img_url = localStorage.getItem('img_url');

        return this.http.put<any>(environment.apiUrl + 'api/user/add-item-to-list-by-title', { 'animeTitle': _animeTitle, 'img_url': _img_url }, httpOptions);
    }

    public addItemToList(item: ItemRequest) {
        this.userToken = JSON.parse(localStorage.getItem('currentUser'));

        const httpOptions = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.userToken
            }
        }

        return this.http.put<any>(environment.apiUrl + 'api/user/add-item-to-list', item, httpOptions);
    }

    public removeItemFromList(item: ItemRequest) {
        this.userToken = JSON.parse(localStorage.getItem('currentUser'));

        const httpOptions = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.userToken
            }
        }

        return this.http.put<any>(environment.apiUrl + 'api/user/remove-item-from-list', item, httpOptions);

    }

    public moveItemToCompleted(item: ItemRequest) {
        this.userToken = JSON.parse(localStorage.getItem('currentUser'));

        const httpOptions = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.userToken
            }
        }

        return this.http.put<any>(environment.apiUrl + 'api/user/item-completed', item, httpOptions);

    }

    public moveItemToPlanToWatch(item: ItemRequest) {
        this.userToken = JSON.parse(localStorage.getItem('currentUser'));

        const httpOptions = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.userToken
            }
        }

        return this.http.put<any>(environment.apiUrl + 'api/user/item-plan-to-watch', item, httpOptions);
    }

    public setListStatus(status: boolean) {
        this.userToken = JSON.parse(localStorage.getItem('currentUser'));

        const httpOptions = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.userToken
            }
        }
        const body = {
            isListPublic: status,
        }

        return this.http.put<any>(environment.apiUrl + 'api/user/set-list-status', body, httpOptions);
    }

    /* Continue Watching */

    public addItemToContinueWatching(item: ContinueWatching_ItemAdd) {
        this.userToken = JSON.parse(localStorage.getItem('currentUser'));

        const httpOptions = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.userToken
            }
        }

        return this.http.put<any>(environment.apiUrl + 'api/user/add-item-to-continue-watching', item, httpOptions);
    }

    public removeItemFromeContinueWatching(title: string) {
        console.log(title);

        this.userToken = JSON.parse(localStorage.getItem('currentUser'));

        const httpOptions = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.userToken
            }
        }
        let _title = String(title);

        return this.http.put<any>(environment.apiUrl + 'api/user/remove-item-from-continue-watching', { title: _title }, httpOptions);
    }

    getUserContinueWatchList() {
        // get users continue watch list
        if (localStorage.getItem('currentUser')) {
            this.getUserContinueWatching().subscribe(
                data => {
                    if (data) {
                        //const sorted = continue_watching
                        const sorted = data['continue_watching'].sort(function (a, b) {
                            return b.dateCreated - a.dateCreated;
                        });

                        this.cached_continue_watching.next(sorted);
                    }
                }
            )

        }
    }

    public verifyToken() {
        this.userToken = JSON.parse(localStorage.getItem('currentUser'));

        const httpOptions = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.userToken
            }
        }
        if (this.userToken) {
            this.http.post<any>(environment.apiUrl + 'api/user/verify-token', { message: "refresh token" }, httpOptions).subscribe(
                result => {
                    if (result !== null && result.success) {
                        // token still valid
                    } else {
                        this.authService.logout();
                    }
                },
                error => {
                    console.log(error);
                    if (error.status === 401) {
                        this.authService.logout();
                        this.router.navigate(['/login']);
                    }
                }
            )
        }


    }

    // checks if JWT expiration
    private tokenExpired(token: string) {
        const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
        return (Math.floor((new Date).getTime() / 1000)) >= expiry;
    }

    public uploadNewAvatar(avatarIMG: any): Observable<boolean> {
        var subject = new Subject<boolean>();
        this.userToken = JSON.parse(localStorage.getItem('currentUser'));

        const httpOptions = {
            headers: { Authorization: this.userToken }
        }

        let data = new FormData();
        data.append('avatar', avatarIMG, avatarIMG.name);

        this.http.post<any>(environment.apiUrl + 'api/user/upload-avatar', data, httpOptions).subscribe(
            result => {
                if (result.success) {
                    subject.next(true);
                    this.profileAvatarChanged.next(true);
                    this.profileAvatarChanged.next(false);
                }
            },
            error => {
                subject.next(false);
                console.log(error);
            }
        );

        return subject.asObservable();
    }
    
    public uploadAnimeTracer(formData: FormData): Observable<boolean> {
        var subject = new Subject<boolean>();
        this.userToken = JSON.parse(localStorage.getItem('currentUser'));

        const httpOptions = {
            headers: { Authorization: this.userToken }
        }

        this.http.post<any>(environment.apiUrl + 'api/user/upload-anime-tracer', formData, httpOptions).subscribe(
            result => {
                if (result.success) {
                    subject.next(true);
                    this.profileAvatarChanged.next(true);
                    this.profileAvatarChanged.next(false);
                }
            },
            error => {
                subject.next(false);
                console.log(error);
            }
        );

        return subject.asObservable();
    }

    snackbarMessage(_message: string, _duration: number = 1500) {
        this.snackBar.openFromComponent(SnackbarMessageComponent, {
            duration: _duration,
            data: {
                message: _message
            }
        })
    }

    cacheUserProfile() {
        this.getUserProfile().subscribe(
            result => {
                if (result) {
                    this.cached_user_profile.next(result.accountProfile);
                }
            }
        );
    }

    setUserContinent() {
        this.apiService.regularGET('https://geolocation-db.com/json/', ``).subscribe(
            result => {
                if (result) {
                    let continentCodes={BD:"EU",BE:"EU",BF:"EU",BG:"EU",BA:"EU",BB:"NA",WF:"EU",BL:"NA",BM:"NA",BN:"EU",BO:"NA",BH:"EU",BI:"EU",BJ:"EU",BT:"EU",JM:"NA",BV:"NA",BW:"EU",WS:"EU",BQ:"NA",BR:"NA",BS:"NA",JE:"EU",BY:"EU",BZ:"NA",RU:"EU",RW:"EU",RS:"EU",TL:"EU",RE:"EU",TM:"EU",TJ:"EU",RO:"EU",TK:"EU",GW:"EU",GU:"EU",GT:"NA",GS:"NA",GR:"EU",GQ:"EU",GP:"NA",JP:"EU",GY:"NA",GG:"EU",GF:"NA",GE:"EU",GD:"NA",GB:"EU",GA:"EU",SV:"NA",GN:"EU",GM:"EU",GL:"NA",GI:"EU",GH:"EU",OM:"EU",TN:"EU",JO:"EU",HR:"EU",HT:"NA",HU:"EU",HK:"EU",HN:"NA",HM:"NA",VE:"NA",PR:"NA",PS:"EU",PW:"EU",PT:"EU",SJ:"EU",PY:"NA",IQ:"EU",PA:"NA",PF:"EU",PG:"EU",PE:"NA",PK:"EU",PH:"EU",PN:"EU",PL:"EU",PM:"NA",ZM:"EU",EH:"EU",EE:"EU",EG:"EU",ZA:"EU",EC:"NA",IT:"EU",VN:"EU",SB:"EU",ET:"EU",SO:"EU",ZW:"EU",SA:"EU",ES:"EU",ER:"EU",ME:"EU",MD:"EU",MG:"EU",MF:"NA",MA:"EU",MC:"EU",UZ:"EU",MM:"EU",ML:"EU",MO:"EU",MN:"EU",MH:"EU",MK:"EU",MU:"EU",MT:"EU",MW:"EU",MV:"EU",MQ:"NA",MP:"EU",MS:"NA",MR:"EU",IM:"EU",UG:"EU",TZ:"EU",MY:"EU",MX:"NA",IL:"EU",FR:"EU",IO:"EU",SH:"EU",FI:"EU",FJ:"EU",FK:"NA",FM:"EU",FO:"EU",NI:"NA",NL:"EU",NO:"EU",NA:"EU",VU:"EU",NC:"EU",NE:"EU",NF:"EU",NG:"EU",NZ:"EU",NP:"EU",NR:"EU",NU:"EU",CK:"EU",XK:"EU",CI:"EU",CH:"EU",CO:"NA",CN:"EU",CM:"EU",CL:"NA",CC:"EU",CA:"NA",CG:"EU",CF:"EU",CD:"EU",CZ:"EU",CY:"EU",CX:"EU",CR:"NA",CW:"NA",CV:"EU",CU:"NA",SZ:"EU",SY:"EU",SX:"NA",KG:"EU",KE:"EU",SS:"EU",SR:"NA",KI:"EU",KH:"EU",KN:"NA",KM:"EU",ST:"EU",SK:"EU",KR:"EU",SI:"EU",KP:"EU",KW:"EU",SN:"EU",SM:"EU",SL:"EU",SC:"EU",KZ:"EU",KY:"NA",SG:"EU",SE:"EU",SD:"EU",DO:"NA",DM:"NA",DJ:"EU",DK:"EU",VG:"NA",DE:"EU",YE:"EU",DZ:"EU",US:"NA",UY:"NA",YT:"EU",UM:"EU",LB:"EU",LC:"NA",LA:"EU",TV:"EU",TW:"EU",TT:"NA",TR:"EU",LK:"EU",LI:"EU",LV:"EU",TO:"EU",LT:"EU",LU:"EU",LR:"EU",LS:"EU",TH:"EU",TF:"NA",TG:"EU",TD:"EU",TC:"NA",LY:"EU",VA:"EU",VC:"NA",AE:"EU",AD:"EU",AG:"NA",AF:"EU",AI:"NA",VI:"NA",IS:"EU",IR:"EU",AM:"EU",AL:"EU",AO:"EU",AQ:"NA",AS:"EU",AR:"NA",AU:"EU",AT:"EU",AW:"NA",IN:"EU",AX:"EU",AZ:"EU",IE:"EU",ID:"EU",UA:"EU",QA:"EU",MZ:"EU"};
                    let userContinetCode = continentCodes[result.country_code];
                    localStorage.setItem('nearby_node', String(userContinetCode));
                }
            },
            error => {
                console.log(error);
                localStorage.setItem('nearby_node', 'NA');
            }
        )
    }






}
