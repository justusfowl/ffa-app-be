import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoaderService } from './loader.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  ENV : string = ""; 

  apiURL: string = "";
  loading : boolean = false;

  constructor(
    private http: HttpClient, 
    private loaderSrv : LoaderService
  ) { 
    
    this.ENV = environment.env;

    this.apiURL = "http://" + environment.apiBase

    if (environment.apiPort != ""){
      this.apiURL= this.apiURL + ":" + environment.apiPort;
    }else{
      this.apiURL = "";
    }

    this.apiURL= this.apiURL + environment.apiEnd;

    console.log(environment.production);
  }

  setLoading(targetState){
    this.loaderSrv.setLoading(targetState);
  }

  get(endPoint, paramOptions?, enableLoader=true){  

    this.loading = true;
    if (enableLoader){
      this.setLoading(true);
    }
    
    const api = this;

    return new Promise(function(resolve, reject) {
      
      api.http.get(api.apiURL + endPoint, {params: paramOptions}).subscribe(
        (data: any) => {
          
          api.loading = false;
          if (enableLoader){
            setTimeout(function(){
              api.setLoading(false);
            },500)
          }

          resolve(data)
        },
        error => {
          api.loading = false;
          api.handleAPIError(error);
          reject(error)
        }
      )
    });
  }

  delete(endPoint, enableLoader=true){  
    this.loading = true;
    if (enableLoader){
      this.setLoading(true);
    }
    
    const api = this;

    return new Promise(function(resolve, reject) {
      
      api.http.delete(api.apiURL + endPoint).subscribe(
        (data: any) => { 
          
          api.loading = false;
          if (enableLoader){
            setTimeout(function(){
              api.setLoading(false);
            },500)
          }

          resolve(data)
        },
        error => {
          api.loading = false;
          api.handleAPIError(error);
          reject(error)
        }
      )
    });
  }

  post(endPoint, body, enableLoader=true){  
    this.loading = true;
    if (enableLoader){
      this.setLoading(true);
    }
    
    const api = this;

    return new Promise(function(resolve, reject) {
      
      api.http.post(api.apiURL + endPoint, body).subscribe(
        (data: any) => { 
          
          api.loading = false;
          if (enableLoader){
            setTimeout(function(){
              api.setLoading(false);
            },500)
          }

          resolve(data)
        },
        error => {
          api.loading = false;
          api.handleAPIError(error);
          reject(error)
        }
      )
    });
  }

  put(endPoint, body, enableLoader=true){  
    this.loading = true;
    if (enableLoader){
      this.setLoading(true);
    }
    
    const api = this;

    return new Promise(function(resolve, reject) {
      
      api.http.put(api.apiURL + endPoint, body).subscribe(
        (data: any) => { 
          
          api.loading = false;
          if (enableLoader){
            setTimeout(function(){
              api.setLoading(false);
            },500)
          }

          resolve(data)
        },
        error => {
          api.loading = false;
          api.handleAPIError(error);
          reject(error)
        }
      )
    });
  }

    
  handleAPIError(error){
    if (!error.flagHasActionHappened){
      console.error(error);
    }
  }
  
}
