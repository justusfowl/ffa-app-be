import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-editmedia',
  templateUrl: './editmedia.component.html',
  styleUrls: ['./editmedia.component.scss']
})
export class EditmediaComponent implements OnInit {

  mediaItem : any; 

  constructor(
    public dialogRef: MatDialogRef<EditmediaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private snackBar : MatSnackBar
  ) {
       
    if (data.item){
      this.mediaItem = data.item;
    }else{
      this.mediaItem = {};
    }

   }

  ngOnInit() {

  }

  close(){

    this.dialogRef.close(this.mediaItem);

  }

}
