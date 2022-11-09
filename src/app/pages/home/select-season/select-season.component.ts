import { Component } from '@angular/core';
import { SeasonSelect } from '../../../shared/interface';
import { SelectSeasonService } from '../../../@core/services/select-season.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-select-season',
  templateUrl: './select-season.component.html',
  styleUrls: ['./select-season.component.scss']
})
export class SelectSeasonComponent  {

  SEASONS: SeasonSelect[] = [
    {
      season_name: 'Spring',
      color: '#D6F1C6',
      season: 'Spring',
      path: `${environment.animettvIMGCDN}other/Spring_Anime_Girl-${String(Math.floor(Math.random() * 3) + 1)}.webp`
    },
    {
      season_name: 'Summer',
      color: '#ffb4c3',
      season: 'Summer',
      path: `${environment.animettvIMGCDN}other/Summer_Anime_Girl-${String(Math.floor(Math.random() * 3) + 1)}.webp`
    },
    {
      season_name: 'Fall',
      color: '#e7bc9f',
      season: 'Fall',
      path: `${environment.animettvIMGCDN}other/Fall_Anime_Girl-${String(Math.floor(Math.random() * 3) + 1)}.webp`
    },
    {
      season_name: 'Winter',
      color: '#C9F1FD',
      season: 'Winter',
      path: `${environment.animettvIMGCDN}other/Winter_Anime_Girl-${String(Math.floor(Math.random() * 3) + 1)}.webp`
    }
    
  ]
  
  constructor(private selectSeasonService: SelectSeasonService) {
  }
  
  
  selectSeason(season: string) {
    this.selectSeasonService.selectSeason(season);
    this.selectSeasonService.selectYear_Change.next(false);
    let current_season = (<HTMLElement>document.getElementById('current-season'));
    if (current_season) {
      setTimeout(() => {
        current_season.focus();
      }, 150)
    }
  }
  
}
