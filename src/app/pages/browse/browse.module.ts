import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowseComponent } from './browse.component';
import { BrowseRoutingModule } from './browse-all-routing.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../../@theme/material.module';
import { AnimeCardComponent } from './anime-card/anime-card.component';
import { LazyLoadImageModule } from 'ng-lazyload-image'; // <-- import it
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GenricResultComponent } from './generic-result/generic-result.component';
import { AdsenseModule } from 'ng2-adsense';

const COMPONENTS = [
    BrowseComponent,
    AnimeCardComponent,
    GenricResultComponent
];

const MODULES = [
    CommonModule,
    BrowseRoutingModule,
    FlexLayoutModule,
    MaterialModule,
    LazyLoadImageModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    AdsenseModule.forRoot({
        adClient: 'ca-pub-6890066986315850',
        adSlot: 4272829140,
        adFormat: 'Display'
      })
];

@NgModule({
    declarations: [...COMPONENTS],
    imports: [...MODULES],
    exports: [],
    providers: [],
})
export class BrowseModule {}