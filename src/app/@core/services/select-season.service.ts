import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import {
  GetNewSeason,
  SeasonsDetail,
  TopSeason,
} from 'src/app/shared/interface';
import { ApiService } from './api.service';
import { SnackbarMessageComponent } from 'src/app/@theme/components/snackbar-message/snackbar-message.component';

@Injectable({
  providedIn: 'root',
})
export class SelectSeasonService {
  selectNewSeason_Change: BehaviorSubject<boolean> = new BehaviorSubject(false);
  selectYear_Change: BehaviorSubject<boolean> = new BehaviorSubject(false);

  GET_NEW_SEASON: GetNewSeason;
  SELECTED_YEAR: number;
  SELECTED_SEASON: string;
  SELECTED_ID: string;
  SELECTED_SEASON_DATA: BehaviorSubject<TopSeason[]> = new BehaviorSubject(null);
  ALL_SEASON_DETAIL: BehaviorSubject<SeasonsDetail[]> = new BehaviorSubject(null);

  constructor(private apiService: ApiService, public snackBar: MatSnackBar) {
    this.apiService.getSeasonsDetail().subscribe(
      (result) => {
        if (result) {
          this.ALL_SEASON_DETAIL.next(result.reverse());
        }
      },
      (error) => {
        console.log(error);
      }
    );

    this.selectNewSeason_Change.subscribe((state) => {
      if (state) {
        this.getTopSeason(this.GET_NEW_SEASON);
      }
    });
  }

  getTopSeason(newSeasonReq: GetNewSeason) {
    /* update selected season */
    this.apiService.getSeasonById(newSeasonReq.id).subscribe((newSeason) => {
      if (newSeason) {
        this.SELECTED_SEASON_DATA.next(newSeason);
      } else {
        this.snackbarMessage(`Sorry We could't find it`);
      }
    });
  }

  selectYear(year: number) {
    this.SELECTED_YEAR = year;
  }

  selectSeason(season: string) {
    this.SELECTED_SEASON = season;

    /* get Id of selected year and season */

    this.getSeasonYearId();
  }

  getSeasonYearId() {
    this.ALL_SEASON_DETAIL.getValue().forEach((el) => {
      if (
        el.season_name === this.SELECTED_SEASON &&
        el.season_year === this.SELECTED_YEAR
      ) {
        this.GET_NEW_SEASON = {
          id: String(el.id),
          season: this.SELECTED_SEASON,
          year: this.SELECTED_YEAR,
        };
        this.selectNewSeason_Change.next(true);
      }
    });
  }

  snackbarMessage(_message: string, _duration: number = 1000) {
    this.snackBar.openFromComponent(SnackbarMessageComponent, {
      duration: _duration,
      data: {
        message: _message,
      },
    });
  }
}
