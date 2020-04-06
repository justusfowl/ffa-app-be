import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-appointment-details',
  templateUrl: './appointment-details.component.html',
  styleUrls: ['./appointment-details.component.scss']
})
export class AppointmentDetailsComponent implements OnInit {

  appointmentObj : any;
  appointmentObjOrig : any;

  isHistoricAppointment : boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AppointmentDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private dialog : MatDialog, 
    private api: ApiService, 
    private snackBar : MatSnackBar
    ) { 
      
      this.appointmentObj = data.appointmentObj;
      this.appointmentObjOrig = JSON.parse(JSON.stringify(data.appointmentObj));

      let today = new Date(); 

      if (today.getTime() > this.appointmentObj.end.getTime()){
        this.isHistoricAppointment = true;
      }

      console.log(data);
    }

  ngOnInit() {
  
  }

  close(){
    let changed = false;
    if (this.appointmentObj != this.appointmentObjOrig){
      changed = true;
    } 

    this.dialogRef.close({"changed" : changed});
  }

  handleInitTeleDialIn(){
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {meta : {"type" : "confirm", "title" : "Einwählen", "messageText" : "Möchten Sie die Video-Sprechstunde für diesen Termin starten?"}}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.answerConfirm){
       this.openTeleAppointment();
      }
      console.log('The dialog was closed');
    });
  }

  openTeleAppointment(){

    if (!this.appointmentObj){
      return;
    }

    var win = window.open(this.appointmentObj.tele.dialInUrlDoc, '_blank');
    win.focus();
  }

  deleteAppointment(){
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {meta : {"type" : "confirm", "title" : "Absagen", "messageText" : "Möchten Sie diesen Termin absagen - dem Patienten wird automatisch eine eMail zugeschickt?"}}
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result.answerConfirm){
        this.api.delete("/appointment/" + this.appointmentObj._id).then((result : any) => {
          if (result.success){
            this.appointmentObj.inactive = true;

            this.snackBar.open("Gelöscht", "", {
              duration: 1500
            })


          }
        }).catch(err => {
          this.snackBar.open("Es scheint als könnten wir den Termin nicht löschen. Ggf. versuchen Sie es bitte in wenigen Minuten erneut, falls der Termin nicht in der Vergangenheit endete.", "", {
            duration: 1500
          })
        })
      }
    });
  }

}
