import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-tele-slot',
  templateUrl: './tele-slot.component.html',
  styleUrls: ['./tele-slot.component.scss']
})
export class TeleSlotComponent implements OnInit {

  slotForm : FormGroup = new FormGroup({
    userId : new FormControl("", Validators.required),
    dayId : new FormControl("", Validators.required),
    startTime : new FormControl("", Validators.required),
    endTime : new FormControl("", Validators.required)
  });

  availableDocs : any[] = [];

  days : any[] = [
    {
      "dayId" : 1, 
      "dayName" : "Montag",
    },
    {
      "dayId" : 2, 
      "dayName" : "Dienstag",
    },
    {
      "dayId" : 3, 
      "dayName" : "Mittwoch",
    },
    {
      "dayId" : 4, 
      "dayName" : "Donnerstag",
    },
    {
      "dayId" : 5, 
      "dayName" : "Freitag",
    }
  ]

  constructor(
    public dialogRef: MatDialogRef<TeleSlotComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private api : ApiService
  ) { 



   }

  async ngOnInit() {

    await this.getAvailableDocs();
    
    // let data = this.data;

    if (this.data.teleslotObj){

      this.slotForm =  new FormGroup({
        userId : new FormControl(this.data.teleslotObj.userId, Validators.required),
        dayId : new FormControl(this.data.teleslotObj.dayId, Validators.required),
        startTime : new FormControl(this.data.teleslotObj.start.getHours().toFixed().padStart(2,"0") + ":" + this.data.teleslotObj.start.getMinutes().toFixed().padStart(2,"0"), Validators.required),
        endTime : new FormControl(this.data.teleslotObj.end.getHours().toFixed().padStart(2,"0") + ":" + this.data.teleslotObj.end.getMinutes().toFixed().padStart(2,"0"), Validators.required)
      });
    }else{
      this.slotForm =  new FormGroup({
        userId : new FormControl("", Validators.required),
        dayId : new FormControl("", Validators.required),
        startTime : new FormControl("", Validators.required),
        endTime : new FormControl("", Validators.required)
      });
    }
  }

  getAvailableDocs(){
    return new Promise ((resolve, reject) => {
      this.api.get("/appointment/docs").then((docs : any) => {
        this.availableDocs = docs;
        console.log(docs);
        resolve(true);
      }).catch(err => {
        console.error(err);
        reject(err);
      })
    })
   
  }

  abort(){
    this.dialogRef.close();
  }

  confirm(){
    let result; 

    if (this.data.teleslotObj){
      if (this.data.teleslotObj._id){
        let formValue = this.slotForm.value; 

        this.data.teleslotObj.dayId = formValue.dayId; 
        this.data.teleslotObj.userId = formValue.userId;
        this.data.teleslotObj.startTime = formValue.startTime;
        this.data.teleslotObj.endTime = formValue.endTime;

        result = this.data.teleslotObj
      }
    }else{
      result = this.slotForm.value; 
      result.userName 
    }
    console.log(result)
    this.dialogRef.close(result);
    
  }

}
