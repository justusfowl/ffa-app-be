import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  OnInit
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


@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
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

  constructor(
    private api : ApiService,
    private datePipe : DatePipe,
    public dialog: MatDialog
  ) {
    this.locale = "de";
   }

  ngOnInit() {
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

    const params = new HttpParams()
      .set(
        'startDate',
        format(getStart(this.viewDate), 'MM-dd-yyyy')
      )
      .set(
        'endDate',
        format(getEnd(this.viewDate), 'MM-dd-yyyy')
      )

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
      
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {meta : {"type" : "confirm", "title" : "Einwählen", "messageText" : "Video-Termin öffnen?"}}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.answerConfirm){
        this.openTeleAppointment(event); 
      }
      console.log('The dialog was closed');
    });
    }
    
  }


  openTeleAppointment(appointmentObj){

    if (!appointmentObj){
      return;
    }

    var win = window.open(appointmentObj.tele.dialInUrlDoc, '_blank');
    win.focus();
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
    this.fetchEvents();
  }


}