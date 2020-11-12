import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { NgcCookieConsentService } from 'ngx-cookieconsent';
import { Router, NavigationEnd } from '@angular/router';
declare let gtag:Function;

@Injectable({
  providedIn: 'root'
})

export class GoogleAnalyticsService {

  gaId : string = environment.gaId;
  active: boolean = false;

  constructor(
    private ccService: NgcCookieConsentService, 
    private router : Router
  ) {

  }

  public sendEvent(eventName, value: {category: string, label: string, action?: string, value?: string}) {

    if (!this.ccService.hasConsented()) {
      this.active = false;
      return;
    }

    gtag('event', eventName, {
      event_category : value.category,
      event_action : value.action, 
      event_label : value.label,
      event_value : value.value
    })

  }

  setStatus(status){
    console.log(status);
    this.active = status;
    if (!status){
      let gCookies = document.cookie.split(";").map(x => {return x.split("=")[0]}).filter(x => x.indexOf('_g')>-1);
      gCookies.forEach(gC => {
        document.cookie = gC + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      });
      document.cookie = "cookieconsent_status=deny;"
      
    }
  }

  initGA(){
    if (!this.active){
      return;
    }
    gtag('js', new Date());
    gtag('config', this.gaId);

    this.active = true;

    this.router.events.subscribe(event => {
      if(event instanceof NavigationEnd){
          gtag('config', this.gaId, 
                {
                  'page_path': event.urlAfterRedirects
                }
               );
       }
    });


  }

}
