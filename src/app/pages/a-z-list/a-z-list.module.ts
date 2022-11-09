import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A_Z_ListRoutingModule } from './a-z-list-routing.module';
import { A_Z_ListComponent }  from './a-z-list.component';
import { MaterialModule } from '../../@theme/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';

const COMPONENTS = [
    A_Z_ListComponent
];

const MODULE = [
    CommonModule,
    A_Z_ListRoutingModule,
    MaterialModule,
    FlexLayoutModule
];

@NgModule({
    declarations: [ ...COMPONENTS ],
    imports: [ ...MODULE ],
    exports: [],
    providers: [],
})
export class A_Z_ListModule {}