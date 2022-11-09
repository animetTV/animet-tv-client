import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FAQRoutingModule } from './faq-routing.module';
import { FAQComponent } from './faq.component';
import { MaterialModule } from '../../@theme/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';

const MODULES = [
    CommonModule,
    FAQRoutingModule,
    MaterialModule,
    FlexLayoutModule
]

const COMPONENTS = [
    FAQComponent
]
@NgModule({
    declarations: [ ...COMPONENTS ],
    imports: [ ...MODULES ],
    exports: [],
    providers: [],
})
export class FAQModule {}