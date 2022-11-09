import { Component, Input, OnChanges, OnInit } from '@angular/core';
declare var jwplayer: any;

@Component({
  selector: 'app-jwplayer',
  templateUrl: './jwplayer.component.html',
  styleUrls: ['./jwplayer.component.scss']
})
export class JwplayerComponent implements OnChanges {
  @Input() _file: string;
  @Input() _type: string;
  @Input() _width: string;

  constructor() {
  
  }

  ngOnChanges() {
    /**********THIS FUNCTION WILL TRIGGER WHEN PARENT COMPONENT UPDATES 'someInput'**************/
      const playerJw = jwplayer('player').setup({
        title: 'Player Test',
        playlist: [
            {
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
        width: this._width,
        aspectratio: '16:9',
        mute: false,
        autostart: true,
        primary: 'html5'
      });

    }   



}