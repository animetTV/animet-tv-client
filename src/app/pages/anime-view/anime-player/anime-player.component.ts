import { Component, ElementRef, EventEmitter, HostListener, Inject, OnDestroy, Output, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition, } from '@angular/material/snack-bar';
import { DomSanitizer } from "@angular/platform-browser";
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { WatchAnimeService } from 'src/app/@core/services/watch-anime.service';
import { SnackbarMessageComponent } from 'src/app/@theme/components/snackbar-message/snackbar-message.component';
import { EpisodesEntity, EpisodeStream, jwplayerMP4SourceItem, Link, /* ServersEntity, */ WatchAnimeResult } from 'src/app/types/interface';
import { filter, map, shareReplay, skip, take, takeUntil } from 'rxjs/operators'
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { UserService } from 'src/app/@core/services/user.service';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { ApiService } from 'src/app/@core/services/api.service';
import { DOCUMENT } from '@angular/common';
import { AuthService } from 'src/app/@core/services/auth.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomSheetComponent } from './bottom-sheet/bottom-sheet.component';
import { environment } from 'src/environments/environment';
import { MatTabChangeEvent } from '@angular/material/tabs';

declare var jwplayer: any;

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
  transform(url: any) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'app-anime-player',
  templateUrl: './anime-player.component.html',
  styleUrls: ['./anime-player.component.scss']
})
export class AnimePlayerComponent implements OnDestroy {
  selectedAnime: BehaviorSubject<WatchAnimeResult[]> = new BehaviorSubject(null);
  // selectedEpisodeServers: BehaviorSubject<ServersEntity[]> = new BehaviorSubject(null);
  selectedEpisodeServers: BehaviorSubject<EpisodeStream> = new BehaviorSubject(null);
  episodeServers: BehaviorSubject<Link[]> = new BehaviorSubject(null);

  episodes_dub: BehaviorSubject<EpisodesEntity[]> = new BehaviorSubject<EpisodesEntity[]>(null);
  episodes_sub: BehaviorSubject<EpisodesEntity[]> = new BehaviorSubject<EpisodesEntity[]>(null);

  safeStreamURL: BehaviorSubject<string> = new BehaviorSubject(null);

  episodeSelection: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showEpisodes: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showPlayer: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showPlayer1: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showPlayer2: BehaviorSubject<boolean> = new BehaviorSubject(false);
  animeType: BehaviorSubject<boolean> = new BehaviorSubject(false);
  playerBuffering: BehaviorSubject<boolean> = new BehaviorSubject(false);
  noEpisodeAvailable: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isDubAvailable: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isSubAvailable: BehaviorSubject<boolean> = new BehaviorSubject(true);
  showServerOptions: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingEpisodeSection: BehaviorSubject<boolean> = new BehaviorSubject(false);
  /* isBrave: boolean = this.getIsBrave();; */
  /* isChrome: boolean = this.getIsChrome(); */
  autoPlay: boolean;
  theaterMode: boolean = false;
  fullscreenMode: boolean = false;
  showAnimetIntro: BehaviorSubject<boolean> = new BehaviorSubject(false);
  animetIntroPlayerState: boolean =false;
  private destroy$ = new Subject();

  currentEpisode: number = 0;
  CurrentEpisodeNumber: number = 0; // episode number html val
  currentEpisodeView: BehaviorSubject<Number> = new BehaviorSubject(null);
  currentServer: number = 0;
  maxEpisodes_dub: number = 0;
  maxEpisodes_sub: number = 0;

  selectedOption = '';
  currentTimeStamp: number = null;
  defaultServerURL: string = '';
  currentVolume: number = 1.0;
  initalIntorPlayed: boolean = false;
  isIframeBackup_available: BehaviorSubject<boolean> = new BehaviorSubject(false);
  iframeBackup_src: string = "";
  iframeBackup_src_v2: string = "";
  isUser: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
  isCrunchyRoll_available: BehaviorSubject<boolean> = new BehaviorSubject(this.getStorageIsCR());
  isDownload_available: BehaviorSubject<boolean> = new BehaviorSubject(false);

  internalPlayer2Source: BehaviorSubject<jwplayerMP4SourceItem[]> = new BehaviorSubject(null);
  showInternalPlayer2: BehaviorSubject<boolean> = new BehaviorSubject(false);
  sandboxOn: BehaviorSubject<boolean> = new BehaviorSubject(false);

  current_img_url: string = localStorage.getItem('img_url');
  @ViewChild("video_player") video_player: ElementRef;
  @ViewChild("animet_intro_player") animet_intro_player: ElementRef;
  // get the component instance to have access to plyr instance
  /* @ViewChild(PlyrComponent)
  plyr: PlyrComponent; */
  // or get it from plyrInit event
  /* player: Plyr;
  hlsjsDriver = new HlsjsPlyrDriver(true); */
  sourceType: BehaviorSubject<string> = new BehaviorSubject(null);
  /* videoSources: BehaviorSubject<Plyr.Source[]> = new BehaviorSubject(null); */
  //isShowAdsChecked: boolean = this.getShowAdsState();
  //@ViewChild('episode_number') episode_number: ElementRef;  animet_intro_player
  @Output() episodeSelected = new EventEmitter<Number>();

  animeTitle: string = this.getStorageLastAnimeTitle();
  views: BehaviorSubject<string> = new BehaviorSubject(null);
  isSafari: BehaviorSubject<boolean> = new BehaviorSubject(this.getIsSafari());
  CRID: BehaviorSubject<string> = new BehaviorSubject(null);
  currentURL: string = '';
  isBuffering : BehaviorSubject<boolean> = new BehaviorSubject(true);
  constructor(
    public sanitizer: DomSanitizer,
    public watchAnimeService: WatchAnimeService,
    public snackBar: MatSnackBar,
    public router: Router,
    private userService: UserService,
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver,
    private apiService: ApiService,
    /* private renderer2: Renderer2, */
    @Inject(DOCUMENT) private _document,
    /*  private route: ActivatedRoute, */
    private _bottomSheet: MatBottomSheet
  ) {
    this.watchAnimeService.isBuffering.pipe(takeUntil(this.destroy$)).subscribe(
      state => {
        this.isBuffering.next(state);
      }
    )
    this.currentURL = environment.baseUrl+ `video/` + this.animeTitle ; 

    this.watchAnimeService.availableSources.pipe(takeUntil(this.destroy$)).subscribe(
      aList => {
        if (aList) {
          aList.forEach(el => {
            if (el.sourceType === 'crunchyroll') {
              this.isCrunchyRoll_available.next(true);
              this.CRID.next(el.id);
            }

          });
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

    /* on route change reset */
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (!(event['url'].includes('/video'))) {
          this.reset();
        }
      }
    });

    /* on page refresh */

    this.router.events
      .pipe(filter((rs): rs is NavigationEnd => rs instanceof NavigationEnd))
      .subscribe(event => {
        if (
          event.id === 1 &&
          event.url === event.urlAfterRedirects
        ) {
          console.log('page has been refreshed');
          //this.reset();

        }
      });

    this.watchAnimeService.animeResult.pipe(takeUntil(this.destroy$)).subscribe(
      AnimeResult => {
        if (AnimeResult !== null && AnimeResult.length > 0) {
          this.selectedAnime.next(AnimeResult);
          this.noEpisodeAvailable.next(false);

          // check if dub available 
          if (AnimeResult.length > 1) {
            this.isDubAvailable.next(true);

            if (localStorage.getItem('animeTitle').includes("(Dub)")) {
              this.isSubAvailable.next(false);
            }

            // create episodes array so its compatibil with Gapi
            var id = localStorage.getItem('id-dub');

            // populate dub
            this.maxEpisodes_dub = Number(AnimeResult[1].totalepisode);

            this.episodes_dub.next(AnimeResult[1].episodes);

            this.maxEpisodes_dub = AnimeResult[1].totalepisode;
            this.watchAnimeService.totalEp = this.maxEpisodes_dub;


            // populate sub
            tmpEpisodes = [];
            var id = localStorage.getItem('id-sub');

            this.maxEpisodes_sub = Number(AnimeResult[0].totalepisode);
            this.episodes_sub.next(AnimeResult[0].episodes);
            

            this.watchAnimeService.animeType.next(true);
          } else {
            this.isDubAvailable.next(false);

            // create episodes array so its compatibil with Gapi
            var tmpEpisodes = [];
            var id = localStorage.getItem('id-sub');

            this.maxEpisodes_sub = Number(AnimeResult[0].totalepisode);
            for (let i = 0; i < Number(AnimeResult[0].totalepisode); i++) {
              let epNum = i + 1;
              tmpEpisodes.push({
                id: `${id}-episode-${epNum}`,
                isFiller: AnimeResult[0].episodes[i]?.isFiller
              });
            }

            this.episodes_sub.next(tmpEpisodes);
            this.watchAnimeService.animeType.next(false);
          }

        } else if (AnimeResult === null && this.episodeSelection.value) {
          this.snackbarMessage('sorry no episodes are available right now, make a request on our discord server', 6000);

        }
      },
    );

    /* LISTEN EPISODE STREAM */
    this.watchAnimeService.episodeResult.pipe(takeUntil(this.destroy$)).subscribe(
      EpisodeResult => {
        if (EpisodeResult && EpisodeResult.links.length === 0) { // if result empty src
          /* this.showPlayer.next(true);     
          this.playerBuffering.next(false);  */
          // switch to gogoanime 

          /* setTimeout(() => {
            this.switchToExternalPlayer();
          }, (10));   */

        } else if (EpisodeResult && EpisodeResult.links[0].iframe) { // Set External Player

          this.showPlayer.next(true);
          this.playerBuffering.next(false);
          setTimeout(() => {
            this.switchToExternalPlayer();
          }, (10));
        } else if (EpisodeResult !== null) { // Set Internal Player
          // this.selectedEpisodeServers.next(EpisodeResult);
          // set default server  
          this.showPlayer.next(true);

          let MP4_SRC = "";
          let HLS_SRC = "";
          let IFRAME_SRC = "";

          // check for hls src and iframe src 
          EpisodeResult.links.forEach(el => {
            if (el.size.includes('HLS')) { // HLS Stream check
              HLS_SRC = el.src;
            } else if (el.iframe) { // Iframe stream check
              this.isIframeBackup_available.next(true);
              this.iframeBackup_src = el.src;

              IFRAME_SRC = el.src;
            } else if (el.size.includes("HDP") || el.size.includes("High Speed")) { // Regular mp4 check
              MP4_SRC = el.src;
            }
          });

          // ORDER HLS -> HDP -> IFRAME
          if (HLS_SRC.length > 0 && HLS_SRC.includes("m3u8")) {
            this.defaultServerURL = HLS_SRC;
            this.sourceType.next("hls");
            this.showPlayer1.next(true);
          } else if (MP4_SRC.length > 0) {
            this.defaultServerURL = MP4_SRC;
            this.sourceType.next("mp4");
            this.showPlayer2.next(false)
            this.showPlayer1.next(true);
          } else if (IFRAME_SRC.length > 0) {
            this.defaultServerURL = IFRAME_SRC;
            // hide animetTV JWPlayer if it exists
            let el = (<HTMLElement>document.getElementById('player'));
            if (el) {
              el.style.display = 'block';
            }

            this.showPlayer2.next(true);
            setTimeout(() => {
              this.switchToExternalPlayer();
            }, (10));

          }

          this.playerBuffering.next(false);
          this.safeStreamURL.next(this.defaultServerURL);

          /* exclude specific quality link */
          let filterLink: Link[] = [];
          EpisodeResult.links.forEach(el => {
            if (el.size === "FullHDP" || el.size === "SDP" || el.size === "External Player") {
              filterLink.push(el);
            }
          });
          this.episodeServers.next(filterLink);

        } else {
          this.showPlayer.next(false);
        }
      });

    this.watchAnimeService.isContinueWatchSelected.pipe(takeUntil(this.destroy$)).subscribe(
      state => {
        if (state) {
          this.watchAnimeService.watchAnimeState.next(true);
          /* let lastOpen: LastOpen = JSON.parse(localStorage.getItem('lastopen'));
          let episodeNumber = lastOpen.episodeNumber - 1; */
          let episodeNumber = this.watchAnimeService.currentEp;
          let type = this.watchAnimeService.animeType.getValue();
          
          /* this.isUser.pipe(takeUntil(this.destroy$)).subscribe(
            isLoggedIn => {
              if (isLoggedIn) {
                episodeNumber = this.watchAnimeService.currentEp - 1;
              }
            }
          ); */

          this.snackbarMessage('Wait... auto playing', 2000, 'right', 'bottom');

          this.selectedAnime.pipe(skip(1), takeUntil(this.destroy$)).subscribe(
            data => {
              if (data !== null && data.length > 0) {
                setTimeout(() => {
                  this.setEpisode(episodeNumber, type);
                }, 500)

              }
            }
          )
        } else {
          // on select set first episode
          this.selectedAnime.pipe(skip(1), takeUntil(this.destroy$)).subscribe(
            data => {
              if (data !== null && data.length > 0) {
                setTimeout(() => {
                  if (localStorage.getItem('lastSelectedEpisode') !== null) {
                    let lastAnimeTitle = this.getStorageLastAnimeTitle();
                    if (lastAnimeTitle) {
                      //this.setEpisode(episode, type);
                      this.setEpisode(0, false);

                    } else {
                      this.setEpisode(0, false);
                    }
                  } else {
                    this.setEpisode(0, false);
                  }
                }, 500)

              }
            }
          )
        }
      },
      error => {
        console.log(error);
        
      }
    );

    // get autoplay state from session
    this.watchAnimeService.autoPlay.pipe(takeUntil(this.destroy$)).subscribe(
      state => {
        this.autoPlay = state;
      }
    );

    this.watchAnimeService.animeType.pipe(takeUntil(this.destroy$)).subscribe(
      state => {
        this.animeType.next(state);
      }
    );

    // ios double tap zoom hack
/*     document.addEventListener('touchstart', () => { });
    document.addEventListener('touchend', () => { });
    document.addEventListener('touchcancel', () => { });
    document.addEventListener('touchmove', () => { }); */

    // buffer episode section while switching sourceType
    this.watchAnimeService.disableEpisodeSelect.pipe(takeUntil(this.destroy$)).subscribe(
      state => {
        this.isLoadingEpisodeSection.next(state);
        if (state) {
          this.showEpisodes.next(false);

          // remove iframe if its opened
          this.showPlayer2.next(false);

        } else {
          this.showEpisodes.next(true);
        }
      }
    );
  }

  @HostListener('unloaded')
  ngOnDestroy(): void {
    this.watchAnimeService.isBuffering.next(false);
    setTimeout(() => {
      this.destroy$.next();
      this.destroy$.complete();
      this.watchAnimeService.resetStreamIDS();
    }, 20);
  }

  getStorageLastAnimeTitle() {
    if (localStorage.getItem('animeTitle') !== null) {
      let animeTitle = localStorage.getItem('animeTitle');
      return animeTitle;
    }
  }
  getStorageLastType() {
    if (localStorage.getItem('currentType') !== null) {
      let lastCurrentType = localStorage.getItem('currentType');
      return (JSON.parse(lastCurrentType) === true);
    }
  }

  getStorageLastSelectedEpisode() {
    if (localStorage.getItem('lastSelectedEpisode') !== null) {
      let lastSelectedEpisode = localStorage.getItem('lastSelectedEpisode');
      return (JSON.parse(lastSelectedEpisode));
    }
  }

  getStorageIsCR(): boolean {
    if (localStorage.getItem('isCR') !== null) {
      let lastSelectedEpisode = localStorage.getItem('isCR');
      return (JSON.parse(lastSelectedEpisode) === true);
    } else {
      return false;
    }
  }

  getSanitizedUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  switchType(_type: boolean) {
    this.watchAnimeService.animeType.next(_type);
  }

  getSourceType() {
    if (localStorage.getItem('sourceType') !== null) {
      let type = localStorage.getItem('sourceType');
      return type;
    }
  }

  getCurrentType() {
    if (localStorage.getItem('currentType') !== null) {
      let type = localStorage.getItem('currentType');
      return type === "true";
    }
  }

  getIsSafari(): boolean {
    if (localStorage.getItem('isSafari') !== null) {
      let isSafari = localStorage.getItem('isSafari');
      return JSON.parse(isSafari) === true;
    }
  }


  // change internal 1 from CR to regular
  tabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
    if (tabChangeEvent.tab.textLabel === `DUB`) {
      this.isCrunchyRoll_available.next(false);
    } else if (tabChangeEvent.tab.textLabel === `SUB`) {
      this.CRID.subscribe(
        CRID => {
          if (CRID && CRID.length > 0) {
            this.isCrunchyRoll_available.next(true);
          }
        }
      )
    }
  }

  public setEpisode(index: number, type: boolean) {
   /*  this.videoSources.next(null); */
    /* this.currentServer = 0;
    this.showAnimetIntro.next(true); */
    this.showInternalPlayer2.next(false);
    this.episodeSelected.emit(index);
    this.playerBuffering.next(true);
    this.showPlayer.next(false);

    this.currentEpisode = index;
    this.CurrentEpisodeNumber = this.currentEpisode + 1;
    this.currentEpisodeView.next(this.CurrentEpisodeNumber);
    this.addEpisodeHighlight(this.currentEpisode, type);
    /* this.updateEpisodeTitle(index);  */

    if (this.getSourceType() === 'streamani') {
      this.showPlayer1.next(false);
      this.showPlayer2.next(true);
    } else if (this.getSourceType() === 'gogoanime') {
      this.showPlayer1.next(true);
      this.showPlayer2.next(false);
    }

    this.watchAnimeService.currentEp = index + 1;
    localStorage.setItem("lastSelectedEpisode", `${String(index)} `);
    localStorage.setItem("lastSelectedAnimeType", `${String(type)}`);
    this.isDownload_available.next(true);
    
      this.CRID.subscribe(
        CRID => {
          if (CRID && CRID.length > 0 && !type ) {
            let animeDetail = this.selectedAnime.getValue();
            this.watchAnimeService.intialGetSourcesID(animeDetail[0].episodes[index].id);
            //this.watchAnimeService.setEpisode(animeDetail[0].episodes[index].id, "client-side-vidstreaming", false);
            this.switchType(false);
            setTimeout(() => {
              this.setCRplayer();
            },10)
          } else {
            let animeDetail = this.selectedAnime.getValue();
            if (type) {
              this.watchAnimeService.intialGetSourcesID(animeDetail[1].episodes[index].id);
              //this.watchAnimeService.setEpisode(animeDetail[1].episodes[index].id, "client-side-vidstreaming");
              this.switchType(true);
            } else if (!type) {
              this.watchAnimeService.intialGetSourcesID(animeDetail[0].episodes[index].id);
              //this.watchAnimeService.setEpisode(animeDetail[0].episodes[index].id, "client-side-vidstreaming");
              this.switchType(false);
            }   
            this.setInternalVidStreaming();
          }
        })
       
      setTimeout(() => {
        this.scrollTo('player-wrapper');
      }, 10)
  
      this.watchAnimeService.startTracking();
      this.views.next("0");
      this.setViews();
    }

  setEpisodeServerSide() {
    let animeDetail = this.selectedAnime.getValue();
    let type = this.getCurrentType();
    let index = this.watchAnimeService.currentEp - 1;
    if (type) {
      this.watchAnimeService.setEpisode(animeDetail[1].episodes[index].id, "server-side");
      this.switchType(true);
    } else if (!type) {
      this.watchAnimeService.setEpisode(animeDetail[0].episodes[index].id, "server-side");
      this.switchType(false);
    }
    let el = (<HTMLElement>document.getElementById('player-title'));
    if (el) {
      el.innerText = "External Player 2 (Ads)";
    }
  }

  setInternalVidStreaming() {
    let playerFrame = (<HTMLElement>document.getElementById('player-frame'));
    if (playerFrame) {
      playerFrame.classList.remove('external-player');
    }
    this.showPlayer.next(false);
    this.showPlayer2.next(false);
    this.playerBuffering.next(true);
    this.showInternalPlayer2.next(false);
    let animeDetail = this.selectedAnime.getValue();
    let type = this.getCurrentType();
    let index = this.watchAnimeService.currentEp - 1;
    if (type) {
      this.watchAnimeService.setEpisode(animeDetail[1].episodes[index].id, "client-side-vidstreaming");
      this.switchType(true);
    } else if (!type) {
      this.watchAnimeService.setEpisode(animeDetail[0].episodes[index].id, "client-side-vidstreaming");
      this.switchType(false);
    }
  }

  setInternalProxy() {
    let playerFrame = (<HTMLElement>document.getElementById('player-frame'));
    if (playerFrame) {
      playerFrame.classList.remove('external-player');
    }
    this.showInternalPlayer2.next(false);
    this.showPlayer2.next(false);
    let animeDetail = this.selectedAnime.getValue();
    let type = this.getCurrentType();
    let index = this.watchAnimeService.currentEp - 1;
    if (type) {
      this.watchAnimeService.setEpisode(animeDetail[1].episodes[index].id, "client-side-proxy");
      this.switchType(true);
    } else if (!type) {
      this.watchAnimeService.setEpisode(animeDetail[0].episodes[index].id, "client-side-proxy");
      this.switchType(false);
    }
  }

  async setIframePlayer2() {
    this.sandboxOn.next(true);
    this.playerBuffering.next(true);
    this.delay(5);
    let url = `https://mplayer.sbs/default.php?id=${this.watchAnimeService.vidstreamID}`;

    this.defaultServerURL = url;

    // hide animetTV JWPlayer if it exists
    let el = (<HTMLElement>document.getElementById('player'));
    if (el) {
      el.style.display = 'block';
    }

    this.showPlayer2.next(true);

    this.showAnimetIntro.next(false);
    this.safeStreamURL.next(null);
    this.snackbarMessage('Switching to Internal Player 1 (NO ADS)', 1500, 'right', 'bottom');


    let playerFrame = (<HTMLElement>document.getElementById('player-frame'));
    if (playerFrame) {
      playerFrame.classList.add('external-player');
    }

    let JWPlayer = (<HTMLElement>document.getElementById('player'));
    if (JWPlayer) {
      JWPlayer.style.display = 'none';
      // stop session
      jwplayer('player').stop();
    }

    this.showPlayer1.next(false);
    this.showPlayer2.next(true);
    this.showServerOptions.next(false);
    this.safeStreamURL.next(this.defaultServerURL);
    await this.delay(5);
    this.playerBuffering.next(false);
    this.showInternalPlayer2.next(true);
  }
  async setInternalMplayer() {
    this.sandboxOn.next(true);
    this.playerBuffering.next(true);
    this.delay(5);
    let url = `https://aniplay.sbs/stream/${this.watchAnimeService.vidstreamID}`;
    
    this.defaultServerURL = url;

    // hide animetTV JWPlayer if it exists
    let el = (<HTMLElement>document.getElementById('player'));
    if (el) {
      el.style.display = 'block';
    }

    this.showPlayer2.next(true);

    this.showAnimetIntro.next(false);
    this.safeStreamURL.next(null);
    this.snackbarMessage('Switching to Internal Player 1 (NO ADS)', 1500, 'right', 'bottom');


    let playerFrame = (<HTMLElement>document.getElementById('player-frame'));
    if (playerFrame) {
      playerFrame.classList.add('external-player');
    }

    let JWPlayer = (<HTMLElement>document.getElementById('player'));
    if (JWPlayer) {
      JWPlayer.style.display = 'none';
      // stop session
      jwplayer('player').stop();
    }

    this.showPlayer1.next(false);
    this.showPlayer2.next(true);
    this.showServerOptions.next(false);
    this.safeStreamURL.next(this.defaultServerURL);
    await this.delay(5);
    this.playerBuffering.next(false);
    this.showInternalPlayer2.next(true);
  }


  setCRplayer() {
    let playerFrame = (<HTMLElement>document.getElementById('player-frame'));
    if (playerFrame) {
      playerFrame.classList.remove('external-player');
    }
    this.showInternalPlayer2.next(false);
    this.showPlayer2.next(false);
    this.CRID.pipe(takeUntil(this.destroy$)).subscribe(CRID => {
      if (CRID) {
        let url = `${environment.animetPlayer}foxanime.html?CRID=${CRID}K${this.currentEpisode + 1}`;
        let nl = {
          src: url, size: 'HLS', iframe: true
        }
        this.watchAnimeService.episodeResult_Change.next({ links: [nl] });
        this.defaultServerURL = url;
        this.safeStreamURL.next(this.defaultServerURL);
      }

    });

  }




  // DOES NOT FULLY WORK BREAKING
  /* async findAndswitchToExternalPlayer() {
    this.showAnimetIntro.next(false);
    this.safeStreamURL.next(null);
    this.snackbarMessage('Switching to external player', 3200, 'center', 'top');
    
     document.getElementById('player-frame').classList.add('external-player');

    this.showPlayer1.next(false);
    this.showPlayer2.next(true);
    this.showServerOptions.next(false);
    this.watchAnimeService.findWorkingSrc();
    this.watchAnimeService.episodeResult.subscribe(
      result => {
        // check if its external link
        if (result !== null && (result.links[0].src.includes('gogo-play.net'))) {
          this.defaultServerURL = result.links[0].src;
          this.safeStreamURL.next(this.defaultServerURL);
        }
      }
    )
    await this.delay(10);
    this.scrollTo('player');
    //this.checkExternalPlayerStatus();
  } */

  async switchToExternalPlayer() {
    this.sandboxOn.next(false);
    this.defaultServerURL = this.iframeBackup_src;

    // hide animetTV JWPlayer if it exists
    let el = (<HTMLElement>document.getElementById('player'));
    if (el) {
      el.style.display = 'block';
    }

    this.showPlayer2.next(true);

    this.showAnimetIntro.next(false);
    this.safeStreamURL.next(null);
    this.snackbarMessage('Switching to external player (NO ADS)', 2500, 'right', 'bottom');


    let playerFrame = (<HTMLElement>document.getElementById('player-frame'));
    if (playerFrame) {
      playerFrame.classList.add('external-player');
    }

    let JWPlayer = (<HTMLElement>document.getElementById('player'));
    if (JWPlayer) {
      JWPlayer.style.display = 'none';
      // stop session
      jwplayer('player').stop();
    }

    this.showPlayer1.next(false);
    this.showPlayer2.next(true);
    this.showServerOptions.next(false);
    this.watchAnimeService.episodeResult_Change.pipe(takeUntil(this.destroy$)).subscribe(
      result => {
        if (result) {
          // find link with iframe src 
          let links = result.links;
          for (let i = 0; i < links.length; i++) {
            if (links[i].iframe) {
              this.defaultServerURL = links[i].src;
              this.safeStreamURL.next(this.defaultServerURL);
              break;
            }
          }
        }

      }
    );

    await this.delay(10);
    this.scrollTo('player');
  }


  async checkInternalPlayerStatus() { }
  checkExternalPlayerStatus() {
    setTimeout(() => {
      let iframe = (<HTMLIFrameElement>document.getElementById('player2'));
      if (iframe === null) {
        console.log('external player fail to load');
        this.snackbarMessage('Switching back to Internal', 2000, 'center', 'top');
        let selectedOption = {
          value: 'FullHDP'
        }
        //this.changeServer(selectedOption);

        this.showAnimetIntro.next(true);
        this.showPlayer2.next(false);
        this.delay(50);
      }
    }, 1500)

  }

  reset() {
    this.episodeSelection.next(false);
    this.showEpisodes.next(false);
    this.showPlayer.next(false);
    this.playerBuffering.next(null);
    this.noEpisodeAvailable.next(false);
    this.isDubAvailable.next(false);
  }

  addEpisodeHighlight(id: number, type: boolean) {
    if (type) {
    /*   if (id < this.maxEpisodes_dub || id === this.maxEpisodes_dub) {
        //  highlight all ep before selected
        for (let i = 0; i < id; i++) {
          let id_name = this.getEpisodeID(i);
          let el = (<HTMLElement>document.getElementById(id_name));
          if (el) {
            el.classList.add('selected');
          }
        }

        //  unhighlight all ep after selected
        for (let i = id; i < this.maxEpisodes_dub; i++) {
          let id_name = this.getEpisodeID(i);
          let el = (<HTMLElement>document.getElementById(id_name));
          if (el) {
            el.classList.remove('selected');
          }
        }
      } */

    } else {
      /* if (id < this.maxEpisodes_sub || id === this.maxEpisodes_sub) {
        //  highlight all ep before selected
        for (let i = 0; i < id; i++) {
          let id_name = this.getEpisodeID(i);
          let el = (<HTMLElement>document.getElementById(id_name));
          if (el) {
            el.classList.add('selected');
          }
        }
      }
      //  unhighlight all ep after selected
      for (let i = id; i < this.maxEpisodes_sub; i++) {
        let id_name = this.getEpisodeID(i);
        let el = (<HTMLElement>document.getElementById(id_name));
        if (el) {
          el.classList.remove('selected');
        }
      } */
    }

    if (id > -1) {
      let id_name = this.getEpisodeID(id);
      let el = (<HTMLElement>document.getElementById(id_name));
      if (el) {
        el.classList.add('selected');
      }
    }
  }

  addHighlightFillerEpisodes(fillerEpisodes: any) {

  }

  snackbarMessage(_message: string, _duration: number = 1500, horizontalPos: MatSnackBarHorizontalPosition = 'right', verticalPos: MatSnackBarVerticalPosition = 'top', action?: string) {
    this.snackBar.openFromComponent(SnackbarMessageComponent, {
      duration: _duration,
      horizontalPosition: horizontalPos,
      verticalPosition: verticalPos,
      data: {
        message: _message,
        action: action
      }
    });
  }

  scrollTo(el: string, type: boolean = true) {
    const id = el;
    const yOffset = -200;
    const element = (<HTMLElement>document.getElementById(id));

    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      if (type) {
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: y, behavior: 'auto' });
      }
    }

  }

  /* updateEpisodeTitle(epNum: number) {
    if (epNum ) {
      let epNumber = epNum+1;    
      this.episode_number.nativeElement.innerHTML = `Ep: ${epNumber}`;
    }
  } */

  /* epsiode navigation */

  previousEpisode() {
    if (this.currentEpisode > 0) {
      let currentEpisodeID = localStorage.getItem('currentEpisodeID');
      if (currentEpisodeID !== null) {
        let type = currentEpisodeID.includes('dub');
        this.currentEpisode--;
        this.setEpisode(this.currentEpisode, type);
      }
    }

  }

  nextEpisode() {
      let nextEp = this.currentEpisode;
      nextEp += 1;
      let currentType = localStorage.getItem("currentType");
      if (currentType === 'true' && nextEp < this.maxEpisodes_dub) {
        this.currentEpisode += 1;
        this.setEpisode(this.currentEpisode, true);
      } else if (currentType === 'false' && nextEp < this.maxEpisodes_sub) {
        this.currentEpisode += 1;
        this.setEpisode(this.currentEpisode, false);
      }
    
  }

  getEpisodeID(id: number) {
    return `episode_${id}`;
  }
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  rstr2b64(input: string) {
    var b64pad = "";
    try { b64pad } catch (e) { b64pad = ''; }
    var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var output = "";
    var len = input.length;
    for (var i = 0; i < len; i += 3) {
      var triplet = (input.charCodeAt(i) << 16)
        | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0)
        | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
      for (var j = 0; j < 4; j++) {
        if (i * 8 + j * 6 > input.length * 8) output += b64pad;
        else output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F);
      }
    }
    return output;
  }

  setViews() {
    this.apiService.regularGET(`https://api.countapi.xyz/hit/animettv/${this.rstr2b64(this.animeTitle + this.currentEpisode)}`).subscribe(
      result => {
        if (result) {
          this.views.next(String(this.numberWithCommas(result.value)));
        }
      },
      error => {
        this.views.next('N/A');
      }
    );
  }

  numberWithCommas(x: Number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  async sbAnime() {
    this.sandboxOn.next(true);
    this.playerBuffering.next(true);
    this.delay(5);
    let url = `https://animepl.xyz/v/${this.watchAnimeService.fembedID}`

    this.defaultServerURL = url;

    // hide animetTV JWPlayer if it exists
    let el = (<HTMLElement>document.getElementById('player'));
    if (el) {
      el.style.display = 'block';
    }

    this.showPlayer2.next(true);

    this.showAnimetIntro.next(false);
    this.safeStreamURL.next(null);
    this.snackbarMessage('Switching to Internal Player 3 (NO ADS)', 2000, 'right', 'bottom');


    let playerFrame = (<HTMLElement>document.getElementById('player-frame'));
    if (playerFrame) {
      playerFrame.classList.add('external-player');
    }

    let JWPlayer = (<HTMLElement>document.getElementById('player'));
    if (JWPlayer) {
      JWPlayer.style.display = 'none';
      // stop session
      jwplayer('player').stop();
    }

    this.showPlayer1.next(false);
    this.showPlayer2.next(true);
    this.showServerOptions.next(false);
    this.safeStreamURL.next(this.defaultServerURL);
    await this.delay(5);
    this.playerBuffering.next(false);
    this.showInternalPlayer2.next(true);
  }

  async gdriveplayer() {
    this.sandboxOn.next(true);
    this.playerBuffering.next(true);
    this.delay(5);

    let url = `https://gdriveplayer.xyz/embed2/?id=https%3A%2F%2Ffembed.com%2Fv%${this.watchAnimeService.fembedID}&aid=https%3A%2F%2Fstreamsb.net%${this.watchAnimeService.streamSB_ID}&poster=https%3A%2F%2Fimg.animet.site%2Ffile%2Fanimettv-avatars%2Fother%2Fanimet-tv_chibi_1.png&lang%5B0%5D=Default&sub%5B0%5D=&host=fembed&ahost=streamsb`;
    this.defaultServerURL = url;

    // hide animetTV JWPlayer if it exists
    let el = (<HTMLElement>document.getElementById('player'));
    if (el) {
      el.style.display = 'block';
    }

    this.showPlayer2.next(true);

     this.showAnimetIntro.next(false);
    this.safeStreamURL.next(null);
    this.snackbarMessage('Switching to Internal Player 3 (NO ADS)', 2000, 'right', 'bottom');


    let playerFrame = (<HTMLElement>document.getElementById('player-frame'));
    if (playerFrame) {
      playerFrame.classList.add('external-player');
    }

    let JWPlayer = (<HTMLElement>document.getElementById('player'));
    if (JWPlayer) {
      JWPlayer.style.display = 'none';
      // stop session
      jwplayer('player').stop();
    }

    this.showPlayer1.next(false);
    this.showPlayer2.next(true);
    this.showServerOptions.next(false);
    this.safeStreamURL.next(this.defaultServerURL);
    await this.delay(5);
    this.playerBuffering.next(false);
    this.showInternalPlayer2.next(true);
  }
  async internalPlayer2() {
    this.watchAnimeService.isBuffering.next(true);
    this.showPlayer2.next(false);
    this.showPlayer.next(false);
    await this.delay(5);
    this.playerBuffering.next(true)
    this.watchAnimeService.getAnime2().subscribe(
      source => {
        this.showPlayer.next(true);
        if (source && typeof source !== 'undefined') {
          let src = source[0].file;
          this.sandboxOn.next(false);
          this.playerBuffering.next(true);
          this.delay(5);
          let url = `https://internal.animet.site/?m3u8=${src}`

          this.defaultServerURL = url;

          // hide animetTV JWPlayer if it exists
          let el = (<HTMLElement>document.getElementById('player'));
          if (el) {
            el.style.display = 'block';
          }

          this.showPlayer2.next(true);

          this.showAnimetIntro.next(false);
          this.safeStreamURL.next(null);
          this.snackbarMessage('Switching to Internal Player 2 (NO ADS)', 2000, 'right', 'bottom');


          let playerFrame = (<HTMLElement>document.getElementById('player-frame'));
          if (playerFrame) {
            playerFrame.classList.add('external-player');
          }

          let JWPlayer = (<HTMLElement>document.getElementById('player'));
          if (JWPlayer) {
            JWPlayer.style.display = 'none';
            // stop session
            jwplayer('player').stop();
          }

          this.showPlayer1.next(false);
          this.showPlayer2.next(true);
          this.showServerOptions.next(false);
          this.safeStreamURL.next(url);
          this.playerBuffering.next(false);
          this.showInternalPlayer2.next(true);
          this.watchAnimeService.isBuffering.next(false);

        } else {
          this.watchAnimeService.isBuffering.next(false);
          this.snackbarMessage('Internal 2 faild switching to 1');
          this.setInternalProxy();
        }
      }, error => {
        this.watchAnimeService.isBuffering.next(false);
        this.snackbarMessage('Internal 2 faild switching to 1');
        this.setInternalProxy();
      }
    )

    await this.delay(2);
  }

  openBottomSheetDownload(): void {
    let proxy_list = environment.limitedNodes;
        let proxyNode = ``;
        if (proxy_list.length > 0) {
          proxyNode = `${proxy_list[Math.floor(Math.random() * proxy_list.length)].url}`
        } else {
          proxyNode = `https://cors-anywhere-zeuz-na.herokuapp.com/`
        }
    this._bottomSheet.open(BottomSheetComponent, {
      data: [
        {
          label: 'FembedHD',
          url: `${proxyNode}https://fembed-hd.com/f/${this.watchAnimeService.fembedID}`,
          ads: false
        },
        {
          label: 'StreamSB',
          url: `https://sbplay2.com/d/${this.watchAnimeService.streamSB_ID}`,
          ads: true
        }
      ]
    });
  }

}
