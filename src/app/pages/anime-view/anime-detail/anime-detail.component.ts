import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Subject } from 'rxjs';
import { AuthService } from 'src/app/@core/services/auth.service';
import { UserService } from 'src/app/@core/services/user.service';
import { WatchAnimeService } from 'src/app/@core/services/watch-anime.service';
import { SnackbarMessageComponent } from 'src/app/@theme/components/snackbar-message/snackbar-message.component';
import { WatchAnimeResult } from 'src/app/shared/interface';
import { Router } from '@angular/router';
import { TooltipPosition } from '@angular/material/tooltip';
import { BrowseService } from 'src/app/@core/services/browse.service';
import { MatDialog } from '@angular/material/dialog';
import { ShareButtonsComponent } from 'src/app/@theme/components/share-buttons/share-buttons.component';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-anime-detail',
  templateUrl: './anime-detail.component.html',
  styleUrls: ['./anime-detail.component.scss']
})
export class AnimeDetailComponent implements OnInit {
  selectedAnime: BehaviorSubject<WatchAnimeResult> = new BehaviorSubject(null);
  selectedAnimeGenere: BehaviorSubject<string[]> = new BehaviorSubject(null);
  isLoaded: BehaviorSubject<Boolean> = new BehaviorSubject(false);;
  isUser: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isMobile: boolean = false;
  is404: BehaviorSubject<Boolean> = new BehaviorSubject(false);
  toolTipPosition: TooltipPosition = 'right';
  toolTipText: string = 'Expand';
  isSynopsisExpanded: boolean = false;
  disableBtn: BehaviorSubject<boolean> = new BehaviorSubject(false);
  accepted_genres = ["Action", "Adventure", "Cars", "Comedy", "Dementia", "Demons", "Drama", "Dub", "Ecchi", "Fantasy", "Game", "Harem", "Historical", "Horror", "Josei", "Kids", "Magic", "Mecha", "Military", "Music", "Mystery", "Parody", "Police", "Psychological", "Romance", "Samurai", "School", "Sci-Fi", "Seinen", "Shoujo", "Shounen", "Space", "Sports", "Supernatural", "Thriller", "Vampire", "Yaoi", "Yuri"];
  private destroy$ = new Subject();
  
  @Output() changeAnimeTypeEvent = new EventEmitter<boolean>();

  constructor(
    public watchAnimeService: WatchAnimeService,
    private sanitizer: DomSanitizer,
    public snackBar: MatSnackBar,
    public userService: UserService,
    private authService: AuthService,
    public router: Router,
    public browseService: BrowseService,
    public  dialog: MatDialog
  ) {
    this.userService.isMobile.pipe(takeUntil(this.destroy$)).subscribe(
      isMobile => {
        if (isMobile) {
          this.isMobile = true;
        }
      }
    )
    /* detected state if user or guest  */
    this.authService.isUser_Change.pipe(takeUntil(this.destroy$)).subscribe(
      newState => {
        if (newState) {
          this.isUser.next(newState);
        } else {
          this.isUser.next(false);
        }
      },
      error => { console.log(error); }
    );


  };


  ngOnInit(): void {
    var nullC = 0;
    window.scrollTo({ left: 0, top: 0 });
    this.watchAnimeService.animeResult.pipe(takeUntil(this.destroy$)).subscribe(
      AnimeResult => {
        if (AnimeResult === null) {
          nullC++;
          this.is404.next(true);
          this.isLoaded.next(null);
        } else if (AnimeResult !== null && AnimeResult.length > 0) {
          this.is404.next(false);
          // parse genres if empty dont parse
          if (AnimeResult[0].genres.length > 0) {
            var generes = new String(AnimeResult[0].genres);
            var genereList = generes.split(',');
            // remove whitespace
            genereList = genereList.map(function (el) {
              return el.trim();
            });
  
            var cleaned_Genre = genereList.filter((item) => {
              if (this.accepted_genres.indexOf(item) !== -1) return item;
            });
  
            this.selectedAnimeGenere.next(cleaned_Genre);
          }

          this.isLoaded.next(true);
          this.selectedAnime.next(AnimeResult[0]);
          localStorage.setItem('img_url', AnimeResult[0].img);
          this.is404.next(false);
        } else if (AnimeResult && AnimeResult.length === 0) {
          this.is404.next(true);
          this.isLoaded.next(true);
        } else {
          this.isLoaded.next(true);
        }
      }
    );

    /* initilized buffer status */
    /* this.watchAnimeService.isLoaded.pipe(takeUntil(this.destroy$)).subscribe(
      state => {
        if (state === false) {
          //this.bufferTxt();
          // reset searchbar val 
         
        }
      }
    ); */

    this.watchAnimeService.watchAnimeState.pipe(takeUntil(this.destroy$)).subscribe(
      state => {
        if (state) {
          this.disableBtn.next(false);
        }
      }
    );

    // default auto watch
    this.watchAnime();
  }

  @HostListener('unloaded')
  ngOnDestroy(): void {
    setTimeout(() => {
      this.destroy$.next();
      this.destroy$.complete();
    },20);
  }

  getSantizeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  truncateOnWord(str: string, limit: number) {
      var trimmable = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u2028\u2029\u3000\uFEFF';
      var reg = new RegExp('(?=[' + trimmable + '])');
      var words = str.split(reg);
      var count = 0;
      return words.filter(function(word) {
          count += word.length;
          return count <= limit;
      }).join('');
    
}

  watchAnime() {
    this.watchAnimeService.watchAnimeState.next(true);
    this.disableBtn.next(true);
  }

  btnDisabledMsg() {
    this.snackbarMessage('Please no spaming');
  }

  snackbarMessage(_message: string, _duration: number = 1500) {
    this.snackBar.openFromComponent(SnackbarMessageComponent, {
      duration: _duration,
      data: {
        message: _message
      }
    })
  }

  addToPlanToWatch() {
    //anime.LIST = 'plan_to_watch';

    this.userService.addItemToListByTitle().pipe(takeUntil(this.destroy$)).subscribe(
      result => {
        if (result.success) {
          this.snackbarMessage(result.message);
          this.userService.listEdit_change.next(!this.userService.listEdit);
        } else {
          this.snackbarMessage(result.message);
        }
      },
      error => {
        console.log(error);
      }
    )
  };


  /* bufferTxt() {
    var statusTxt = ['sumbitted 🔎. . .', 'filtering ads 🧹. . .', 'gathering. . .'];
    var counter = 0;
    var delayAmount = [5, 5, 5];
    function count(num) {
      setTimeout(function () {
        var el = document.getElementById('status-txt');
        if (el) {
          el.innerText = statusTxt[counter++]
          if (num > 0) count(num - 1);
        }
      }, delayAmount[counter]);
    }
    count(2);
  } */

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  showAllSynopsis() {
    let el = (<HTMLElement>document.getElementById('anime-synopsis'));
    this.isSynopsisExpanded = !this.isSynopsisExpanded;
    this.toolTipText = this.isSynopsisExpanded ? 'Collapse' : 'Read More';

    if (this.isSynopsisExpanded) {
      el.classList.add('show-all-synopsis');
    } else {
      el.classList.remove('show-all-synopsis');
    }
  }

  changeAnimeType() {
    this.changeAnimeTypeEvent.emit(true);
  }

  setGenre(genre: any) {
    this.browseService.currentGenreType.next(genre);
    if (this.router.url !== '/browse/genre') {
      this.router.navigate(['/browse/genre']);
    }
  }

  shareCurrentLink() {
    this.dialog.open(ShareButtonsComponent, {
      data: {
        ShareTitle: localStorage.getItem('animeTitle'),
        ShareLink: window.location.href,
        ShareContainerTitle: 'Share This Anime'
      }
    });
  }


}

