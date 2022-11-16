import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AfterViewInit, Component, OnInit, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
} from 'rxjs/operators';
import { ApiService } from 'src/app/@core/services/api.service';
import { BrowseService } from 'src/app/@core/services/browse.service';
import { WatchAnimeService } from 'src/app/@core/services/watch-anime.service';
import { SearchResult } from 'src/app/types/interface';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
})
export class BrowseComponent implements OnInit, AfterViewInit {
  
  animes: BehaviorSubject<SearchResult[]> = new BehaviorSubject(null);
  
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  pageNumber: number = 1;
  maxSize: number = 7;
  showPagination: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isShowMore: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);

  // Searchbar
  animeCtrl: FormControl;
  /* filteredAnimes: Observable<SearchResult[]>; */
  animeList: SearchResult[] = [];
  currnetSearchTerm: string = '';
  isShowAdsChecked: boolean = this.getShowAdsState();
  @ViewChildren('animeInput') vc;

  constructor(
    public apiService: ApiService,
    public watchAnimeService: WatchAnimeService,
    public browseService: BrowseService,
    private breakpointObserver: BreakpointObserver,
    private titleService: Title
  ) {
    this.watchAnimeService.availableSources.next(null);
    this.titleService.setTitle('Search - AnimetTV');
    this.watchAnimeService.reset();
    this.isHandset$.subscribe((isMobile) => {
      if (isMobile) {
        this.maxSize = 3;
      } else {
        this.maxSize = 7;
      }
    });

    /* SEARCHBAR */
    this.animeCtrl = new FormControl();

    this.animeCtrl.valueChanges
      .pipe(
        // time between events
        debounceTime(230),
        // If previous query is diffent from current
        distinctUntilChanged()
      )
      .subscribe((newValue) => {
        if (newValue.length > 2) {
          // save last search value
          localStorage.setItem('lastSearched', newValue);
          this.isLoaded.next(true);
          // regular search
          this.apiService.searchByTermAnimetTV(newValue).subscribe(
            (result) => {
              if (result) {
                if (result.length > 1) {
                  // remove dub tags from title because backend will take care of if dub exists or not
                  var results_without_dub = result.filter((el) => {
                    if (!el.title.includes('(Dub)')) {
                      return el;
                    }
                  });

                  // if results are less than 5
                  if (
                    results_without_dub.length < 6 ||
                    results_without_dub.length === 6
                  ) {
                    this.isShowMore.next(true);
                  } else {
                    this.isShowMore.next(false);
                  }
                  this.animeList = results_without_dub;
                  this.animes.next(results_without_dub);
                  this.apiService.cache_Search_Result.next(results_without_dub);
                  this.showPagination.next(false);
                } else {
                  this.isShowMore.next(true);
                  // if result empty use gogo search
                  this.searchCurrentVal();
                }
                this.isLoaded.next(false);
              } else {
                this.isLoaded.next(false);
              }
            },
            (error) => {
              this.isLoaded.next(false);
              console.log(error);
            }
          );
        } else {
          this.showPagination.next(true);
          this.setFilterResult();
        }
      });
  }

  /* SEARCHBAR */
  filteranimes(title: string) {
    return this.animeList.filter(
      (anime) => anime.title.toLowerCase().indexOf(title.toLowerCase()) === 0
    );
  }

  searchCurrentVal() {
    this.isShowMore.next(false);
    this.currnetSearchTerm = this.animeCtrl.value;
    this.apiService.searchByTerm(this.animeCtrl.value).subscribe(
      (result) => {
        if (result) {
          this.animeList = result;
          this.animes.next(result);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  ngOnInit(): void {
    /*  this.apiService.cache_Search_Result.subscribe(
        searchResult => {
          let searchBarVal = (document.getElementById("searchbar") as HTMLTextAreaElement).value;
          
          if (searchResult && searchBarVal.length > 0) {
            this.animes.next(searchResult);
          }
        }
        ); */
    this.cachedResult();
  }

  ngAfterViewInit() {
    window.scrollTo(0, 0);
  }

  ngOnDestroy(): void {
    // save last search value
    localStorage.setItem('lastSearched', this.animeCtrl.value);

    this.browseService.isBrowse.next(false);
  }

  scrollTo(el: string) {
    let element = document.getElementById(el);
    element.scrollIntoView({
      behavior: 'smooth',
    });
  }

  getTrending() {
    this.apiService.cached_Trending.subscribe((data) => {
      if (data) {
        this.pageNumber = 1;
        this.animes.next(data);
        this.browseService.currentFileterType.next('trending');
      }
    });
  }

  getUpcoming() {
    this.apiService.cached_Upcoming.subscribe((data) => {
      if (data) {
        this.pageNumber = 1;
        this.animes.next(data);
        this.browseService.currentFileterType.next('upcoming');
      }
    });
  }

  getAllTimePopular() {
    this.apiService.cached_AllTime_Popular.subscribe((data) => {
      if (data) {
        this.pageNumber = 1;
        this.animes.next(data);
        this.browseService.currentFileterType.next('alltime_popular');
      }
    });
  }

  getRecentlyAdded() {
    this.apiService.cached_RecentlyAdded.subscribe((data) => {
      if (data) {
        this.pageNumber = 1;
        this.animes.next(data.SUB);
        this.browseService.currentFileterType.next('recently_added');
      }
    });
  }

  setFilter(type: string) {
    this.addFilterHlight(type);
    if (type === 'trending') {
      this.getTrending();
    } else if (type === 'alltime_popular') {
      this.getAllTimePopular();
    } else if (type === 'upcoming') {
      this.getUpcoming();
    } else if (type === 'recently_added') {
      this.getRecentlyAdded();
    }
  }

  removeFilterHlight(id: string) {
    const el = <HTMLElement>document.getElementById(id);

    if (el !== null) {
      el.classList.remove('filter-btn-selected');
    }
  }
  addFilterHlight(id: string) {
    /* reset */
    this.removeFilterHlight('trending');
    this.removeFilterHlight('alltime_popular');
    this.removeFilterHlight('upcoming');
    this.removeFilterHlight('recently_added');
    /* apply */
    setTimeout(() => {
      let el = <HTMLElement>document.getElementById(id);
      if (el) {
        el.classList.add('filter-btn-selected');
      }
    }, 100);
  }

  cachedResult() {
    // show cached result if fetch results
    let lastSearched = localStorage.getItem('lastSearched');
    if (
      lastSearched !== null &&
      lastSearched.length > 2 &&
      lastSearched !== 'null'
    ) {
      this.animeCtrl.setValue(lastSearched);
      this.apiService.cache_Search_Result.subscribe((result) => {
        if (result && result.length > 0) {
          this.animes.next(result);
          this.animeList = result;
        } else {
          this.searchCurrentVal();
        }
      });
    } else {
      this.setFilterResult();
    }
  }

  setFilterResult() {
    this.browseService.isBrowse.next(true);
    let lastFilterType = this.browseService.currentFileterType.getValue();

    // keep filter type else set initial
    if (lastFilterType) {
      this.setFilter(lastFilterType);
    } else {
      this.browseService.initalBrowseResult.subscribe((initalType) => {
        if (initalType) {
          this.setFilter(initalType);
        } else {
          this.setFilter('recently_added');
        }
      });
    }
  }

  onFocuse() {
    this.browseService.currentFileterType.next('trending');
    this.setFilter('');
  }

  scrollToTop() {
    window.scrollTo(0, 0);
  }

  getShowAdsState() {
    if (localStorage.getItem('isShowAdsChecked') === null) {
      localStorage.setItem('isShowAdsChecked', 'true');
    }
    let isShowAdsChecked = localStorage.getItem('isShowAdsChecked');
    return JSON.parse(isShowAdsChecked) === true;
  }
}
