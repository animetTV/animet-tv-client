import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { UserService } from 'src/app/@core/services/user.service';
import { ShareListComponent } from 'src/app/@theme/components/share-list/share-list.component';
import { SnackbarMessageComponent } from 'src/app/@theme/components/snackbar-message/snackbar-message.component';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent {
  @ViewChild('fileUpload') fileUploadEl: ElementRef;
  fName = '';
  contents: any[];
  name = '';
  isUploading: BehaviorSubject<boolean> = new BehaviorSubject(false);
  constructor(private userService: UserService, public snackBar: MatSnackBar, public dialog: MatDialog) { }

  public fileChanged(event?: UIEvent): void {
    const files: FileList = this.fileUploadEl.nativeElement.files;

    const file = files[0];
    const reader = new FileReader();

    const loaded = (el) => {
      const contents = el.target.result;
      this.contents = contents;
    }
    reader.onload = loaded;
    reader.readAsText(file, 'UTF-8');
    this.name = file.name;
  }


  uploadFile() {
    this.isUploading.next(true);
    const files: FileList = this.fileUploadEl.nativeElement.files;

    const file = files[0];
    this.userService.uploadNewAvatar(file).subscribe(
      result => {
        if (result) {
          this.isUploading.next(false);
          this.fileUploadEl.nativeElement.value = "";
        } else {
          this.snackbarMessage(`Image too large or Wrong format we only accept jpg, png and webp`);
        }
      }
    );
  }

  snackbarMessage(_message: string, _duration: number = 5000) {
    this.snackBar.openFromComponent(SnackbarMessageComponent, {
      duration: _duration,
      data: {
        message: _message
      }
    })
  }

  openShareList() {
    let dialogRef;
    dialogRef = this.dialog.open(ShareListComponent, {
      width: '100%',
    });

  }

}
