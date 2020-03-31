import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-imprint',
  templateUrl: './imprint.component.html',
  styleUrls: ['./imprint.component.scss']
})
export class ImprintComponent implements OnInit {

  settingsObj: any;

  constructor(
    private api : ApiService, 
    private sanitizer : DomSanitizer
  ) { }

  ngOnInit() {

  }

  ngAfterViewInit(){
    this.getGeneralSettings();
  }

  getGeneralSettings(refresher?){

    this.api.get("/general/settings").then((result : any) => {
      if (result && result.length > 0){
        this.settingsObj = result[0];
      }else{
        this.settingsObj = { }
      }
      

      if (refresher){
        refresher.target.complete();
      }
    }).catch(err => {
      console.error(err);
    })

  }

  
  sanText(inText){
    return this.sanitizer.bypassSecurityTrustHtml(inText);
  }
}