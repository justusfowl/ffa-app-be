import { Component, OnInit, ChangeDetectionStrategy, ViewChild,   TemplateRef, ViewEncapsulation, Inject } from '@angular/core';

import {
  subDays,
  addDays,
  addHours,
  isSameMonth,
  isSameDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  format
} from 'date-fns';
import { Subject, Observable } from 'rxjs';

import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView
} from 'angular-calendar';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { MatStepper, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LoaderService } from 'src/app/services/loader.service';
import { ApiService } from 'src/app/services/api.service';
import { DatePipe } from '@angular/common';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { GoogleAnalyticsService } from 'src/app/services/google-analytics.service';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};

function getTimezoneOffsetString(date: Date): string {
  const timezoneOffset = date.getTimezoneOffset();
  const hoursOffset = String(
    Math.floor(Math.abs(timezoneOffset / 60))
  ).padStart(2, '0');
  const minutesOffset = String(Math.abs(timezoneOffset % 60)).padEnd(2, '0');
  const direction = timezoneOffset > 0 ? '-' : '+';

  return `T00:00:00${direction}${hoursOffset}:${minutesOffset}`;
}

@Component({
  selector: 'app-newappointment',
  templateUrl: './newappointment.component.html',
  styleUrls: ['./newappointment.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NewappointmentComponent implements OnInit {



  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;
  @ViewChild('stepper', { static: true }) private stepper: MatStepper;

  availableDocs : any[] = [];
  

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  locale : string = 'de';

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [];

  evtLoading : boolean = false;

  refresh: Subject<any> = new Subject();

  events$: Observable<Array<CalendarEvent<{ any:any }>>>;
  flagHasSlots : boolean = false;

  activeDayIsOpen: boolean = true;

  isLinear = true;
  baseInfoForm: FormGroup;
  dateTimeForm: FormGroup;
  finalForm : FormGroup;

  flagSubmitted : boolean = false;


  appointmentTypes : any[] = [
    {
      "type" : "general", 
      "name" : "Generelle Konsultation"
    },
    {
      "type" : "lab", 
      "name" : "Besprechung Laborwerte"
    },
    
    {
      "type" : "docletter", 
      "name" : "Befund-Rückfrage"
    },
    
    {
      "type" : "travel-vac", 
      "name" : "Reise-Impf-Beratung"
    }
    
  ];

  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<NewappointmentComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private loaderSrv : LoaderService, 
    private api : ApiService, 
    private datePipe : DatePipe, 
    private auth: AuthenticationService, 
    private googleAnalytics : GoogleAnalyticsService
    ) {


  }

  ngOnInit() {
    let patientName;

    if (this.auth.isAuthorized()){
      patientName = this.auth.currentUserValue.name || this.auth.currentUserValue.userName;
    }else if (this.auth.isGuest()){
      let guestObject = this.auth.guestObjectValue;
      patientName = guestObject.name;
    }
    
    this.baseInfoForm = this._formBuilder.group({
      patientName: [patientName, Validators.required],
      appointmentType: ['', Validators.required],
      doc : ['', Validators.required],
      appointmentNotes: ['', Validators.required],
    });

    this.dateTimeForm = this._formBuilder.group({
      appointmentObj: ['', Validators.required],
      appointmentDateStart: ['', Validators.required]
    });

    this.finalForm = this._formBuilder.group({
      acceptTerms: ['', Validators.requiredTrue], 
      initiated :  ['', Validators.required]
    });

    this.getAvailableDocs();

  }

  fetchEvents(): void {
    this.activeDayIsOpen = false;
    this.evtLoading = true;

    const getStart: any = {
      month: startOfMonth,
      week: startOfWeek,
      day: startOfDay
    }[this.view];

    const getEnd: any = {
      month: endOfMonth,
      week: endOfWeek,
      day: endOfDay
    }[this.view];

    const params = new HttpParams()
      .set(
        'startDate',
        format(getStart(this.viewDate), 'MM-dd-yyyy')
      )
      .set(
        'endDate',
        format(getEnd(this.viewDate), 'MM-dd-yyyy')
      )
      .set(
        'appointmentType', this.baseInfoForm.get("appointmentType").value.type)
      .set(
         'docId', this.baseInfoForm.get("doc").value._id)

        this.api.get("/appointment/new", params).then((result : any) => {

          if (result.length > 0){
            this.flagHasSlots = true;
          }else{
            this.flagHasSlots = false;
          }

          result.forEach(element => {
            element.start = new Date(element.start);
            element.end = new Date(element.end);

           element.title = this.datePipe.transform( element.start, "shortTime") + " | " + element.title;
          }); 

          this.events$ = result;
          this.evtLoading = false;

        }).catch(err => {
          console.error(err);
          this.evtLoading = false;
        });    
      
  }

  getAvailableDocs(){
    this.api.get("/appointment/docs").then((docs : any) => {

      docs.unshift({
        "userName" : "Egal"
      })
      this.availableDocs = docs;
    }).catch(err => {
      console.error(err);
    })
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  handleEvent(action: string, event: CalendarEvent): void {
   this.activeDayIsOpen = false;

   this.dateTimeForm.patchValue({
     appointmentObj : event, 
     appointmentDateStart : event.start
   })
  }

  removeSlotSelection(){
    this.dateTimeForm.reset();
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  initiateAppointment(){

    let appointmentRequest = this.baseInfoForm.value;

    this.googleAnalytics.sendEvent("initiateAppointment",{
      category: "video-dialog", 
      label : appointmentRequest.appointmentType || "unknown appointment type"
    });
    
    appointmentRequest["acceptTerms"] = this.finalForm.get("acceptTerms").value;
    appointmentRequest["appointmentObj"] = this.dateTimeForm.get("appointmentObj").value;

    appointmentRequest.doc = appointmentRequest["appointmentObj"]["doc"];

    let self = this;

    this.loaderSrv.setMsgLoading(true, "Bitte warten Sie - wir stellen den Termin ein.");

    this.api.post("/appointment/new", appointmentRequest).then(response => {

      self.flagSubmitted = true;

      self.finalForm.patchValue({
        acceptTerms : true,
        initiated : "success"
      });
      self.stepper.next();
      self.loaderSrv.setMsgLoading(false);

    }).catch(err => {
      self.finalForm.patchValue({
        acceptTerms : true,
        initiated : "error"
      });
      self.stepper.next();
    self.loaderSrv.setMsgLoading(false);
    })

  }

  closeModal(){
    this.dialogRef.close(this.finalForm.value);
  }

}
