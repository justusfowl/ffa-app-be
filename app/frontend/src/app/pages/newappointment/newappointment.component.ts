import { Component, OnInit, ChangeDetectionStrategy, ViewChild,   TemplateRef, ViewEncapsulation } from '@angular/core';

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
import { MatStepper, MatDialogRef } from '@angular/material';
import { LoaderService } from 'src/app/services/loader.service';
import { ApiService } from 'src/app/services/api.service';
import { DatePipe } from '@angular/common';
import { AuthenticationService } from 'src/app/services/authentication.service';

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
  styleUrls: ['./newappointment.component.scss', '../../app.component.scss'],
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

  actions: CalendarEventAction[] = [
    /*
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
    */
  ];

  evtLoading : boolean = false;

  refresh: Subject<any> = new Subject();

  events$: Observable<Array<CalendarEvent<{ any:any }>>>;

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
    private loaderSrv : LoaderService, 
    private api : ApiService, 
    private datePipe : DatePipe, 
    private auth: AuthenticationService
    ) {
  }

  ngOnInit() {

    // check: is logged-on? retrieve user data

    let patientName = this.auth.currentUserValue.name || this.auth.currentUserValue.userName;
    
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
      console.log(docs);
    }).catch(err => {
      console.error(err);
    })
  }

  loadSlots(){

    return new Promise((resolve, reject) => {
      setTimeout(function(){
        resolve([{
          start: subDays(startOfDay(new Date()), 1),
          title: '08:00 | Dr. Kaulfuss',
          color: colors.yellow,
          meta : {
            "doc" : "harald"
          }
        },
        {
          start: startOfDay(new Date()),
          title: '08:40 | Dr. Kaulfuss',
          color: colors.yellow
        },
        {
          start: subDays(endOfMonth(new Date()), 3),
          title: '08:45 | Dr. Kaulfuss',
          color: colors.yellow
        },
        {
          start: addHours(startOfDay(new Date()), 2),
          end: addHours(new Date(), 2),
          title: '12:15 | Dr. Gärtner',
          color: colors.blue
        }]);
      }, 2500)
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
    appointmentRequest["acceptTerms"] = this.finalForm.get("acceptTerms").value;
    appointmentRequest["appointmentObj"] = this.dateTimeForm.get("appointmentObj").value

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
