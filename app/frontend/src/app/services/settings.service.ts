import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {


    _settingsObj : Subject<any>;
    _settings : any;

  constructor(
      private api : ApiService
  ) { 

    this._settingsObj = new Subject<any>();
    
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

  }

  get settingsObjObservable() {
    return this._settingsObj.asObservable();
  }

  _setSettingsObj(result){
    
  }

  getSettings(){
    return this._settings;
  }


}
