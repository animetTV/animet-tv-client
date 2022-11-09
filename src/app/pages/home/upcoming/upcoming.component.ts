import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DragScrollComponent } from 'ngx-drag-scroll';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { ApiService } from 'src/app/@core/services/api.service';
import { BrowseService } from 'src/app/@core/services/browse.service';
import { UserService } from 'src/app/@core/services/user.service';
import { WatchAnimeService } from 'src/app/@core/services/watch-anime.service';
import { TopSeason } from 'src/app/shared/interface';

@Component({
  selector: 'app-upcoming',
  templateUrl: './upcoming.component.html',
  styleUrls: ['./upcoming.component.scss']
})
export class UpcomingComponent  {
  UPCOMING_ANIME: TopSeason[] = [];
  @ViewChild('nav', {read: DragScrollComponent}) ds: DragScrollComponent;
  isUser: BehaviorSubject<boolean> = new BehaviorSubject(false);
  addToList: boolean = false;
  isLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  .pipe(
    map(result => result.matches),
    shareReplay()
  );

  constructor(
    private apiService: ApiService, 
    public dialog: MatDialog,
    public userService: UserService,
    public snackBar: MatSnackBar,
    public watchAnimeService: WatchAnimeService,
    public browseService: BrowseService,
    private breakpointObserver: BreakpointObserver, 
    private router: Router
  ) {

    this.apiService.cached_Upcoming.pipe(distinctUntilChanged()).subscribe(
      data => {
        if (data) {
          this.isLoaded.next(true);   
          this.UPCOMING_ANIME = data.slice(0,25);       

        }
      }
    );
  }

  trackBy(index: number, item: TopSeason) {
    return item.title;
  }
  
  moveLeft() {
    this.ds.moveLeft();
    this.ds.moveLeft();
  }
 
  moveRight() {
    this.ds.moveRight();   
    this.ds.moveRight();
  }
  
  setAnime(animeTitle: string) {
    localStorage.removeItem("animeTitle");
    this.watchAnimeService.setCurrnetAnime(animeTitle);
  }

  setBrowse() {
    localStorage.removeItem('lastSearched');
    this.browseService.initalBrowseResult.next('upcoming');
    this.router.navigate(['/browse']);
  }

}
