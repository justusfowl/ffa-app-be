import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
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
import { Subject } from 'rxjs';

import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';
import { ApiService } from 'src/app/services/api.service';
import { HttpParams } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material';
import { AppointmentDetailsComponent } from 'src/app/components/appointment-details/appointment-details.component';


@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./appointments.component.scss', '../../app.component.scss']
})
export class AppointmentsComponent implements OnInit {

  locale : any; 
  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fas-phone"></i>',
      a11yLabel: 'Wählen',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Call', event);
      },
    }
  ];

  refresh: Subject<any> = new Subject();

  events$: CalendarEvent[] = [];

  activeDayIsOpen: boolean = true;

  availableDocs : any[] = [];
  appointmentDocSelected : any ; 

  constructor(
    private api : ApiService,
    private datePipe : DatePipe,
    public dialog: MatDialog
  ) {
    this.locale = "de";
   }

  ngOnInit() {
    this.fetchEvents();
    this.getAvailableDocs();
  }

  getAvailableDocs(){ 
    this.api.get("/appointment/docs").then((docs : any) => {

      docs.unshift({
        "userName" : "Alle"
      });

      this.availableDocs = docs;
    }).catch(err => {
      console.error(err);
    })
  }

  docChanged(){
    this.fetchEvents();
  }

  fetchEvents(): void {
    this.activeDayIsOpen = false;

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

    let params;

    params = new HttpParams()
          .set(
            'startDate',
            format(getStart(this.viewDate), 'MM-dd-yyyy')
          )
          .set(
            'endDate',
            format(getEnd(this.viewDate), 'MM-dd-yyyy')
          )
    
      if (this.appointmentDocSelected){
        if (this.appointmentDocSelected._id){
          params = new HttpParams()
          .set(
            'startDate',
            format(getStart(this.viewDate), 'MM-dd-yyyy')
          )
          .set(
            'endDate',
            format(getEnd(this.viewDate), 'MM-dd-yyyy')
          )
          .set(
            'docId',
            this.appointmentDocSelected._id
          )
        }
      }

      this.api.get("/appointment", params).then((result : any) => {

        result.forEach(element => {
          element.start = new Date(element.appointmentObj.start);
          element.end = new Date(element.appointmentObj.end);
          element.actions = this.actions;
          element.title = this.datePipe.transform( element.start, "shortTime") + " | " + "Typ: " + element.appointmentType.name + " | Arzt: " + element.doc.userName + " mit " + element.patientName;
        }); 

        this.events$ = result;

      }).catch(err => {
        console.error(err);
      });    
      
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
    this.modalData = { event, action };

    if (action == 'Clicked'){
      
      const dialogRef = this.dialog.open(AppointmentDetailsComponent, {
        data: {appointmentObj : event},
        panelClass : "dialog-popup"
      });

      dialogRef.afterClosed().subscribe((resultData : any) => {
        if (resultData){
          if (resultData.changed){
              this.fetchEvents();
          }
        }
      });

    }
    
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
    this.fetchEvents();
  }


}
