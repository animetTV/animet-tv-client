import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ExperimentService } from 'src/app/@core/services/experiment.service';
declare var jwplayer: any;

@Component({
  selector: 'app-jwplayer',
  templateUrl: './jwplayer.component.html',
  styleUrls: ['./jwplayer.component.scss']
})
export class JwplayerComponent implements OnChanges {
  @Input() _show: boolean;
  @Input() _file: string;
  @Input() _type: string;
  thumbNailUrl: string;

  constructor(private experimentService: ExperimentService) {
  
  }
  ngOnChanges() {
    this.experimentService.currentVideoThumbnails.subscribe(
      url => {
        if (url) {
          this.thumbNailUrl = url;
        }
      }
    )

    /**********THIS FUNCTION WILL TRIGGER WHEN PARENT COMPONENT UPDATES 'someInput'**************/
    if (this._file) {
      if (this._file.includes('m3u8')) {
        const playerJw = jwplayer('player').setup({
          title: 'Player Test',
          playlist: [
              {
                image: `${this.thumbNailUrl}`,
                  sources: [
                      {
                          default: false,
                          type: this._type,
                          file: this._file,
                          lable: "0"
                      }
                  ]
              }
          ],
          horizontalVolumeSlider: true,
          width: '100%',
          aspectratio: '16:9',
          mute: false,
          autostart: true,
          primary: 'html5',
          hlshtml: true
        });
      } else if (this._type === 'mp4') {
        const playerJw = jwplayer('player').setup({
          title: 'Player Test',
          playlist: [
              {
                image: `${this.thumbNailUrl}`,
                  sources: [
                      {
                          default: false,
                          type: this._type,
                          file: this._file,
                          lable: "0"
                      }
                  ]
              }
          ],
          horizontalVolumeSlider: true,
          width: '100%',
          aspectratio: '16:9',
          mute: false,
          autostart: false,
          primary: 'html5',
          hlshtml: true
        });
      } else {
        let JWPlayer = (<HTMLElement>document.getElementById('player'));
        if (JWPlayer) {
          JWPlayer.style.display = 'none';
          // stop session
          jwplayer('player').stop();
        }
      }
    }
  }   


}