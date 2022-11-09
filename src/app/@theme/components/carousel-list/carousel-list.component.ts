import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DragScrollComponent } from 'ngx-drag-scroll';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ApiService } from 'src/app/@core/services/api.service';
import { UserService } from 'src/app/@core/services/user.service';
import { WatchAnimeService } from 'src/app/@core/services/watch-anime.service';
import { SnackbarMessageComponent } from 'src/app/@theme/components/snackbar-message/snackbar-message.component';
import { ItemRequest, List, TopSeason } from 'src/app/shared/interface';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-carousel-list',
  templateUrl: './carousel-list.component.html',
  styleUrls: ['./carousel-list.component.scss'],
})
export class CarouselListComponent {
  TOP_SEASON_ANIME: TopSeason[] = [];
  @ViewChild('nav', { read: DragScrollComponent }) ds: DragScrollComponent;
  @Input() ListName: String;
  @Input() List: List[] = [];
  @Input() isFinishedBtn: boolean = false;
  @Input() isContinueWatch: boolean = false;
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );
  moveItemRequest: ItemRequest;
  constructor(
    private apiService: ApiService,
    public userService: UserService,
    public snackBar: MatSnackBar,
    public watchAnimeService: WatchAnimeService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    this.apiService.getCurrentTopSeason().subscribe(
      (result) => {
        this.TOP_SEASON_ANIME = result;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  setAnime(animeTitle: string) {
    localStorage.setItem('animeTitle', animeTitle);
    this.watchAnimeService.isContinueWatchSelected.next(false);
    this.router.navigate(['video', animeTitle]);
    // this.openNewTabVideoPlayer();
  }

  openNewTabVideoPlayer() {
    window.open(environment.baseUrl + 'video', '_blank');
  }

  moveLeft() {
    this.ds.moveLeft();
  }

  moveRight() {
    this.ds.moveRight();
  }

  moveItemToCompleted(anime: ItemRequest) {
    this.userService.moveItemToCompleted(anime).subscribe(
      (result) => {
        if (result.success) {
          this.snackbarMessage(result.message);
          this.userService.listEdit_change.next(!this.userService.listEdit);
        } else {
          this.snackbarMessage(result.message);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  moveItemToPlanToWatch(anime: ItemRequest) {
    this.userService.moveItemToPlanToWatch(anime).subscribe(
      (result) => {
        if (result.success) {
          this.snackbarMessage(result.message);
          this.userService.listEdit_change.next(!this.userService.listEdit);
        } else {
          this.snackbarMessage(result.message);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  removeItemFromList(anime: ItemRequest) {
    if (this.isFinishedBtn) {
      anime.LIST = 'plan_to_watch';
    } else {
      anime.LIST = 'completed';
    }

    localStorage.setItem('img_url', anime.img_url);

    this.userService.removeItemFromList(anime).subscribe(
      (result) => {
        if (result.success) {
          this.snackbarMessage(result.message);
          this.userService.listEdit_change.next(!this.userService.listEdit);
        } else {
          this.snackbarMessage(result.message);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  snackbarMessage(_message: string) {
    this.snackBar.openFromComponent(SnackbarMessageComponent, {
      duration: 1000,
      data: {
        message: _message,
      },
    });
  }

  copyText(anime: ItemRequest) {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = anime.title;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    this.snackbarMessage('Copied!');
  }
}
