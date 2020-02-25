import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthenticationService } from './authentication.service';
import { LoaderService } from './loader.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
        private authenticationService: AuthenticationService, 
        private loaderSrv : LoaderService
        ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            console.error(err); 

            this.loaderSrv.setLoading(false);
            
            if ((err.status === 401 || err.status === 403) && err.url.indexOf("login") == -1) {
                // auto logout if 401 response returned from api
                this.authenticationService.logout();
                location.reload(true);
            }else if (err.status == 440){
                this.authenticationService.logout();
            }
            
            const error = err.error.message || err.statusText;
            return throwError(error);
        }))
    }
}