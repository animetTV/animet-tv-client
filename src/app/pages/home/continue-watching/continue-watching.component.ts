import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DragScrollComponent } from 'ngx-drag-scroll';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { ApiService } from 'src/app/@core/services/api.service';
import { AuthService } from 'src/app/@core/services/auth.service';
import { BrowseService } from 'src/app/@core/services/browse.service';
import { UserService } from 'src/app/@core/services/user.service';
import { WatchAnimeService } from 'src/app/@core/services/watch-anime.service';
import { SnackbarMessageComponent } from 'src/app/@theme/components/snackbar-message/snackbar-message.component';
import { ContinueWatching_ItemAdd, ItemRequest, LastOpen } from 'src/app/shared/interface';

@Component({
  selector: 'app-continue-watching',
  templateUrl: './continue-watching.component.html',
  styleUrls: ['./continue-watching.component.scss']
})
export class ContinueWatchingComponent implements OnDestroy {
  CONTINUE_WATCHING: ContinueWatching_ItemAdd[] = [];
  @ViewChild('nav', {read: DragScrollComponent}) ds: DragScrollComponent;
  isUser: BehaviorSubject<boolean> = new BehaviorSubject(false);
  addToList: boolean = false;
  isLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showContent: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private destroy$ = new Subject();
  
  constructor(
    public dialog: MatDialog,
    public userService: UserService,
    public snackBar: MatSnackBar,
    private authService: AuthService,
    public watchAnimeService: WatchAnimeService,
    public browseService: BrowseService,
    private router: Router
  ) {
    /* detected state if user or guest  */
    this.authService.isUser_Change.subscribe(
      newState => {
        if (newState) {
          this.isUser.next(newState);
        } else {
          this.isUser.next(false);
        }
      },
      error => { console.log(error); }
    );
    
    this.userService.cached_continue_watching.pipe(takeUntil(this.destroy$)).subscribe(
      data => {
        if (data && data.length > 0) {
          this.isLoaded.next(true);
          this.showContent.next(true);
          this.CONTINUE_WATCHING = data;
          
        } else {
          this.showContent.next(false);
        }
      }
    );

  }

 @HostListener('unloaded')
  ngOnDestroy(): void {
    setTimeout(() => {
      this.destroy$.next();
      this.destroy$.complete();
    },20)
  }

  moveLeft() {
    this.ds.moveLeft();
    this.ds.moveLeft();
  }
 
  moveRight() {
    this.ds.moveRight();
    this.ds.moveRight();
  }

 snackbarMessage(_message: string, _duration: number = 1000){
  this.snackBar.openFromComponent(SnackbarMessageComponent, {
    duration: _duration,
    data: {
      message: _message
    }
  })
 }

  setAnime(anime: ContinueWatching_ItemAdd) {
    this.router.navigate(['video', anime.animeTitle]);
    this.watchAnimeService.isContinueWatchSelected.next(true);
    // set type & epnum
    this.watchAnimeService.animeType.next(anime.type);
    this.watchAnimeService.currentEp = anime.episodeNumber;
  }


  setBrowse() {
    this.browseService.initalBrowseResult.next('trending');
  }
  removeItemFromContinueWatching(title: string) {
    this.userService.removeItemFromeContinueWatching(title).subscribe(
      result => {
        if (result.success) {
          this.snackbarMessage(result.message);
          this.userService.getUserContinueWatchList();
        }else if (!result.success) {
          this.snackbarMessage(result.message);
        }
      },
      error => {
        console.log(error);
        
      }
    )
  }

}

