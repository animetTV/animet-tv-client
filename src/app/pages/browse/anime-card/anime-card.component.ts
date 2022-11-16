import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { BrowseService } from 'src/app/@core/services/browse.service';
import { WatchAnimeService } from 'src/app/@core/services/watch-anime.service';
import { SnackbarMessageComponent } from 'src/app/@theme/components/snackbar-message/snackbar-message.component';

@Component({
  selector: 'app-anime-card',
  templateUrl: './anime-card.component.html',
  styleUrls: ['./anime-card.component.scss']
})
export class AnimeCardComponent implements OnInit {
  @Input() Title?: string;
  @Input() ImageSrc?: string;
  @Input() Id?: string;
  @Input() EpisodeNumber?: number;
  isRecentlyAdded: boolean;
  isNSFW: BehaviorSubject<boolean> = new BehaviorSubject(null);
  /* isFilterRecentlyAdded: BehaviorSubject<boolean> = new BehaviorSubject(true); */

  constructor(
    public watchAnimeService: WatchAnimeService,
    public browseService: BrowseService,
    public router: Router,
    public snackBar: MatSnackBar,
  ) {
  }


  ngOnInit(): void {
    if (this.EpisodeNumber) {
      this.isRecentlyAdded = true;
    } else {
      this.isRecentlyAdded = false;
    }
    /* this.browseService.currentFileterType.subscribe(
      newFilterType => {
        console.log(newFilterType);
        
        if(newFilterType) {
          if (newFilterType === 'recently_added') {
            this.isFilterRecentlyAdded.next(true);
          } else {
            this.isFilterRecentlyAdded.next(false);
          }
        }
      }
    ); */

  }


  setAnime() {
    this.watchAnimeService.isContinueWatchSelected.next(false);
    this.router.navigate(['video', this.Title]);
  }

  snackbarMessage(_message: string, _duration: number = 1500) {
    this.snackBar.openFromComponent(SnackbarMessageComponent, {
      duration: _duration,
      data: {
        message: _message
      }
    })
  }



  floorNumber(num: number) {
    return Math.floor(num);
  }

}
