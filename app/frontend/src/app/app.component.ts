import {  Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { Router } from '@angular/router';
import { LoaderService } from './services/loader.service';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  
  @ViewChild('globalLoader', {static: true}) public globalLoader: ElementRef;
  title = 'Facharztpraxis für Allgemeinmedizin';

  times : any[] = [];
  vacation : any[] = [];

  constructor(
    public auth: AuthenticationService, 
    private router:Router, 
    public loaderSrv : LoaderService, 
    private api : ApiService
  ){  

  }

  ngAfterViewInit(){
    this.loaderSrv.setGlobalLoader(this.globalLoader);
    this.getTimes();
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

  
  goToTag(tagId, route='home'){

    try{
      if (this.router.url.search(route) < 0){
        this.router.navigate(["/"+ route]);
      }
      let d = document.getElementById(tagId);

      setTimeout(function(){
        d.scrollIntoView();
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

