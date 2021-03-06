import { Component, OnInit , ViewEncapsulation, Inject} from '@angular/core';
import {FormControl, Validators, FormGroup} from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { first } from 'rxjs/operators';
import {MatSnackBar } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { GoogleAnalyticsService } from 'src/app/services/google-analytics.service';
import { LoaderService } from 'src/app/services/loader.service';



function validatePassphrase(c: FormControl) {

  var mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
 
  return mediumRegex.test(c.value) ? null : {
    validateEmail: {
      valid: false
    }
  };
}

function  validateAge(birthDate : FormControl){

  let falseObj = {
    validateAge : {
      valid: false
    }
  };

  try{

    let bd = new Date(birthDate.value);
    let today = new Date(); 
  
    if ((today.getTime() - bd.getTime()) / (1000*60*60*24*365) > 18){
      return null;
    }else{
      return falseObj
    }
  }
  catch(err){
    return falseObj;
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class LoginComponent implements OnInit {

  guestform : any;
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
    private route : ActivatedRoute, 
    private googleAnalytics : GoogleAnalyticsService, 
    private loaderSrv : LoaderService
  ) {

    this.guestform =  new FormGroup({
      name : new FormControl('', Validators.required),
      userEmail : new FormControl('', [Validators.required, Validators.email])
    });

    this.forgotPasswordForm =  new FormGroup({
      username : new FormControl('', [Validators.required, Validators.email])
    });

    this.registerForm =  new FormGroup({ 
      userName : new FormControl('', [Validators.required, Validators.email]),
      name : new FormControl('', Validators.required),
      birthdate : new FormControl('', [Validators.required, validateAge]),
      password : new FormControl('', [Validators.required, validatePassphrase]), 
      acceptTerms : new FormControl(false, Validators.requiredTrue), 
      acceptInfo : new FormControl(false)
    });

    this.loginForm = new FormGroup({
      username : new FormControl('', [Validators.required, Validators.email]),
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

      this.loaderSrv.setMsgLoading(true, "einen Moment bitte...");

      this.authenticationService.login(this.f.username.value, this.f.password.value)
          .pipe(first())
          .subscribe(
              userData => {

                this.loaderSrv.setMsgLoading(false)

                  this.snackBar.open(`Willkommen ${userData.userName}`, null, {
                      duration: 1500,
                    });

                    this.dialogRef.close(true);

                    
                  this.googleAnalytics.sendEvent("login",{
                    category: "auth", 
                    label : "success"
                  });
                  
              },
              error => {
                this.loaderSrv.setMsgLoading(false);
                if (error.status == 425){
                  this.snackBar.open("Bitte verifizieren Sie Ihr Konto, bevor Sie Ihr Konto verwenden können. Prüfen Sie Ihr Email-Postfach.", "OK", {
                    duration : 10000
                  });

                  this.googleAnalytics.sendEvent("login",{
                    category: "auth", 
                    label : "account not validated yet"
                  });


                }else{
                  this.snackBar.open("Das hat leider nicht geklappt, bitte erneut versuchen.", "OK", {
                    duration : 3000
                  });

                  this.googleAnalytics.sendEvent("login",{
                    category: "auth", 
                    label : "Error logging in"
                  });
                }


              });
  }

  issueForgot(){
     // stop here if form is invalid
     if (this.forgotPasswordForm.invalid) {
        return;
    }

    this.loaderSrv.setMsgLoading(true, "einen Moment bitte...")

    this.authenticationService.forgotPassword(this.forgot.username.value)
    .pipe(first())
    .subscribe(
        userData => {
          this.loaderSrv.setMsgLoading(false);
            this.snackBar.open(`Danke für Ihre Anfrage. Wir haben Ihnen soeben eine Email geschickt.`, null, {
                duration: 1500,
              });

              this.dialogRef.close(true);

              this.googleAnalytics.sendEvent("passreset",{
                category: "auth", 
                label : "Requesting password reset"
              });
        },
        error => {
          this.loaderSrv.setMsgLoading(false);
          if (error.status == 425){
            
            this.snackBar.open("Es ist ein Fehler aufgetreten, ggf. ist für diese eMail schon ein Konto angelegt worden.", "OK", {
              duration : 3000
            });
          }else{
            this.snackBar.open("Es ist ein Fehler aufgetreten, ggf. ist für diese eMail schon ein Konto angelegt worden.", "OK", {
              duration : 3000
            });
          }
          
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

    if (this.registerForm.invalid){
      return;
    }

    this.loaderSrv.setMsgLoading(true, "einen Moment bitte...")

    this.authenticationService.register(this.registerForm.value)
    .pipe(first())
    .subscribe(
        userData => {
          
          this.loaderSrv.setMsgLoading(false);

            this.setState("newuser")

            this.loginForm.patchValue({
              username : this.registerForm.value.userName
            })

            this.registerForm.resetForm()

            this.googleAnalytics.sendEvent("register",{
              category: "auth", 
              label : "register new user"
            });

            // this.router.navigate([this.returnUrl]);
        },
        error => {

          this.loaderSrv.setMsgLoading(false);

          if (error.status == 412){
            this.snackBar.open("Es scheint, als wäre diese eMail bereits registriert. Eventuell hilft das Zurücksetzen des Passworts.", "OK", {
              duration : 4000
            });

            this.googleAnalytics.sendEvent("register",{
              category: "auth", 
              label : "user already exists"
            });

          }else{
            this.snackBar.open("Das hat leider nicht geklappt, bitte erneut versuchen.", "OK", {
              duration : 3000
            });
          }

        });
  }

  continueGuest(){

    this.googleAnalytics.sendEvent("guest",{
      category: "auth", 
      label : "progress as guest user"
    });

    let guestObject = this.guestform.value; 
    guestObject["flagGuest"] = true;

    this.authenticationService.setGuestStatus(guestObject);

    this.dialogRef.close({
      flagGuest : true,
      data : guestObject
    });
    
  }


}
