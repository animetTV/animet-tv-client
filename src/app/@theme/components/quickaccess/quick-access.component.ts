import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ApiService } from 'src/app/@core/services/api.service';
import { BrowseService } from 'src/app/@core/services/browse.service';
import { LastOpen } from 'src/app/shared/interface';

@Component({
  selector: 'app-quick-access',
  templateUrl: './quick-access.component.html',
  styleUrls: ['./quick-access.component.scss'],
})
export class QuickAccessComponent implements OnInit {
  lastOpenAnime: LastOpen;
  animeType: string;
  elaspedTime: string;
  hideElement = true;
  isAvailable: boolean = false;
  aiupscalingBadge: BehaviorSubject<Number> = new BehaviorSubject(0);

  @Output() watchLastOpenEvent = new EventEmitter<LastOpen>();
  @Output() scrollToMustWatchEvent = new EventEmitter<boolean>();

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private apiService: ApiService,
    private router: Router,
    private browseService: BrowseService
  ) {
    setInterval(() => {
      this.getLastOpen();
    }, 60000);

    this.apiService.cached_Available60fpsTitlesCount.subscribe((count) => {
      this.aiupscalingBadge.next(count);
    });
  }

  ngOnInit() {
    this.getLastOpen();
  }

  getLastOpen() {
    let obj = JSON.parse(localStorage.getItem('lastopen'));
    if (obj !== null) {
      this.isAvailable = true;

      let tmp: LastOpen = {
        animeTitle: obj.animeTitle,
        episodeNumber: obj.episodeNumber,
        img_url: obj.img_url,
        date: new Date(obj.date),
        type: JSON.parse(obj.type),
      };
      this.lastOpenAnime = tmp;

      // set anime type
      this.animeType = tmp.type ? 'DUB' : 'SUB';

      let recorededDate = new Date(obj.date);

      // Calulate elasped time
      let currentTime = new Date();
      let diff = currentTime.getTime() - recorededDate.getTime();
      // Convert time difference from milliseconds to seconds
      diff = diff / 1000;

      // Extract integer seconds
      let seconds = Math.floor(diff % 60);
      // Extract Minutes by convertin
      diff = Math.floor(diff / 60);
      let minutes = diff % 60;

      // Extract Hours by converting
      diff = Math.floor(diff / 60);
      let hours = diff % 24;
      diff = Math.floor(diff / 24);
      let days = diff;
      let totalHours = hours + days * 24; // add days to hours

      // build elasped time string
      if (minutes > 0 && totalHours === 0) {
        // show min
        this.elaspedTime = `watched ${minutes} minutes ago`;
      } else if (totalHours > 0 && totalHours < 24) {
        // show hours
        this.elaspedTime = `watched ${totalHours} hours ago`;
      } else if (minutes === 0 && totalHours === 0) {
        // show sec
        this.elaspedTime = `watched ${seconds} secounds ago`;
      } else if (totalHours > 24) {
        this.elaspedTime = `watched ${Math.floor(totalHours / 24)} days ago`;
      }
    }
  }

  onClickLastOpen() {
    this.watchLastOpenEvent.emit(this.lastOpenAnime);
  }

  onClickMustWatch() {
    this.scrollToMustWatchEvent.emit(true);
  }

  /* onWatchRandom() {
        // choose randomly from all time popular cached res
        this.apiService.cached_AllTime_Popular.subscribe(
            res => {
                if (res) {
                    let choosenAnime = res[Math.floor(Math.random() * res.length-50)]
                    localStorage.setItem('sourceType', 'gogoanime');
                    this.browseService.currentSourceType.next('gogoanime');
                    this.router.navigate(['video', choosenAnime.title]);
                }
            }
        )
    } */

  goExperiment() {
    this.router.navigate(['/experiment']);
  }
}
