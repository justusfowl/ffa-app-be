import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'trimLongStr'})

export class TrimLongStr implements PipeTransform {
  transform(str: string, numChars): string {
    if (typeof(numChars) == "undefined"){
      numChars = 200; 
    }
    
    if (str.length > numChars){
        const takeFirst1 = str.substring(0,numChars) + "...";
        return takeFirst1;
    }else{
        return str; 
    }

  }
}
