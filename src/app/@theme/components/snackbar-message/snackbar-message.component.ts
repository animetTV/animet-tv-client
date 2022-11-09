import { Component, Inject, } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-snackbar-message',
  templateUrl: './snackbar-message.component.html',
})
export class SnackbarMessageComponent {
  Message: string;
  Action: string = null;
  isAction: BehaviorSubject<boolean> = new BehaviorSubject(false);
  constructor(public snackBarRef: MatSnackBarRef<SnackbarMessageComponent>, @Inject(MAT_SNACK_BAR_DATA) public data: any) {
    this.Message  = this.data.message;
    
    if ( this.data.action && this.data.action !== null ) {
      this.Action = this.data.action;
      this.isAction.next(true) ;
      console.log(this.data.action);
    } 
  }

}
