import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { FAQComponent } from './faq.component';
const routes: Routes = [
    { path: '', component: FAQComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FAQRoutingModule {}
