import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Services
import { ApiService } from './services/api.service';
/* import { SwipeService } from './services/swipe.service';
import { FeedService } from './services/feed.service'; */
import { SynopsisDialogService } from './services/synopsis-dialog.service';
import { SelectSeasonService } from './services/select-season.service';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { WatchAnimeService } from './services/watch-anime.service';
import { BrowseService } from './services/browse.service';
import { ExperimentService } from './services/experiment.service';
import { UpdateService } from './services/update.service';
// other
//import { NoCacheHeadersInterceptor } from './interceptors/no-cache-headers-interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JWTInterceptor } from './interceptors/jwt-interceptor';

const DATA_SERVICES = [
  { provide: ApiService },
  /* { provide: SwipeService },
  { provide: FeedService }, */
  { provide: SynopsisDialogService },
  { provide: SelectSeasonService },
  { provide: UserService },  
  { provide: AuthService },
  { provide: WatchAnimeService },
  { provide: BrowseService },
  { provide: ExperimentService},
  { provide: UpdateService },
];

export const ANIMET_CORE_PROVIDERS = [
  ...DATA_SERVICES
];

@NgModule({
  imports: [
    CommonModule,
  ],
  exports: [ ],
  declarations: [],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JWTInterceptor,
      multi: true
    }   
  
  ]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        ...ANIMET_CORE_PROVIDERS
      ],
    };
  }
}

