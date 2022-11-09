import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DragScrollComponent } from 'ngx-drag-scroll';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ApiService } from 'src/app/@core/services/api.service';
import { BrowseService } from 'src/app/@core/services/browse.service';
import { ExperimentAnimeTitles, ExperimentService } from 'src/app/@core/services/experiment.service';
import { UserService } from 'src/app/@core/services/user.service';
import { WatchAnimeService } from 'src/app/@core/services/watch-anime.service';

@Component({
  selector: 'app-ai-showcase',
  templateUrl: './ai-showcase.component.html',
  styleUrls: ['./ai-showcase.component.scss']
})
export class AiShowcaseComponent implements OnInit {
  @Input() type: string;
  AI_TITLE: ExperimentAnimeTitles[] = [];
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
    private experimentService: ExperimentService
  ) {
    this.experimentService.getAvailableTitle();
    this.experimentService.availableTitles.subscribe(data => {
      if (data) {
        this.isLoaded.next(true);
        var result = [];
        if (this.type === `4k`) {
          result = data.filter(
            el => {
              if (el.quality.includes('4k')) {
                return el;
              }
            }
          );
          result = result.slice(0,5);
        } else if (this.type === `60fps`) {
          result = data.filter(
            el => {
              if (el.quality.includes('hd') && !el.isRemastered && !el.isNSFW) {
                return el;
              }
            }
          );
          result = result.slice(0,7);
        }
        this.AI_TITLE = result;       
      }
    });

  }
  moveLeft() {
    this.ds.moveLeft();
    this.ds.moveLeft();
  }
 
  moveRight() {
    this.ds.moveRight();   
    this.ds.moveRight();
  }

  trackBy(index: number, item: ExperimentAnimeTitles) {
    return item.title;
  }

  setAnime(title: string) {
    this.router.navigate(['experiment/anime-60fps', title])

  }


  ngOnInit(): void {
    /* this.getTrending(); */
  }

}
