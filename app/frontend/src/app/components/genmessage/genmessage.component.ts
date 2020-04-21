import { Component, OnInit, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { MedrequestComponent } from '../medrequest/medrequest.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FormGroupDirective, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { GoogleAnalyticsService } from 'src/app/services/google-analytics.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-genmessage',
  templateUrl: './genmessage.component.html',
  styleUrls: ['./genmessage.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GenmessageComponent implements OnInit {

  medrequestDelivery : any[] = [
    {
      "type" : "collect", 
      "name" : "Abholung in der Praxis"
    },
    {
      "type" : "drugstore", 
      "name" : "Apotheke:"
    }
    
  ];

  @ViewChild(FormGroupDirective, {static : true}) formGroupDirective: FormGroupDirective;

  medicationsRequest : any[] = [];
  requestForm : FormGroup;

  constructor(
    public dialogRef: MatDialogRef<GenmessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private snackBar : MatSnackBar,
    private dialog : MatDialog, 
    private auth : AuthenticationService, 
    private googleAnalytics : GoogleAnalyticsService, 
    private api : ApiService
  ) {

   }

  ngOnInit() {

    let userEmail = ""; 
    let name = ""; 

    if (this.auth.isAuthorized()){
      userEmail = this.auth.currentUserValue.userName;
      name = this.auth.currentUserValue.name || "";
    }else if (this.auth.isGuest()){
      userEmail = this.auth.guestObjectValue.userEmail;
      name = this.auth.guestObjectValue.name || "";
    }else{
      this.dialogRef.close();
    }

    this.requestForm = new FormGroup({
      name : new FormControl(name, Validators.required),
      email : new FormControl(userEmail, [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]),
      acceptTerms : new FormControl(false, Validators.requiredTrue),
      deliveryType : new FormControl(""),
      collectDrugStore : new FormControl(""),
      message : new FormControl('')
    });

    if (this.data.type == 'prescription'){
      this.openMedicationDialog();
    }
  
  }

  openMedicationDialog(medications = []) : void {

    if (this.auth.isAuthorized() || this.auth.isGuest()){

      if (this.auth.isAuthorized()){
        if (!this.auth.currentUserValue.validated){
          this.snackBar.open("Bitte verifizieren Sie ihr Konto bevor Sie digitale Dienste nutzen können. Prüfen Sie ihr Postfach oder gehen Sie auf 'myFFA'", "OK", {
            duration: 10000
          })
          return;
        }
      }
      
      const dialogRef = this.dialog.open(MedrequestComponent, {
        data: {medications : medications},
        panelClass : "prescription-dialog"
      });
    
      dialogRef.afterClosed().subscribe((medicationsArray : any) => {
        if (medicationsArray){
          this.medicationsRequest = medicationsArray;
        }
      });

    }else{

     // close this dialog 
     this.dialogRef.close();

    }

  }

  public get requestFormValue() {
      return this.requestForm.value;
  }

  public get medications() : FormArray {
    return this.requestForm.get("medications") as FormArray
  }
  
  editMediRequests(){
    this.openMedicationDialog(this.medicationsRequest);
  }

  sendMessage2(){
    console.log(this.requestFormValue)
  }

  sendMessage(){

    let f = this.requestFormValue;
    let endPoint = "/message/";

    if (this.data.type == 'general'){
      endPoint += "general"
    }else if (this.data.type == 'prescription'){
      endPoint += "prescription"
      f.medications = this.medicationsRequest;

      if (f.deliveryType == 'drugstore' && (!f.collectDrugStore || f.collectDrugStore == "")){
        return;
      }
    }

    this.googleAnalytics.sendEvent("contactform",{
      category: "contact", 
      label : this.data.type
    });

    this.api.post(endPoint, f).then(result => {
      this.snackBar.open("Vielen Dank. Wir haben Ihre Nachricht erhalten.", "OK", {
        duration: 5000
      });

      setTimeout(() => {
        this.dialogRef.close();
      }, 1000);

    }).catch(err=>{
      console.warn(err);
      this.snackBar.open("Etwas hat nicht geklappt", "", {
        duration: 1500
      })
    })
  }

  close(){
    this.dialogRef.close();
  }

}
