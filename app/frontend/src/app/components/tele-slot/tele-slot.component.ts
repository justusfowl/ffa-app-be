import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-tele-slot',
  templateUrl: './tele-slot.component.html',
  styleUrls: ['./tele-slot.component.scss']
})
export class TeleSlotComponent implements OnInit {

  todayDate: Date = new Date()

  slotForm : FormGroup = new FormGroup({
    userId : new FormControl("", Validators.required),
    dayId : new FormControl("", Validators.required),
    startTime : new FormControl("", Validators.required),
    endTime : new FormControl("", Validators.required), 
    exceptions : new FormArray([
      new FormGroup({
        start: new FormControl(''),
        end: new FormControl('')
      })
    ])
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
    private api : ApiService,
    private fb: FormBuilder
  ) { 



   }

  async ngOnInit() {

    await this.getAvailableDocs();
    
    // let data = this.data;

    if (this.data.teleslotObj){

      let exceptionsArray = [];

      if (this.data.teleslotObj.exceptions){

        this.data.teleslotObj.exceptions.forEach(element => {

          if (this.todayDate.getTime()<=new Date(element["end"]).getTime()){
            exceptionsArray.push(
              new FormGroup({
                start: new FormControl(element.start || ''),
                end: new FormControl(element.end || '')
              })
            )
          }
         
        });

      }

      this.slotForm =  new FormGroup({
        userId : new FormControl(this.data.teleslotObj.userId, Validators.required),
        dayId : new FormControl(this.data.teleslotObj.dayId, Validators.required),
        startTime : new FormControl(this.data.teleslotObj.start.getHours().toFixed().padStart(2,"0") + ":" + this.data.teleslotObj.start.getMinutes().toFixed().padStart(2,"0"), Validators.required),
        endTime : new FormControl(this.data.teleslotObj.end.getHours().toFixed().padStart(2,"0") + ":" + this.data.teleslotObj.end.getMinutes().toFixed().padStart(2,"0"), Validators.required), 
        exceptions : new FormArray(exceptionsArray)
      });

    }else{

      this.slotForm =  new FormGroup({
        userId : new FormControl("", Validators.required),
        dayId : new FormControl("", Validators.required),
        startTime : new FormControl("", Validators.required),
        endTime : new FormControl("", Validators.required), 
        exceptions : new FormArray([])
      });

    }
  }

  get exceptions() { return <FormArray>this.slotForm.get('exceptions'); }

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
        this.data.teleslotObj.exceptions = formValue.exceptions;

        result = this.data.teleslotObj
      }
    }else{
      result = this.slotForm.value; 
      result.userName 
    }

    this.dialogRef.close(result);
    
  }

  createException(){

    let exceptions = this.slotForm.get('exceptions') as any;

    const control = new FormGroup({
      start: new FormControl(''),
      end: new FormControl('')
    });

    exceptions.push(control);

  }

  removeException(idx){

    let exceptions = this.slotForm.get('exceptions') as FormArray;

    exceptions.removeAt(idx);

  }

}
