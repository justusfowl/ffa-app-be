import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ApiService } from 'src/app/services/api.service';
import { LoaderService } from 'src/app/services/loader.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { GoogleAnalyticsService } from 'src/app/services/google-analytics.service';

@Component({
  selector: 'app-cancelappointment',
  templateUrl: './cancelappointment.component.html',
  styleUrls: ['./cancelappointment.component.scss']
})
export class CancelappointmentComponent implements OnInit, AfterViewInit {

  appointmentId : string = "";
  token : string = "";
  flagError : boolean = false;

  constructor(
    public dialogRef: MatDialogRef<CancelappointmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private api : ApiService,
    private loaderSrv : LoaderService, 
    private auth : AuthenticationService,
    private googleAnalytics : GoogleAnalyticsService
  ) {

    if (data.token){
      
      this.token = data.token;
      this.appointmentId = data.appointmentId;
    }else{
      this.flagError = true;
    }

   }

  ngOnInit() {

  }

  ngAfterViewInit(){
    let self = this; 

    setTimeout(function(){
      self.auth.setTmpToken(self.data.token);
      self.removeAppointment();
    }, 2500 )
  }

  removeAppointment(){

    this.api.delete("/appointment/my/"+this.appointmentId).then(result => {
      this.loaderSrv.setMsgLoading(false);
      this.auth.setTmpToken(null);

      this.googleAnalytics.sendEvent("user-delete",{
        category: "video-dialog", 
        label : ""
      });
      
    }).catch(err => {
      this.flagError = true;
      this.loaderSrv.setMsgLoading(false);
      this.auth.setTmpToken(null);
    })
  }

  close(){
    this.dialogRef.close();
  }

}
