import { Component, OnInit,ViewEncapsulation } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ApiService } from 'src/app/services/api.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { LoginComponent } from '../login/login.component';
import { NewappointmentComponent } from '../newappointment/newappointment.component';

@Component({
  selector: 'app-my',
  templateUrl: './my.component.html',
  styleUrls: ['./my.component.scss', '../../app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MyComponent implements OnInit {

  currentUser : any;
  myAppointments : any;

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
    this.api.get("/appointment/my").then(result => {
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
