import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthenticationService } from './authentication.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with jwt token if available
        let userData = this.authenticationService.currentUserValue;
        
        if (userData && userData.token) {
            request = request.clone({
                setHeaders: { 
                    Authorization: `Bearer ${userData.token}`
                }
            });
        }else if (this.authenticationService.getTmpToken()){
            let tmpToken = this.authenticationService.getTmpToken();
            request = request.clone({
                setHeaders: { 
                    Authorization: `Bearer ${tmpToken}`
                }
            });
        }

        if (this.authenticationService.isGuest()){

            let guestObject = this.authenticationService.guestObjectValue;

            request = request.clone({
                setHeaders: { 
                    "x-guest-user-email": `${guestObject.userEmail}`,
                    "x-guest-user-name": `${guestObject.name}`
                }
            });
        }


        return next.handle(request);
    }
}