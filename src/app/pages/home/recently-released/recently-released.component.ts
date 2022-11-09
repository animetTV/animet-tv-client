import { Component, Input, OnInit, ViewChild } from '@angular/core';
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
import { RecentlyAdded, RecentlyAddedEntity } from 'src/app/shared/interface';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-recently-released',
  templateUrl: './recently-released.component.html',
  styleUrls: ['./recently-released.component.scss']
})
export class RecentlyReleasedComponent implements OnInit {
  RECENTLY_ADDED: BehaviorSubject<RecentlyAdded> = new BehaviorSubject(null);
  dubTitles: BehaviorSubject<RecentlyAddedEntity[]> = new BehaviorSubject(null);
  subTitles: BehaviorSubject<RecentlyAddedEntity[]> = new BehaviorSubject(null);

  @ViewChild('navDub', {read: DragScrollComponent}) dsDub: DragScrollComponent;
  @ViewChild('navSub', {read: DragScrollComponent}) dsSub: DragScrollComponent;
  isUser: BehaviorSubject<boolean> = new BehaviorSubject(false);
  addToList: boolean = false;
  isLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @Input() isSubSelected: boolean = true;
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
    private sanitizer: DomSanitizer,
  ) { }

  tabClick($event: any) {
    if ($event.index === 1) {
      this.isSubSelected = false;
    } else {
      this.isSubSelected = true;
    }
  }

  moveLeft() {
    if (this.isSubSelected) {
      this.dsSub.moveLeft();
      this.dsSub.moveLeft();
    } else {
      this.dsDub.moveLeft();
      this.dsDub.moveLeft();
    }
  }
 
  moveRight() {
    if (this.isSubSelected) {
      this.dsSub.moveRight();
      this.dsSub.moveRight();
    } else {
      this.dsDub.moveRight();
      this.dsDub.moveRight();
    }
  }

  setAnime(anime: RecentlyAddedEntity) {
    this.router.navigate(['video', anime.title]);
    this.watchAnimeService.isContinueWatchSelected.next(true);
    // set type & epnumc    
    this.watchAnimeService.animeType.next(!this.isSubSelected);
    this.watchAnimeService.currentEp = Number(anime.episodeNumber -1);
  }


  trackBy(index: number, title: RecentlyAddedEntity) {
    return title.id;
  }

  setBrowse() {
    this.browseService.currentSourceType.next('gogoanime');
    localStorage.removeItem('lastSearched');
    this.browseService.initalBrowseResult.next('recently_added');
    this.router.navigate(['/browse']);
  }
  ngOnInit(): void {
    /* this.getTrending(); */
    this.apiService.cached_RecentlyAdded.pipe(distinctUntilChanged()).subscribe(
      data => {
        if (data) {
          this.isLoaded.next(true);
          this.RECENTLY_ADDED.next(data);
          this.subTitles.next(data.SUB.slice(0, 20));      
          this.dubTitles.next(data.DUB.slice(0, 20));      
        }
      }
    );
  }

  getSantizeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  floorNumber(num: number) {
    return Math.floor(num);
  }

  getSystemDate() {
    let d = new Date(),
    t = d.toDateString().split(" ");
    return t[1] + " " + t[2];
  }
}
