import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SynopsisDialogService {
    isOpen: boolean;
    isOpen_Change: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor() {
        this.isOpen_Change.subscribe( newState => {
            this.isOpen = newState;
        })
    }

    openDialog() {
        this.isOpen_Change.next(true);
    }

    closeDialog() {
        this.isOpen_Change.next(false);
    }
    
}