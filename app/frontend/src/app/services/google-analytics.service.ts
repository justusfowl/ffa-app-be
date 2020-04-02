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
    this.active = status;
  }

  initGA(){
    if (!this.active){
      return;
    }
    gtag('js', new Date());
    console.log("Initiatilizing GA with...#" + this.gaId)
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
