import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-newsdetail',
  templateUrl: './newsdetail.component.html',
  styleUrls: ['./newsdetail.component.scss']
})
export class NewsdetailComponent implements OnInit {

  newsObj : any;

  constructor(
    public dialogRef: MatDialogRef<NewsdetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    protected sanitizer: DomSanitizer
  ) {
    this.newsObj = data.newsObj;
   }

  ngOnInit() {

  }

  sanText(inText){
    return this.sanitizer.bypassSecurityTrustHtml(inText);
  }

  
  getImageUrl(){
    if (this.newsObj.image){
      return this.newsObj.image;
    }else{
      return "https://www.facharztpraxis-fuer-allgemeinmedizin.de/images/landing_img.png";
    }
  }

  close(){
    this.dialogRef.close();
  }

}
