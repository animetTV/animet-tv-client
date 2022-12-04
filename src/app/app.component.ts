import {
  Component,
  Input,
  Pipe,
  PipeTransform,
  ViewChild,
} from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { ApiService } from './@core/services/api.service';
import { PublicLinkService } from './@core/services/public-link.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { UserService } from './@core/services/user.service';
import { WatchAnimeService } from './@core/services/watch-anime.service';
import { BrowseService } from './@core/services/browse.service';
import { ExperimentService } from './@core/services/experiment.service';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AuthService } from './@core/services/auth.service';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { GenreDialogComponent } from './@theme/components/genre/genre-dialog.component';
import { ShareListComponent } from './@theme/components/share-list/share-list.component';
import { DomSanitizer } from '@angular/platform-browser';
import { UpdateService } from './@core/services/update.service';
import { Location } from '@angular/common';
import { Season, SeasonsDetail, TopSeason } from './types/interface';
import { SelectSeasonService } from './@core/services/select-season.service';
declare let ga: Function;

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url: any) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'app-root',
  styleUrls: ['app.component.scss'],
  templateUrl: 'app.component.html',
})
export class AppComponent {
  title = 'AnimetTV';
  isMobile: boolean = false;
  isBuffering: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isChecked: BehaviorSubject<boolean> = new BehaviorSubject(
    this.getStorageNSFW()
  );
  /* isShowAdsChecked: boolean = this.getShowAdsState(); */
  isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject(false);
  userAvatarFileName: BehaviorSubject<string> = new BehaviorSubject(null);
  userAvatarShortEmail: BehaviorSubject<string> = new BehaviorSubject('');
  isAvatarLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );
  totalUserSessions: string = '';
  @Input() openedSubject: Subject<boolean>;
  @ViewChild('drawer') sidenav: MatSidenav;

  // season selector
  ALL_SEASON_DETAIL: SeasonsDetail[] = [];
  AVAILABLE_YEAR: BehaviorSubject<number[]> = new BehaviorSubject(null);

  SEASON: string;
  YEAR: number;
  seasons: Season[] = [
    { value: 'Winter', viewValue: 'Winter' },
    { value: 'Spring', viewValue: 'Spring' },
    { value: 'Summer', viewValue: 'Summer' },
    { value: 'Fall', viewValue: 'Fall' },
  ];

  /* @HostListener('window:scroll', ['$event'])
  onScroll() {
    var el = document.getElementById('scroll_to_top_btn');

    if (el) {
      if (window.pageYOffset > 500) {
          el.classList.remove('hide')
      } else {
        el.classList.add('hide');
      }
    }
  } */

  constructor(
    public router: Router,
    public publicLinkService: PublicLinkService,
    private deviceService: DeviceDetectorService,
    private userService: UserService,
    public apiService: ApiService,
    public watchService: WatchAnimeService,
    private browseService: BrowseService,
    private experimentService: ExperimentService,
    public dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private authServie: AuthService,
    public watchAnimeService: WatchAnimeService,
    public serviceWorker: UpdateService,
    private location: Location,
    private selectSeason: SelectSeasonService
  ) {
    this.userService.setUserContinent();

    /* dected mobile device */
    this.userService.isMobile.next(this.deviceService.isMobile());

    // check the service worker for updates
    this.serviceWorker.checkForUpdates();

    /* shared user profile link */
    router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        // use all must watch http calls on route change
        if (event['url'].includes('/user')) {
          let accountID = event['url'].split('/')[2];

          this.publicLinkService.getPublicList(accountID);
        } else if (
          event['url'].includes('/home') ||
          event['url'].includes('/browse')
        ) {
          this.watchService.reset();

          if (event['url'].includes('/browse/movie')) {
            this.browseService.currentFileterType.next('trending');
          }
        }
      }
    });

    // buffer state
    this.watchService.isBuffering.subscribe((state) => {
      if (state !== null) {
        this.isBuffering.next(state);
      }
    });

    /* check local storage if any type user logged in */
    this.authServie.currentUser.subscribe((state) => {
      if (state) {
        if (
          localStorage.getItem('currentUser') === null ||
          localStorage.getItem('currentGoogleSignIn')
        ) {
          this.isLoggedIn.next(false);
        } else {
          this.isLoggedIn.next(true);
          // fetch avatar
          this.userService.cacheUserProfile();
        }
      } else {
        this.isLoggedIn.next(false);
      }
    });

    // if logged in fetch avatarIMG
    this.isLoggedIn.subscribe((result) => {
      if (result !== null) {
        this.userService.cached_user_profile.subscribe((userProfile) => {
          if (userProfile) {
            this.isAvatarLoaded.next(true);
            this.userAvatarFileName.next(
              `https://img.animet.site/file/animettv-avatars/${userProfile?.avatarFileName}`
            );
            this.setAvatarShortEmail(userProfile?.email);
          }
        });
      }
    });

    // refresh userAvatar on change by user
    this.userService.profileAvatarChanged.subscribe((state) => {
      if (state) {
        this.userService.cacheUserProfile();
      }
    });

    /*  this.apiService.getUserSessionForToday().subscribe(
       result => {
         if (result) {
           this.totalUserSessions = result[0].totalSessionToday;
         }
       }
     ) */
    // local nsfw state
    this.userService.isNSFWClient.subscribe((newState) => {
      this.isChecked.next(newState);
    });
  }

  setAvatarShortEmail(email: string) {
    let name = email.substring(0, email.lastIndexOf('@'));
    this.userAvatarShortEmail.next(name.substring(0, 6));
  }

  goBack() {
    this.location.back();
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    // tmp use gogoanime source by default

    this.apiService.initalLoad();
    localStorage.setItem('sourceType', 'gogoanime');
    this.experimentService.getQuickBits();
    //this.apiService.initalLoad();
    this.userService.verifyToken();

    const getSeason = (d) => Math.floor((d.getMonth() / 12) * 4) % 4;
    this.SEASON = ['Winter', 'Spring', 'Summer', 'Fall'][getSeason(new Date())];
    this.YEAR = new Date().getFullYear();
    this.setSeason(this.SEASON);
    this.setYear(this.YEAR);

    this.selectSeason.ALL_SEASON_DETAIL.subscribe(
      (result) => {
        if (result) {
          let available_years = [];
          result.forEach((el) => {
            available_years.push(el.season_year);
          });
          /* filter out duplicate years */
          const onlyUnique = (value, index, self) => {
            return self.indexOf(value) === index;
          };
          this.AVAILABLE_YEAR.next(
            available_years.filter(onlyUnique).filter((n) => n)
          );
        }
      },
      (error) => {
        console.log(error);
      }
    );

    setTimeout(() => {
      //console.clear();
      /*  Developer Console Warning Message */
      /* console.log("%c ⚠️ WARNING! DO NOT COPY/PASTE ANY TEXT HERE ⚠️ ", "color: #BF4160; font-size: 34px; font-weight: bold;"); */
      console.log(
        '%cWITH GREAT POWER COMES GREAT RESPONSIBILITY!',
        'color: #DEB201; font-size: 20px; font-weight: bold; font-style: italic'
      );
    }, 1500);
  }

  /* scrollToTop() {
   window.scrollTo({
     top: 0,
     left: 0,
     behavior: 'smooth'
   });
  } */

  onNSFWChange() {
    let nsfw_local = this.getStorageNSFW();
    this.isChecked.next(!nsfw_local);
    this.userService.isNSFWClient.next(!nsfw_local);
    if (!nsfw_local) {
      this.router.navigate(['/experiment']);
    }
    localStorage.setItem('NSFW', JSON.stringify(!nsfw_local));
  }

  getStorageNSFW() {
    if (localStorage.getItem('NSFW') !== null) {
      let NSFW = localStorage.getItem('NSFW');
      return JSON.parse(NSFW) === true;
    } else {
      localStorage.setItem('NSFW', 'false');
      return false;
    }
  }

  openSearchBar() {
    localStorage.removeItem('lastSearched');
    this.router.navigate(['/browse']);
    window.scrollTo(0, 0);
  }

  openShareList() {
    let dialogRef;
    if (this.isMobile) {
      dialogRef = this.dialog.open(ShareListComponent, {
        width: '100%',
      });
    } else {
      dialogRef = this.dialog.open(ShareListComponent, {
        width: '95%',
      });
    }

    /* close sidenave after dialog closed */
    dialogRef.afterClosed().subscribe(() => {
      this.sidenav.close();
    });
  }

  logout() {
    this.authServie.logout();
  }

  scrollToMustWatch() {
    const id = 'must-watch';
    const yOffset = -65;
    const element = document.getElementById(id);
    const y =
      element.getBoundingClientRect().top + window.pageYOffset + yOffset;

    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  scollToHome() {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }

  goToDontation() {
    window.scrollTo({ top: 0, left: 0 });
  }

  openGenereDialog() {
    if (this.isMobile) {
      this.dialog.open(GenreDialogComponent, {
        minHeight: '350px',
        width: '100%',
      });
    } else {
      this.dialog.open(GenreDialogComponent, {
        minHeight: '350px',
        width: '50%',
      });
    }
  }

  onWatchRandom() {
    // choose randomly from all time popular cached res
    this.apiService.cached_AllTime_Popular.subscribe((res) => {
      if (res) {
        let choosenAnime = res[Math.floor(Math.random() * res.length)];
        this.router.navigate(['video', choosenAnime.title]);
      }
    });
  }

  // get isShowAdsChecked state from localstorage if not exists create one and set to false as default
  /* getShowAdsState() {
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
    localStorage.setItem('isShowAdsChecked', `${currentState}`);
    this.reloadCurrentRoute()
  } */

  reloadCurrentRoute() {
    window.location.reload();
  }

  goAnime60fps() {
    this.router.navigate(['experiment']);
  }

  shareCurrentLink() {

  }

  setYear(year: number) {
    this.YEAR = year;
  }
  setSeason(season: string) {
    this.SEASON = season;
  }
  searchSelectedSeason() {
    this.selectSeason.selectYear(this.YEAR);
    this.selectSeason.selectSeason(this.SEASON);
    this.selectSeason.selectYear_Change.next(true);
    this.sidenav.close();
    this.router.navigate(['/browse/season']);
  }
}
