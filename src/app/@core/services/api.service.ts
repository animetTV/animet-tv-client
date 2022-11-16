import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Card } from '../../pages/home/home.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { TopSeason, SeasonsDetail, SearchResult, Rating, WatchAnimeResult, EpisodeStream, Genres, RecentlyAddedEntity, Spotlight, RecentlyAdded, Tops, CorsAnyWhereItem, jwplayerMP4SourceItem, PreparedTitle, CommentCount, AllTitles } from '../../types/interface';
import { SnackbarMessageComponent } from 'src/app/@theme/components/snackbar-message/snackbar-message.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, share, shareReplay, timeout } from 'rxjs/operators';
import { ExperimentAnimeTitles } from './experiment.service';
import { TraceMoeResponse } from 'src/app/pages/anime-tracer/anime-tracer-interface';

@Injectable()
export class ApiService {
 
  DEFAULT_HEADERS = new HttpHeaders({'Content-Type':'application/json; charset=utf-8'});
  cached_Trending: BehaviorSubject<TopSeason[]> = new BehaviorSubject(null);
  cache_Search_Result: BehaviorSubject<SearchResult[]> = new BehaviorSubject(null);
  cached_Upcoming: BehaviorSubject<TopSeason[]> = new BehaviorSubject(null);
  cached_AllTime_Popular: BehaviorSubject<TopSeason[]> = new BehaviorSubject(null);
  cached_Top_Of_The_Wekk: BehaviorSubject<TopSeason[]> = new BehaviorSubject(null);
  cached_AllTime_PopularHentai: BehaviorSubject<TopSeason[]> = new BehaviorSubject(null);
  cached_Search_Value: BehaviorSubject<string> = new BehaviorSubject(null);
  cached_Genres: BehaviorSubject<Genres> = new BehaviorSubject(null);
  cached_Movies: BehaviorSubject<SearchResult[]> = new BehaviorSubject(null);
  cached_RecentlyAdded: BehaviorSubject<RecentlyAdded> = new BehaviorSubject(null);
  cached_Spotlight: BehaviorSubject<Spotlight[]> = new BehaviorSubject(null);
  cached_Available60fpsTitlesCount: BehaviorSubject<Number> = new BehaviorSubject(0);
  cached_CorsAnyWhereList: BehaviorSubject<CorsAnyWhereItem[]> = new BehaviorSubject(null);
  
  constructor(private http: HttpClient,  public snackBar: MatSnackBar) { }

  regularGET(url: string, headers: any = ({ 'Content-Type':'application/json; charset=utf-8', 'X-Request-Width': 'XMLHttpRequest'})): Observable<any> {
    let HEADERS = new HttpHeaders(
      headers
    );
    if (headers.lenght > 0) {
      return this.http.get<any>(url, {headers: HEADERS});
    } else {
      return this.http.get<any>(url);
    }
  }
  regularPOST(url: string, body: any ): Observable<any> {
    return this.http.post<any>(url, body, { reportProgress: true})
  }

  postTracerMoe(url: string, formData: FormData):Observable<any>  {
    return this.http.post<TraceMoeResponse>(url, formData, { reportProgress: true})
  }

  // get top_daily feed
  getFeed(request: any): Observable<Card[]> {
    let params = new HttpParams().set('limit', request.limit).set('nsfw', request.nsfw);
    return this.http.get<Card[]>(environment.apiUrl + 'api/post/get-feed', { headers: this.DEFAULT_HEADERS, params: params }).pipe(share());
  }

  getRandomFeed(request: any): Observable<Card[]> {
    let params = new HttpParams().set('nsfw', request.nsfw);
    return this.http.get<Card[]>(environment.apiUrl + 'api/post/get-random-feed', { headers: this.DEFAULT_HEADERS, params: params });
  }

  postRating(request: Rating) {
    const body = request;

    this.http.post(environment.apiUrl + 'api/post/rate-post', body, { headers: this.DEFAULT_HEADERS })
      .subscribe(
        result => { }
      )
  }
 
  getCommentCount(slugID: string):Observable<CommentCount> {
    let params = new HttpParams().set('slug', slugID);
    return this.http.get<CommentCount>(environment.apiUrl + 'api/watch-anime/comment-count',  { headers: this.DEFAULT_HEADERS, params: params });
  }
  /* get current top season anime */
  getCurrentTopSeason(): Observable<TopSeason[]> {
    return this.http.get<TopSeason[]>(environment.apiUrl + 'api/popular/get-current-top-season', { headers: this.DEFAULT_HEADERS }).pipe(shareReplay(1), share());
  }

  getSeasonsDetail(): Observable<SeasonsDetail[]> {
    return this.http.get<[]>(environment.apiUrl + 'api/popular/get-seasons-data', { headers: this.DEFAULT_HEADERS }).pipe(share());
  }  

  getSeasonById(ID: string): Observable<TopSeason[]> {
    let params = new HttpParams().set('id', ID)
    return this.http.get<TopSeason[]>(environment.apiUrl + 'api/popular/get-season-by-id', { headers: this.DEFAULT_HEADERS, params: params });
  }

  getTrending(): Observable<TopSeason[]> {
    return this.http.get<TopSeason[]>(environment.apiUrl + 'api/popular/trending', { headers: this.DEFAULT_HEADERS }).pipe(shareReplay(1), share());
  }

  getUpcoming(): Observable<TopSeason[]> {
    return this.http.get<TopSeason[]>(environment.apiUrl + 'api/popular/upcoming', { headers: this.DEFAULT_HEADERS }).pipe(shareReplay(1), share());
  }

  getAllTime_Popular():Observable<TopSeason[]> {
    return this.http.get<TopSeason[]>(environment.apiUrl + 'api/popular/all-time-popular', { headers: this.DEFAULT_HEADERS}).pipe(shareReplay(1), share());
  }

  getAllTime_PopularHentai():Observable<TopSeason[]> {
    return this.http.get<TopSeason[]>(environment.apiUrl + 'api/popular/all-time-popular-hentai', { headers: this.DEFAULT_HEADERS}).pipe(shareReplay(1), share());
  }

  getAllGenres():Observable<any[]> {
    return this.http.get<any[]>(environment.apiUrl + 'api/popular/genres');
  }

  getAllMovies():Observable<any[]> {
    return this.http.get<any[]>(environment.apiUrl + 'api/popular/movies');
  }
  
  getRecentlyAdded() {
    return this.http.get<RecentlyAdded>(environment.apiUrl + 'api/popular/recently-added');
  }
  
  getSpotlight() {
    return this.http.get<Spotlight[]>(environment.apiUrl + 'api/popular/spotlight');
  }

  getAllAvailableSource_currentAnime() {
    let params = new HttpParams()
      .set("animeTitle", localStorage.getItem('animeTitle'));
    return this.http.get<any[]>(environment.streamAPI + 'api/watching/available-sources', {headers: this.DEFAULT_HEADERS, params: params});
  }

  getTitleAnime60fps(title: string) {
    let params = new HttpParams()
      .set('title',title);
    return this.http.get<any[]>(environment.apiUrl + 'api/watch-anime/anime60fps', {headers: this.DEFAULT_HEADERS, params: params});
  }

  getAvailable60fpsTitles() {
    return this.http.get<ExperimentAnimeTitles[]>(environment.apiUrl + 'api/watch-anime/anime60fps-available-titles', {headers: this.DEFAULT_HEADERS});
  }

  getAvailable60fpsTitlesCount() {
    return this.http.get<Number>(environment.apiUrl + 'api/watch-anime/anime60fps-available-titles-count', {headers: this.DEFAULT_HEADERS});
  }

  getTops() {
    return this.http.get<Tops>(environment.apiUrl + 'api/popular/tops', { headers: this.DEFAULT_HEADERS });
  }

  getUserSessionForToday() {
    return this.http.get<any>(environment.apiUrl + 'server-stat/total-sessions-today', { headers: this.DEFAULT_HEADERS });
  }

  getCorsAnyWhereList() {
    return this.http.get<CorsAnyWhereItem[]>(environment.apiUrl + 'server-stat/cors-anywhere-list', { headers: this.DEFAULT_HEADERS });
  }

  getFembedSourceById(id: string) {
    return this.http.get<jwplayerMP4SourceItem[]>(environment.streamAPI + `fembed/video/${id}`, { headers: this.DEFAULT_HEADERS });
  }

  getAnime2ById(id: string, episode: string) {
    return this.http.get<jwplayerMP4SourceItem[]>(environment.streamAPI + `9anime2/video/${id}/${episode}`);
  }

  getPreparedTitleAll() {
    return this.http.get<AllTitles>(environment.apiUrl + `api/popular/prepared-title-all`, { headers: this.DEFAULT_HEADERS});
  }

  /* search bar */
  // SLOW RESPONSE and rate limited DONT USE
 /*  searchByTerm(term: string): Observable<SearchResult[]> {
    let params = new HttpParams().set('term', term);
    return this.http.get<SearchResult[]>(environment.apiUrl + 'api/popular/search', { headers: this.DEFAULT_HEADERS, params: params });
  } */
  
  searchByTermGapi(term: string, nsfw: boolean = true): Observable<SearchResult[]> {
    let params = new HttpParams()
    .set('term', term.toLowerCase())
    .set('NSFW', String(nsfw));
    return this.http.get<SearchResult[]>(environment.apiUrl + 'api/popular/search', { headers: this.DEFAULT_HEADERS, params: params }).pipe(shareReplay(1));
  }

  searchByTerm(term: string): Observable<SearchResult[]> {
    let sourceType = localStorage.getItem('sourceType');
    let params = new HttpParams()
      .set('word', term.toLowerCase())
      .set('sourceType', sourceType);
    return this.http.get<SearchResult[]>(environment.streamAPI + 'api/search', { headers: this.DEFAULT_HEADERS, params: params });
  }

  /* searchByTermAnimetTV(term: string): Observable<SearchResult[]> {
    let params = new HttpParams()
      .set('word', term.toLowerCase())
    return this.http.get<SearchResult[]>('http://localhost:9899' + `/search/${term}`);
  } */
  searchByTermAnimetTV(term: string): Observable<SearchResult[]> {
    let params = new HttpParams()
      .set('word', term.toLowerCase())
    return this.http.get<SearchResult[]>(environment.apiUrl + 'api/popular/search', { headers: this.DEFAULT_HEADERS, params: params });
  }

  /* watch anime API */
  getAnime(animeTitle: string):Observable<WatchAnimeResult[]> {
    let params = new HttpParams().set('animeTitle', animeTitle.toLowerCase());
    return this.http.get<WatchAnimeResult[]>(environment.apiUrl + 'api/watch-anime/get-anime-available', { headers: this.DEFAULT_HEADERS, params: params });
  }

  getAnimeDetail(animeTitle: string): Observable<WatchAnimeResult[]> {
    let sourceType = localStorage.getItem('sourceType');
    let params = new HttpParams()
    .set('animeTitle', animeTitle)
    .set('sourceType', sourceType);
      
    return this.http.get<WatchAnimeResult[]>(environment.streamAPI + 'api/details/', { headers: this.DEFAULT_HEADERS, params: params}).pipe(timeout(20000));
    
    
  }

  getAnimeEpisode(episodeID: string) {
    let sourceType = localStorage.getItem('sourceType');
    let params = new HttpParams()
      .set('episodeID', episodeID)
      .set('sourceType', sourceType);


   return this.http.get<EpisodeStream>(environment.streamAPI + 'api/watching', { headers: this.DEFAULT_HEADERS, params: params });
  }
  
  getExternalPlayer(_episodeID: string) {
    let params = new HttpParams().set('episodeID', _episodeID);
     return this.http.get<EpisodeStream>(environment.apiUrl + 'api/watch-anime/gapi/get-episode-stream', { headers: this.DEFAULT_HEADERS, params: params });
  }

  snackbarMessage(_message: string, _duration: number = 1500){
    this.snackBar.openFromComponent(SnackbarMessageComponent, {
      duration: _duration,
      data: {
        message: _message
      }
    });
   }

 
   initalLoad() {
     var t0 = performance.now();
    this.getSpotlight().subscribe(
      data => {
        if (data) {
          this.cached_Spotlight.next(data);
        }
      }
    );

    this.getTops().subscribe(
      data => {
        if (data) {
          this.cached_Trending.next(data.TRENDING);
          this.cached_Upcoming.next(data.UPCOMING);
          this.cached_AllTime_Popular.next(data.ALL_TIME_POPULAR);
          this.cached_Top_Of_The_Wekk.next(data.TOP_OF_THE_WEEK);
        }
      }
    );

    this.getRecentlyAdded().subscribe(
      data => { 
        if (data) {
          this.cached_RecentlyAdded.next(data);
        }
      },
      error => {
        console.log(error);
        this.snackbarMessage(`sorry we couldn't fetch recently added`, 3000);
      }
    );

    this.getAllGenres().subscribe(
      data => {
        if (data) {
          this.cached_Genres.next(data[0]);
        }
      }
    );
    
    this.getAvailable60fpsTitlesCount().subscribe(
      count => {
        if (count) {
          this.cached_Available60fpsTitlesCount.next(count);
        }
       }
    )

    this.getCorsAnyWhereList().subscribe(
      data => {
        if (data) {
          this.cached_CorsAnyWhereList.next(data);
          var t1 = performance.now();
         console.log("%c Initial AnimetTV Data - response_time: " +`${~~(t1- t0)+ 'ms'}`, "color: #4BB543; font-size: 14px; font-weight: bold;");
        }
      }
    );
    
    }

    initialMovies() {
      this.getAllMovies().subscribe(
        data => {
          if (data) {
            this.cached_Movies.next(data[0].Movies);
          }
        }
      );
    }
}

