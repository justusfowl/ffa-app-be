import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-imprint',
  templateUrl: './imprint.component.html',
  styleUrls: ['./imprint.component.scss', '../../app.component.scss']
})
export class ImprintComponent implements OnInit, OnDestroy  {

  settingsObj: any;
  settingsSubscription : any;

  constructor(
    private api : ApiService, 
    private sanitizer : DomSanitizer, 
    private settingsSrv : SettingsService
  ) {
    this.settingsSubscription = this.settingsSrv.settingsObjObservable.subscribe(result => {
      this.settingsObj = result;
    })
    
   }

  ngOnInit() {
    
  }

  ngAfterViewInit(){
  
  }

    
  sanText(inText){
    return this.sanitizer.bypassSecurityTrustHtml(inText);
  }

  ngOnDestroy(){
    this.settingsSubscription.unsubscribe()
  }
}
