import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AnimeTracerComponent } from './anime-tracer.component';
const routes: Routes = [
    { path: '', component: AnimeTracerComponent },];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AnimeTracerRoutingModule {}
