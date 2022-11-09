import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, HostListener, OnInit, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
//import * as Plyr from 'plyr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, shareReplay, take, takeUntil } from 'rxjs/operators';
import { ExperimentAnimeTitles, ExperimentService } from 'src/app/@core/services/experiment.service';
import { Anime60fps } from '../../../@core/services/experiment.service';
import { Location } from '@angular/common';
import { ApiService } from 'src/app/@core/services/api.service';
import { AuthService } from 'src/app/@core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ShareButtonsComponent } from 'src/app/@theme/components/share-buttons/share-buttons.component';

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url:any) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
    selector: 'app-anime60fps',
    templateUrl: './anime-60fps.component.html',
    styleUrls: ['./anime-60fps.component.scss']
})
export class Anime60FpsComponent implements OnInit {
    isAdblockerOn: BehaviorSubject<boolean> = new BehaviorSubject(false);
    isDubAvailable: BehaviorSubject<boolean> = new BehaviorSubject(false);
    isLoadingEpisodeSection: BehaviorSubject<boolean> = new BehaviorSubject(false);
    showEpisodes: BehaviorSubject<boolean> = new BehaviorSubject(false);
    showPlayer: BehaviorSubject<boolean> = new BehaviorSubject(false);
    currentTitleData: BehaviorSubject<Anime60fps[]> = new BehaviorSubject(null);
    currentEpisode: number = 0;
    maxEpisodes_sub: number = 0;
    safeStreamURL: BehaviorSubject<string> = new BehaviorSubject(null);
    safeStreamDownloadURL: BehaviorSubject<string> = new BehaviorSubject(null);
    //videoSources: BehaviorSubject<Plyr.Source[]> = new BehaviorSubject(null);
    //videoTracks: BehaviorSubject<Plyr.Track[]> = new BehaviorSubject(null);
    isV2: boolean = false;
    //plyr1: Plyr;
    //hlsjsDriver1 = new HlsjsPlyrDriver(true);
    isIframe: BehaviorSubject<boolean> = new BehaviorSubject(false);
    sourceType: BehaviorSubject<string> = new BehaviorSubject(null);
    
    disqusIdentifier: BehaviorSubject<string> = new BehaviorSubject(null);
    currentTitle: string;
    isDisqusComment: BehaviorSubject<boolean> = new BehaviorSubject(false);
    selectionMade: BehaviorSubject<boolean> = new BehaviorSubject(null);
    isDownload: boolean = false;
    isFirefox: boolean = localStorage.getItem('isFirefox') === "true";
    private destroy$ = new Subject();

    isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
        .pipe(
            map(result => result.matches),
            shareReplay()
        );
    views: BehaviorSubject<string> = new BehaviorSubject(null);
    isUser: BehaviorSubject<boolean> = new BehaviorSubject(false);
    selectedAnime: BehaviorSubject<ExperimentAnimeTitles> = new BehaviorSubject(null);

    constructor(
        private experimentService: ExperimentService,
        private route: ActivatedRoute,
        private breakpointObserver: BreakpointObserver,
        public DomSanitizer: DomSanitizer,
        private location: Location,
        private router: Router,
        public titleService: Title,
        private apiService: ApiService,
        private authService: AuthService,
        private sanitizer: DomSanitizer,
        public  dialog: MatDialog

    ) {
          // detect weather to use its hls title
          if (this.router.url.includes('anime-60fps/v2/'))  {
            this.isV2 = true;
        } else {
            this.isV2 = false;
        }
        
        this.route.params.pipe(takeUntil(this.destroy$)).subscribe(
            params => {
                if (params['animeTitle']) {
                    this.currentTitle = (params['animeTitle']);
                    this.experimentService.setCurrentTitle(params['animeTitle']);
                    this.experimentService.getCurrentTitle();
                    this.titleService.setTitle(this.currentTitle);
                    
                }
            }
        );

        this.experimentService.currentTitleDATA.pipe(takeUntil(this.destroy$)).subscribe(
            result => {
                if (result) { 
                    this.showPlayer.next(true);
                    this.currentTitleData.next(result);
                    this.maxEpisodes_sub = Number(result.length)
                    this.showEpisodes.next(true);
                    setTimeout(() => {
                        this.setEpisode(0, false);
                        this.isIframe.next(result[0].iframe);
                    },100);
                }
            }
        );

        this.experimentService.currentSelection.pipe(takeUntil(this.destroy$)).subscribe(
            result => {
                if (result) {
                    this.selectedAnime.next(result);
                } else {
                    this.selectedAnime.next({
                        "title": `${this.currentTitle}`,
                        "cover_img": "assets/placeholder/404notfound.jpg",
                        "isDub": false,
                        "isSub": false,
                        "quality": "hd",
                        "isNew": false,
                        "isNSFW": false,
                        "isRemastered": false,
                        "isDownload": true
                      })
                    
                }
            }
        )

        // set download status
        this.isDownload = this.experimentService.currentTitleDownloadAvailable;

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
    }

    shareCurrentLink() {
        this.dialog.open(ShareButtonsComponent, {
          data: {
            ShareTitle: this.currentTitle,
            ShareLink: window.location.href,
            ShareContainerTitle: 'Share This Anime'
          }
        });
      }

    ngOnInit(): void {
        /* setTimeout(() => {
            if (this.isAdBlocker()) {
                console.log('adblocker on');
                this.isAdblockerOn.next(true);
            } else {
                console.log('adblocker off');
                this.isAdblockerOn.next(false);
            }
        }, 100); */
    }

    ngAfterViewInit(): void {
       window.scrollTo(0,0);
    }

    /* isAdBlocker() {
        let fakeAd = document.createElement("div");
        fakeAd.className =
            "textads banner-ads banner_ads ad-unit ad-zone ad-space adsbox";
        fakeAd.style.height = "1px";

        document.body.appendChild(fakeAd);
        let x_width = fakeAd.offsetHeight;
        let msg = (<HTMLElement>document.getElementById("msg"))

        if (x_width) {
            return false;
        } else {
            return true;
        }
    } */

    @HostListener('unloaded')
    ngOnDestroy(): void {
        setTimeout(() => {
        this.destroy$.next();
        this.destroy$.complete();
        },20);
    }


    getEpisodeID(id: number) {
        return `episode_${id}`;
    }

    setEpisode(index: number, type: boolean) {
        this.showPlayer.next(false);
        this.currentEpisode = index;
        this.episodeSelected(index);
        this.addEpisodeHighlight(this.currentEpisode, type);

        this.experimentService.currentTitleDATA.pipe(takeUntil(this.destroy$)).subscribe(
            result => {   
                if (result && result[index].src !== null) {
                    if (!result[index].src.includes('m3u8') && !result[index].iframe) {
                        this.isIframe.next(false);
                        this.sourceType.next('mp4');
                        this.safeStreamURL.next(result[index].src);
                        this.safeStreamDownloadURL.next(result[index]?.download);
                    } else if (result[index].src.includes('m3u8')) {
                        
                            this.sourceType.next('hls');
                            this.safeStreamURL.next(result[index].src);
                    } else if (result[index].iframe) {
                        this.safeStreamURL.next(result[index].src);
                        this.isIframe.next(true);
                    }
                    /*  else {
                        // youtube emebed src
                        if (result[index].src.includes('youtube')) {
                            this.safeStreamURL.next(result[index].src + `?origin=${location.hostname}&amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1`);
                        } else {
                            this.safeStreamURL.next(result[index].src );
                        }
                    } */
                }
                    
            }
        )
        this.showPlayer.next(true);
        this.setViews();
        
    }

    addEpisodeHighlight(id: number, type: boolean) {
        if (id < this.maxEpisodes_sub || id === this.maxEpisodes_sub) {
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
        }

        if (id > -1) {
            let id_name = this.getEpisodeID(id);
            let el = (<HTMLElement>document.getElementById(id_name));
            if (el) {
                el.classList.add('selected');
            }
        }
    }

    goBack() {
        this.router.navigate(['/experiment'])
      }

      showComments() {
        this.isDisqusComment.next(true);
        this.selectionMade.next(false);
      }
      
      episodeSelected(episodeNumber: Number) {
        this.selectionMade.next(true);
        this.isDisqusComment.next(false);
        this.disqusIdentifier.next(`https://animet.tv/experiment/anime-60fps/${this.currentTitle}-0`);   
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
        this.apiService.regularGET(`https://api.countapi.xyz/hit/animettv/${this.rstr2b64(this.currentTitle + this.currentEpisode)}`).pipe(takeUntil(this.destroy$)).subscribe(
          result => {
            if (result) {
              this.views.next(String(result.value));
            }
          },
          error => {
            this.views.next('N/A');
          }
        );
      }

      getSantizeUrl(url: string) {
        return this.sanitizer.bypassSecurityTrustUrl(url);
      }

}