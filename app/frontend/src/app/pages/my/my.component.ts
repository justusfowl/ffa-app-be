import { Component, OnInit,ViewEncapsulation } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ApiService } from 'src/app/services/api.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { LoginComponent } from '../login/login.component';
import { NewappointmentComponent } from '../newappointment/newappointment.component';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { GenmessageComponent } from 'src/app/components/genmessage/genmessage.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

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

  myPrescriptionRequests : any[] = [];
  mediDisplayColumns: string[] = ['name', 'amount', 'substance', 'dose', 'pzn', 'dosageform'];

  tab : any; 
  tabs : any[] = [
    "profil", 
    "termine", 
    "rezeptanfragen"
  ]
  selectedIndex : number = 1;
  messageId : string = "";

  constructor(
    private auth : AuthenticationService, 
    private api : ApiService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog, 
    private route: ActivatedRoute, 
    private router : Router, 
    private location : Location
  ) {
    this.route.queryParams.subscribe(params => {
        this.tab = params['tab'] || ""; 
        let idx = this.tabs.findIndex(x => x.toLowerCase() == this.tab.toLowerCase()); 
        this.selectedIndex = idx;

        this.messageId = params['messageId'] || null; 
    });
   }

  ngOnInit() {
   //  this.router.routeReuseStrategy.shouldReuseRoute = () => false;

    this.currentUser = this.auth.currentUserValue;
    this.getMyAppointments();
    this.getMyMessages();
  }

  getMyAppointments(){

    let params = {};

    if (this.flagIncludePast){
      params["flagIncludePast"] = true;
    }

    this.api.get("/appointment/my", params).then(result => {
      this.myAppointments = result;
    }).catch(err => {
      this._snackBar.open("Ups - es scheint etwas schief gelaufen zu sein.", "", {
        duration: 2000,
      });
    })
  }

  getMyMessages(){

    let params = {};

    this.api.get("/message/my", params).then((result : any) => {
      let messages = result.messages || [];

      this.myPrescriptionRequests = [];

      messages.forEach(element => {
        if (element.medications){
          this.myPrescriptionRequests.push(element);
        }
      });

    }).catch(err => {
      this._snackBar.open("Ups - es scheint etwas schief gelaufen zu sein.", "", {
        duration: 2000,
      });
    })
  }

  updateUser(){
    this.api.put("/profile/user", {user: this.currentUser}).then(result => {
      this._snackBar.open("Aktualisiert", "", {
        duration: 2000,
      });
      this.auth.setUserData(this.currentUser);
    }).catch(err => {
      console.error(err);
      this._snackBar.open("Ups - es scheint etwas schief gelaufen zu sein.", "", {
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
       
        this.api.delete("/appointment/my/"+appointmentObj._id).then((result : any) => {
          if (result.success){
            appointmentObj.inactive = true;
            this._snackBar.open("Termin wurde gelöscht.", "", {
              duration: 2000,
            });
          }else{
            this._snackBar.open("Konnte nicht gelöscht werden, da der Start in der Vergangenheit liegt.", "", {
              duration: 2000,
            });
          }
          
        }).catch(err => {
          console.error(err);
        });

      }
      console.log('The dialog was closed');
    });
  }

  canDelete(appointmentObj){
    let now = new Date(); 

    if (new Date(appointmentObj.appointmentObj.start).getTime() > now.getTime()){
      return true;
    }else{
      return false;
    }
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

  openMessageDialog(type, messageDataObject=null) : void {

    if (this.auth.isAuthorized()){

      if (this.auth.isAuthorized()){
        if (!this.auth.currentUserValue.validated){
          this._snackBar.open("Bitte verifizieren Sie ihr Konto bevor Sie digitale Dienste nutzen können. Prüfen Sie ihr Postfach oder gehen Sie auf 'myFFA'", "OK", {
            duration: 10000
          })
          return;
        }
      }
      
      const dialogRef = this.dialog.open(GenmessageComponent, {
        data: {type : type, messageData : messageDataObject},
        panelClass : "generalmessage-dialog"
      });
    
      dialogRef.afterClosed().subscribe((resultObj : any) => {
        if (resultObj){
          this.getMyMessages();
        }
      });

    }else{

     const dialogRef = this.dialog.open(LoginComponent, {
        data: {},
        panelClass : "login-dialog"
      });

      dialogRef.afterClosed().subscribe((resultData : any) => {
        if (resultData){
          this.openMessageDialog(type, messageDataObject);
        }
      });

    }

  }

  removePrescriptionRequest(prescriptionRequest){

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {meta : {"type" : "confirm", "title" : "Anfrage-Details löschen", "messageText" : "Möchten Sie die Anfragedetails (zB Medikationen) löschen?"}}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result){return;}
      if (result.answerConfirm){
        this.api.delete(`/message/prescription/${prescriptionRequest._id}`).then(result => {

          this._snackBar.open("Details gelöscht", "", {
            duration: 2000,
          });
          prescriptionRequest.removed = true;

        }).catch(err => {
          console.error(err);
          this._snackBar.open("Ups - es scheint etwas schief gelaufen zu sein.", "", {
            duration: 2000,
          });
        });
      }
    });
  }

  newPrescriptionRequest(prescriptionRequest=null){
    this.openMessageDialog("prescription", prescriptionRequest);
  }

  getListMedis(prescriptionRequest){

    if (prescriptionRequest.removed){
      return "";
    }

    if (prescriptionRequest.medications){
      let outString = "";
      prescriptionRequest.medications.forEach(element => {
        if (outString.length > 0){
          outString += ", ";
        }
        outString += element.name;
      });

      return outString;

    }
  }

  updateUrl(tab){

    const url = this.router
        .createUrlTree([], {
          relativeTo: this.route,
          queryParams: { tab: tab },
          
          queryParamsHandling: 'merge'}
        )
        .toString();

      this.location.go(url);
  }

  tabChanged(evt){
    this.updateUrl(evt.tab.textLabel.toLowerCase())
  }

  deleteAccount(){

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {meta : {"type" : "confirm", "title" : "Profil löschen", "messageText" : "Warnung: Sind Sie sicher, dass Sie Ihren Account löschen möchten? Dieser Schritt lässt sich nicht umkehren."}}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.answerConfirm){
       
        this.api.delete("/profile/user").then(result => {
          this._snackBar.open("Account wurde gelöscht", "", {
            duration: 2000,
          });
          this.auth.logout();
        }).catch(err => {
          console.error(err);
          this._snackBar.open("Ups - es scheint etwas schief gelaufen zu sein.", "", {
            duration: 2000,
          });
        });

      }
      console.log('The dialog was closed');
    });



  }

}
