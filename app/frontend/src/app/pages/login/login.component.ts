import { Component, OnInit , ViewEncapsulation, Inject} from '@angular/core';
import {FormControl, Validators, FormGroup} from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { first } from 'rxjs/operators';
import {MatSnackBar } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';



function validatePassphrase(c: FormControl) {

  var mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
 
  return mediumRegex.test(c.value) ? null : {
    validateEmail: {
      valid: false
    }
  };
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class LoginComponent implements OnInit {

  registerForm : any;
  forgotPasswordForm : any; 
  loginForm : any;
  returnUrl : string = "";
  forgotPasswordState : boolean = false;

  viewState = "login"; 

  constructor(
    public dialogRef: MatDialogRef<LoginComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private authenticationService : AuthenticationService, 
    private snackBar : MatSnackBar, 
    private router : Router, 
    private route : ActivatedRoute
  ) {

    this.forgotPasswordForm =  new FormGroup({
      username : new FormControl('', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")])
    });

    this.registerForm =  new FormGroup({
      userName : new FormControl('', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]),
      name : new FormControl('', Validators.required),
      birthdate : new FormControl('', Validators.required),
      password : new FormControl('', [Validators.required, validatePassphrase]), 
      acceptTerms : new FormControl(false, Validators.requiredTrue), 
      acceptInfo : new FormControl(false)
    });

    this.loginForm = new FormGroup({
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

  validatePassphrase(pass){
    var mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
    return mediumRegex.test(pass)
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

                    this.dialogRef.close(true);
                  
              },
              error => {
                console.log(error);
                if (error.status == 425){
                  this.snackBar.open("Bitte verifizieren Sie Ihr Konto, bevor Sie Ihr Konto verwenden können. Prüfen Sie Ihr Email-Postfach.", "OK", {
                    duration : 10000
                  });
                }else{
                  this.snackBar.open("Das hat leider nicht geklappt, bitte erneut versuchen.", "OK", {
                    duration : 3000
                  });
                }


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

              this.dialogRef.close(true);
        },
        error => {

            this.snackBar.open("Das hat leider nicht geklappt, bitte erneut versuchen.", "OK", {
              duration : 3000
            });
        });
    
  }

  setState(state){
    this.viewState = state;
  }

  toggleFogotPw(){
    if (this.forgotPasswordState){
      this.forgotPasswordState = false;
    }else{
      this.forgotPasswordState = true;
    }
  }

  registerNewUser(){

    console.log(this.registerForm.value)

    this.authenticationService.register(this.registerForm.value)
    .pipe(first())
    .subscribe(
        userData => {
          console.log(userData);

            this.setState("newuser")

            this.loginForm.patchValue({
              username : this.registerForm.value.userName
            })

            this.registerForm.resetForm()

            // this.router.navigate([this.returnUrl]);
        },
        error => {

          if (error.status == 412){
            this.snackBar.open("Es scheint, als wäre diese eMail bereits registriert. Eventuell hilft das Zurücksetzen des Passworts.", "OK", {
              duration : 4000
            });
          }else{
            this.snackBar.open("Das hat leider nicht geklappt, bitte erneut versuchen.", "OK", {
              duration : 3000
            });
          }


        });
    

  }


}
