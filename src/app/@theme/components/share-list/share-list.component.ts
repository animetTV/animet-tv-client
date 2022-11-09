import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { UserService } from 'src/app/@core/services/user.service';
import { SnackbarMessageComponent } from '../snackbar-message/snackbar-message.component';

@Component({
  selector: 'app-share-list',
  templateUrl: './share-list.component.html',
  styleUrls: ['./share-list.component.scss']
})
export class ShareListComponent implements OnInit {

  sharedLink: string;
  listStatus: boolean;
  listStatus_txt: BehaviorSubject<string> = new BehaviorSubject(null);
  listStatus_Change: BehaviorSubject<boolean> = new BehaviorSubject(null);

  constructor(
    public snackBar: MatSnackBar,
    private userService: UserService) {
      this.listStatus_Change.subscribe(
        isListPublic => {
          if (isListPublic) {
            this.listStatus = true;
            this.listStatus_txt.next("public");
          } else {
            this.listStatus = false;
            this.listStatus_txt.next("private");
          }
        }
      )
    }

  copyText(){

    let selBox = document.createElement('textarea');
      selBox.style.position = 'fixed';
      selBox.style.left = '0';
      selBox.style.top = '0';
      selBox.style.opacity = '0';
      selBox.value = this.sharedLink;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand('copy');
      document.body.removeChild(selBox);

      this.snackbarMessage('Copied!')
    }
    
    snackbarMessage(_message: string){
      this.snackBar.openFromComponent(SnackbarMessageComponent, {
        duration: 1500,
        data: {
          message: _message
        }
      })
    }
    
    setListStatus() {
      this.listStatus_Change.next(!this.listStatus);
      this.userService.setListStatus(!this.listStatus).subscribe(
        result => {
          if (result.success) {
            this.getListStatus();
            this.snackbarMessage(result.message);
          }
        }
      )
    }

     getListStatus() {
      this.userService.getUserProfile().subscribe(
        profile => {
          if (profile.success) {
            this.listStatus = profile.accountProfile.isProfilePublic;
            this.listStatus_Change.next(profile.accountProfile.isProfilePublic);
            this.sharedLink = 'https://'+ window.location.hostname +'/user/' +profile.accountProfile.accountID;
          } else if (!profile.success) {
            this.snackbarMessage(profile.message);
          }
        }, 
        error => {
          this.snackbarMessage(error.message);
        }
      )
    }
    
    
  ngOnInit(): void {
    this.getListStatus();
  }

}
