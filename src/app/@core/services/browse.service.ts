import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BrowseService {
    isBrowse: BehaviorSubject<boolean> = new BehaviorSubject(false);
    initalBrowseResult: BehaviorSubject<string> = new BehaviorSubject(null);
    currentFileterType: BehaviorSubject<string> = new BehaviorSubject(null);
    currentGenreType: BehaviorSubject<string> = new BehaviorSubject(null);
    currentSourceType: BehaviorSubject<string> = new BehaviorSubject('gogoanime');

    constructor() {
        this.currentFileterType.subscribe(
            type => {
              localStorage.setItem('filterType' ,String(type));
            }
          );
    }

}