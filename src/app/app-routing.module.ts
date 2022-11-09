
import { NgModule } from '@angular/core';
import { ExtraOptions, Routes, RouterModule, ActivatedRoute } from '@angular/router';
import { PagesComponent } from './pages/pages.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
//import { ProfileComponent } from './pages/profile/profile.component';
import { SignupComponent } from './pages/signup/signup.component'; 
import { PasswordResetComponent } from './pages/password-reset/password-reset.component';

import { AuthGuard } from './@core/auth-guard/index';
import { PageNotFoundComponent } from './@theme/components/page-not-found/page-not-found.component';
import { PublicProfileComponent } from './pages/public-profile/public-profile.component';
export const APP_ROUTES: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full',
      },
      { 
        path: 'video', 
        loadChildren: () => import('./pages/anime-view/anime-view.module').then(m => m.AnimeViewModule),
      },
      { 
        path: 'video/:animeTitle', 
        loadChildren: () => import('./pages/anime-view/anime-view.module').then(m => m.AnimeViewModule),
      },
      {
        path: 'browse', 
        loadChildren: () => import('./pages/browse/browse.module').then(m => m.BrowseModule),  
      },
      {
        path: 'browse/:searchTerm', 
        loadChildren: () => import('./pages/browse/browse.module').then(m => m.BrowseModule),  
      },
      {
        path:'experiment',
        loadChildren: () => import('./pages/experiment/experiment.module').then(m => m.ExperimentModule),
      },
      {
        path:'a-z',
        loadChildren: () => import('./pages/a-z-list/a-z-list.module').then(m => m.A_Z_ListModule),
      },
      {
        path: 'info',
        loadChildren: () => import('./pages/regular-pages/regular-pages.module').then(m => m.RegularPagesModule),
      },
      {
        path:'quick-bites',
        loadChildren: () => import('./pages/quick-bites/quick-bites.module').then(m => m.QuickBitesModule),
      },
      {
        path:'faq',
        loadChildren: () => import('./pages/faq/faq.module').then(m => m.FAQModule),
      },
      {
        path: 'anime-tracer',
        loadChildren: () => import('./pages/anime-tracer/anime-tracer.module').then(m => m.AnimeTracerModule),
      },
      {
        path: 'user',
        component: PublicProfileComponent,
      },
      {
        path: 'user/:accountID',
        component: PublicProfileComponent,
      },
      {
        path: 'profile',
        loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'signup',
        component: SignupComponent
      },
      {
        path: 'forgot-password',
        component: PasswordResetComponent
      },
      {
        path: 'forgot-password/:token',
        component: PasswordResetComponent
      },
      {
        path: '404',
        component: PageNotFoundComponent,
      },
      {
        path: 'sitemap',
        redirectTo: '/home'
      },
      { path: '**', redirectTo: '/404'}
    ], 
  },

];

const config: ExtraOptions = {
    useHash: true,
    relativeLinkResolution: 'corrected',
    scrollPositionRestoration: 'disabled'
};


@NgModule({
  imports: [RouterModule.forRoot(APP_ROUTES,config)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
