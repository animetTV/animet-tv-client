import { Injectable } from "@angular/core";
import {
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
    HttpHandler,
    HttpEvent
} from '@angular/common/http';


import { Router } from '@angular/router'
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from "../services/auth.service";

@Injectable()
export class JWTInterceptor implements HttpInterceptor {
    constructor(private router: Router, private authService: AuthService){

    }
    headers = new Headers({
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem("currentUser")
    });
  

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add auth header with jwt if user is logged in and request is to api url
        const currentUser = localStorage.getItem("currentUser");
        const isApiUrl = request.url.startsWith('/user');
        if (currentUser && isApiUrl) {
            request = request.clone({
                setHeaders: {
                    Authorization: currentUser
                }
            });
        }

        return next.handle(request).pipe(
        map((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
                if (event.status === 401) {
                    this.authService.logout();
                    this.router.navigate(['/login']);
                }
            }
            return event;
        }));
    }
}