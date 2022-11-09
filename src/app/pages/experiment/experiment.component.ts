import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from 'src/app/@core/services/auth.service';
import { ExperimentAnimeTitles, ExperimentService } from 'src/app/@core/services/experiment.service';
import { UserService } from 'src/app/@core/services/user.service';

interface PageDetail  {
    thumbnail: string;
    pageTitle: string;
}

@Component({
    selector: 'app-experiment',
    templateUrl: './experiment.component.html',
    styleUrls: ['./experiment.component.scss']
})
export class ExperimentComponent implements OnInit {
    PAGE_DEFAULTS: PageDetail[] = [
        {
            thumbnail: `https://img.animet.site/file/animettv-avatars/other/logo/animet-tv_chibi_60fps.png`,
            pageTitle: `60FPS`
        },
        {
            thumbnail: `https://img.animet.site/file/animettv-avatars/other/logo/animet-tv_chibi_60fps.png`,
            pageTitle: `60FPS Hentai`
        },
        {
            thumbnail: `https://img.animet.site/file/animettv-avatars/other/logo/animet-tv_chibi_4k.png`,
            pageTitle: `4K UHD`
        },
        {
            thumbnail: `https://img.animet.site/file/animettv-avatars/other/animet-tv_chibi_1.png`,
            pageTitle: `Remastered`
        },
    ];
    /*  isAdblockerOn: BehaviorSubject<boolean> = new BehaviorSubject(null); */
    isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
        .pipe(
            map(result => result.matches),
            shareReplay()
        );

    FPS_TITLES: BehaviorSubject<ExperimentAnimeTitles[]> = new BehaviorSubject(null);
    FPS_TITLES_HENTAI: BehaviorSubject<ExperimentAnimeTitles[]> = new BehaviorSubject(null);
    ULTRAHD_TITLES: BehaviorSubject<ExperimentAnimeTitles[]> = new BehaviorSubject(null);
    REMASTERED_TITLES: BehaviorSubject<ExperimentAnimeTitles[]> = new BehaviorSubject(null);
    isNSFWClient: BehaviorSubject<boolean> = new BehaviorSubject(this.getStorageNSFW());
    isUser: BehaviorSubject<boolean> = new BehaviorSubject(false);
    pageTitle: BehaviorSubject<String> = new BehaviorSubject(`60FPS`);

    private destroy$ = new Subject();

    constructor(private authService: AuthService, private userService: UserService,  public titleService: Title, private router: Router, private experimentService: ExperimentService, private breakpointObserver: BreakpointObserver,) {
        this.titleService.setTitle("Upscales - AnimetTV");

        this.experimentService.getAvailableTitle();
        // fetch availabletitles
        this.experimentService.availableTitles.subscribe(
            titles => {
                if (titles) {
                    let fps_titles: ExperimentAnimeTitles[] = [];
                    let fps_titles_hentai: ExperimentAnimeTitles[] =[];
                    let ultrahd_titles: ExperimentAnimeTitles[] = [];
                    let remastered_titles: ExperimentAnimeTitles[] = [];

                    titles.forEach(el => {
                        if (el.isRemastered === false && el.quality === 'hd' && el.isNSFW === false) {
                                fps_titles.push(el);
                        } else if (el.isRemastered === false && el.quality === 'hd' && el.isNSFW ) {
                            fps_titles_hentai.push(el);
                        } else if (el.quality === '4k') {
                            ultrahd_titles.push(el);
                        } else if (el.isRemastered === true) {
                            remastered_titles.push(el);
                        }
                    });

                    this.FPS_TITLES.next(fps_titles);
                    this.FPS_TITLES_HENTAI.next(fps_titles_hentai);
                    this.ULTRAHD_TITLES.next(ultrahd_titles);
                    this.REMASTERED_TITLES.next(remastered_titles);
                }
            }
        );
        // local nsfw state
        this.userService.isNSFWClient.subscribe(
            newState => {
                console.log(newState);
                
                if (newState) {
                    this.isNSFWClient.next(newState);
                } else {
                    this.isNSFWClient.next(false);
                }
            }
        );

         /* detected state if user or guest  */
        this.authService.isUser_Change.subscribe(
            newState => {
            if (newState) {
                this.isUser.next(true);
            } else {
                this.isUser.next(false);
            }
            },
            error => { console.log(error); }
        );
        }

    
    ngOnInit(): void {
        this.experimentService.currentVideoThumbnails.next('https://img.animet.site/file/animettv-avatars/other/logo/animet-tv_chibi_60fps.png')
        window.scrollTo(0, 0);
        
        /* setTimeout(() => {
            if (this.isAdBlocker()) {
                console.log('adblocker on');
                this.isAdblockerOn.next(true);
            } else {
                console.log('adblocker off');
                this.isAdblockerOn.next(false);
            }
        },820); */
        
        // scroll to top of page 
        window.scroll({
            top: 0,
            left: 0,
            behavior: 'auto'
        });
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

    // deploy fakAd div for adblocker detection

    /* isAdBlocker() {
        let fakeAd = document.createElement("div");
        fakeAd.className = 
        "textads banner-ads banner_ads ad-unit ad-zone ad-space adsbox"
            
        fakeAd.style.height = "1px"
            
        document.body.appendChild(fakeAd);
        let x_width = fakeAd.offsetHeight;
        let msg = (<HTMLElement>document.getElementById("msg"))
            
        if(x_width){
            return false;
        }else{
            return true;
        }
    } */

    setAnime60fps(anime: ExperimentAnimeTitles) {
        this.experimentService.currentSelection.next(anime);
        // save download avaliable status
        if (anime.isDownload) {
            this.experimentService.currentTitleDownloadAvailable = true;
        } else {
            this.experimentService.currentTitleDownloadAvailable = false;
        }
        /* if (anime.quality === '4k') {
            this.router.navigate(['experiment/anime-60fps/v2/', anime.title]);
        } else {
            this.router.navigate(['experiment/anime-60fps', anime.title]);
        } */
        this.router.navigate(['experiment/anime-60fps', anime.title])
    }

    tabChanged($event: number) {
        if (this.getStorageNSFW()) {
            this.experimentService.currentVideoThumbnails.next(this.PAGE_DEFAULTS[$event].thumbnail);
            this.pageTitle.next(this.PAGE_DEFAULTS[$event].pageTitle);
        } else {
            if ($event > 0) {
                this.experimentService.currentVideoThumbnails.next(this.PAGE_DEFAULTS[$event+1].thumbnail);
                this.pageTitle.next(this.PAGE_DEFAULTS[$event+1].pageTitle);
            } else {
                this.experimentService.currentVideoThumbnails.next(this.PAGE_DEFAULTS[$event].thumbnail);
                this.pageTitle.next(this.PAGE_DEFAULTS[$event].pageTitle);
            }
        }
    }
}


