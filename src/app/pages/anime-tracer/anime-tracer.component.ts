import { Component, ViewChild, ElementRef, HostListener, OnDestroy} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/@core/services/api.service';
import { UserService } from 'src/app/@core/services/user.service';
import { environment } from 'src/environments/environment';
import { SnackbarMessageComponent } from 'src/app/@theme/components/snackbar-message/snackbar-message.component';
import { WatchAnimeService } from 'src/app/@core/services/watch-anime.service';
import { TraceMoeResponse, Result } from './anime-tracer-interface';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
    selector: 'app-anime-tracer',
    templateUrl: './anime-tracer.component.html',
    styleUrls: ['./anime-tracer.component.scss']
})
export class AnimeTracerComponent implements OnDestroy {
    @ViewChild('fileUpload') fileUploadEl: ElementRef;
    fName = '';
    contents: any[];
    name = '';
    private destroy$ = new Subject();
    isUploading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    TracerResult: BehaviorSubject<Result[]> = new BehaviorSubject(null);
    MostSimilar: Result;
    DoneTracing: BehaviorSubject<boolean> = new BehaviorSubject(false);
    isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
    constructor( private breakpointObserver: BreakpointObserver, private watchService: WatchAnimeService, private snackBar: MatSnackBar, private userService: UserService, private apiService: ApiService) { }

    public fileChanged(event): void {
      this.isUploading.next(true);
      this.watchService.isBuffering.next(true);
      
      const target = event.target as HTMLInputElement;
      const files = target.files as FileList;
      this.uploadToTracerMoe(files[0]);
      
      }
    

    uploadToTracerMoe(file: File) {
      const url = "https://api.trace.moe/search";
      const formData = new FormData();
      formData.append("imag", file);
      
      this.apiService.postTracerMoe(url, formData).pipe(takeUntil(this.destroy$)).subscribe(
        res => {
          if (res) {
            this.DoneTracing.next(true);
            this.TracerResult.next(res.result);
            this.MostSimilar = res.result[0];
            
            let ids = [];
            res.result.forEach(el => {
              ids.push(el.anilist);
            });
            
            this.isUploading.next(false);
            this.watchService.isBuffering.next(false);
          }
        }, 
        error => {
          console.log(error);
        }
      )
    }

    fetchAnilistDetail(anilist_IDS: string[]) {
      let url = `https://cors-anywhere.demonking.workers.dev/?https://trace.moe/anilist/`;
      let body = `{\"query\":\"query ($ids: [Int]) {\\n            Page(page: 1, perPage: 50) {\\n              media(id_in: $ids, type: ANIME) {\\n                id\\n                title {\\n                  native\\n                  romaji\\n                  english\\n                }\\n                type\\n                format\\n                status\\n                startDate {\\n                  year\\n                  month\\n                  day\\n                }\\n                endDate {\\n                  year\\n                  month\\n                  day\\n                }\\n                season\\n                episodes\\n                duration\\n                source\\n                coverImage {\\n                  large\\n                  medium\\n                }\\n                bannerImage\\n                genres\\n                synonyms\\n                studios {\\n                  edges {\\n                    isMain\\n                    node {\\n                      id\\n                      name\\n                      siteUrl\\n                    }\\n                  }\\n                }\\n                isAdult\\n                externalLinks {\\n                  id\\n                  url\\n                  site\\n                }\\n                siteUrl\\n              }\\n            }\\n          }\\n          \",\"variables\":{\"ids\":${anilist_IDS}}}`;
      
      this.apiService.regularPOST(url, body).pipe(takeUntil(this.destroy$)).subscribe(
        res => {
          console.log(res);
          
        }
      )
    }
    uploadToFreeImageHost(file: any) {
      let url = `https://cors-anywhere.demonking.workers.dev/?https://freeimage.host/api/1/upload?key=${environment.freeImageAPI}&action=upload&source=file`;
      const formData = new FormData();
      formData.append("imag", file);

      let proxy_list = this.apiService.cached_CorsAnyWhereList.value;
      let PayloadURL = ``;
      /* if (proxy_list.length > 0) {
          PayloadURL = `${proxy_list[Math.floor(Math.random() * proxy_list.length)].url}${url}}`
      } else {
          PayloadURL = `https://cors-anywhere-zeuz-na.herokuapp.com/${url}`;
      } */
      PayloadURL = `https://cors-anywhere.demonking.workers.dev/?${url}`;

      

      this.apiService.regularPOST(PayloadURL, formData).pipe(takeUntil(this.destroy$)).subscribe(
        result => {
          if (result) {
            console.log(result);
          }
        },
        error => {
          console.log(error);
        }
      )
      /* 
      
      https://soruly.github.io/trace.moe-api/#/docs
      */
    }


  snackbarMessage(_message: string, _duration: number = 5000) {
    this.snackBar.openFromComponent(SnackbarMessageComponent, {
      duration: _duration,
      data: {
        message: _message
      }
    })
  }

  secoundsToTimeStamp(sec: number) {
    sec = Number(sec);

    var h = Math.floor(sec / 3600);
    var m = Math.floor(sec % 3600 / 60);
    var s = Math.floor(sec % 3600 % 60);

    return ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
  }

  numToTwoDecimal (val) {
    val = val *100;
    var num = val;
    var with2Decimals = num.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]
    return with2Decimals ;
  }

  reset() {
    this.DoneTracing.next(false);
    this.MostSimilar = null;
    this.TracerResult.next(null);
  }

  switchMain(pos: number) {
    this.MostSimilar = this.TracerResult.getValue()[pos];    
  }

  @HostListener('unloaded')
  ngOnDestroy(): void {
    setTimeout(() => {
      this.destroy$.next();
      this.destroy$.complete();
    }, 20);
  }
    
}
