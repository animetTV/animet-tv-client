import { Component, Input, OnChanges } from '@angular/core';
import { ApiService } from 'src/app/@core/services/api.service';
import { jwplayerMP4SourceItem } from 'src/app/types/interface';
declare var jwplayer: any;

@Component({
  selector: 'app-jwplayer',
  templateUrl: './jwplayer.component.html',
  styleUrls: ['./jwplayer.component.scss']
})
export class JwplayerComponent implements OnChanges {
  @Input() _file: string;
  @Input() _type: string;
  @Input() _playlistSource: jwplayerMP4SourceItem[];
  constructor(private apiService: ApiService) {
  
  }

  ngOnChanges() {
    /**********THIS FUNCTION WILL TRIGGER WHEN PARENT COMPONENT UPDATES 'someInput'**************/
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
          }
      }
  );
    if (this._type === 'hls') {
      const playerJw = jwplayer('player').setup({
        title: 'AnimetTV Player',
        playlist: [
            {
              image: "https://img.animet.site/file/animettv-avatars/other/animet-tv_chibi_1.png",
                sources: [
                    {
                        default: false,
                        type: this._type,
                        file: `${CorsEveryWhereProxy}${this._file}`,
                        onXhrOpen: function(xhr, url) {
                          xhr.open('GET', `${CorsEveryWhereProxy}${url}`);
                        },
                        lable: "0"
                    }
                ]
            }
        ],
        width: '100%',
        aspectratio: '16:9',
        mute: false,
        autostart: false,
        primary: 'html5',
        hlshtml: true,
        stretching: 'uniform',
        playbackRateControls: true,
        displaytitle: true,
        displaydescription: true,
        repeat: false
      });
    } else if (this._type === 'mp4') {
      const playerJw = jwplayer('player').setup({
        title: 'AnimetTV Player',
        playlist: [
            {
              image: "https://img.animet.site/file/animettv-avatars/other/animet-tv_chibi_1.png",
                sources: [
                    {
                        default: false,
                        type: this._type,
                        file: this._file,
                        lable: "0",
                      }
                    ]
                  }
                ],
        width: '100%',
        aspectratio: '16:9',
        mute: false,
        autostart: false,
        primary: 'html5',
      });
    } else if (this._type === 'hls-regular') {
      // customer http headers
      const playerJw = jwplayer('player').setup({
        title: 'AnimetTV Player',
        playlist: [
            {
              image: "https://img.animet.site/file/animettv-avatars/other/animet-tv_chibi_1.png",
                sources: [
                    {
                        default: false,
                        type: this._type,
                        file: `${this._file}`,
                        lable: "0"
                    }
                ]
            }
        ],
        width: '100%',
        aspectratio: '16:9',
        mute: false,
        autostart: false,
        primary: 'html5',
        hlshtml: true,
        stretching: 'uniform',
        playbackRateControls: true,
        displaytitle: true,
        displaydescription: true,
        repeat: false
      });
    }
  }   


}