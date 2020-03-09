import { Component, OnInit , ViewEncapsulation} from '@angular/core';
import {FormControl, Validators, FormGroup} from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { first } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {

  forgotPasswordForm : any; 
  loginForm : any;
  returnUrl : string = "";
  forgotPasswordState : boolean = false;

  constructor(
    private authenticationService : AuthenticationService, 
    private snackBar : MatSnackBar, 
    private router : Router, 
    private route : ActivatedRoute
  ) {

    this.forgotPasswordForm =  new FormGroup({
      username : new FormControl('', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")])
    });

    this.loginForm =  new FormGroup({
      username : new FormControl('', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]),
      password : new FormControl('', Validators.required)
    });

     // redirect to home if already logged in
     if (this.authenticationService.currentUserValue) {
        this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }


  get f() { return this.loginForm.controls; }

  get forgot() {return this.forgotPasswordForm.controls;}

  login() {
      // reset alerts on submit
      // this.alertService.clear();

      // stop here if form is invalid
      if (this.loginForm.invalid) {
          return;
      }

      this.authenticationService.login(this.f.username.value, this.f.password.value)
          .pipe(first())
          .subscribe(
              userData => {
                  this.snackBar.open(`Willkommen ${userData.userName}`, null, {
                      duration: 1500,
                    });

                  this.router.navigate([this.returnUrl]);
              },
              error => {

                  this.snackBar.open("Das hat leider nicht geklappt, bitte erneut versuchen.", "OK", {
                    duration : 3000
                  })
              });
  }

  issueForgot(){
     // stop here if form is invalid
     if (this.forgotPasswordForm.invalid) {
        return;
    }

    this.authenticationService.forgotPassword(this.forgot.username.value)
    .pipe(first())
    .subscribe(
        userData => {
            this.snackBar.open(`Danke für Ihre Anfrage. Wir haben Ihnen soeben eine Email geschickt.`, null, {
                duration: 1500,
              });

            this.router.navigate([this.returnUrl]);
        },
        error => {

            this.snackBar.open("Das hat leider nicht geklappt, bitte erneut versuchen.", "OK", {
              duration : 3000
            })
        });
    
  }

  toggleFogotPw(){
    if (this.forgotPasswordState){
      this.forgotPasswordState = false;
    }else{
      this.forgotPasswordState = true;
    }
    
  }
}
