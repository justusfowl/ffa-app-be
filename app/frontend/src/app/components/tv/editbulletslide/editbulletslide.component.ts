import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, Validators, FormControl, FormArray } from '@angular/forms';

@Component({
  selector: 'app-editbulletslide',
  templateUrl: './editbulletslide.component.html',
  styleUrls: ['./editbulletslide.component.scss']
})
export class EditbulletslideComponent implements OnInit {

  slideContentFrm : FormGroup; 
  

  constructor(
    public dialogRef: MatDialogRef<EditbulletslideComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private snackBar : MatSnackBar
  ) {
    if (data.item.slide){
      this.slideContentFrm = this.initSlideContent(data.item.slide);
    }else{
      this.slideContentFrm = this.initSlideContent({});
    }
   }

  initSlideContent(options){
    let b = [];

    if (options.bullets){
      options.bullets.forEach(bullet => {
          b.push(this.initSlideBullet(bullet))
      });
    }

    return new FormGroup({
      title : new FormControl(options.title || "", Validators.required),
      bullets : new FormArray(b, Validators.required)
    });

  }

  initSlideBullet(options){
    return new FormGroup({
      text : new FormControl(options.text || "", Validators.required)
    });
  }

  getBullets() : FormArray{
    return this.slideContentFrm.get("bullets") as FormArray;
  }

  addBullet(){
    if (this.getBullets().length < 10){
      let newB = this.initSlideBullet({});
      this.getBullets().push(newB);
    }else{
      this.snackBar.open("Sie können maximal 10 Inhaltspunkte auf eine Folie einfügen", "", {duration : 3500});
    }

  }

  removeBullet(idx){
    if (idx > -1){
      this.getBullets().removeAt(idx);
    }
  }

  ngOnInit() {

  }

  close(){
    this.dialogRef.close();
  }

  save(){
    if (!this.slideContentFrm.valid){
      console.log("Invalid...")
      return;
    }
    let v =  this.slideContentFrm.value; 
    this.dialogRef.close(v);
  }

}
