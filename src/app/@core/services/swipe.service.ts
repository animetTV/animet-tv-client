/* import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FeedService } from '../../@core/services/feed.service';

@Injectable()
export class SwipeService {
  isSwipedRight: boolean;
  isSwipedLeft: boolean;
  swipeRight_Change: Subject<boolean> = new Subject<boolean>();
  swipedLeft_Change: Subject<boolean> = new Subject<boolean>();

  constructor( private feedService: FeedService)   {
    this.swipeRight_Change.subscribe((value) => {
      this.isSwipedRight = value
      this.feedService.updateIndex('increment');
    });

    this.swipedLeft_Change.subscribe((value) => {
      this.isSwipedLeft = value;
      this.feedService.updateIndex('decrement');
    })

  }

  toggleSwipeRight() {
      this.swipeRight_Change.next(!this.isSwipedRight);
  }

  toggledSwipedLeft() {
    this.swipedLeft_Change.next(!this.isSwipedLeft);
  }
}
 */