import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BrowseService } from 'src/app/@core/services/browse.service';
import { Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-genre-dialog',
    templateUrl: './genre-dialog.component.html',
    styleUrls: ['./genre-dialog.component.scss']
})
export class GenreDialogComponent{
    genres =["Action","Adventure","Cars","Comedy","Dementia","Demons","Drama","Ecchi","Fantasy","Game","Harem","Historical","Horror","Josei","Kids","Magic","Mecha","Military","Music","Mystery","Parody","Police","Psychological","Romance","Samurai","School","Sci-Fi","Seinen","Shoujo","Shounen","Space","Sports","Supernatural","Thriller","Vampire","Yaoi","Yuri"];
    @Output() selectionMade = new EventEmitter<boolean>();
    constructor(
        public browseService: BrowseService,
        private router: Router) { 
            window.scrollTo(0, 0);
        }
    
    setGenre(genre: string) {
        this.selectionMade.emit(true);
        this.browseService.currentGenreType.next(genre);
        if (this.router.url !== '/browse/genre') {
            this.router.navigate(['/browse/genre']);          
        }
    }
}
