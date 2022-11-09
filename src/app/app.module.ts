import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
/* import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
 */
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule, APP_ROUTES } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutModule } from '@angular/cdk/layout';

import { HammerModule } from '@angular/platform-browser';

import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
/* import { GtagModule } from 'angular-gtag'; */
/* import { PublicLinkService } from './@core/services/public-link.service'; */
import { PublicProfileComponent } from './pages/public-profile/public-profile.component';

import * as Hammer from 'hammerjs';

export class HammerConfig extends HammerGestureConfig {
  overrides = <any>{
    swipe: { direction: Hammer.DIRECTION_ALL }
  };
}
import { environment } from 'src/environments/environment';

import { RouterModule } from '@angular/router';
import { ThemeModule } from './@theme/theme.module';
import { CommonModule } from '@angular/common';
import { DragScrollModule } from 'ngx-drag-scroll';
import { CoreModule } from './@core/core.module';
import { SharedModule } from './shared/shared.module';
import { MaterialModule } from './@theme/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ServiceWorkerModule } from '@angular/service-worker';
import { LazyLoadImageModule } from 'ng-lazyload-image'; // <-- import it
import { SwiperModule } from 'swiper/angular';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';

import { HomeComponent, SafePipe } from './pages/home/home.component';
import { PagesComponent } from './pages/pages.component';
import { FooterComponent } from './@theme/components/footer/footer.component';
import { SelectSeasonComponent } from './pages/home/select-season/select-season.component';
import { TrendingComponent } from './pages/home/trending/trending.component';
import { UpcomingComponent } from './pages/home/upcoming/upcoming.component';
import { ContinueWatchingComponent } from './pages/home/continue-watching/continue-watching.component';
import { MustWatchComponent } from './pages/home/must-watch/must-watch.component';
import { RegularCarouselComponent } from './pages/home/must-watch/regular-carousel/regular-carousel.component';
import { QuickAccessComponent } from './@theme/components/quickaccess/quick-access.component';
import { TopOfTheWeekComponent } from './pages/home/top-of-the-week/top-of-the-week.component';
import { GenreDialogComponent } from './@theme/components/genre/genre-dialog.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { SnackbarMessageComponent } from './@theme/components/snackbar-message/snackbar-message.component';
import { CarouselListComponent } from './@theme/components/carousel-list/carousel-list.component';
import { ShareListComponent } from './@theme/components/share-list/share-list.component';
import { PageNotFoundComponent } from './@theme/components/page-not-found/page-not-found.component';
import { PasswordResetComponent } from './pages/password-reset/password-reset.component';
import { DialogMessageComponent } from './@theme/components/dialog-message/dialog-message.component';
import { UserDetailComponent } from './pages/public-profile/user-detail/user-detail.component';
import { AiShowcaseComponent } from './pages/home/ai-showcase/ai-showcase.component';
import { CookieService } from 'ngx-cookie-service';
import { LayoutGapStyleBuilder } from '@angular/flex-layout';
import { DISQUS_SHORTNAME } from 'ngx-disqus';

// Sentry for JavaScript error reporting system 
/* import * as Sentry from "@sentry/angular";
import { Integrations } from "@sentry/tracing"; */
import { RecentlyReleasedComponent } from './pages/home/recently-released/recently-released.component';
import { ShareButtonsComponent } from './@theme/components/share-buttons/share-buttons.component';
import { FormsModule } from '@angular/forms';
import { AdsenseModule } from 'ng2-adsense';
import { CustomLayoutGapStyleBuilder } from './gapBuilder';
/* Sentry.init({
  dsn: "https://ccd0606c30d14baf94cdad079c60d7fe@o610195.ingest.sentry.io/5747854",
  integrations: [
    new Integrations.BrowserTracing({
      tracingOrigins: [
        "localhost",
        `${environment.baseUrl}`, 
        `${environment.apiUrl}`,
        `${environment.streamAPI}`
      ],
      routingInstrumentation: Sentry.routingInstrumentation,
    }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.5,
}); */


const COMPONENTS = [
  FooterComponent,
  SelectSeasonComponent,
  PagesComponent,
  HomeComponent,
  CarouselListComponent,
  AppComponent,
  SafePipe,
  TrendingComponent,
  RecentlyReleasedComponent,
  TopOfTheWeekComponent,
  UpcomingComponent,
  PageNotFoundComponent,
  MustWatchComponent,
  RegularCarouselComponent,
  LoginComponent,
  SignupComponent,
  SnackbarMessageComponent,
  ContinueWatchingComponent,
  QuickAccessComponent,
  GenreDialogComponent,
  ShareListComponent,
  ShareButtonsComponent,
  PublicProfileComponent,
  PasswordResetComponent,
  DialogMessageComponent,
  UserDetailComponent,
  AiShowcaseComponent
];

const MODULES = [
  BrowserModule,
  CommonModule,
  ThemeModule,
  SharedModule,
  FlexLayoutModule,
  DragScrollModule,
  CoreModule.forRoot(),
  MaterialModule,
  BrowserAnimationsModule,
  HttpClientModule,
  ThemeModule.forRoot(),
  AppRoutingModule,
  LayoutModule,
  HammerModule,
  SwiperModule,
  RouterModule.forRoot(APP_ROUTES, { relativeLinkResolution: 'legacy' }),
  /* GtagModule.forRoot({ trackingId: 'G-E10E0LJ5RB', trackPageviews: true }), */
  LazyLoadImageModule,
  ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production, registrationStrategy: 'registerImmediately' }),
  ShareButtonsModule,
  ShareIconsModule,
  FormsModule,
  AdsenseModule.forRoot({
    adClient: 'ca-pub-6890066986315850',
    adSlot: 3419288807,
  }),
];

/* export class SentryErrorHandler implements ErrorHandler {
  handleError(err:any) : void {
    Sentry.captureException(err.originalError || err);
  }
}
 */
@NgModule({
  declarations: [
    ...COMPONENTS,
  ],
  imports: [
    ...MODULES,
  ],
  providers: [
    /* { provide: ErrorHandler, useClass: SentryErrorHandler }, */
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HammerConfig,
    },
    /* PublicLinkService, */
    CookieService,
    // catch undefined layout gap values
    {
      provide: LayoutGapStyleBuilder,
      useClass: CustomLayoutGapStyleBuilder
    },
    {
      provide: DISQUS_SHORTNAME,
      useValue: environment.disqusShortName
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

/* enableProdMode();
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then(success => console.log(`Bootstrap success`))
  .catch(err => console.error(err)); */