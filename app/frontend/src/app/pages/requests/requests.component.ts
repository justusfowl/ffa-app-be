import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss', '../../app.component.scss']
})
export class RequestsComponent implements OnInit {

  prescriptionRequests: any[] = [];
  mediDisplayColumns: string[] = ['name', 'amount', 'substance', 'dose', 'pzn', 'dosageform'];

  messageId : string;

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
        this.messageId = params['messageId'] || null; 
        if (this.messageId){
          console.log(`opening the message with id: ${this.messageId}`)
        }
    });
   }

  ngOnInit() {
    this.getRequests();
  }

  getRequests(flagIncludeCompleted?){

    let params = {};

    if (flagIncludeCompleted){
      params["flagincludecompleted"] = true;
    }

    this.api.get("/message/request", params).then((result : any) => {
      
      let messages = result.messages || [];

      this.prescriptionRequests = messages;

    }).catch(err => {
      this._snackBar.open("Ups - es scheint etwas schief gelaufen zu sein.", "", {
        duration: 2000,
      });
    })
  }
  getStatusDescription(prescriptionRequest){
    if (prescriptionRequest.removed){
      return "Der Vorgang wurde vom Nutzer entfernt."
    }

    if (prescriptionRequest.status == 0){
      return "Der Vorang wurde eröffnet und wird bearbeitet."
    }else if (prescriptionRequest.status == 50){
      return "Es fehlen Informationen, der Patient wurde per eMail zur Kontaktaufnahme mit der Praxis per Telefon gebeten."
    }else if (prescriptionRequest.status == 100){
      return "Der Vorgang ist erfolgreich abgeschlossen."
    }else{
      return "## unbekannter Status ##"
    }
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

  askPatientToCall(prescriptionRequest){
    let body = {};
    body["status"] = 50;

    this.api.put(`/message/request/${prescriptionRequest._id}`, body).then((result : any) => {

      prescriptionRequest["status"] = 50;
      
      this._snackBar.open("Erfolgreich.", "", {
        duration: 2000,
      });

    }).catch(err => {
      this._snackBar.open("Ups - es scheint etwas schief gelaufen zu sein.", "", {
        duration: 2000,
      });
    })
  }

  confirmPresRequest(prescriptionRequest){
    let body = {};
    body["status"] = 100;

    this.api.put(`/message/request/${prescriptionRequest._id}`, body).then((result : any) => {

      prescriptionRequest["status"] = 100;
      
      this._snackBar.open("Erfolgreich.", "", {
        duration: 2000,
      });

    }).catch(err => {
      this._snackBar.open("Ups - es scheint etwas schief gelaufen zu sein.", "", {
        duration: 2000,
      });
    })
  }

}
