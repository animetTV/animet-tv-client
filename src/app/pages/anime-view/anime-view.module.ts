import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimeViewComponent } from './anime-view.component';
import { AnimeViewRoutingModule } from './anime-view-routing.module';
import { AnimeDetailComponent } from './anime-detail/anime-detail.component';
import { AnimePlayerComponent, SafePipe } from './anime-player/anime-player.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../../@theme/material.module';
import { JwplayerComponent} from './anime-player/jwplayer/jwplayer.component';
import { DisqusModule } from 'ngx-disqus';
import { BottomSheetComponent } from './anime-player/bottom-sheet/bottom-sheet.component';
const COMPONENTS = [
    AnimeViewComponent,
    AnimeDetailComponent,
    AnimePlayerComponent,
    SafePipe,
    JwplayerComponent,
    BottomSheetComponent
];

const MODULES = [
    CommonModule,
    AnimeViewRoutingModule,
    MaterialModule,
    FlexLayoutModule,
    DisqusModule,
];

@NgModule({
    declarations: [...COMPONENTS],
    imports: [...MODULES],
    exports: [],
    providers: [],
})
export class AnimeViewModule {}