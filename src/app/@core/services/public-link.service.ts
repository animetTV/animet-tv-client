import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { List, Profile } from 'src/app/types/interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicLinkService {
  DEFAULT_HEADERS = new HttpHeaders({'Content-Type':'application/json; charset=utf-8'});
  CONTINUE_WATCHING: BehaviorSubject<List[]> = new BehaviorSubject(null);
  PLAN_TO_WATCH: BehaviorSubject<List[]> = new BehaviorSubject(null);
  COMPLETED:  BehaviorSubject<List[]> = new BehaviorSubject(null);
  PUBLIC_USER: BehaviorSubject<Profile> = new BehaviorSubject(null);
  
  constructor(private http: HttpClient) { }

  getPublicList(accountID: string) {
    let params = new HttpParams().set('accountID', accountID);

    this.http.get<any>(environment.apiUrl + 'api/post/get-public-user-list', { headers: this.DEFAULT_HEADERS, params: params }).subscribe(
      result => {
        console.log(result);
        
        if (result && result !== null) {
          this.PLAN_TO_WATCH.next(result.list.plan_to_watch);
          this.COMPLETED.next(result.list.completed);
          this.CONTINUE_WATCHING.next(result.list.continue_watching);
          this.PUBLIC_USER.next(result.profile);
        }
      },
      error => {
        console.log(error);
      }
    )
  }




}
