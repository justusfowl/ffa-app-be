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

  loginForm : any;
  returnUrl : string = "";

  constructor(
    private authenticationService : AuthenticationService, 
    private snackBar : MatSnackBar, 
    private router : Router, 
    private route : ActivatedRoute
  ) {
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
}
