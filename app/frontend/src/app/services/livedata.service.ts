import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Socket } from 'ngx-socket-io';
import { AuthenticationService } from './authentication.service';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class LivedataService implements OnDestroy {

  currentUserSubscription : any;
  flagIsInit : boolean = false;

  constructor(
    public socket: Socket, 
    private _snackBar : MatSnackBar, 
    private auth : AuthenticationService
  ) { 


    this.currentUserSubscription = this.auth.currentUser.subscribe(userObject => {
        console.log("authenticated"); 
        console.log(userObject)
        if (userObject){
            this.initService();
        }else{
            
            if (!this.auth.isAuthorized()){
                this.flagIsInit = false;
                this.socket.disconnect();
            }
        } 
        
      });

  }

  initService(){

    if (!this.flagIsInit && this.auth.isAuthorized()){
        this.socket.fromEvent('hb').subscribe(data => {
            this._snackBar.open("Verbunden", "", { duration: 1500 });
        });
    
        this.socket.fromEvent('connect').subscribe(data => {
            let userData = this.auth.currentUserValue;
            let token = userData.token;
            this.socket.emit('authentication', { "token" : token })
        });
    
        this.socket.fromEvent('token:expired').subscribe(data => {
            this._snackBar.open("Token ist abgelaufen", "", { duration: 1500 });
            this.auth.logout();
        });

    
        this.socket.fromEvent('disconnect').subscribe(data => {
            console.log("disconnected");
        });
    
        this.socket.connect();
    
        this.flagIsInit = true;
    }    

   }

   ngOnDestroy(){
       this.currentUserSubscription.unsubscribe();
   }

   send(endpoint, data){
       this.socket.emit(endpoint, data);
   }


}
