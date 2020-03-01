import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { NewsdetailComponent } from '../newsdetail/newsdetail.component';
import {FormControl, Validators, FormGroup, FormGroupDirective, FormArray} from '@angular/forms';
import * as L from 'leaflet';
import { MedrequestComponent } from 'src/app/components/medrequest/medrequest.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss', '../../app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {

  WELCOME_TITLE : string = "Dr. Kaulfuß & Dr. Gärtner"
  WELCOME_SUBHEADER : string = "Facharztpraxis für Allgemeinmedizin";

  news = [];
  times : any[] = [];
  vacation : any[] = [];
  teamDocs : any[] = [];
  teamMfa : any[] = [];

  serviceBullets : any[] = [
    {
      "icon" : "slow_motion_video", 
      "service" : "ULTRASCHALL-UNTERSUCHUNGEN"
    },
    {
      "icon" : "tag_faces", 
      "service" : "Kindervorsorge-Untersuchungen"
    },
    {
      "icon" : "pool", 
      "service" : "SPORTMED. UNTERSUCHUNGEN",
      "sub" : "(Z.B. TAUCHERUNTERS.)"
    },
    {
      "icon" : "healing", 
      "service" : "KLEINE CHIRURGIE, BESTRAHLUNGEN"
    },
    {
      "icon" : "spa", 
      "service" : "GESUNDHEITSCHECK-UP"
    },
    {
      "icon" : "local_dining", 
      "service" : "ERNÄHRUNGSBERATUNG"
    },
    {
      "icon" : "child_care", 
      "service" : "JUGENDSCHUTZ-UNTERSUCHUNGEN"
    },
    {
      "icon" : "directions_bike", 
      "service" : "FAHRRADBERLASTUNGS - EKG"
    },
    {
      "icon" : "search", 
      "service" : "KREBSFRÜHERKENNUNG"
    },
    {
      "icon" : "pin_drop", 
      "service" : "AKUPUNKTUR"
    },
    {
      "icon" : "local_pharmacy", 
      "service" : "NEU: SCHRÖPFEN"
    },
  ];

  requestTypes : any[] = [
    {
      "type" : "general", 
      "name" : "Generelle Anfrage"
    },
    {
      "type" : "prescription", 
      "name" : "Rezeptvorbestellung"
    },
    /*
    {
      "type" : "appointment", 
      "name" : "Terminanfrage"
    }
    */
  ];

  @ViewChild(FormGroupDirective, {static : true}) formGroupDirective: FormGroupDirective;

  medicationsRequest : any[];
  requestForm : any;
  contactForm : any;


  constructor(
    private api: ApiService,
    public dialog: MatDialog, 
    private _snackBar: MatSnackBar
  ) {

  }

  ngOnInit() {
    this.getTimes();
    this.getNews();
    this.getTeam();
    this.initMap();

    this.initContactForm();
    this.initRequestForm();


    this.requestForm.get("type").valueChanges.subscribe(selectedValue => {
      
      try{
        console.log(selectedValue);
        if (selectedValue.type == "prescription"){
          this.openMedicationDialog();
        }
      }catch(err){ } 

    })
  }

  public get requestFormValue() {
      return this.requestForm.value;
  }

  public get medications() : FormArray {
    return this.requestForm.get("medications") as FormArray
  }

  initContactForm(){
    this.contactForm =  new FormGroup({
      name : new FormControl('', Validators.required),
      email : new FormControl('', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]),
      message : new FormControl('', Validators.required),
      acceptTerms : new FormControl(false, Validators.requiredTrue)
    });
  }

  initRequestForm(){
    this.requestForm =  new FormGroup({
      name : new FormControl('', Validators.required),
      email : new FormControl('', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]),
      type : new FormControl('', Validators.required),
      acceptTerms : new FormControl(false, Validators.requiredTrue),
      message : new FormControl('')
    });

    this.medicationsRequest = [];
  }

  getTimes(){

    this.api.get("/times").then((result : any) => {
      this.times = result.opening;
      this.vacation = result.vacation;

    }).catch(err => {
      console.error(err);
    })

  }

  getServices(){

    this.api.get("/services").then((result : any) => {
      this.serviceBullets = result;


    }).catch(err => {
      console.error(err);
    })

  }

  getNews(){

    this.api.get("/news").then((result : any) => {

      // per default, only show top 3 most recent articles 
      // API already provides sorted by date desc
      this.news = result.splice(0,3);

    }).catch(err => {
      console.error(err);
    })

  }

  setMessage(){
    let self = this;
    setTimeout(function(){
      self._snackBar.open("Vielen Dank für Ihre Nachricht. Wir werden uns schnellstmöglich bei Ihnen melden.", "OK", {
        duration: 2000,
      });
      self.initContactForm();
    },1500)
  }

  initMap(){
    var googleMapsDirections = "https://www.google.de/maps/place/Facharztpraxis+f%C3%BCr+Allgemeinmedizin+-+Dr.+Kaulfu%C3%9F+%26+Dr.+G%C3%A4rtner/@50.0231912,8.0905312,17z/data=!3m1!4b1!4m5!3m4!1s0x47bdeb20ec1f8b91:0xde050cd6a5da2599!8m2!3d50.0231912!4d8.0927199"

    var mymap = L.map('mapid').setView([50.023196, 8.092682], 20);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11'
    }).addTo(mymap);

    L.marker([50.023196, 8.092682]).addTo(mymap)
        .bindPopup('<b>Praxis</b><br /><a href='+googleMapsDirections+'">Route</a> <br/> Ringstr. 33<br/>65346 Erbach').openPopup();


    var popup = L.popup();
  }

  
  getTeam(){
    this.api.get("/team").then((data : any) => {
      this.teamDocs = data.docs;
      this.teamMfa = data.mfa;

    }).catch(err => {
      console.error(err);
    })
  }


  getVacationDisplay(vacationObj){

    let startDate = new Date(vacationObj.vacationStart) as any;
    let endDate = new Date(vacationObj.vacationEnd) as any;

    if (startDate.getYear() == endDate.getYear()){

      if (startDate.getMonth() == endDate.getMonth()){
        return startDate.getDate() + " - " + endDate.getDate() + "." + (startDate.getMonth()+1) + "." + (startDate.getYear()-100);
      }else{
        return startDate.getDate() + "." + (startDate.getMonth()+1) + " - " + endDate.getDate() + "." + (endDate.getMonth()+1) + "." + (endDate.getYear()-100) 
      }
     
    }else{
      return startDate.getDate() + "." + (startDate.getMonth()+1) + "." + (startDate.getYear()-100) + " - " + endDate.getDate() + "." + (endDate.getMonth()+1) + "." + (endDate.getYear()-100) 
    }

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

  getIsVacationClosed(){
    let flagIsCurrentlyVacation = "";
    let today = new Date();

    this.vacation.forEach(element => {

      let start = new Date(element.vacationStart);
      let end = new Date(element.vacationEnd);

      if (start <= today && start <= end){
        flagIsCurrentlyVacation = "Wir befinden uns gerade im Urlaub.";
      }
      
    });

    return flagIsCurrentlyVacation;

  }

  getIsNowOpen(){
    let now = new Date(); 
    now["dayId"] = now.getDay();

    return this.getIsDayOpen(now);

  }

  openNews(newsObject) : void {

    const dialogRef = this.dialog.open(NewsdetailComponent, {
      data: {newsObj : newsObject},
      panelClass : "full-height-dialog"
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });

  }

  getAvatar(doc){
    if (doc.picture){
      return doc.picture;
    }else{
      return "https://www.facharztpraxis-fuer-allgemeinmedizin.de/images/landing_img.png";
    }
  }

  getImageUrl(img){
    if (img.image){
      return img.image;
    }else{
      return "https://www.facharztpraxis-fuer-allgemeinmedizin.de/images/landing_img.png";
    }
  }

  goToTag(tagId){

    try{
      let d = document.getElementById(tagId)
      d.scrollIntoView()
    }catch(err){
    }

  }

  editMediRequests(){
    this.openMedicationDialog(this.medicationsRequest);
  }

  sendMessage(){

    let f = this.requestFormValue;
    let endPoint = "/message/";

    if (f.type.type == 'general'){
      endPoint += "general"
    }else if (f.type.type == 'prescription'){
      endPoint += "prescription"
      f.medications = this.medicationsRequest;
    }

    this.api.post(endPoint, f).then(result => {
      this._snackBar.open("Vielen Dank. Wir haben Ihre Nachricht erhalten.", "OK", {
        duration: 5000
      });

      setTimeout(() => {
        this.formGroupDirective.resetForm()
        this.initRequestForm();
      }, 200);

    }).catch(err=>{
      console.warn(err);
      this._snackBar.open("Etwas hat nicht geklappt", "", {
        duration: 1500
      })
    })
  }

  openMedicationDialog(medications = []) : void {

    const dialogRef = this.dialog.open(MedrequestComponent, {
      data: {medications : medications},
      panelClass : "prescription-dialog"
    });

    dialogRef.afterClosed().subscribe((medicationsArray : any) => {
      if (medicationsArray){
        this.medicationsRequest = medicationsArray;
      }
    });

  }

}