import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Component, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DragScrollComponent } from 'ngx-drag-scroll';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/@core/services/api.service';
import { List, UserStat } from 'src/app/shared/interface';
import { PublicLinkService } from '../../@core/services/public-link.service';
import { WatchAnimeService } from '../../@core/services/watch-anime.service';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.scss']
})
export class PublicProfileComponent {
  USER_STATS: BehaviorSubject<UserStat> = new BehaviorSubject(null);
  CONTINUE_WATCHING: List[] = [];
  PLAN_TO_WATCH: List[] = [];
  COMPLETED: List[] = [];
  isListPublic: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @ViewChild('nav', { read: DragScrollComponent }) ds: DragScrollComponent;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
  private destroy$ = new Subject();

  constructor(
    public publicLinkService: PublicLinkService,
    public watchAnimeService: WatchAnimeService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private apiService: ApiService
  ) {
    /* updated the fetched public list with component list  */
    this.publicLinkService.PLAN_TO_WATCH.pipe(takeUntil(this.destroy$)).subscribe(
      list => {
        if (list) {
          this.PLAN_TO_WATCH = list;
        }
      }
    );

    this.publicLinkService.COMPLETED.pipe(takeUntil(this.destroy$)).subscribe(
      list => {
        if (list) {
          this.COMPLETED = list;
        }
      }
    );
    this.publicLinkService.CONTINUE_WATCHING.pipe(takeUntil(this.destroy$)).subscribe(
      list => {
        if (list) {
          this.CONTINUE_WATCHING = list;
        }
      }
    )

    this.publicLinkService.PUBLIC_USER.subscribe(
      profileData => {
        if (profileData) {
          if (profileData.isProfilePublic) {
            this.isListPublic.next(profileData.isProfilePublic);

            this.setViews(profileData.accountID).pipe(takeUntil(this.destroy$)).subscribe(
              _channelViews => {
                this.USER_STATS.next(
                  {
                    accountID: profileData.accountID,
                    email: profileData.email,
                    watching: this.CONTINUE_WATCHING.length,
                    plan_to_watch: this.PLAN_TO_WATCH.length,
                    completed: this.COMPLETED.length,
                    socials: null,
                    avatarFileID: profileData.avatarFileID,
                    avatarFileName: profileData.avatarFileName,
                    channelViews: _channelViews
                  }
                );
              },
              error => {
                this.USER_STATS.next(
                  {
                    accountID: profileData.accountID,
                    email: profileData.email,
                    watching: 0,
                    plan_to_watch: this.PLAN_TO_WATCH.length,
                    completed: this.COMPLETED.length,
                    socials: null,
                    avatarFileID: profileData.avatarFileID,
                    avatarFileName: profileData.avatarFileName,
                    channelViews: "N/A"
                  });
              }
            );
          }
        }
      }
    );


  }

  moveLeft() {
    this.ds.moveLeft();
  }

  moveRight() {
    this.ds.moveRight();
  }

  setAnime(animeTitle: string) {
    localStorage.setItem("animeTitle", animeTitle);
    this.watchAnimeService.isContinueWatchSelected.next(false);
    this.router.navigate(['video', animeTitle]);
    // this.openNewTabVideoPlayer();
  }

  setViews(key: string): Observable<any> {
    let views = new Subject();
    this.apiService.regularGET(`https://api.countapi.xyz/hit/animettv/${key}`).subscribe(
      result => {
        if (result) {
          views.next(this.numberWithCommas(result.value));
        }
      },
      error => {
        views.next('N/A');
      }
    );

    return views.asObservable();
  }

  numberWithCommas(x: Number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  @HostListener('unloaded')
  ngOnDestroy(): void {
    setTimeout(() => {
      this.destroy$.next();
      this.destroy$.complete();
    }, 20)
  }




}
