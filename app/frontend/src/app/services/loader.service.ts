import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  globalLoader : any;
  isLoading : boolean = false;

  constructor() { }

  
  setGlobalLoader(loaderRef){
      this.globalLoader = loaderRef;
  }

  setLoading(targetState){
    this.isLoading = targetState;
  }


}
