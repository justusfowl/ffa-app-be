import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { LoaderService } from './loader.service';
import { MatSnackBar } from '@angular/material';


@Injectable({ providedIn: 'root' })

export class AuthenticationService {

    private currentUserSubject: BehaviorSubject<any>;
    public currentUser: Observable<any>;

    constructor(
        private http: HttpClient, 
        private api : ApiService, 
        private router: Router, 
        private loaderSrv : LoaderService, 
        private snackBar : MatSnackBar
        ) {
        this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('userData')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue() {
        return this.currentUserSubject.value;
    }

    login(userName, password) {
        this.loaderSrv.setLoading(true);
        return this.http.post<any>(`${this.api.apiURL}/auth/login`, { userName, password })
            .pipe(map( (resp : any) => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                let userData = resp.data; 

                localStorage.setItem('userData', JSON.stringify(userData));
                this.currentUserSubject.next(userData);

                this.loaderSrv.setLoading(false);

                return userData;
            }));
    }

    register(userName, password){
        return this.http.post<any>(`${this.api.apiURL}/auth/register`, { userName, password })
        .pipe(map( (resp : any) => {
            return;
        }));
    }

    logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('userData');
        this.currentUserSubject.next(null);
        this.router.navigate(["/"]);

        this.snackBar.open("Erfolgreich", "OK", {
            duration: 3000
        })
    }   

    isAuthorized(){

        if (this.currentUserValue) {
            return true;
        }else{
            return false;
        }
    }

    checkUIForRole(reqRole){
        if (this.isAuthorized()){
            let roles = this.currentUserSubject.value.roles;
            if (roles.indexOf(reqRole) != -1){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }
}