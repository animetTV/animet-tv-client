import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnimeTracerRoutingModule } from './anime-tracer-routing.module';
import { AnimeTracerComponent }  from './anime-tracer.component';
import { MaterialModule } from '../../@theme/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';

const COMPONENTS = [
    AnimeTracerComponent
];

const MODULES = [
    CommonModule,
    AnimeTracerRoutingModule,
    MaterialModule,
    FlexLayoutModule
];
@NgModule({
    declarations: [ ...COMPONENTS],
    imports: [ ...MODULES ],
    exports: [ ],
    providers: [],
})
export class AnimeTracerModule {}