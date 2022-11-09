import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AnimesEntity, MustWatch } from 'src/app/shared/interface';
import { MustWatchList } from './data';

@Component({
  selector: 'app-must-watch',
  templateUrl: './must-watch.component.html',
  styleUrls: ['./must-watch.component.scss']
})
export class MustWatchComponent {
  MustWatch = MustWatchList;
  SelectedMustWatch: BehaviorSubject<AnimesEntity[]> = new BehaviorSubject(null);
  SelectedMustWatchs: BehaviorSubject<MustWatch[]> = new BehaviorSubject(null);

  Type: BehaviorSubject<string> = new BehaviorSubject(null);
  showChipAmount: number = 10;
  startIndex: number;
  endIndex: number;

  constructor() {
    // initial selection 
    this.setTodayMustWatch();
  }
  
  setTodayMustWatch() {
    let dayOftheWeek = this.userDayOfWeekAsNumber();
    this.startIndex = dayOftheWeek * 7;
    this.endIndex = (this.startIndex + 7);

    let tmp: MustWatch[] = []; 
    for (let i = this.startIndex; i < this.endIndex; i++) {
      tmp.push(this.MustWatch[i]);
    }
 
    this.SelectedMustWatchs.next(tmp);
  }
  setSelection(type: string) {
    this.MustWatch.every(el => {
      if (el.type === type) {
        this.SelectedMustWatch.next(el.animes);
        this.Type.next(type);
        return false;
      }

      return true;
    });
  }
  trackBy(index: number, item: AnimesEntity) {
    return item.title;
  }

  public scroll() {
    let el = document.getElementById('target');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  showAllChips() {
    this.showChipAmount = this.MustWatch.length;
  }
  minimizeChips() {
    this.showChipAmount = 10;
  }

  userDayOfWeekAsNumber() {
    return [1,2,3,4,5,6,7,][new Date().getDay()];
  }
}
