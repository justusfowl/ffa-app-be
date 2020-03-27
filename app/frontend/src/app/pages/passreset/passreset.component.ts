import { Component, OnInit , ViewEncapsulation} from '@angular/core';
import {FormControl, Validators, FormGroup} from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { first } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import * as jwt_decode from "jwt-decode";

@Component({
  selector: 'app-passreset',
  templateUrl: './passreset.component.html',
  styleUrls: ['./passreset.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PassresetComponent implements OnInit {

  loginForm : any;
  returnUrl : string = "";
  token: string = "";

  constructor(
    private authenticationService : AuthenticationService, 
    private snackBar : MatSnackBar, 
    private router : Router, 
    private route : ActivatedRoute
  ) {
    
    this.loginForm =  new FormGroup({
      password :  new FormControl('', Validators.required),
      password2 : new FormControl('')
    }, this.checkPasswords );

  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.token = this.route.snapshot.queryParams['token'] || null;

    console.log(this.token)

    if (!this.token){
      this.router.navigate([""]);
    }else{

      let tokenInfo = this.getDecodedAccessToken(this.token); 
      let now = new Date();

      if (now.getTime() > (tokenInfo.exp*1000)){
        this.snackBar.open(`Der Link ist leider abgelaufen - bitte fordern Sie einen neuen an.`, null, {
          duration: 4500,
        });
        this.router.navigate([""]);
        return;
      }else{
        let userData = {
          token: this.token
        }; 
        
        this.authenticationService.setUserData(userData);
      }

     
    }

  }

  getDecodedAccessToken(token: string): any {
    try{
        return jwt_decode(token);
    }
    catch(Error){
        return null;
    }
  }


  get f() { return this.loginForm.controls; } 

  changePassword() {

    let self = this;

    if (this.f.password.value != this.f.password2.value){
      this.snackBar.open(`Die Passwörter stimmen nicht miteinander über ein.`, null, {
        duration: 1500,
      });
      return;
    }

    if (!this.authenticationService.validatePassphrase(this.f.password.value)){
      this.snackBar.open(`Bitte wählen Sie ein starkes Passwort mit min. 8 Zeichen + Sonderzeichen.`, null, {
        duration: 1500,
      });
      return;
    }

    if (this.loginForm.invalid) {
        return;
    }

    this.authenticationService.changePassword(this.f.password.value)
        .pipe(first())
        .subscribe(
            userData => {

                this.snackBar.open(`Vielen Dank - wir haben Ihr Password zurückgesetzt. Sie werden in Kürze weitergeleitet. Bitte melden Sie sich erneut an.`, null, {
                    duration: 2800,
                  });

                  setTimeout(function(){
                    self.authenticationService.logout();
                  },3000);

            },
            error => {

                this.snackBar.open("Das hat leider nicht geklappt, bitte erneut versuchen.", "OK", {
                  duration : 3000
                });

            });
  }

  checkPasswords(group: FormGroup) {
    let pass = group.get('password').value;
    let confirmPass = group.get('password2').value;

    return pass === confirmPass ? null : { notSame: true }     
  }
}
