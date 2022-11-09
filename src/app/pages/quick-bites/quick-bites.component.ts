import { Component, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ExperimentService } from 'src/app/@core/services/experiment.service';
import { Location } from '@angular/common';
import { QuickBitsSource } from 'src/app/shared/interface';
import { PlyrComponent } from 'ngx-plyr';
import * as Plyr from 'plyr';
import { ApiService } from 'src/app/@core/services/api.service';

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url:any) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
    selector: 'app-quick-bites',
    templateUrl: './quick-bites.component.html',
    styleUrls: ['./quick-bites.component.scss']
})
export class QuickBitesComponent implements OnInit {
    feedSource: QuickBitsSource[];
    currentSource: BehaviorSubject<string> = new BehaviorSubject(null);
    currentVideo: BehaviorSubject<QuickBitsSource> = new BehaviorSubject(null);
    currentID: string;
    counter: number = 0;
    maxQuickBites: number = 0;
    isContainerOpen: BehaviorSubject<boolean> = new BehaviorSubject(false);
    width = "100%";
    disqusIdentifier: BehaviorSubject<string> = new BehaviorSubject(null);
    views: BehaviorSubject<string> = new BehaviorSubject(null);
    // PLYR
    @ViewChild(PlyrComponent)
    plyr: PlyrComponent;
    videoSources: BehaviorSubject<Plyr.Source[]> = new BehaviorSubject(null);
    
    constructor(
      private experimentService: ExperimentService,
      private router: Router,
      private location: Location,
      private apiService: ApiService) {

      this.experimentService.getQuickBits();
      experimentService.currentFeed.subscribe(
        result => {
          if (result) {
            this.maxQuickBites = result.length;
            this.feedSource = this.shuffle(result);
            this.currentSource.next(result[0].src);
            this.currentID = result[0].videoID;
            this.currentVideo.next(result[0]);
             // plyr implementation
            this.videoSources.next(
              [{
                src: `${this.feedSource[this.counter].src}`,
                provider: 'youtube',
              }]
            );
            this.disqusIdentifier.next(`https://animet.tv/quick-bites/${this.currentID}`);
            this.setViews(this.feedSource[this.counter].videoID);
          }
        }
      );
    }

    next() {
      if (this.counter < this.maxQuickBites -1 ) {
        this.counter += 1;
        this.currentSource.next(this.feedSource[this.counter].src);
        this.currentID = this.feedSource[this.counter].videoID;
        this.currentVideo.next(this.feedSource[this.counter]);

        // plyr implementation
        this.videoSources.next(
          [{
            src: `${this.feedSource[this.counter].src}`,
            provider: 'youtube',
          }]
        )
      }

      this.disqusIdentifier.next(`https://animet.tv/quick-bites/${this.currentID}`);
      this.setViews(this.feedSource[this.counter].videoID);

    }
    prev() {
      if (this.counter < this.maxQuickBites && this.counter > 0) {
        this.counter -= 1;
        this.currentSource.next(this.feedSource[this.counter].src);
        this.currentID = this.feedSource[this.counter].videoID;

        // plyr implementation
        this.videoSources.next(
          [{
            src: `${this.feedSource[this.counter].src}`,
            provider: 'youtube',
          }]
        )
      }
      this.disqusIdentifier.next(`https://animet.tv/quick-bites/${this.currentID}`);
      this.setViews(this.feedSource[this.counter].videoID);

    }
    close() {
      // detect if users loaded the page without navigating to amv 
      if(this.location.getState()['navigationId'] === 1) {
        this.router.navigate(['/home']);
      } else {
        this.location.back();
      }
    }

    shuffle(array: any) {
      let currentIndex = array.length,  randomIndex;
    
      // While there remain elements to shuffle...
      while (currentIndex != 0) {
    
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
    
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex], array[currentIndex]];
      }
    
      return array;
    }

    videoEnded() {
      this.next();
    }
    
    // container nav
    openContainer() {
      let el = (<HTMLElement>document.getElementById('content-container'));
      if (el) {
        el.classList.remove('content-container-closed');
        setTimeout(() => {
          this.isContainerOpen.next(true);
          el.classList.add('content-container-opened');
        }, 25);
      }
    }
    closeContainer() {
      let el = (<HTMLElement>document.getElementById('content-container'));
      if (el) {
        el.classList.remove('content-container-opened');
        setTimeout(() => {
          this.isContainerOpen.next(false);
          el.classList.add('content-container-closed');
        }, 25);
      }
    }


    setViews(id: string) {
    
      this.apiService.regularGET(`https://api.countapi.xyz/hit/animettv-quick-bites/videoID-${id}`).subscribe(
        result => {
          if (result) {
            this.views.next(String(this.numberWithCommas(result.value)));
          }
        },
        error => {
          this.views.next('N/A');
        }
      );
    }

    numberWithCommas(x: Number) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    ngOnInit(): void {
      this.setWidthResolution();
    }

    setWidthResolution() {
      if (window.screen.width < 1367 ) {
        this.width = "100%";
      }
    }

}
