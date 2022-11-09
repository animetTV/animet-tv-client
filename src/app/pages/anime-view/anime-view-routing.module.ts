import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { AnimeViewComponent } from './anime-view.component';

const routes: Routes = [
    { path: '', component: AnimeViewComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AnimeViewRoutingModule {}
