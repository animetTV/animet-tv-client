import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExperimentRoutingModule } from './experiment-routing.module';
import { MaterialModule } from '../../@theme/material.module';
import { ExperimentComponent } from './experiment.component';
import { Anime60FpsComponent } from './anime-60fps/anime-60fps.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SafePipe } from '../experiment/anime-60fps/anime-60fps.component';
/* import { AdsenseModule } from 'ng2-adsense'; */
import { JwplayerComponent } from './anime-60fps/jwplayer/jwplayer.component';
import { DisqusModule } from 'ngx-disqus';

@NgModule({
    declarations: [ExperimentComponent, Anime60FpsComponent, SafePipe, JwplayerComponent],
    imports: [ 
        CommonModule, 
        ExperimentRoutingModule, 
        MaterialModule,
        FlexLayoutModule, 
       /*  AdsenseModule.forRoot({
            adClient: 'ca-pub-6890066986315850',
            adSlot: 7232638209,
          }), */
          DisqusModule
        ],
    exports: [],
    providers: [],
})
export class ExperimentModule {}