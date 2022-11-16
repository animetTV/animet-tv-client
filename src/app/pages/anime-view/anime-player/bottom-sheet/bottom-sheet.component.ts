import { Component, Inject, OnInit } from '@angular/core';
import { MatBottomSheet, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { BehaviorSubject } from 'rxjs';
import { WatchAnimeService } from 'src/app/@core/services/watch-anime.service';
import { Download } from 'src/app/types/interface';

@Component({
    selector: 'app-bottom-sheet',
    templateUrl: './bottom-sheet.component.html',
    styleUrls: ['./bottom-sheet.component.scss']
})
export class BottomSheetComponent {
    DownloadList: BehaviorSubject<Download[]> = new BehaviorSubject(null);
    DownloadTitle: BehaviorSubject<string> = new BehaviorSubject(null);
    constructor(private _bottomSheet: MatBottomSheet,
        public watchAnimeService: WatchAnimeService,
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: Download[], 
        ) {            
            this.DownloadList.next(data);
            this.DownloadTitle.next(`Download: ${this.watchAnimeService.animeTitle} Ep: ${this.watchAnimeService.currentEp}`)
        }

        closeSheet() {
            this._bottomSheet.dismiss();
        }
}
