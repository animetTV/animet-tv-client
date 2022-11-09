import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';
@Injectable()
export class UpdateService {
    constructor(private swUpdate: SwUpdate, private snackbar: MatSnackBar) {
        if (!this.swUpdate.isEnabled) {
            console.log('Self update enabled: Nope 🙁');
          } else if (this.swUpdate.isEnabled) {
            interval(2000).subscribe(() => swUpdate.checkForUpdate());
            console.log('Self update enabled: Yes 😃');
          }

        this.swUpdate.available.subscribe(evt => {
            // on update force update
            this.snackbar.open('Update Available, Updating Now..');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            /* const snack = this.snackbar.open('Update Available', 'Tap to Reload');
            snack
                .onAction()
                .subscribe(() => {
                    window.location.reload();
                }); */
        });
    }

    public checkForUpdates(): void {
        this.swUpdate.available.subscribe(event => {
            this.swUpdate.activateUpdate().then(() => document.location.reload());
        });
    }
}
