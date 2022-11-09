import { Component, OnInit } from '@angular/core';
import { Title } from "@angular/platform-browser";

@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.scss']
})
export class FAQComponent implements OnInit {
    constructor(private titleService: Title) {
        this.titleService.setTitle('FAQ');
    }

    ngOnInit(): void {
        window.scroll({
            behavior: 'auto',
            top: 0,
            left: 0
        })
    }
}
