import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { RegularPagesComponent } from './regular-pages.component';
import { TermsAndServiceComponent } from './terms-and-service/terms-and-service.component';

const routes: Routes = [
    { path: 'about', component: RegularPagesComponent },
    { path: 'terms-of-use', component: TermsAndServiceComponent }
  
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RegularPagesRoutingModule {}
