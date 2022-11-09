import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from 'src/app/@core/services/api.service';
import { WatchAnimeService } from 'src/app/@core/services/watch-anime.service';
import { Title } from "@angular/platform-browser";
import { MatDialog } from '@angular/material/dialog';
import { DialogMessageComponent } from 'src/app/@theme/components/dialog-message/dialog-message.component';

@Component({
  selector: 'app-anime-view',
  templateUrl: './anime-view.component.html',
  styleUrls: ['./anime-view.component.scss']
})
export class AnimeViewComponent implements OnInit {
  SOURCES = [];
  disqusIdentifier: BehaviorSubject<string> = new BehaviorSubject(null);
  currentTitle: string;
  isDisqusComment: BehaviorSubject<boolean> = new BehaviorSubject(false);
  commentCount: BehaviorSubject<string> = new BehaviorSubject(null);
  selectionMade: BehaviorSubject<boolean> = new BehaviorSubject(null);

  constructor(
    public apiService: ApiService,
    public watchAnimeService: WatchAnimeService,
    private route: ActivatedRoute,
    private titleService: Title,
    public dialog: MatDialog) {

    this.route.params.subscribe(
      params => {
        if (params['animeTitle']) {
          this.currentTitle = (params['animeTitle']);
          this.titleService.setTitle('Watch ' + params['animeTitle'])
          this.watchAnimeService.setCurrnetAnime(params['animeTitle']);
          this.watchAnimeService.checkAvailableSources();
        }
      }
    );

  }

  ngOnInit(): void {

    localStorage.setItem("isCR", 'false');
  }


  scrollTo(el: string) {
    let element = document.getElementById(el);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }

  }

  changeAnimeType($event: any) {
    this.route.params.subscribe(
      params => {
        if (params['animeTitle']) {
          this.watchAnimeService.setCurrnetAnime(params['animeTitle']);
        }

      }
    )
  }


  changeSourceType(sourceType: string) {
    localStorage.setItem('sourceType', sourceType);
    this.watchAnimeService.disableEpisodeSelect.next(true);
    this.route.params.subscribe(
      params => {
        if (params['animeTitle']) {
          this.watchAnimeService.setCurrnetAnime(params['animeTitle']);
        }

      }
    );
    this.highlightSourceType(sourceType);
  }

  highlightSourceType(sourceType: string) {
    for (let i = 0; i < this.SOURCES.length; i++) {
      if (this.SOURCES[i] === sourceType) {
        let el = (<HTMLElement>document.getElementById(sourceType));
        if (el) {
          el.classList.add('selected');
        }
      } else {
        let el = (<HTMLElement>document.getElementById(this.SOURCES[i]));
        if (el) {
          el.classList.remove('selected');
        }
      }
    }
  }

  showComments() {
    this.isDisqusComment.next(true);
    this.selectionMade.next(false);
  }

  setCommentCount(episodeNumber: Number) {

    let CorsEveryWhereProxy = "";
    this.apiService.cached_CorsAnyWhereList.subscribe(
      list => {
          if (list) {
              const assignedNode = localStorage.getItem('nearby_node'); 
              // filter list by users continent & exclude workers
              let filteredList = list.filter(el => {
                  return (el.continent === assignedNode) && (!el.url.includes('workers'));
              });
              if (filteredList.length > 0) {
                // randomly assing one of the cors everywhere proxys
                CorsEveryWhereProxy = `${filteredList[Math.floor(Math.random() * filteredList.length)].url}`;
              } else {
                CorsEveryWhereProxy = `${list[Math.floor(Math.random() * list.length)].url}`;
              }

              let slug = `https://animet.tv/video/${this.currentTitle}-0`;
              let url = `${CorsEveryWhereProxy}https://prodanimettv.disqus.com/count-data.js?1=${slug}`;
              fetch(url)
                .then((resp) => {
                  if(resp.ok) {
                    return resp.text();
                  } else {
                    return null;
                  }
                })
                .then((html_text) => {
                  if (html_text !== null && html_text.includes(`"counts":[{"id":"https:\/\/animet.tv\/video\/`)) {
                    let tmp = html_text.split(`,"comments":`)[2];
                    tmp = tmp.split("}")[0];
                    this.commentCount.next(String(tmp));
                  } else {
                    this.commentCount.next(`0`);
                  }
                })
                .catch((error) => {
                  console.log(error);
                  this.commentCount.next('N/A');

                })

          }
      }
  );


      // server side
    /* this.apiService.getCommentCount(slug).subscribe(
      commentCount => {
        this.commentCount.next(commentCount.comment);
      },
      error => {
        this.commentCount.next('N/A');
      }
    ) */
  }

  episodeSelected(episodeNumber: Number) {
    this.selectionMade.next(true);
    this.isDisqusComment.next(false);
    this.setCommentCount(episodeNumber);
    this.disqusIdentifier.next(`https://animet.tv/video/${this.currentTitle}-0`);
  }

  firstTimeChromeUsers() {
    if (this.isChrome() === true && this.getWasVisted() !== true && this.isMobileBrowser() === false) {
      this.openFirstTimeUserDialog();
    }
  }

  openFirstTimeUserDialog() {
    const dialogRef = this.dialog.open(DialogMessageComponent);

    dialogRef.afterClosed().subscribe(
      result => {
        localStorage.setItem("wasVisted", JSON.stringify(true));
      }
    );
  }

  isChrome() {
    let isChrome = navigator.userAgent.match(/Chrome\/\d+/) !== null;
    if (isChrome) {
      return true;
    } else {
      return false;
    }
  }


  getWasVisted() {
    if (localStorage.getItem("wasVisted") === undefined) {
      localStorage.setItem("wasVisted", JSON.stringify(false));
      return false;
    } else {
      let wasVisted = localStorage.getItem("wasVisted");
      return (wasVisted === 'true');
    }
  }

  isMobileBrowser() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      return true;
    }
    return false;
  }

}
