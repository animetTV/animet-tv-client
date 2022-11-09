import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from 'src/app/@core/services/api.service';
import { BrowseService } from 'src/app/@core/services/browse.service';
import { WatchAnimeService } from 'src/app/@core/services/watch-anime.service';
import { AllTitles, PreparedTitle } from 'src/app/shared/interface';

@Component({
    selector: 'app-a_z_list',
    templateUrl: './a-z-list.component.html',
    styleUrls: ['./a-z-list.component.scss']
})
export class A_Z_ListComponent implements OnInit {
    displayedColumns: string[] = ['title',];
    dataSource = new MatTableDataSource(null);
    allTitles: AllTitles;
    dataAll: PreparedTitle[] = []; 
    lang = 'sub';
    lastShow = 'A';
    totalTitles = "";
    totalSub = "";
    totalDub = "";
    isLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);
    checked = false;

    constructor(
        private apiService: ApiService,
        private browseService: BrowseService,
        private watchAnimeService: WatchAnimeService,
        private router: Router,
        private titleService: Title,
        ) {
            this.titleService.setTitle(`A-Z List - AnimetTV`);
        }

        onChange(event) {
            this.checked = event.checked;
            if (event.checked) {
                this.dataAll = this.allTitles.crunchyroll;
                this.show(this.lastShow);
                this.totalTitles = this.numberWithCommas(this.dataAll.length.toString());
                
            }else {
                this.dataAll = this.allTitles.gogoanime;
                this.show(this.lastShow);
                this.totalTitles = this.numberWithCommas(this.dataAll.length.toString());

            }
        }

    show(filterType: string) {
        let rawdata = this.dataAll;
        this.lastShow = filterType;
        var n, a, s, i = "";
        let data = [], j = 0;
        var l = Object.keys(rawdata).length;
        if ("#" === (filterType = filterType.toLowerCase()))
            for (var r = 0; r < l; r++)
                (s = rawdata[r].title.toLowerCase()).trim().charAt(0).match(/[^A-Za-z]/i) && this.langCheck(s) && (data[j++] = rawdata[r]);
        else
            for (r = 0; r < l; r++)(s = rawdata[r].title.toLowerCase()).trim().charAt(0) === filterType && this.langCheck(s) && (data[j++] = rawdata[r]);
        data.sort((function (e, t) {
            return e.title.trim() < t.title.trim() ? -1 : e.title.trim() > t.title.trim() ? 1 : 0
        }));
        this.dataSource = new MatTableDataSource(data);
    }
    langCheck(e: any) {
        return "any" === this.lang || ("dub" === this.lang ? e.includes("dub)") : !e.includes("dub)"))
    }

    typeChange(event: any) {
        this.lang = event.value;
        this.show(this.lastShow);
        
    }
    setAnime(animeTitle: string) {
        localStorage.setItem('sourceType', 'gogoanime');
        this.browseService.currentSourceType.next('gogoanime');
        this.watchAnimeService.isContinueWatchSelected.next(false);
        this.router.navigate(['video', animeTitle]);
    }
    ngOnInit(): void {
        this.apiService.getPreparedTitleAll().subscribe(
            result => {
                if (result) {
                    this.isLoaded.next(true);
                    this.allTitles = result;
                    this.dataAll = result.gogoanime;
                    this.show('A');
                    this.totalTitles = this.numberWithCommas(result.gogoanime.length.toString());
                }
            }
        )
    }

    numberWithCommas(x: string) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
}
