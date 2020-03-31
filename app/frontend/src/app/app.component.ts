import { Component, ViewChild, AfterViewInit, ElementRef, OnInit } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { Router, NavigationEnd  } from '@angular/router';
import { LoaderService } from './services/loader.service';
import { ApiService } from './services/api.service';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { NgcCookieConsentService, NgcInitializeEvent, NgcStatusChangeEvent, NgcNoCookieLawEvent } from 'ngx-cookieconsent';
import { Subscription } from 'rxjs';
import { GoogleAnalyticsService } from './services/google-analytics.service';


declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  
  @ViewChild('globalLoader', {static: true}) public globalLoader: ElementRef;
  @ViewChild('globalMessageLoader', {static: true}) public globalMessageLoader: ElementRef;

  
  title = 'Facharztpraxis für Allgemeinmedizin';

  times : any[] = [];
  vacation : any[] = [];

  flagShowGlobalAnnouncement : boolean = false;

  globalAnnouncement : string = "";

  //keep refs to subscriptions to be able to unsubscribe later
  private popupOpenSubscription: Subscription;
  private popupCloseSubscription: Subscription;
  private initializeSubscription: Subscription;
  private statusChangeSubscription: Subscription;
  private revokeChoiceSubscription: Subscription;
  private noCookieLawSubscription: Subscription;

  constructor(
    public auth: AuthenticationService, 
    private router:Router, 
    public loaderSrv : LoaderService, 
    private api : ApiService,
    private ccService: NgcCookieConsentService, 
    private googleAnalytics : GoogleAnalyticsService
  ){  
    this.globalAnnouncement = "Bitte beachten Sie - wir bieten Ihnen ab sofort Video-Konsultationen."
  }

  ngOnInit(){
    registerLocaleData(localeDe);

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
          return;
      }
      window.scrollTo(0, 0)
    });

    if (this.ccService.hasConsented()){
      this.googleAnalytics.initGA()
    }

    // subscribe to cookieconsent observables to react to main events
    this.popupOpenSubscription = this.ccService.popupOpen$.subscribe(
      () => {
        // you can use this.ccService.getConfig() to do stuff...
        console.log("PopOpen")
        this.getCookieConsent();
      });

    this.popupCloseSubscription = this.ccService.popupClose$.subscribe(
      () => {
        // you can use this.ccService.getConfig() to do stuff...
        console.log("popupClose")
        this.getCookieConsent();
      });

    this.initializeSubscription = this.ccService.initialize$.subscribe(
      (event: NgcInitializeEvent) => {
        // you can use this.ccService.getConfig() to do stuff...
        console.log("initialize")
        this.getCookieConsent();
      });

    this.statusChangeSubscription = this.ccService.statusChange$.subscribe(
      (event: NgcStatusChangeEvent) => {
        // you can use this.ccService.getConfig() to do stuff...
        if (event.status){
          this.googleAnalytics.initGA()
        }
        console.log(event);
      });

    this.revokeChoiceSubscription = this.ccService.revokeChoice$.subscribe(
      () => {
        // you can use this.ccService.getConfig() to do stuff...
        console.log("PopOrevokeChoicepen")
        this.getCookieConsent();
      });

      this.noCookieLawSubscription = this.ccService.noCookieLaw$.subscribe(
      (event: NgcNoCookieLawEvent) => {
        // you can use this.ccService.getConfig() to do stuff...
        console.log("noCookieLaw")
        this.getCookieConsent();
      });

      console.log("wie ist der consent ?")
      this.getCookieConsent(); 
  }

  getCookieConsent(){
    console.log("consented:" + this.ccService.hasConsented())
  }



  ngAfterViewInit(){

    this.loaderSrv.setGlobalLoader(this.globalLoader);
    this.loaderSrv.setGlobalMsgLoader(this.globalMessageLoader);

    this.getTimes();

    this.loaderSrv.setMsgLoading(false);
    this.showGlobalAnnouncement();

  }

  closeGlobalAnnouncement(){
    this.flagShowGlobalAnnouncement = false;
  }

  showGlobalAnnouncement(){
    let self = this; 
    setTimeout(function(){
      self.flagShowGlobalAnnouncement = true;
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
          },500);

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

