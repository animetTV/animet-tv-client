import { Component, HostListener, OnInit, Pipe, PipeTransform } from '@angular/core';
import { SynopsisDialogService } from '../../@core/services/synopsis-dialog.service';
import { MatDialog, } from '@angular/material/dialog';
import { LastOpen, Spotlight } from '../../shared/interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { SnackbarMessageComponent } from 'src/app/@theme/components/snackbar-message/snackbar-message.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/@core/services/user.service';
import { AuthService } from 'src/app/@core/services/auth.service';
import { WatchAnimeService } from 'src/app/@core/services/watch-anime.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import SwiperCore,  { Pagination, Autoplay } from 'swiper/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { ApiService } from 'src/app/@core/services/api.service';

// install Swiper modules
SwiperCore.use([Pagination, Autoplay]);


export interface Card  {
  postID?: string;
  title: string;
  img_url: string;
  score?: string;
  genre?: string;
  synopsis: string;
}

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url:any) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  /* index: number;
  current_feed: BehaviorSubject<Card[]> = new BehaviorSubject(null);
  isFeedAvailable: BehaviorSubject<boolean> = new BehaviorSubject(false) */;
  isSpotlightAvailable: BehaviorSubject<boolean> = new BehaviorSubject(false);
  addToList: boolean = false;
  isUser: BehaviorSubject<boolean> = new BehaviorSubject(null);
  isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject(null);
  isNSFW: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showBannerMessage: BehaviorSubject<boolean> = new BehaviorSubject(true);
  spotLight: BehaviorSubject<Spotlight[]> = new BehaviorSubject(null);

  deferredPrompt: any;
  showButton = false;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  @HostListener('window:beforeinstallprompt', ['$event'])
  onbeforeinstallprompt(e) {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    this.deferredPrompt = e;
    //this.showButton = true;
  }


  constructor( 
    /* private feedService: FeedService,  */
    public synopsisService: SynopsisDialogService, 
    public dialog: MatDialog,
    public userService: UserService,
    public snackBar: MatSnackBar, 
    private authService: AuthService,
    public router: Router,
    public watchAnimeService: WatchAnimeService,
    private cookieService: CookieService,
    private breakpointObserver: BreakpointObserver,
    private apiService: ApiService,
    private titleService: Title) {
    this.titleService.setTitle("AnimetTV - Watch for free");
    
    localStorage.removeItem('currentEpisodeID');
    apiService.cached_Spotlight.pipe(distinctUntilChanged()).subscribe(
      data => {
        if (data) {
          this.isSpotlightAvailable.next(true);
          this.spotLight.next(this.shuffle(data));
        }
      }
    )

   /*  this.feedService.indexChange.subscribe( currentIndex => {
      this.index = currentIndex;
      this.synopsisService.closeDialog();
    });

    

      // animet feed are not done yet
    this.feedService.cached_Feed.subscribe(
      new_feed_data => {
        if (new_feed_data) {
          this.current_feed.next(new_feed_data.splice(170));
          this.index = this.feedService.index.valueOf();
          this.feedService.isFeedAvailable.next(true);
          this.isFeedAvailable.next(true);
        }
      },
      error => {
        if (error.status === 404) {
          this.feedService.isFeedAvailable.next(false);
          this.isFeedAvailable.next(false);
        }
      });


    this.feedService.nsfwValue_Change.subscribe(
      nsfw_value => {
        if (nsfw_value) {
          this.isNSFW.next(true);
          this.feedService.loadMoreFeed('top').subscribe(
            new_feed_data => {
              this.current_feed.next(new_feed_data);
            }
          );
        } else {
          this.isNSFW.next(false);
          this.feedService.loadMoreFeed('top').subscribe(
            new_feed_data => {
              this.current_feed.next(new_feed_data.splice(170));
            }
          );
        }
      }
    ) */

    /* // Open dialog when its isOpen is true
    this.synopsisService.isOpen_Change.subscribe( newState => {
      if (newState) {
        this.openDialog();
      }
    }); */

    /* detected state if user or guest  */
    this.authService.isUser_Change.pipe(distinctUntilChanged()).subscribe(
      newState => {
        if (newState) {
          this.isUser.next(newState);
        } else {
          this.isUser.next(false);
        }
      },
      error => { console.log(error); }
    );

    this.watchAnimeService.reset();
    localStorage.setItem('Gapi', 'false');
    localStorage.removeItem('img_url');
    this.userService.getUserContinueWatchList();
  }

  /* dazzleMe() {
    this.feedService.loadMoreFeed('random').subscribe(
      feed_data => {
        this.current_feed.next(feed_data.splice(170));
      }
    )
  }

  openNSFWLink() {
    let title = this.current_feed[this.index].title;
    title =  title.split(":").join("");
    title = title.split(/\s+/).join("-"); 
    title = title.toLowerCase();
    
    // check if its NSFW 
    if (this.feedService.nsfwValue) {
      title = 'https://'+ externalWebsites[0].DOMAIN + externalWebsites[0].EP + title;
    }
    window.open(title, '_blank');
  } */

  setAnime(anime: Spotlight) {
    if (anime.isAIContent) {
      this.router.navigate(['experiment/anime-60fps', anime.title]);
    } else {
      this.router.navigate(['video', anime.title]);
    }
  }
  /* To copy any Text */
/* copyText(){

  let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.current_feed[this.index].title;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  } */

  TruntcateTitle(title: string) {
    return title.substr(0, title.split(/[^\s]+/).length + 34)
  }

  TruncateScore(score: string) {
    return String(Number(score).toFixed(2));
  }

  TruncateSynopsis(synopsis: string) {
    if (synopsis && synopsis.length > 150) {
      //return synopsis.substr(0, synopsis.toString().split(/[^\s]+/).length + 5)
      return synopsis.replace(/^(.{150}[^\s]*).*/, "$1") +'...'
    }
  }

  TransformString(genre: string) {
    return genre.toString().replace(/[\[\]']+/g,'');
  }

  ngOnInit(): void {
    localStorage.removeItem('animeTitle');

    /* check local storage if any type user logged in */    
    if (localStorage.getItem('currentUser') === null) {
      this.isLoggedIn.next(false);
    } else {
      this.isLoggedIn.next(true);
    }
    
    this.setBannerMessageState();

    this.watchAnimeService.availableSources.next(null);
  }

  /* addToPlanToWatch() {
    //this.watchAnimeService.setCurrnetAnime(this.current_feed[this.index].title);
    this.userService.addItemToListByTitle().subscribe(
      result => {
        if (result.success) {
          this.snackbarMessage(result.message);
          this.addToList = !this.addToList;
          this.userService.listEdit_change.next(!this.userService.listEdit);
        } else {
          this.snackbarMessage(result.message);
        }
      },
      error => {
        console.log(error);
      }
    )
 } */

  snackbarMessage(_message: string, _duration: number = 1300){
    this.snackBar.openFromComponent(SnackbarMessageComponent, {
      duration: _duration,
      data: {
        message: _message
      }
    })
  }

  minimizePWAcontainer() {
    let expires = (new Date(Date.now() + 60 * 60 * 24 * 1000)); // expires in 24hrs
    this.cookieService.set('showBannerMsg','false',expires);
    this.showBannerMessage.next(false);
  }

  setBannerMessageState() {
    let cookie = this.cookieService.get('showBannerMsg');
    
    if (cookie === 'false') {
      this.showBannerMessage.next(false);
    } else {
      this.showBannerMessage.next(true);
    }
    
  }

  addToHomeScreen() {
    // hide our user interface that shows our A2HS button
    this.showButton = false;
    // Show the prompt
    if (this.deferredPrompt) {

      this.deferredPrompt.prompt();
    
      // Wait for the user to respond to the prompt
      this.deferredPrompt.userChoice
        .then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
            this.minimizePWAcontainer();
          } else {
            console.log('User dismissed the A2HS prompt');
          }
          this.deferredPrompt = null;
        });
    }
  }


  watchLastOpen(anime: LastOpen) {
    this.watchAnimeService.currentEp = anime.episodeNumber;
    this.watchAnimeService.animeType.next(anime.type);
    this.watchAnimeService.isContinueWatchSelected.next(true);
    this.router.navigate(['video', anime.animeTitle]);
  }
  scrollToMustWatch($event: boolean) {
    const id = 'must-watch';
    const yOffset = -65; 
    const element = document.getElementById(id);
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    
    window.scrollTo({top: y, behavior: 'smooth'});

  }

  shuffle(array: Spotlight[]) {
    var currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

  setExperimentAnime(title: string) {
    this.router.navigate(['experiment/anime-60fps', title])
  }



}
