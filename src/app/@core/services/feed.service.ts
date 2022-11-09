/* import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { Card } from 'src/app/pages/home/home.component';
import { Rating } from 'src/app/shared/interface';
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable()
export class FeedService {

  currentFeedLimit: number;
  currentFeedLimit_Change: BehaviorSubject<number> = new BehaviorSubject(environment.feedLimit);
  index: number;
  indexChange: BehaviorSubject<number> = new BehaviorSubject(0);
  nsfwValue: boolean;
  nsfwValue_Change: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isFeedAvailable: BehaviorSubject<boolean> = new BehaviorSubject(false);
  cached_Feed: BehaviorSubject<Card[]> = new BehaviorSubject(null);

  constructor(private apiService: ApiService, private authService: AuthService) {
    this.indexChange.subscribe((newIndex) => {
      this.index = newIndex;
    });

    this.currentFeedLimit_Change.subscribe((newLimit) => {
      this.currentFeedLimit = newLimit;
    });

    this.nsfwValue_Change.subscribe((newState) => {
      this.nsfwValue = newState;
    })

  }

  updateIndex(swipeType: String) {

    if (swipeType === 'increment') {
      let newIndex = this.index + 1;
      let newFeedLimit = this.currentFeedLimit + environment.feedLimit;

      //  Update master feed
      if (newIndex > this.currentFeedLimit) {
        this.currentFeedLimit_Change.next(newFeedLimit);
      }
      this.indexChange.next(newIndex);

    } else if (swipeType === 'decrement') {
      let newIndex = this.index - 1;
      let newFeedLimit = this.currentFeedLimit - environment.feedLimit;

      if (newIndex < this.currentFeedLimit && newIndex > environment.feedLimit) {
        this.currentFeedLimit_Change.next(newFeedLimit);
      }
      if (newIndex > 1) {
        this.indexChange.next(newIndex);
      }
    }

  }


  loadMoreFeed(type: string) {
    const request = {
      limit: String(this.currentFeedLimit),
      nsfw: this.nsfwValue
    }

    if (type == 'top') {
      return this.apiService.getFeed(request);

    } else if (type == 'random') {
      const request = {
        nsfw: this.nsfwValue
      }

      return this.apiService.getRandomFeed(request);
    }
  }



  submitRating(request: Rating) {
    // check if user logged in 
    if (this.authService.currentUserValue !== null && this.authService.currentUserValue.accountID) {
      request.accountID = this.authService.currentUserValue.accountID;
      request.isUser = true;
      request.nsfw = this.nsfwValue;

      this.apiService.postRating(request);

    } else { //submit as guest 
      this.apiService.postRating(request);
    }
  }

  initalLoad() {
    this.loadMoreFeed('top').pipe(
      distinctUntilChanged()
    ).subscribe(
      feed_data => {
        if (feed_data) {
          this.cached_Feed.next(feed_data);
        }
      }
    )
  }

} */
