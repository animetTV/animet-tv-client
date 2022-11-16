import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
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
import { TopSeason } from 'src/app/types/interface';

@Component({
  selector: 'app-top-of-the-week',
  templateUrl: './top-of-the-week.component.html',
  styleUrls: ['./top-of-the-week.component.scss']
})
export class TopOfTheWeekComponent{
  TOP_OF_THE_WEEK: TopSeason[] = [];
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
    private router: Router,
    private breakpointObserver: BreakpointObserver, 
  ) {

    this.apiService.cached_Top_Of_The_Wekk.pipe(distinctUntilChanged()).subscribe(
      data => {
        if (data) {
          this.isLoaded.next(true);
          this.isHandset$.pipe(distinctUntilChanged()).subscribe(state => {
            if (state) {
              this.TOP_OF_THE_WEEK = data.slice(0,9);       
            } else if (!state) {
              this.TOP_OF_THE_WEEK = data.slice(0,20);       
            }
          })   
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
    localStorage.setItem('sourceType', 'gogoanime');
    this.browseService.currentSourceType.next('gogoanime');
    this.watchAnimeService.isContinueWatchSelected.next(false);
    this.router.navigate(['video', animeTitle]);
  }


  setBrowse() {
    this.browseService.currentSourceType.next('gogoanime');
    localStorage.removeItem('lastSearched');
    this.browseService.initalBrowseResult.next('trending');
    this.router.navigate(['/browse']);
  }
}
