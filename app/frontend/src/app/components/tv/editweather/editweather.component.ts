import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-editweather',
  templateUrl: './editweather.component.html',
  styleUrls: ['./editweather.component.scss']
})
export class EditweatherComponent implements OnInit {

  // https://openweathermap.org/weather-conditions

  weatherCodes : any[] = [
    {
      "code" : 2, 
      "iconClass" : "mdi-weather-lightning-rainy"
    },
    {
      "code" : 3, 
      "iconClass" : "mdi-weather-partly-rainy"
    },
    {
      "code" : 5, 
      "iconClass" : "mdi-weather-pouring"
    },
    {
      "code" : 6, 
      "iconClass" : "mdi-snowflake"
    },
    {
      "code" : 7, 
      "iconClass" : "mdi-weather-fog"
    },
    {
      "code" : 800, 
      "iconClass" : "mdi-weather-sunny"
    },
    {
      "code" : 8, 
      "iconClass" : "mdi-weather-cloudy"
    }
  ];

  selectable : boolean = true;

  searchString : string = "";
  searchStringCopy : string = "";

  searchResults: any[] = [];
  weatherItem : any;

  selectedLocations: any[] = [];
  submitted : boolean = false;
  loadingCities : boolean = false;

  constructor(
    public dialogRef: MatDialogRef<EditweatherComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private snackBar : MatSnackBar, 
    private api : ApiService
  ) {
    console.log(data.item);

    if (data.item){
      this.weatherItem = data.item;

      if (this.weatherItem.location){
        this.selectedLocations.push(this.weatherItem.location);
      }
    }else{
      this.weatherItem = {};
    }

   }

  ngOnInit() {

  }

  handleSearch(val){

    if (!val || val.length < 1){
      return;
    }

    this.searchStringCopy = val;

    this.submitted = false;
    this.loadingCities = true;

    this.api.get("/general/content/tv/weather/find?q=" + val).then((result : any) => {
      this.submitted = true;
      this.loadingCities = false;

      if (typeof(result.list) != "undefined"){
        this.searchResults = [];
        for (var i=0;i<5;i++){
          if (i<result.list.length){
            this.searchResults.push(result.list[i]);  
          }
        }     
      }
    }).catch(err => {
      this.loadingCities = false;
      console.error(err);
    })


  }

  getIconClass(resultItem){
    try{
      let stateCode = resultItem.weather[0].id; 
      if (stateCode == 800){
        return "mdi mdi-weather-sunny";
      }else{
        let codeGroup = parseFloat(stateCode.toFixed().substring(0,1));
        let weatherTypeIdx = this.weatherCodes.findIndex(x => x.code == codeGroup);
        if (weatherTypeIdx > -1){
          return "mdi " + this.weatherCodes[weatherTypeIdx].iconClass;
        }else{
          return "mdi mdi-temperature-celsius"
        }
      }
    }catch(err){
      console.error(err);
      return "mdi mdi-temperature-celsius";
    }
  }

  selectItem(item){
    this.weatherItem["location"] = item;
    this.selectedLocations = [item];
    this.searchString = "";
  }

  removeItem(){
    delete this.weatherItem.location;
    this.selectedLocations = [];
    this.searchString = this.searchStringCopy;
  }
  
  clearSearch(){
    this.searchString = "";
    this.searchResults = []; 
  }

  close(){
    this.dialogRef.close();
  }

}
