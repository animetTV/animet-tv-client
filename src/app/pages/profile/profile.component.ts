import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/@core/services/api.service';
import { UserService } from 'src/app/@core/services/user.service';
import { ShareListComponent } from 'src/app/@theme/components/share-list/share-list.component';
import { SnackbarMessageComponent } from 'src/app/@theme/components/snackbar-message/snackbar-message.component';
import { List, Profile, UserStat } from 'src/app/shared/interface';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent {
  USER_STATS: BehaviorSubject<UserStat> = new BehaviorSubject(null);
  CONTINUE_WATCHING: List[] = [];
  PLAN_TO_WATCH: List[] = [];
  COMPLETED: List[] = [];
  isPublic: BehaviorSubject<Boolean> = new BehaviorSubject(null);
  USER_PROFILE: BehaviorSubject<Profile> = new BehaviorSubject(null);
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
  isMobile: boolean;
  isBuffering: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private destroy$ = new Subject();

  constructor(
    public userService: UserService,
    public snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver,
    public dialog: MatDialog,
    private router: Router,
    private apiService: ApiService) {
    this.getContinueWatching();
    this.getList();
    this.getProfile();
    /* if edite happens get updated profile */
    this.userService.listEdit_change.pipe(takeUntil(this.destroy$)).subscribe(
      () => {
        this.getList();
      }
    );

    /* if profile changes */
    this.USER_PROFILE.pipe(takeUntil(this.destroy$)).subscribe(
      profileData => {
        if (profileData) {
          this.isPublic.next(profileData.isProfilePublic);
          // update channel View 
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
                  watching: this.CONTINUE_WATCHING.length,
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
    );

    this.isHandset$.pipe(takeUntil(this.destroy$)).subscribe(
      newState => {
        this.isMobile = newState;
      }
    );

    this.userService.profileAvatarChanged.subscribe(
      state => {
        if (state) {
          this.isBuffering.next(true);
          this.getProfile();
        }
      }
    );

    // mangage buffer popup
    this.isBuffering.subscribe(
      state => {
        if (state) {
          this.dialog.open(DialogBuffering);
        } else if (!state) {
          this.dialog.closeAll();
        }
      }
    )

  }

  getList() {
    this.userService.getUserList().pipe(takeUntil(this.destroy$)).subscribe(
      result => {
        this.PLAN_TO_WATCH = result.plan_to_watch;
        this.COMPLETED = result.completed;
      }
    )
  }

  getProfile() {
    this.isBuffering.next(true);
    this.userService.getUserProfile().pipe(takeUntil(this.destroy$)).subscribe(
      profile => {
        if (profile.success) {
          this.USER_PROFILE.next(profile.accountProfile);
          this.isBuffering.next(false);
        } else if (!profile.success) {
          this.snackbarMessage(profile.message);
        }
      },
      error => {
        this.snackbarMessage(error.message);
      }
    )
  }

  getContinueWatching() {
    this.userService.getUserContinueWatchList();
    this.userService.cached_continue_watching.pipe(takeUntil(this.destroy$)).subscribe(
      data => {
        if (data && data.length > 0) {
          let tmp: List[] = [];
          data.forEach(el => {
            tmp.push({
              dateCreated: el.dateCreated,
              title: el.animeTitle,
              _id: 'null',
              img_url: el.img_url,
              continue_watch_data: {
                episodeNumber: el.episodeNumber,
                totalEpisode: el.totalEpisodes,
                type: el.type
              }
            })
          });

          this.CONTINUE_WATCHING = tmp;
        }
      });
  }

  removeItemFromContinueWatching(title: string) {
    this.userService.removeItemFromeContinueWatching(title).subscribe(
      result => {
        if (result.success) {
          this.snackbarMessage(result.message);
          this.userService.getUserContinueWatchList();
        } else if (!result.success) {
          this.snackbarMessage(result.message);
        }
      },
      error => {
        console.log(error);
      }
    )
  }

  openShareList() {
    let dialogRef;
    if (this.isMobile) {
      dialogRef = this.dialog.open(ShareListComponent, {
        width: '100%',
      });
    } else {
      dialogRef = this.dialog.open(ShareListComponent, {
        width: '40%',
      });
    }


  }

  snackbarMessage(_message: string, _duration: number = 1000) {
    this.snackBar.openFromComponent(SnackbarMessageComponent, {
      duration: _duration,
      data: {
        message: _message
      }
    })
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

  isBufferingState(state: boolean) {
    this.isBuffering.next(state);
  }

}


@Component({
  selector: 'dialog-buffering-dialog',
  templateUrl: './buffer-dialog.html'
})
export class DialogBuffering { }
