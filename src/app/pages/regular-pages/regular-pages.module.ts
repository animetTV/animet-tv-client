import { NgModule } from '@angular/core';
import { RegularPagesComponent } from './regular-pages.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../../@theme/material.module';
import { RegularPagesRoutingModule } from './regular-pages-routing.module';
import { FormsModule } from '@angular/forms';
import { TermsAndServiceComponent } from './terms-and-service/terms-and-service.component';

const COMPONENTS = [
    RegularPagesComponent,
    TermsAndServiceComponent
];

const MODULES = [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    RegularPagesRoutingModule,
    FormsModule
];

@NgModule({
    declarations: [ ...COMPONENTS ],
    imports: [ ...MODULES ],
    exports: [],
    providers: [],
})
export class RegularPagesModule {}