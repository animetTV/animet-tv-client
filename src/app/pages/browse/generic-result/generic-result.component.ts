import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { ApiService } from 'src/app/@core/services/api.service';
import { BrowseService } from 'src/app/@core/services/browse.service';
import { SelectSeasonService } from 'src/app/@core/services/select-season.service';
import { SearchResult } from 'src/app/types/interface';

@Component({
  selector: 'app-generic-result',
  templateUrl: './generic-result.component.html',
  styleUrls: ['./generic-result.component.scss'],
})
export class GenricResultComponent implements OnInit {
  Result_title: string;
  Result: BehaviorSubject<SearchResult[]> = new BehaviorSubject(null);

  pageNumber: number = 1;
  maxSize: number = 7;
  _itemsPerPage: number;
  showPagination: BehaviorSubject<boolean> = new BehaviorSubject(false);
  currnetSearchTerm: string;
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  // Movies
  isMovie: boolean = false;
  showMovieSearchbar: BehaviorSubject<boolean> = new BehaviorSubject(false);
  movieCtrl: FormControl = new FormControl();
  filteredMovies: Observable<SearchResult[]>;
  totalMovies: string;

  constructor(
    public apiService: ApiService,
    public browseService: BrowseService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private titleService: Title,
    private selectSeason: SelectSeasonService
  ) {
    this.isHandset$.subscribe((isMobile) => {
      if (isMobile) {
        this.maxSize = 3;
        this._itemsPerPage = 20;
      } else {
        this.maxSize = 7;
        this._itemsPerPage = 45;
      }
    });

    if (this.router.url === '/browse/genre') {
        window.scrollTo(0, 0);

      // turn off ep number
      this.browseService.currentFileterType.next('trending');

      this.browseService.currentGenreType
        .pipe(distinctUntilChanged())
        .subscribe((genreType) => {
          if (genreType && genreType !== null) {
            this.Result_title = genreType;
            this.titleService.setTitle(genreType + ` - AnimetTV`);
            let choosenGenre = genreType.split(' ').join('_');
            choosenGenre = choosenGenre.split('-').join('_');

            localStorage.setItem('lastGenre', genreType);
            // fetch genreType list from cached genres
            let genres = this.apiService.cached_Genres.getValue();
            let _data = genres[`${choosenGenre}`];

            // remove dups
            _data = this.uniqByKeepLast(_data, (it) => it.title);

            this.Result.next(_data);
            this.showPagination.next(true);
            this.pageNumber = 1;
          }
        });
    } else if (this.router.url === '/browse/movie') {
      // check if already cached
      this.apiService.cached_Movies.subscribe((movies) => {
        if (movies === null) {
          this.apiService.initialMovies();
        }
      });

      // scroll to top
      window.scrollTo(0, 0);

      // turn off ep number
      this.browseService.currentFileterType.next('trending');

      this.titleService.setTitle('Movies - AnimetTV');
      this.Result_title = 'Movies';
      this.isMovie = true;
      // get movies
      this.apiService.cached_Movies.subscribe((data) => {
        if (data) {
          // remove dub tags from title because backend will take care of if dub exists or not
          var results_without_dub = data.filter((el) => {
            if (!el.title.includes('(Dub)')) {
              return el;
            }
          });

          this.Result.next(results_without_dub);
          this.showPagination.next(true);
          this.pageNumber = 1;
          this.totalMovies = this.numberWithCommas(
            results_without_dub.length.toString()
          );
        }
      });

      // movie search filter
      /* this.filteredMovies = this.movieCtrl.valueChanges.pipe(
                debounceTime(20),
                distinctUntilChanged(),
                map(searchTerm => searchTerm ? this.filterMovies(searchTerm) : this.Result.slice())
            ); */
    } else if (this.router.url === '/browse/season') {
      this.selectSeason.SELECTED_SEASON_DATA.pipe(distinctUntilChanged()).subscribe(
        result => {
          if (result) {
            let pageTitle = `${this.selectSeason.SELECTED_SEASON} ${this.selectSeason.SELECTED_YEAR}`;
            this.titleService.setTitle(`${pageTitle} - AnimetTV`);
            this.Result_title = pageTitle;
            this.Result.next(result);
          }
        }
      )
    }
  }

  numberWithCommas(x: string) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // Searchbar Movies
  /* filterMovies(title: string) {        
        let result = this.Result.filter(anime => anime.title.toLocaleLowerCase().indexOf(title.toLocaleLowerCase()) !== -1);

        if (result.length > 0) {
            return result;
        } else {
             // regular search
          this.apiService.searchByTerm(title).subscribe(
            result => {
              if (result.length > 0) {
                // remove dub tags from title because backend will take care of if dub exists or not
                var results_without_dub = result.filter(
                  el => {
                    if (!el.title.includes('(Dub)')) {
                      return el;
                    }
                  }
                );
                this.Result = results_without_dub;     
              }

            }, 
            error => {
              console.log(error);
            }
          );
        }
    } */

  getRandomMovie() {
    this.apiService.cached_Movies.subscribe((movies) => {
      this.Result.next(null);
      this.isHandset$.subscribe((isMobile) => {
        if (isMobile) {
          this.Result.next(this.getRandom(movies, 4));
        } else {
          this.Result.next(this.getRandom(movies, 6));
        }
      });
    });
  }

  getRandom(arr: SearchResult[], n) {
    var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
    if (n > len)
      throw new RangeError('getRandom: more elements taken than available');
    while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
  }

  // remove dupes
  uniqByKeepLast(data: any, key: any) {
    return [...new Map(data.map((x) => [key(x), x])).values()];
  }

  ngOnInit() {
    if (this.router.url === '/browse/genre') {
      // load last choosen genre
      this.browseService.currentGenreType.subscribe((genre) => {
        if (genre === null) {
          let lastGenre = localStorage.getItem('lastGenre');
          if (lastGenre) {
            this.Result_title = lastGenre;
            let choosenGenre = lastGenre.split(' ').join('_');
            choosenGenre = choosenGenre.split('-').join('_');
            this.apiService.cached_Genres.subscribe((data) => {
              let _data = data[`${lastGenre}`];
              // remove dups
              _data = this.uniqByKeepLast(_data, (it) => it.title);

              this.Result = _data;
              this.showPagination.next(true);
              this.pageNumber = 1;
            });
          }
        }
      });
    }
  }

  toggleSearchMovies() {
    let searchbar_icon = <HTMLElement>document.getElementById('search-icon');
    this.showMovieSearchbar.next(!this.showMovieSearchbar.getValue());

    if (this.showMovieSearchbar.getValue()) {
      this.showPagination.next(false);
      searchbar_icon.classList.add('highlight');
    } else {
      this.showPagination.next(true);
      searchbar_icon.classList.remove('highlight');
    }
  }

  scrollToTop() {
    window.scrollTo(0, 0);
  }
}
