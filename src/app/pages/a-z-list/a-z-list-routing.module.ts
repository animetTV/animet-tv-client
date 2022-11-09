import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { A_Z_ListComponent } from './a-z-list.component';


const routes: Routes = [
    { path: '', component: A_Z_ListComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class A_Z_ListRoutingModule {}
