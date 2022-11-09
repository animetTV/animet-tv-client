import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { SnackbarMessageComponent } from 'src/app/@theme/components/snackbar-message/snackbar-message.component';
import { UserStat } from 'src/app/shared/interface';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-user-detail',
    templateUrl: './user-detail.component.html',
    styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit, OnChanges {
    @Input() _USER_STATS: UserStat;
    avatarIMG: BehaviorSubject<string> = new BehaviorSubject(`assets/logo/animet-tv_chibi_1.webp`);
    Domain: string = environment.baseUrl;
    isMobile: boolean = false;

    constructor(public dialog: MatDialog, public snackBar: MatSnackBar,) { }

    ngOnInit(): void { }

    ngOnChanges(): void {

        if (this._USER_STATS && this._USER_STATS.avatarFileID) {
            this.avatarIMG.next(`https://img.animet.site/file/animettv-avatars/${this._USER_STATS.avatarFileID}`);
        }

    }

    channelCopy() {
        let selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = `${this.Domain}user/${this._USER_STATS.accountID}`;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);

        this.snackbarMessage('Channel link copied to clipboard', 2500);
    }


    snackbarMessage(_message: string, _duration: number = 1000) {
        this.snackBar.openFromComponent(SnackbarMessageComponent, {
            duration: _duration,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            data: {
                message: _message
            }
        })
    }
}
