import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {


    _settingsObj : Subject<any>;
    _settings : any;

    _configObj : Subject<any>;
    _config : any;

  constructor(
      private api : ApiService
  ) { 

    this._settingsObj = new Subject<any>();
    this._configObj = new Subject<any>();
    
  }

  initSettings() : any{

    this.api.get("/general/settings").then((result : any) => {
        let _set;
        if (result && result.length > 0){
            _set = result[0];
            
          }else{
            _set = { }
          }
          this._settingsObj.next(_set);
          this._settings = _set;
       
      }).catch(err => {
        console.error(err);
      })

      this.api.get("/general/config").then((result : any) => {
        let _cfg;
        if (result){
          _cfg = result;
            
          }else{
            _cfg = { }
          }
          this._configObj.next(_cfg);
          this._config = _cfg;
       
      }).catch(err => {
        console.error(err);
      })

  }

  get settingsObjObservable() {
    return this._settingsObj.asObservable();
  }

  get configObjObservable() {
    return this._configObj.asObservable();
  }

  setSettingsObj(result){
    this._settingsObj.next(result);
    this._settings = result;
  }

  setConfigObj(result){
    this._configObj.next(result);
    this._config = result;
  }

  getConfig(){
    return this._config;
  }

  getSettings(){
    return this._settings;
  }

  getBrowserName() {
      const agent = window.navigator.userAgent.toLowerCase();

      switch (true) {
        case agent.indexOf('edge') > -1:
          return 'edge';
        case agent.indexOf('opr') > -1 && !!(<any>window).opr:
          return 'opera';
        case agent.indexOf('chrome') > -1 && !!(<any>window).chrome:
          return 'chrome';
        case agent.indexOf('trident') > -1:
          return 'ie';
        case agent.indexOf('firefox') > -1:
          return 'firefox';
        case agent.indexOf('safari') > -1:
          return 'safari';
        default:
          return 'other';
      }
  }


}
