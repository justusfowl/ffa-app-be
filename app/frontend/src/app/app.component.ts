import { Component, ViewChild, AfterViewInit, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { Router, NavigationEnd  } from '@angular/router';
import { LoaderService } from './services/loader.service';
import { ApiService } from './services/api.service';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { NgcCookieConsentService, NgcInitializeEvent, NgcStatusChangeEvent, NgcNoCookieLawEvent } from 'ngx-cookieconsent';
import { Subscription } from 'rxjs';
import { GoogleAnalyticsService } from './services/google-analytics.service';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { SettingsService } from './services/settings.service';


declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  
  @ViewChild('globalLoader', {static: true}) public globalLoader: ElementRef;
  @ViewChild('globalMessageLoader', {static: true}) public globalMessageLoader: ElementRef;

  
  title = 'Facharztpraxis für Allgemeinmedizin | Dres. Kaulfuß & Gärtner';

  times : any[] = [];
  vacation : any[] = [];

  flagShowGlobalAnnouncement : boolean = false;

  globalAnnouncement : string = "";

  private statusChangeSubscription: Subscription;
  private settingsSubscription : Subscription;

  settingsObj : any = {};

  constructor(
    public auth: AuthenticationService, 
    private router:Router, 
    public loaderSrv : LoaderService, 
    private api : ApiService,
    private ccService: NgcCookieConsentService, 
    private googleAnalytics : GoogleAnalyticsService,
    private titleService: Title, 
    private settingsSrv : SettingsService,
    private sanitizer : DomSanitizer
  ){  
    this.globalAnnouncement = "Bitte beachten Sie - wir bieten Ihnen ab sofort Video-Konsultationen."

    this.settingsSrv.initSettings();

    this.settingsSubscription = this.settingsSrv.settingsObjObservable.subscribe(result => {
      this.settingsObj = result;
      this.executeSettings();
    })
  }

 ngOnInit(){

    registerLocaleData(localeDe);

    this.setTitle(this.title);

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
          return;
      }
      window.scrollTo(0, 0)
    });

    if (this.ccService.hasConsented()){
      this.googleAnalytics.setStatus(true);
      this.googleAnalytics.initGA()
    }

    this.statusChangeSubscription = this.ccService.statusChange$.subscribe(
      (event: NgcStatusChangeEvent) => {
        if (event.status == "allow"){ 
          this.googleAnalytics.setStatus(true);
          this.googleAnalytics.initGA()
        }
      });

      
  }

  ngOnDestroy() {
    this.statusChangeSubscription.unsubscribe();
    this.settingsSubscription.unsubscribe();
  }

  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  ngAfterViewInit(){

    this.loaderSrv.setGlobalLoader(this.globalLoader);
    this.loaderSrv.setGlobalMsgLoader(this.globalMessageLoader);

    this.getTimes();

    this.loaderSrv.setMsgLoading(false);
    

  }

  executeSettings(){
    if (this.settingsObj.globalAnnouncement){
      if (this.settingsObj.globalAnnouncement.flagActive){
        this.settingsObj.globalAnnouncement.text = this.sanitizer.bypassSecurityTrustHtml(this.settingsObj.globalAnnouncement.text);
        this.showGlobalAnnouncement(true);
      }
    }
    
  }

  closeGlobalAnnouncement(){
    this.flagShowGlobalAnnouncement = false;
  }

  showGlobalAnnouncement(status=true){
    let self = this; 
    setTimeout(function(){
      self.flagShowGlobalAnnouncement = status;
    }, 1500)
  }

  getTimes(){

    this.api.get("/times").then((result : any) => {
      this.times = result.opening;
      this.vacation = result.vacation;

    }).catch(err => {
      console.error(err);
    })

  }
 
  showHintBar(){
    if (this.router.url.search("home") > -1){
      return true;
   }else{
     return false;
   }
  }

  showNavBar(){
    if (this.router.url.search("login") > -1 || this.router.url.search("passreset") > -1){
      return false;
   }else{
     return true;
   }
  }

  
  goToTag(tagId, route='home', navSrc="main-nav"){

    let self = this; 
    this.api.setLoading(true);

    try{
      if (this.router.url.search(route) < 0){
        this.router.navigate(["/"+ route]);
      }


      setTimeout(function(){
        
        try{
 
          $('html, body').animate({
              scrollTop: ($('#'+tagId).offset().top)-$('nav').height()-$('#global-announcement').height()
          },300);

          self.googleAnalytics.sendEvent(navSrc, {
            category: "nav", 
            label : tagId
          })

        }catch(err){
          console.error(err);
        }

        self.api.setLoading(false);
        
      }, 500);

    }catch(err){

    }

  }

  
  getIsVacationClosed(returnObject=false){
    let flagIsCurrentlyVacation;

    if (returnObject){
      flagIsCurrentlyVacation = null;
    }else{
      flagIsCurrentlyVacation = "";
    }
    
    let today = new Date();

    this.vacation.forEach(element => {

      let start = new Date(element.vacationStart);
      let end = new Date(element.vacationEnd);

      if (start <= today && start <= end){
        if (returnObject){
          flagIsCurrentlyVacation = element;
        }else{
          flagIsCurrentlyVacation = "Wir befinden uns gerade im Urlaub.";
        }
        
      }
      
    });

    return flagIsCurrentlyVacation;

  }

  getIsNowOpen(){
    let now = new Date(); 
    now["dayId"] = now.getDay();

    return this.getIsDayOpen(now);

  }

  
  getDayIsToday(day){
    let now = new Date(); 
    if (now.getDay() != day.dayId){
      return false;
    }else{
      return true;
    }
  }

  getIsDayOpen(day){

    let now = new Date(); 

    let flagIsOpen = false;

    let dayIdx = this.times.findIndex(x => x.dayId == day.dayId)

    let dayHrs = this.times[dayIdx];

    if (this.getIsVacationClosed() != ""){
      return false;
    }
 
    if (now.getDay() != day.dayId){
      return false;
    }

    if (dayHrs){

      var currentTime = now.getHours() * 60 + now.getMinutes();

      if (dayHrs.vomiStart){
        let start = parseInt(dayHrs.vomiStart.substring(0,dayHrs.vomiStart.indexOf(":")))*60+parseInt(dayHrs.vomiStart.substring(dayHrs.vomiStart.indexOf(":")+1,dayHrs.vomiStart.length));
        let end = parseInt(dayHrs.vomiEnd.substring(0,dayHrs.vomiEnd.indexOf(":")))*60+parseInt(dayHrs.vomiEnd.substring(dayHrs.vomiEnd.indexOf(":")+1,dayHrs.vomiEnd.length));
  
        if (start <= currentTime && currentTime <= end){
          flagIsOpen = true;
        }
      }
  
      if (dayHrs.namiStart){
        let start = parseInt(dayHrs.namiStart.substring(0,dayHrs.namiStart.indexOf(":")))*60+parseInt(dayHrs.namiStart.substring(dayHrs.namiStart.indexOf(":")+1,dayHrs.namiStart.length));
        let end = parseInt(dayHrs.namiEnd.substring(0,dayHrs.namiEnd.indexOf(":")))*60+parseInt(dayHrs.namiEnd.substring(dayHrs.namiEnd.indexOf(":")+1,dayHrs.namiEnd.length));
  
        if (start <= currentTime && currentTime <= end){
          flagIsOpen = true;
        }
      }
  
      return flagIsOpen;

    }else{
      return false;
    }

  }

}

