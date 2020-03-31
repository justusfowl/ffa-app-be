import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormArray, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-medrequest',
  templateUrl: './medrequest.component.html',
  styleUrls: ['./medrequest.component.scss', '../../app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MedrequestComponent implements OnInit {

  medications = new FormArray([]);

  doseformOptions = [
    {
      "form" : "Creme"
    },
    {
      "form" : "Dragees"
    },
    {
      "form" : "Spray"
    },
        {
      "form" : "Tabletten"
    },
    {
      "form" : "Tropfen"
    },
    {
      "form" : "Zäpfchen"
    }
  ]

  constructor(
    public dialogRef: MatDialogRef<MedrequestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private snackBar : MatSnackBar
  ) {
    if (data.medications) {

      if (data.medications.length > 0){
       
        data.medications.forEach(element => {

          const group = new FormGroup({
            name: new FormControl(element.name),
            amount: new FormControl(element.amount),
            substance: new FormControl(element.substance),
            dose: new FormControl(element.dose),
            pzn: new FormControl(element.pzn),
            dosageform: new FormControl(element.dosageform)
          });
      
          this.medications.push(group);
        });
      }

    }
   
   }

  ngOnInit() {

  }

  abort(){
    this.dialogRef.close();
  }

  confirm(){
    let result = this.medications.value;
    console.log(result);

    this.dialogRef.close(this.medications.value);
  }

  addMedi(){
    if (this.medications.value.length <5){
      const group = new FormGroup({
        name: new FormControl("", Validators.required),
        amount: new FormControl("", Validators.required),
        substance: new FormControl("", Validators.required),
        dose: new FormControl("", Validators.required),
        pzn: new FormControl(""),
        dosageform: new FormControl("", Validators.required)
      });
  
      this.medications.push(group);
    }else{
      this.snackBar.open("Sie können max. 5 Präparate einfügen.", "OK", {
        duration: 3000
      })
    }
  
  }

  removeMedi(itmIdx){
    this.medications.removeAt(itmIdx);
  }

}
