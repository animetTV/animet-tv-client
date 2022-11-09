import { Routes, RouterModule } from '@angular/router';
import { Component, NgModule } from '@angular/core';
import { BrowseComponent } from './browse.component';
import { GenricResultComponent } from './generic-result/generic-result.component';

const routes: Routes = [
    { 
        path: '',
        component: BrowseComponent,
    },
    { 
        path: 'genre',
        component: GenricResultComponent
    },
    { 
        path: 'movie',
        component: GenricResultComponent
    }, 
    {
        path: 'season',
        component: GenricResultComponent
    }


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BrowseRoutingModule {}
