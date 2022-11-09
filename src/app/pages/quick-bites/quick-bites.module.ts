import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../@theme/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { QuickBitesComponent, SafePipe} from './quick-bites.component';
import { QuickBitesRoutingModule } from './quick-bites-routing.module';
import { JwplayerComponent } from './jwplayer/jwplayer.component';
import { PlyrModule } from 'ngx-plyr';
import { DisqusModule } from 'ngx-disqus';

const MODULES = [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    QuickBitesRoutingModule,
    PlyrModule,
    DisqusModule
]

const COMPONENTS = [
    QuickBitesComponent,
    SafePipe,
    JwplayerComponent
]

@NgModule({
    declarations: [ ...COMPONENTS],
    imports: [ ...MODULES ],
    exports: [],
    providers: [],
})
export class QuickBitesModule {}