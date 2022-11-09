import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DragScrollComponent } from 'ngx-drag-scroll';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from 'src/app/@core/services/auth.service';
import { BrowseService } from 'src/app/@core/services/browse.service';
import { UserService } from 'src/app/@core/services/user.service';
import { WatchAnimeService } from 'src/app/@core/services/watch-anime.service';
import { SnackbarMessageComponent } from 'src/app/@theme/components/snackbar-message/snackbar-message.component';
import { AnimesEntity } from 'src/app/shared/interface';

@Component({
  selector: 'app-regular-carousel',
  templateUrl: './regular-carousel.component.html',
  styleUrls: ['./regular-carousel.component.scss']
})
export class RegularCarouselComponent {

  @Input() ANIME: AnimesEntity[];
  @Input() CarouselTitle: string;
  @Input() CarouselMessage?: string;

  @ViewChild('nav', {read: DragScrollComponent}) ds: DragScrollComponent;
  isUser: BehaviorSubject<boolean> = new BehaviorSubject(false);
  addToList: boolean = false;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  .pipe(
    map(result => result.matches),
    shareReplay()
  );
  constructor( 
    public dialog: MatDialog,
    public userService: UserService,
    public snackBar: MatSnackBar,
    private authService: AuthService,
    public watchAnimeService: WatchAnimeService,
    public browseService: BrowseService,
    private router: Router,
    private breakpointObserver: BreakpointObserver, 
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
    
  }

  moveLeft() {
    this.ds.moveLeft();
    this.ds.moveLeft();
  }
 
  moveRight() {
    this.ds.moveRight();
    this.ds.moveRight();
  }



 snackbarMessage(_message: string, _duration: number = 1500){
  this.snackBar.openFromComponent(SnackbarMessageComponent, {
    duration: _duration,
    data: {
      message: _message
    }
  })
 }

  setAnime(animeTitle: string) {
    this.watchAnimeService.isContinueWatchSelected.next(false);
    this.router.navigate(['video', animeTitle]);
  }


  setBrowse() {
    this.browseService.initalBrowseResult.next('trending');
  }
  
}
