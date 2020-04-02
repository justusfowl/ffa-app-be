import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss', '../../app.component.scss']
})
export class PrivacyComponent implements OnInit, OnDestroy  {

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