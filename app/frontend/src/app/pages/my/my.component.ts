import { Component, OnInit,ViewEncapsulation } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ApiService } from 'src/app/services/api.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { LoginComponent } from '../login/login.component';
import { NewappointmentComponent } from '../newappointment/newappointment.component';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-my',
  templateUrl: './my.component.html',
  styleUrls: ['./my.component.scss', '../../app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MyComponent implements OnInit {

  currentUser : any;
  myAppointments : any;
  flagIncludePast : boolean = false;

  constructor(
    private auth : AuthenticationService, 
    private api : ApiService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.currentUser = this.auth.currentUserValue;
    this.getMyAppointments();
  }

  getMyAppointments(){

    let params = {};

    if (this.flagIncludePast){
      params["flagIncludePast"] = true;
    }

    this.api.get("/appointment/my", params).then(result => {
      this.myAppointments = result;
    }).catch(err => {
      this._snackBar.open("Uups - es scheint etwas schief gelaufen zu sein.", "", {
        duration: 2000,
      });
    })
  }

  updateUser(){
    this.api.put("/profile/user", {user: this.currentUser}).then(result => {
      this._snackBar.open("Aktualisiert", "", {
        duration: 2000,
      });
    }).catch(err => {
      console.error(err);
      this._snackBar.open("Uups - es scheint etwas schief gelaufen zu sein.", "", {
        duration: 2000,
      });
    });
  }

  

  removeTeleAppointment(appointmentObj){

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {meta : {"type" : "confirm", "title" : "Termin absagen", "messageText" : "Sind Sie sicher, dass Sie Ihren Termin löschen möchten?"}}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.answerConfirm){
       
        this.api.delete("/appointment/my/"+appointmentObj._id).then(result => {
          console.log("removed..")
          appointmentObj.inactive = true;
          this._snackBar.open("Termin wurde gelöscht.", "", {
            duration: 2000,
          });
        }).catch(err => {
          console.error(err);
        });

      }
      console.log('The dialog was closed');
    });

   
    
  }

  openTeleAppointment(appointmentObj){

    if (!appointmentObj){
      return;
    }

    var win = window.open(appointmentObj.tele.dialInUrlPatient, '_blank');
    win.focus();
  }

  newTeleAppointment(){

    if (this.auth.isAuthorized()){

      const dialogRef = this.dialog.open(NewappointmentComponent, {
        data: {},
        panelClass : "video-dialog"
      });
  
      dialogRef.afterClosed().subscribe((resultData : any) => {

        if (resultData){
          if (resultData.initiated){
            this.getMyAppointments();
          }
        }
        
      });
    }else{

      const dialogRef = this.dialog.open(LoginComponent, {
        data: {
            flagDialog : true
          },
        panelClass : "login-dialog"
      });
  
      dialogRef.afterClosed().subscribe((resultData : any) => {
        if (resultData){
          this.newTeleAppointment();
        }
      });
    }

  }

}
