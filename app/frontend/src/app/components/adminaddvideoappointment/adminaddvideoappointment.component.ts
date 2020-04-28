import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-adminaddvideoappointment',
  templateUrl: './adminaddvideoappointment.component.html',
  styleUrls: ['./adminaddvideoappointment.component.scss']
})
export class AdminaddvideoappointmentComponent implements OnInit {

  state : string = "";

  timeSelection : any[] = [];

  timeSelectionStart : any[] = [];
  timeSelectionEnd : any[] = [];

  availableDocs : any[] = [];

  appointmentForm : FormGroup;

  appointmentTypes : any[] = [
    {
      "type" : "general", 
      "name" : "Generelle Konsultation"
    },
    {
      "type" : "lab", 
      "name" : "Besprechung Laborwerte"
    },
    
    {
      "type" : "docletter", 
      "name" : "Befund-Rückfrage"
    },
    
    {
      "type" : "travel-vac", 
      "name" : "Reise-Impf-Beratung"
    }
    
  ];


  constructor(
      public dialogRef: MatDialogRef<AdminaddvideoappointmentComponent>,
      private api : ApiService, 
      private _snackBar : MatSnackBar, 
      private auth: AuthenticationService
  ) {

    for (var h=0; h<24; h++){
      for (var min=0; min<12; min++){
        let slot = h.toFixed().padStart(2, "0") + ":" +  (min*5).toFixed().padStart(2, "0")
        this.timeSelection.push(slot)
      }
    }

    this.timeSelectionEnd = this.timeSelection; 
    this.timeSelectionStart = this.timeSelection;

    this.appointmentForm =  new FormGroup({
      doc : new FormControl("", Validators.required),
      appointmentType :  new FormControl("", Validators.required),
      date : new FormControl("", Validators.required),
      startTime : new FormControl("", Validators.required),
      endTime : new FormControl("", Validators.required)
    });

    this.appointmentForm.get("startTime").valueChanges.subscribe(selectedValue => {
      
      try{
       console.log(selectedValue);
       this.timeSelectionEnd = this.timeSelection.filter(x => parseFloat(x.replace(":", "")) >= parseFloat(selectedValue.replace(":", "")));
       
      }catch(err){
        console.error(err);
      }
        
    });

    
    this.appointmentForm.get("endTime").valueChanges.subscribe(selectedValue => {
      
      try{

        this.timeSelectionStart = this.timeSelection.filter(x => parseFloat(x.replace(":", "")) < parseFloat(selectedValue.replace(":", "")));
       
        console.log(selectedValue);
      }catch(err){
        console.error(err);
      }
        
    });

   }

  ngOnInit() {
    this.getAvailableDocs();
  }

  getAvailableDocs(){
    this.api.get("/appointment/docs").then((docs : any) => {

      this.availableDocs = docs;

    }).catch(err => {
      console.error(err);
    })
  }


  createAppointment(){

    this.state = "submit";

    let self = this;

    let userObj = this.auth.currentUserValue;

    let d = this.appointmentForm.get("date").value as any;
    let sT = this.appointmentForm.get("startTime").value as any;
    let eT = this.appointmentForm.get("endTime").value as any;
    let startTime = new Date(new Date(d).setHours(parseFloat(sT.substring(0,sT.indexOf(":"))), parseFloat(sT.substring(sT.indexOf(":")+1,sT.length))));
    let endTime = new Date(new Date(d).setHours(parseFloat(eT.substring(0,eT.indexOf(":"))), parseFloat(eT.substring(eT.indexOf(":")+1,eT.length))));

    let appType =  this.appointmentForm.get("appointmentType").value as any;

    let appointmentObj = {
      patientName : userObj.name, 
      patientEmail : userObj.userName, 
      patientMobilePhone : "", 
      appointmentType : appType, 
      doc : this.appointmentForm.get("doc").value,
      adminGenerated : true, 
      appointmentObj : {
        start : startTime, 
        end : endTime,
        title : sT + " | " + userObj.name, 
        appointmentType :appType.appointmentType
      }  
    }
   
    this.api.post("/appointment/new", appointmentObj).then((response : any) => {

      if (response.success){

        this._snackBar.open("Erfolgreich. Der Termin wurde eingestellt.", "", {duration : 1500});

        setTimeout(function(){
          self.dialogRef.close(true);
        }, 1500);

      }else{
        this.state = "error";
        
        if (response.key == 'TOO_MANY_OUTSTANDING'){
          this._snackBar.open("Wir können Ihren Termin zur Zeit nicht einstellen, da Sie bereits 2 offene Termine registriert haben. Sollten Sie diese nicht wahrnehmen können, so sagen Sie diese bitte vorher ab, bevor Sie neue Termine vereinbaren können. Melden Sie sich an und sehen Sie unter 'myFFA > Profil > Termine'", "OK");
        }else if (response.key == 'SLOT_NOT_AVAILABLE'){
          this._snackBar.open("Leider hat das nicht geklappt - möglicherweise wurde Ihr Slot soeben vergeben. Bitte gehen Sie zum vorherigen Schritt zurück und wählen Sie einen anderen aus.", "OK");
        }else{
          this._snackBar.open("Etwas hat leider nicht geklappt - bitte versuchen Sie es erneut oder mit einem anderen Slot.", "OK");
        }
       
      }

    }).catch(err => {
      console.error(err);
      this._snackBar.open("Etwas hat leider nicht geklappt - bitte versuchen Sie es erneut oder mit einem anderen Slot.", "OK");
    })


  }

  close(){
    this.dialogRef.close();
  }

}
