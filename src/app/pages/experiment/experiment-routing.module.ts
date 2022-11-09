import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { ExperimentComponent } from './experiment.component';
import { Anime60FpsComponent } from './anime-60fps/anime-60fps.component';

const routes: Routes = [
    { 
        path: '', 
        component: ExperimentComponent,
    },
    {
        path: 'anime-60fps',
        component: Anime60FpsComponent
    },
    {
        path: 'anime-60fps/v2/:animeTitle',
        component: Anime60FpsComponent
    },
    {
        path: 'anime-60fps/:animeTitle',
        component: Anime60FpsComponent
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ExperimentRoutingModule {}
