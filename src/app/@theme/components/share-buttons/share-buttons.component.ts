import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-share-buttons',
  templateUrl: './share-buttons.component.html',
  styleUrls: ['./share-buttons.component.scss'],
})
export class ShareButtonsComponent {
  ShareLink: string;
  ShareTitle: string;
  ShareContainerTitle: string;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      ShareLink: string;
      ShareTitle: string;
      ShareContainerTitle: string;
    }
  ) {
    this.ShareLink = this.data.ShareLink;
    this.ShareTitle = this.data.ShareTitle;
    this.ShareContainerTitle = this.data.ShareContainerTitle;
  }
}
