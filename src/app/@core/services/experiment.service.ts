import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { SnackbarMessageComponent } from 'src/app/@theme/components/snackbar-message/snackbar-message.component';
import { QuickBitsSource } from 'src/app/shared/interface';
import { ApiService } from './api.service';
import { fakeData } from './fake_quick_bites_data';

export interface Anime60fps {
    episodeNumber: number;
    src: string;
    iframe: boolean;
    download?:string;
}

export interface ExperimentAnimeTitles {
    title: string;
    cover_img: string;
    isDub: boolean,
    isSub: boolean,
    quality: string;
    isNew?: boolean;
    isRemastered?:boolean;
    isDownload: boolean;
    isNSFW: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ExperimentService {
    currentTitle: string;
    currentSelection: BehaviorSubject<ExperimentAnimeTitles> = new BehaviorSubject(null);
    currentTitleDATA: BehaviorSubject<Anime60fps[]> = new BehaviorSubject(null);
    availableTitles: BehaviorSubject<ExperimentAnimeTitles[]> = new BehaviorSubject(null);
    currentFeed: BehaviorSubject<QuickBitsSource[]> = new BehaviorSubject(null);
    currentVideoThumbnails: BehaviorSubject<string> = new BehaviorSubject('https://img.animet.site/file/animettv-avatars/other/animet-tv_chibi_1.png');
    currentTitleDownloadAvailable: boolean = false;
    constructor(private apiService: ApiService, public snackBar: MatSnackBar) {
    }

    setCurrentTitle(title: string) {
        this.currentTitle = title;
    }

    getCurrentTitle() {
        this.apiService.getTitleAnime60fps(this.currentTitle).subscribe(
            result => {
                if (result) {
                    let tmpArr:Anime60fps[] = [];

                    for (let i = 0; i < result['anime60fps'].length; i++) {
                        // check for iframe 
                        if (result['anime60fps'][i].iframe) {
                            tmpArr.push({
                                episodeNumber: result['anime60fps'][i].episode_number,
                                src: result['anime60fps'][i].src,
                                iframe: true,
                                download: result['anime60fps'][i].download
                            });
                        } else if (!result['anime60fps'][i].iframe) {
                            tmpArr.push({
                                episodeNumber: result['anime60fps'][i].episode_number,
                                src: result['anime60fps'][i].src,
                                iframe: false,
                                download: result['anime60fps'][i]?.download
                            });
                        }
                    }

                    this.currentTitleDATA.next(tmpArr);
                }
            },
            error => {
                console.log(error);
            }
        )
    }

    getAvailableTitle() {
        this.apiService.getAvailable60fpsTitles().subscribe(
            result => {
                if (result) {
                    this.availableTitles.next(result);
                }
            },
            error => {
                console.log(error);
                this.snackbarMessage(`Oops server being grumpy try again or let us know in our Discord Server. ERROR: ${error}`)
            }
        )
    }

    snackbarMessage(_message: string, _duration: number = 6500){
        this.snackBar.openFromComponent(SnackbarMessageComponent, {
          duration: _duration,
          data: {
            message: _message
          }
        })
       }

       getQuickBits() {
         
        this.currentFeed.next(fakeData);
       }


    shuffle(array: any) {
        let currentIndex = array.length,  randomIndex;
      
        // While there remain elements to shuffle...
        while (currentIndex != 0) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      
        return array;
      }
}