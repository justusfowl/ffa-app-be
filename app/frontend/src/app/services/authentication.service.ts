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

    private guestObjectSubject : BehaviorSubject<any>;
    public guestObject : Observable<any>;


    private tmpToken : string = ""; 

    constructor(
        private http: HttpClient, 
        private api : ApiService, 
        private router: Router, 
        private loaderSrv : LoaderService, 
        private snackBar : MatSnackBar
        ) {
        this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('userData')));
        this.currentUser = this.currentUserSubject.asObservable();
        
        // guestData is not put into localstorage as of now
        this.guestObjectSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('guestData')));
        this.guestObject = this.guestObjectSubject.asObservable();
    }

    public get currentUserValue() {
        return this.currentUserSubject.value;
    }

    public get guestObjectValue(){
        return this.guestObjectSubject.value;
    }

    login(userName, password) {
        this.loaderSrv.setLoading(true);
        return this.http.post<any>(`${this.api.apiURL}/auth/login`, { userName, password })
            .pipe(map( (resp : any) => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                let userData = resp.data; 

                this.setUserData(userData);
                this.setGuestStatus(null);

                this.loaderSrv.setLoading(false);

                return userData;
            }));
    }

    setTmpToken(token){

        if (token){
            this.logout();
        }
        this.tmpToken = token;

    }

    getTmpToken(){
        return this.tmpToken;
    }

    setGuestStatus(object){
        this.guestObjectSubject.next(object);
    }

    setUserData(userData){
        localStorage.setItem('userData', JSON.stringify(userData));
        this.currentUserSubject.next(userData);
    }

    register(userObject){
        return this.http.post<any>(`${this.api.apiURL}/auth/register`, userObject)
        .pipe(map( (resp : any) => {
            return;
        }));
    }

    logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('userData');
        this.currentUserSubject.next(null);
        this.setGuestStatus(null);
        this.router.navigate(["/login"]);

        this.snackBar.open("Abgemeldet", "", {
            duration: 3000
        })
    }

    changePassword(password){
        return this.http.post<any>(`${this.api.apiURL}/auth/passwordReset`, { password })
        .pipe(map( (resp : any) => {
            return;
        }));
    }

    isGuest(){
        if (this.guestObjectValue) {
            return true;
        }else{
            return false;
        }
    }

    isAuthorized(){

        if (this.currentUserValue) {
            return true;
        }else{
            return false;
        }
    }

    forgotPassword(userName){
        return this.http.post<any>(`${this.api.apiURL}/auth/forgotPassword`, { userName })
        .pipe(map( (resp : any) => {
            return;
        }));
    }

    /**
     * Function to return if the current user has any of the requested scopes. At least one of the provided scopes must apply
     * @param reqScope String or Array of strings containing different scopes to be checked for
     * 
     */
    checkUIForRole(reqScope){

        if (this.isAuthorized()){

            if (!this.currentUserSubject.value.scopes){
                return false; 
            }

            let scopes = this.currentUserSubject.value.scopes;

            if (Array.isArray(reqScope)){
                let flagHasScope = false;
                reqScope.forEach(element => {
                    if (scopes.indexOf(element) != -1){
                        flagHasScope = true;
                    }
                });
                return flagHasScope; 
            }else if (typeof reqScope === 'string' || reqScope instanceof String){
                if (scopes.indexOf(reqScope) != -1){
                    return true;
                }else{
                    return false;
                }
            }else{
                return false;
            }

            
        }else{
            return false;
        }
    }

    
    validatePassphrase(pass){
        var mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
        return mediumRegex.test(pass)
    }
}