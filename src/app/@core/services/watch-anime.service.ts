import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { SnackbarMessageComponent } from 'src/app/@theme/components/snackbar-message/snackbar-message.component';
import { ContinueWatching_ItemAdd, EpisodeStream, jwplayerMP4SourceItem, LastOpen, Link, WatchAnimeResult } from 'src/app/types/interface';
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class WatchAnimeService {
  animeResult_Change: BehaviorSubject<WatchAnimeResult[]> = new BehaviorSubject(
    null
  );
  public animeResult = new Subject<WatchAnimeResult[]>();

  episodeResult_Change: BehaviorSubject<EpisodeStream> = new BehaviorSubject(
    null
  );
  public episodeResult = new Subject<EpisodeStream>();

  watchAnimeState: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoaded: BehaviorSubject<Boolean> = new BehaviorSubject<Boolean>(false);
  isContinueWatchSelected: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );

  animeTitle: string;
  animeEpisodeID: string;
  animeType: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  qualified_continue_watching: boolean = false;
  episodeCurrentTimeStamp: number = 0;
  totalEp: number = 0;
  currentEp: number = 0;
  currentVolumn: BehaviorSubject<number> = new BehaviorSubject(0.75);
  autoPlay: BehaviorSubject<boolean> = new BehaviorSubject(false);

  disableEpisodeSelect: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private setEpisodeSubject = new Subject<any>();
  setEpisodeObservable = this.setEpisodeSubject.asObservable();

  isBuffering: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isFembedAvailable: BehaviorSubject<boolean> = new BehaviorSubject(false);
  fembedID: string;
  streamSB_ID: string;
  vidstreamID: string;
  vidstreaming_Iframe_URL: string;

  availableSources: BehaviorSubject<any[]> = new BehaviorSubject(null);

  constructor(
    public apiService: ApiService,
    private router: Router,
    private userService: UserService,
    public snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {
    this.animeResult_Change.subscribe((newData) => {
      this.animeResult.next(newData);
    });

    this.episodeResult_Change.subscribe((newData) => {
      this.episodeResult.next(newData);
    });

    //this.animeTitle = localStorage.getItem("animeTitle");

    this.animeType.subscribe((type) => {
      localStorage.setItem('currentType', String(type));
    });
    /* cancel counter if route changes */
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (!event['url'].includes('/video')) {
          /* user not on /video anymore add 
                    add current anime to contine_watching list 
                    if it qualified    
                    */
          this.saveWatchState();
          localStorage.removeItem('animeTitle');
        }
      }
    });

    this.setPlayerVolume();
  }

  setPlayerVolume() {
    if (localStorage.getItem('playerVolume')) {
      this.currentVolumn.next(Number(localStorage.getItem('playerVolume')));
    } else {
      localStorage.setItem(
        'playerVolume',
        String(this.currentVolumn.getValue())
      );
    }
  }

  changePlayerVolume(volumeAmount: number) {
    localStorage.setItem('playerVolume', String(volumeAmount));
    this.currentVolumn.next(volumeAmount);
  }

  setPlayerAutoPlay(state: boolean) {
    if (state) {
      this.autoPlay.next(state);
      localStorage.setItem('playerAutoPlay', 'true');
    } else if (!state) {
      this.autoPlay.next(state);
      localStorage.setItem('playerAutoPlay', 'false');
    }
  }

  getPlayerAutoPlay(): boolean {
    let playerAutoPlay = localStorage.getItem('playerAutoPlay');
    if (playerAutoPlay !== null) {
      return playerAutoPlay.includes('true');
    }
  }

  getAnimeDetail(animeTitle: string) {
    this.apiService.getAnimeDetail(animeTitle).subscribe(
      (result) => {
        if (result) {
          this.animeResult_Change.next(result);
          this.isLoaded.next(true);

          if (result.length > 1) {
            localStorage.setItem('id-sub', result[0].id_sub);

            if (result[1].id_dub !== undefined) {
              localStorage.setItem('id-dub', result[1].id_dub);
            }
          } else if (result) {
            // if only sub
            localStorage.setItem('id-sub', result[0].id_sub);
          }
          this.disableEpisodeSelect.next(false);
          this.isBuffering.next(false);
        } else {
          this.animeResult_Change.next(null);
          this.isLoaded.next(true);
          this.isBuffering.next(false);
        }
      },
      (error) => {
        this.isBuffering.next(false);
        console.log(error);
        this.animeResult_Change.next(null);
        this.isLoaded.next(true);
        this.snackbarMessage(
          `Sorry we could not find Anime: ${animeTitle}`,
          3000
        );
      }
    );
  }

  getAnimeEpisode(episodeID: string) {
    this.isBuffering.next(true);
    localStorage.setItem('currentEpisodeID', episodeID);

    this.apiService.getAnimeEpisode(episodeID).subscribe(
      (episodeResult) => {
        if (episodeResult) {
          this.isBuffering.next(false);

          this.episodeResult_Change.next(episodeResult);
        }
      },
      (error) => {
        // switch to external
        this.isBuffering.next(false);
        console.log(error);
        if (error.status === 404) {
          // this.setExternalPlayer();
          this.snackbarMessage('Please try another stream source', 4000);
        }
      }
    );
  }

  setCurrnetAnime(animeTitle: string) {
    this.isBuffering.next(true);
    this.animeTitle = animeTitle;
    this.isLoaded.next(false);
    /* save current anime to watch on local storage for page refresh */
    localStorage.setItem('animeTitle', animeTitle);
    this.getAnimeDetail(animeTitle);
  }

    setEpisode(episodeID: string, type: string, setSource: boolean = true) {
        localStorage.setItem('currentEpisodeID', episodeID);
       if ( type === "client-side-vidstreaming") {
            this.getAnimeEpisodeExternalAPI(episodeID,`${environment.streamAPI}Episode/`,`vidstreaming`, setSource);

        } else if (type === "client-side-proxy") {
            this.getAnimeEpisodeExternalAPI(episodeID,`${environment.streamAPI}Episode/`,`proxy`, setSource);
        } else if (type === "server-side") {
            this.getAnimeEpisode(episodeID);
        }
    }

  reset() {
    localStorage.removeItem('id-sub');
    localStorage.removeItem('id-dub');
    localStorage.removeItem('animeTitle');
    localStorage.removeItem('currentEpisodeID');
    this.animeResult_Change.next(null);
    this.episodeResult_Change.next(null);
    this.animeType.next(null);
    this.watchAnimeState.next(false);
    this.animeTitle = '';
    this.animeEpisodeID = '';
    this.qualified_continue_watching = false;
    this.isContinueWatchSelected.next(false);
  }

  /* countdown to track if user watching current anime episode for more than x amount
       to determine wheter it should be added to continue watching list */
  startTracking() {
    this.saveWatchState();
    this.qualified_continue_watching = true;
    // remove old lastopen
  }

  saveWatchState() {
    // set sourceType to default
    localStorage.setItem('sourceType', 'gogoanime');
    if (this.qualified_continue_watching) {
      var currentType = localStorage.getItem('currentType');
      var _type = currentType === 'true';

      let _img_url = localStorage.getItem('img_url');

      // Store for continue watching local (lastopen)
      const lastOpenItem: LastOpen = {
        animeTitle: this.animeTitle,
        episodeNumber: this.currentEp,
        date: new Date(),
        img_url: _img_url,
        type: _type,
      };

      localStorage.setItem('lastopen', JSON.stringify(lastOpenItem));

      const addItemToContinueWatching_Request: ContinueWatching_ItemAdd = {
        animeTitle: this.animeTitle,
        img_url: _img_url,
        episodeNumber: this.currentEp,
        totalEpisode: this.totalEp,
        type: _type,
      };

      let user = localStorage.getItem('currentUser');
      if (user !== null) {
        // append item to continue watching
        this.userService
          .addItemToContinueWatching(addItemToContinueWatching_Request)
          .subscribe(
            (result) => {
              if (result.success) {
                //this.snackbarMessage(result.message, 250);
                this.userService.getUserContinueWatchList();
              } else {
                this.snackbarMessage(result.message, 6000);
              }
            },
            (error) => {
              this.snackbarMessage(error);
            }
          );
      }
    }
  }

  snackbarMessage(_message: string, _duration: number = 1000) {
    this.snackBar.openFromComponent(SnackbarMessageComponent, {
      duration: _duration,
      data: {
        message: _message,
      },
    });
  }

  // switch sourceType
  changeSourceType(sourceType: string) {
    localStorage.setItem('sourceType', sourceType);
    let animeTitle = localStorage.getItem('animeTitle');
    if (animeTitle) {
      this.setCurrnetAnime(animeTitle);
    }
  }

  callSetEpisode(index: number, type: boolean) {
    let request = {
      index: index,
      type: type,
    };

    this.setEpisodeSubject.next(request);
  }

  checkAvailableSources() {
    this.apiService.getAllAvailableSource_currentAnime().subscribe(
      (result) => {
        if (result) {
          this.availableSources.next(result);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getAnimeEpisodeExternalAPI(
    episodeID: string,
    externalApi: string,
    type: string = 'proxy',
    setSource: boolean = true
  ) {
    this.isBuffering.next(true);
    localStorage.setItem('currentEpisodeID', episodeID);
    var t0 = performance.now();

    let title = episodeID.split('-episode-');
    let _episodeNumber = title[1];
    let _title = title[0];

        const externalAPI_URL = externalApi;
        let externalPayloadURL = ``;

        externalPayloadURL = `${externalAPI_URL}${_title}/${_episodeNumber}`
        
        // fetch client side external sources
        this.apiService.regularGET(externalPayloadURL).subscribe(
            res => {
                if (res && res.length > 2) {
                    this.isBuffering.next(false);
                    // check if needed links available
                    if (res[0].hasOwnProperty('fembed')) {
                        this.isFembedAvailable.next(true);
                        let link4 = res[0].fembed.split('/');               
                        this.fembedID = link4.slice(-1)[0];
                    } 
                    if (res[0].hasOwnProperty('streamsb')) {
                        let link3 = res[0].streamsb.split('/'); 
                                      
                        this.streamSB_ID = link3.slice(-1)[0];
                    } 
                    if (res[0].hasOwnProperty('vidstreaming')) {
                        let link7 = res[0].vidstreaming.slice(-1)[0];
                        this.vidstreamID = link7;
                    }
                    if (res[0].hasOwnProperty('vidcdn')) {
                        let link7 = res[0].vidcdn.split("&token")[0];
                        this.vidstreamID = link7.splot("id=")[1];
                    }
                    
                    let source = res[0].vidstreaming;
                    let original = res[0].vidstreaming;
                    let vidstream_url = source;

          source = source.replace(
            'https://gogoplay4.com/streaming.php?id',
            'https://gogoplay.link/api.php?id'
          );
          this.apiService.cached_CorsAnyWhereList.subscribe((list) => {
            // if proxy node list empty
            if (list.length === 0) {
              this.apiService.getCorsAnyWhereList();
            }
            // use nearby node value to select proxys
            if (list) {
              let assignedNode = localStorage.getItem('nearby_node');
              let filteredList = list.filter((el) => {
                return el.continent === assignedNode;
              });
              if (filteredList.length > 0) {
                // randomly assing one of the cors everywhere proxys
                source = `${
                  filteredList[Math.floor(Math.random() * filteredList.length)]
                    .url
                }${source}`;
              } else {
                source = `${
                  list[Math.floor(Math.random() * list.length)].url
                }${source}`;
              }

              // shiro dead
              //this.vidstreaming_Iframe_URL = `${environment.animetPlayer}/plyr.html?vidstreaming=${vidstream_url}&nodeURL=${list[Math.floor(Math.random() * list.length)].url}`;

              // self extract
              const EPISODE_ID = localStorage.getItem('currentEpisodeID');
              const GOGO_EXTRACTOR_URL = `${environment.streamAPI}Episode/gogo-extractor?episode_id=${EPISODE_ID}`;

              this.apiService.regularGET(GOGO_EXTRACTOR_URL).subscribe(
                (res) => {
                  if (res) {
                    let nl: Link = {
                      src: res.sources[0].file,
                      size: 'HLS',
                      iframe: false
                    };
                    this.episodeResult_Change.next({ links: [nl] });
                  }
                }
              );

            }
          });
        } else {
          let payload_backup = `${environment.streamAPI}Episode/${_title}/${_episodeNumber}`;
          this.apiService.regularGET(payload_backup).subscribe((res) => {
            if (res) {
              this.isBuffering.next(false);
              // check if needed links available
              if (res.fembed) {
                this.isFembedAvailable.next(true);
                let link4 = res.fembed.split('/');
                this.fembedID = link4.slice(-1)[0];
              }
              if (res.streamsb) {
                let link3 = res.streamsb.split('/');

                this.streamSB_ID = link3.slice(-1)[0];
              }

              if (res.vidcdn) {
                let vidstream_url = res.vidcdn.split('&token')[0];
                vidstream_url = vidstream_url.split('id=')[1];
                this.vidstreamID = vidstream_url;
              }

              let source = res.vidcdn;
              let original = res.vidcdn;
              let vidstream_url = source;
              source = source.replace(
                'http://gogoplay4.com/embedplus?id',
                'https://gogoplay.link/api.php?id'
              );
              this.apiService.cached_CorsAnyWhereList.subscribe((list) => {
                // if proxy node list empty
                if (list.length === 0) {
                  this.apiService.getCorsAnyWhereList();
                }
                // use nearby node value to select proxys
                if (list) {
                  let assignedNode = localStorage.getItem('nearby_node');
                  let filteredList = list.filter((el) => {
                    return el.continent === assignedNode;
                  });
                  if (filteredList.length > 0) {
                    // randomly assing one of the cors everywhere proxys
                    source = `${
                      filteredList[
                        Math.floor(Math.random() * filteredList.length)
                      ].url
                    }${source}`;
                  } else {
                    source = `${
                      list[Math.floor(Math.random() * list.length)].url
                    }${source}`;
                  }
                   // self extract
                    const EPISODE_ID = localStorage.getItem('currentEpisodeID');
                    const GOGO_EXTRACTOR_URL = `${environment.streamAPI}Episode/gogo-extractor?episode_id=${EPISODE_ID}`;

                    this.apiService.regularGET(GOGO_EXTRACTOR_URL).subscribe(
                      (res) => {
                        if (res && res.sources != undefined) {
                          let nl: Link = {
                            src: res.sources.sources[0].file,
                            size: 'HLS',
                            iframe: false
                          };
                          this.episodeResult_Change.next({ links: [nl] });
                        }
                      }
                    );
                }
              });
            }
          });
        }
      },
      (error) => {
        console.log(error);
        let payload_backup = `${environment.streamAPI}Episode/${_title}/${_episodeNumber}`;
        this.apiService.regularGET(payload_backup).subscribe((res) => {
          if (res) {
            this.isBuffering.next(false);
            // check if needed links available
            if (res.fembed) {
              this.isFembedAvailable.next(true);
              let link4 = res.fembed.split('/');
              this.fembedID = link4.slice(-1)[0];
            }
            if (res.streamsb) {
              let link3 = res.streamsb.split('/');

              this.streamSB_ID = link3.slice(-1)[0];
            }

            if (res.vidcdn) {
              let vidstream_url = res.vidcdn.split('&token')[0];
              vidstream_url = vidstream_url.split('id=')[1];
              this.vidstreamID = vidstream_url;
            }

            let source = res.vidcdn;
            let original = res.vidcdn;
            let vidstream_url = source;
            source = source.replace(
              'http://gogoplay4.com/embedplus?id',
              'https://gogoplay.link/api.php?id'
            );
            this.apiService.cached_CorsAnyWhereList.subscribe((list) => {
              // if proxy node list empty
              if (list.length === 0) {
                this.apiService.getCorsAnyWhereList();
              }
              // use nearby node value to select proxys
              if (list) {
                let assignedNode = localStorage.getItem('nearby_node');
                let filteredList = list.filter((el) => {
                  return el.continent === assignedNode;
                });
                if (filteredList.length > 0) {
                  // randomly assing one of the cors everywhere proxys
                  source = `${
                    filteredList[
                      Math.floor(Math.random() * filteredList.length)
                    ].url
                  }${source}`;
                } else {
                  source = `${
                    list[Math.floor(Math.random() * list.length)].url
                  }${source}`;
                }

                // self extract
                const EPISODE_ID = localStorage.getItem('currentEpisodeID');
                const GOGO_EXTRACTOR_URL = `${environment.streamAPI}Episode/gogo-extractor?episode_id=${EPISODE_ID}`;

                this.apiService.regularGET(GOGO_EXTRACTOR_URL).subscribe(
                  (res) => {
                    if (res) {
                      let nl: Link = {
                        src: res.sources[0].file,
                        size: 'HLS',
                        iframe: false
                      };
                      this.episodeResult_Change.next({ links: [nl] });
                    }
                  }
                );
              }
            });
          }
        });
      }
    );
  }

  intialGetSourcesID(
    episodeID: string,
    externalApi: string = `${environment.streamAPI}/Episode`
  ) {
    this.isBuffering.next(true);
    localStorage.setItem('currentEpisodeID', episodeID);

    let title = episodeID.split('-episode-');
    let _episodeNumber = title[1];
    let _title = title[0];

        const externalAPI_URL = externalApi;
        let externalPayloadURL = ``;
        externalPayloadURL = `${externalAPI_URL}${_title}/${_episodeNumber}`
        
        // fetch client side external sources
        this.apiService.regularGET(externalPayloadURL).subscribe(
            res => {
                if (res && res.length > 2) {
                    this.isBuffering.next(false);
                    // check if needed links available
                    if (res[0].hasOwnProperty('fembed')) {
                        this.isFembedAvailable.next(true);
                        let link4 = res[0].fembed.split('/');               
                        this.fembedID = link4.slice(-1)[0];
                    } 
                    if (res[0].hasOwnProperty('streamsb')) {
                        let link3 = res[0].streamsb.split('/'); 
                                      
                        this.streamSB_ID = link3.slice(-1)[0];
                    } 
                    if (res[0].hasOwnProperty('vidstreaming')) {
                        let link7 = res[0].vidstreaming.slice(-1)[0];
                        this.vidstreamID = link7;
                    }
                    if (res[0].hasOwnProperty('vidcdn')) {
                        let link7 = res[0].vidcdn.split("&token")[0];
                        this.vidstreamID = link7.splot("id=")[1];
                    }
                    
                } else {
                    let payload_backup = `${environment.streamAPI}Episode/${_title}/${_episodeNumber}`;
                this.apiService.regularGET(payload_backup).subscribe(
                    res => {
                        if (res) {
                            this.isBuffering.next(false);
                            // check if needed links available
                            if (res.fembed) {
                                this.isFembedAvailable.next(true);
                                let link4 = res.fembed.split('/');               
                                this.fembedID = link4.slice(-1)[0];
                            } 
                            if (res.streamsb) {
                                let link3 = res.streamsb.split('/'); 
                                              
                                this.streamSB_ID = link3.slice(-1)[0];
                            }

              if (res.vidcdn) {
                let vidstream_url = res.vidcdn.split('&token')[0];
                vidstream_url = vidstream_url.split('id=')[1];
                this.vidstreamID = vidstream_url;
              }
            }
          });
        }
      },
      (error) => {
        console.log(error);
        let payload_backup = `${environment.streamAPI}Episode/${_title}/${_episodeNumber}`;
        this.apiService.regularGET(payload_backup).subscribe((res) => {
          if (res) {
            this.isBuffering.next(false);
            // check if needed links available
            if (res.fembed) {
              this.isFembedAvailable.next(true);
              let link4 = res.fembed.split('/');
              this.fembedID = link4.slice(-1)[0];
            }
            if (res.streamsb) {
              let link3 = res.streamsb.split('/');

              this.streamSB_ID = link3.slice(-1)[0];
            }
            if (res.vidcdn) {
              let vidstream_url = res.vidcdn.split('&token')[0];
              vidstream_url = vidstream_url.split('id=')[1];
              this.vidstreamID = vidstream_url;
            }
          }
        });
      }
    );
  }

  resetStreamIDS() {
    this.fembedID = null;
    this.streamSB_ID = null;
    this.vidstreamID = null;
    this.vidstreaming_Iframe_URL = null;
  }
}



