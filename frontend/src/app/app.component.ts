import {  Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { Router } from '@angular/router';
import { LoaderService } from './services/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  
  @ViewChild('globalLoader', {static: true}) public globalLoader: ElementRef;
  title = 'Facharztpraxis für Allgemeinmedizin';

  constructor(
    public auth: AuthenticationService, 
    private router:Router, 
    public loaderSrv : LoaderService
  ){  

  }

  ngAfterViewInit(){
    this.loaderSrv.setGlobalLoader(this.globalLoader);
  }
 
  showNavBar(){
    if (this.router.url.search("login") > -1){
      return false;
   }else{
     return true;
   }
  }

}

