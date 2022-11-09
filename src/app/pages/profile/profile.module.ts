import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../@theme/material.module';
import { FlexLayoutModule } from '@angular/flex-layout'
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent, DialogBuffering } from './profile.component';
import { CarouselListComponent } from './carousel-list/carousel-list.component';
import { DragScrollModule } from 'ngx-drag-scroll';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';

const MODULES = [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    ProfileRoutingModule,
    DragScrollModule,
]

const COMPONENTS = [
    ProfileComponent,
    UserDetailComponent,
    CarouselListComponent,
    EditProfileComponent,
    DialogBuffering
]

@NgModule({
    declarations: [ ...COMPONENTS ],
    imports: [ ...MODULES ],
    exports: [],
    providers: [],
})
export class ProfileModule {}