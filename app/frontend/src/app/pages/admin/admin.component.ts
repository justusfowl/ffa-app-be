import { Component, OnInit, AfterViewInit, ViewEncapsulation, ElementRef, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Subject } from 'rxjs';
import {debounceTime, distinctUntilChanged} from "rxjs/internal/operators";
import { MatSnackBar, MatChipInputEvent, MatAutocomplete, MatDialog } from '@angular/material';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {COMMA, ENTER} from '@angular/cdk/keycodes';

import {ErrorStateMatcher} from '@angular/material/core';

import { ToolbarService, LinkService, ImageService, HtmlEditorService } from '@syncfusion/ej2-angular-richtexteditor';

import { CalendarEvent, CalendarView, DAYS_OF_WEEK, CalendarEventTimesChangedEvent } from 'angular-calendar';
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
import { TeleSlotComponent } from 'src/app/components/tele-slot/tele-slot.component';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}



@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss', '../../app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService]
})
export class AdminComponent implements OnInit, AfterViewInit {

  @ViewChild('scopeInput', {static: false}) fruitInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', {static: false}) matAutocomplete: MatAutocomplete;

  public test = "aasdasd"
  public show = false;

  public tools: object = {
				items: ['Bold', 'Italic', 'Underline', 'StrikeThrough',
            'FontColor', 'BackgroundColor','SuperScript', 'SubScript', '|',
            'Formats', 'Alignments', 'OrderedList', 'UnorderedList',
            'Outdent', 'Indent', '|',
            'CreateTable', 'CreateLink', 'Image', '|', 'ClearFormat', 'Print',
            'SourceCode', 'FullScreen', '|', 'Undo', 'Redo']
        };
    
 
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  _filteredScopes : Observable<string[]>;

  allScopes = [
    "admin", 
    "user", 
    "patient", 
    "doc"
  ];
  scopeCtrl = new FormControl();


  users = [];
  news = [];
  times : any[] = [];
  vacation : any[] = [];
  teamMembers : any[] = [];

  services = [
    {
      "name" : "Ultraschalluntersuchungen", 
      "icon" : "fas fa-clock"
    },
    {
      "name" : "Ultraschalluntersuchungen", 
      "icon" : "fas fa-clock"
    },
    {
      "name" : "Ultraschalluntersuchungen", 
      "icon" : "fas fa-clock"
    },
    {
      "name" : "Ultraschalluntersuchungen", 
      "icon" : "fas fa-clock"
    }
  ];

  teamValChanged = new Subject<any>();
  teamMemberLastChg : any;
  newTeamMember : any = {};
  newTeamMemberFile: File = null;
  newTeamMemberFileStr: any;

  timesDayEditIdx: number = null;

  newNewsImageFile: File = null;

  newSub : any = {};

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  matcher = new MyErrorStateMatcher();

  settingsObj : any;

  /* Telemedicine area */

  teleSlots : any[] = [];
  // exclude weekends
  excludeDays: number[] = [0, 6];

  weekStartsOn = DAYS_OF_WEEK.MONDAY;

  CalendarView = CalendarView.Week;

  viewDate: Date = new Date();

  constructor(
    private api : ApiService, 
    private snackBar : MatSnackBar,
    public dialog: MatDialog
  ) {
    this._filteredScopes = this.scopeCtrl.valueChanges.pipe(
      startWith(null),
      map((scope: string | null) => scope ? this._filterScopes(scope) : this.allScopes.slice()));
   }

  ngOnInit() {

    this.teamValChanged.pipe(
      debounceTime(1000), 
      distinctUntilChanged())
      .subscribe(model => {
        this.updateTeamMember(this.teamMemberLastChg);
      });

  }

  ngAfterViewInit(): void {
    this.getTeam();
    this.getTimes();
    this.getNews();
    this.getUsers();
    this.getGeneralSettings();
    this.getAdminSlots();
  }


  getGeneralSettings(){

    this.api.get("/general/settings").then((result : any) => {
      if (result && result.length > 0){
        this.settingsObj = result[0];

        if (!this.settingsObj.popup){
          this.settingsObj.popup = {};
        }

        if (!this.settingsObj.globalAnnouncement){
          this.settingsObj.globalAnnouncement = {};
        }

      }else{
        this.settingsObj = { }
      }

    }).catch(err => {
      console.error(err);
    })

  }



  getTimes(refresher?){

    this.api.get("/times").then((result : any) => {
      this.times = result.opening;
      this.vacation = result.vacation;

      if (refresher){
        refresher.target.complete();
      }
    }).catch(err => {
      console.error(err);
    })

  }

  getNews(refresher?){
    let params = {"unpublished" : true}
    this.api.get("/news", params).then((result : any) => {
      this.news = result;

      if (refresher){
        refresher.target.complete();
      }
    }).catch(err => {
      console.error(err);
    })

  }

  
  getTeam(refresher?){
    let params = {"includeInactive" : true}
    this.api.get("/team", params).then((data : any) => {

      this.teamMembers = [];

      data.docs.forEach(element => {
        this.teamMembers.push(element);
      });

      data.mfa.forEach(element => {
        this.teamMembers.push(element);
      });

      if (refresher){
        refresher.target.complete();
      }
    }).catch(err => {
      console.error(err);
    })
  }

  deleteMember(teamMember){

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {meta : {"type" : "confirm", "title" : "Team-Member löschen", "messageText" : "Sind Sie sicher, dass Sie den Eintrag löschen möchten?"}}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.answerConfirm){
       
        this.api.delete("/team/" + teamMember._id).then(res => {
          let idx = this.teamMembers.findIndex(x => x._id == teamMember._id);
          this.teamMembers.splice(idx, 1);
          this.snackBar.open("Gelöscht", "", {
            duration: 1500
          })
        }).catch(err =>{
          console.warn(err);
            this.snackBar.open("Etwas hat nicht geklappt", "", {
            duration: 1500
          })
        })

      }
      console.log('The dialog was closed');
    });


  }

  async handleTeamFileInput(files: FileList, teamMember){

    this.api.setLoading(true);

    const formData: FormData = new FormData();
    formData.append('file', files.item(0), files.item(0).name);

    Object.keys(teamMember).forEach(item => {
      if (item != "picture"){
        formData.append(item, teamMember[item]);
      }
      
    });

    const fileStr = await this.convertToBase64(files.item(0));

    this.api.put("/team/" + teamMember._id, formData, true).then(res => {
      console.log("updated.")
      this.snackBar.open("Mitglied aktualisiert", "", {
        duration: 1500
      })
      
      teamMember.picture = fileStr;

    })

  }

  async handleFileInput(files: FileList){
    this.newTeamMemberFile = files.item(0);
    const fileStr = await this.convertToBase64(files.item(0));
    this.newTeamMemberFileStr = fileStr;
  }

  async handleNewsFileUpload(newsObj, files: FileList){
    this.newNewsImageFile = files.item(0);
    const fileStr = await this.convertToBase64(files.item(0));
    newsObj.image = fileStr;
  }

  removeUploadImage(newsObj){
    this.newNewsImageFile = null;
    delete newsObj.image;
  }
  

  convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
  }   

  updateTeamMember(member){
    this.api.put("/team/" + member._id, member, true).then(res => {
      console.log("updated.")
      this.snackBar.open("Mitglied aktualisiert", "", {
        duration: 1500
      })
    })

  }

  handleUpdateTeamMember(teamMember, evt){
    this.teamMemberLastChg = teamMember;
    this.teamValChanged.next(evt);
  }

  addMember(){

    if (!this.newTeamMemberFile || !this.newTeamMember.name ||  !this.newTeamMember.type){
      this.snackBar.open("Bitte alle Felder ausfüllen", "", {
        duration: 1500
      });
      return;
    }

    const formData: FormData = new FormData();
    formData.append('file', this.newTeamMemberFile, this.newTeamMemberFile.name);

    Object.keys(this.newTeamMember).forEach(item => {
      formData.append(item, this.newTeamMember[item]);
    })

    this.api.post("/team", formData, true).then(res => {
      
       this.snackBar.open("Hinzugefügt", "", {
        duration: 1500
      })
      this.getTeam();
      this.initNewMember();
    }).catch(err=>{
      console.warn(err);
      this.snackBar.open("Etwas hat nicht geklappt", "", {
        duration: 1500
      })
    })
  }

  initNewMember(){
    this.newTeamMember = {};
    this.newTeamMemberFile = null;
    this.newTeamMemberFileStr = null;
  }

  editOpenHrs(day, idx){
    if (this.timesDayEditIdx == idx){
      this.timesDayEditIdx = null;
    }else{
      this.timesDayEditIdx = idx;
    }
  }

  removeHrs(day, flagVomi = false){
    if (flagVomi){
      delete day.vomiStart
      delete day.vomiEnd
    }else if (!flagVomi){
      delete day.namiStart
      delete day.namiEnd
    }
  }

  validateOpenHrs(d){
    let flagValid = true;
    let flagHasVomi = false;
    let flagHasNami = false;

    let vomiStart, vomiEnd, namiStart, namiEnd;

    if (typeof(d.vomiStart) != "undefined"){
      flagHasVomi = true;

        if (typeof(d.vomiEnd) == "undefined"){
          return false;
        }

          
      vomiStart = parseInt(d.vomiStart.substring(0,d.vomiStart.indexOf(":")))*60+parseInt(d.vomiStart.substring(d.vomiStart.indexOf(":")+1,d.vomiStart.length));
      vomiEnd = parseInt(d.vomiEnd.substring(0,d.vomiEnd.indexOf(":")))*60+parseInt(d.vomiEnd.substring(d.vomiEnd.indexOf(":")+1,d.vomiEnd.length));

      if (vomiStart >= vomiEnd){
        return false;
      }

    }

    if (typeof(d.namiStart) != "undefined"){
      flagHasNami = true;

        if (typeof(d.namiEnd) == "undefined"){
          return false;
        }

          
      namiStart = parseInt(d.namiStart.substring(0,d.namiStart.indexOf(":")))*60+parseInt(d.namiStart.substring(d.namiStart.indexOf(":")+1,d.namiStart.length));
      namiEnd = parseInt(d.namiEnd.substring(0,d.namiEnd.indexOf(":")))*60+parseInt(d.namiEnd.substring(d.namiEnd.indexOf(":")+1,d.namiEnd.length));

      if (namiStart >= namiEnd){
        return false;
      }
    }

    if (flagHasVomi){
      if (namiStart<vomiEnd){
        return false;
      }
    }

    return flagValid;


  }

  updateOpenHrs(d){

    if (!this.validateOpenHrs(d)){
      this.snackBar.open("Bitte Zeiten prüfen.", "", {
        duration: 2500
      })
      return ;
    }


    this.api.put("/times/open/", d, true).then(result => {
      this.snackBar.open("Aktualisiert", "", {
        duration: 1500
      });
      this.timesDayEditIdx = null;
    }).catch(err=>{
      console.warn(err);
      this.snackBar.open("Etwas hat nicht geklappt", "", {
        duration: 1500
      })
    })
  }

  deleteNews(newsObj, index){

    if (!newsObj._id){
      this.news.splice(index, 1);
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {meta : {"type" : "confirm", "title" : "News-Eintrag löschen", "messageText" : "Sind Sie sicher, dass Sie den Eintrag löschen möchten?"}}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.answerConfirm){
       
        this.api.delete("/news/"+ newsObj._id, true).then(result => {
          let idx = this.news.findIndex(x => x._id == newsObj._id);
          this.news.splice(idx, 1);
          this.snackBar.open("Gelöscht", "", {
            duration: 1500
          })
        }).catch(err => {
          console.warn(err);
          this.snackBar.open("Etwas hat nicht geklappt", "", {
            duration: 1500
          })
        })

      }
      console.log('The dialog was closed');
    });

   

   

  }

  saveNews(newsObj){

    let endPoint;
    let uploadImage = false;

    const formData: FormData = new FormData()

    if (this.newNewsImageFile){
      formData.append('file', this.newNewsImageFile, this.newNewsImageFile.name);
      uploadImage = true;
    }
    

    Object.keys(newsObj).forEach(item => {

      if (!uploadImage && item == "image"){
        formData.append(item, newsObj[item]);
      }else if (item != "image") {
        formData.append(item, newsObj[item]);
      }
      
    });

    if (newsObj._id){
      endPoint = "/news/" +  newsObj._id;

      this.api.put(endPoint, formData, true).then(res => {
        
         this.snackBar.open("Aktualisiert", "", {
          duration: 1500
        });

        this.newNewsImageFile = null;
      }).catch(err=>{
        console.warn(err);
        this.snackBar.open("Etwas hat nicht geklappt", "", {
          duration: 1500
        })
      })


    }else{
      endPoint = "/news"

      this.api.post(endPoint, formData, true).then((res : any) => {

        if (res._id){
          newsObj["_id"] = res._id;
        }
        
         this.snackBar.open("Hinzugefügt", "", {
          duration: 1500
        });

        this.newNewsImageFile = null;
      }).catch(err=>{
        console.warn(err);
        this.snackBar.open("Etwas hat nicht geklappt", "", {
          duration: 1500
        })
      })
    }


  }


  addNewNews(){
    this.news.push({
      "header" : "Neu", 
      "date" : new Date()
    })
  }

  saveVacation(vacationObj){
    this.api.put("/times/vacation", vacationObj, true).then(res => {
      this.snackBar.open("Aktualisiert", "", {
        duration: 1500
      });
    }).catch(err => {
      console.warn(err);
      this.snackBar.open("Etwas hat nicht geklappt", "", {
        duration: 1500
      })
    })
  }

  addNewVacation(){
    this.vacation.push({
      
    })
  }

  copyVacation(vacationObj){
    let cp = JSON.parse(JSON.stringify(vacationObj));
    cp.title = cp.title + " (Kopie) ";
    if (cp._id){
      delete cp._id;
    }
    this.vacation.push(cp);

     this.snackBar.open("Eintrag kopiert.", "", {
          duration: 1500
        })
  }

  deleteVacation(vacationObj){
    if (!vacationObj._id){
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {meta : {"type" : "confirm", "title" : "News-Eintrag löschen", "messageText" : "Sind Sie sicher, dass Sie den Eintrag löschen möchten?"}}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.answerConfirm){
       
        this.api.delete("/times/vacation/"+ vacationObj._id, true).then(result => {
          let idx = this.vacation.findIndex(x => x._id == vacationObj._id);
          this.vacation.splice(idx, 1);
          this.snackBar.open("Gelöscht", "", {
            duration: 1500
          })
        }).catch(err => {
          console.warn(err);
          this.snackBar.open("Etwas hat nicht geklappt", "", {
            duration: 1500
          })
        })

      }
      console.log('The dialog was closed');
    });

   
  }

  addSubstitute(vacationObj){
    if (typeof(vacationObj.subs) == "undefined"){
      vacationObj.subs = []
    }

    vacationObj.subs.push(this.newSub);
    this.newSub = {};

  }

  removeSub(vacationObj, sub){
    let idx = vacationObj.subs.indexOf(sub);
    vacationObj.subs.splice(idx, 1);
  }

  updateUser(userObj){
    this.api.put("/auth/users", userObj, true).then(res => {
      console.log("updated.")
      this.snackBar.open("Mitglied aktualisiert", "", {
        duration: 1500
      });
    })
  }

  initAddScope(event: MatChipInputEvent, user, callback?){
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {meta : {"type" : "confirm", "title" : "Scope ändern", "messageText" : `Sind Sie sicher, dass Sie ${user.userName} die Rolle [${event.value}] zufügen möchten?`}}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.answerConfirm){
       
       this.addScope(event, user, callback);

      }
      console.log('The dialog was closed');
    });
  }

  addScope(event: MatChipInputEvent, user, callback?): void {

    if (typeof(user.scopes) == "undefined"){
      user.scopes = [];
    }

    const input = event.input;
    const value = event.value;

    if (this.allScopes.indexOf(value) < 0 ){
      return;
    }

    if ((value || '').trim()) {
      if (user.scopes.indexOf((value || '').trim()) == -1){
        user.scopes.push(value.trim());
      }else{
        return;
      }
      
    }

    // Reset the input value
    if (input.value) {
      input.value = '';
    }

    this.scopeCtrl.setValue(null);

    this.updateUser(user);

    if (callback){
      callback();
    }
  }

  removeScope(user, scopeIdx): void {
    
    if (scopeIdx >= 0) {
      user.scopes.splice(scopeIdx,1);
      this.updateUser(user);
    }
    
  }

  handleScopeSelected(event, user, input){

    let scope = event.option.viewValue;
    let evt = {
      "input" : scope, 
      "value" : scope
    };

    let cb = function(){
      input.nativeElement.value = '';
    }

    this.initAddScope(evt, user, cb);   

  }

  private _filterScopes(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allScopes.filter(scope => scope.toLowerCase().indexOf(filterValue) === 0);
  }


  getUsers(refresher?){
    this.api.get("/auth/users", {params : {}}, true).then((result : any) => {
      this.users = result;
    }).catch(err => {
      console.error(err);
    })

  }

  preregisterUser(){

    let userName = this.emailFormControl.value;
    console.log(userName);

    this.api.post("/auth/adminRegisterUser", {userName}, true).then((result : any) => {
      this.users = result;

      this.getUsers();

      this.emailFormControl.reset();

      this.snackBar.open("Mitglied zugefügt. Bitte Postfach prüfen, um Kennwort zu setzen.", "", {
        duration: 1500
      });

    }).catch(err => {
      console.error(err);
    })

  }

  saveSettings(){
    let id = "/1";
    if ( this.settingsObj._id){
      id = "/" + this.settingsObj._id;
    }
    this.api.put("/general/settings" + id, this.settingsObj, true).then((result : any) => {
     
      this.snackBar.open("Einstellungen aktualisiert.", "", {
        duration: 1500
      });

      if (id == ""){
        this.getGeneralSettings();
      }

    }).catch(err => {
      console.error(err);
    })
  }

  getAdminSlots(){
        
    let viewPortTeleCal = this._getTeleViewStartEndDates();
    let daysArray = this._getDaysArray(viewPortTeleCal.start, viewPortTeleCal.end);


    this.api.get("/appointment/slots").then((result : any) => {

      result.forEach(element => {

        element = this._formatTeleSlotEvent(daysArray, element);
        
      });

      this.teleSlots = result;

    }).catch(err => {
      console.error(err);
    })
  }

  _getTeleViewStartEndDates(){
    const getStart: any = {
      month: startOfMonth,
      week: startOfWeek,
      day: startOfDay
    }[this.CalendarView];

    const getEnd: any = {
      month: endOfMonth,
      week: endOfWeek,
      day: endOfDay
    }[this.CalendarView];

    let start = format(getStart(this.viewDate), 'MM-dd-yyyy')
    let end = format(getEnd(this.viewDate), 'MM-dd-yyyy');
    return {start, end}
  }

  _formatTeleSlotEvent(daysArray, element){
    
    let dayIdx = daysArray.findIndex(x => x.getDay() == element.dayId);
    if (dayIdx >= 0){
      let elementStart = new Date(daysArray[dayIdx]);
      let elemHrs = parseInt(element.startTime.substring(0,element.startTime.indexOf(":")));
      let elemMin = parseInt(element.startTime.substring(element.startTime.indexOf(":")+1,element.startTime.length));
      elementStart.setHours(elemHrs, elemMin)

      element.start = elementStart;

      let elementEndDate = new Date(daysArray[dayIdx]);
      elemHrs = parseInt(element.endTime.substring(0,element.endTime.indexOf(":")));
      elemMin = parseInt(element.endTime.substring(element.endTime.indexOf(":")+1,element.endTime.length));
      elementEndDate.setHours(elemHrs, elemMin)

      element.end = elementEndDate;

      element.title = element.userName || element.name;
      
      element.actions = [
        {
          label: '<i class="fas fa-edit teleslot-action"></i>',
          onClick: ({ event }: { event: CalendarEvent }): void => {
            this.openTeleSlot(event)
          },
        },
        {
          label: '<i class="fas fa-trash-alt  teleslot-action" style="color: red;"></i>',
          onClick: ({ event }: { event: CalendarEvent }): void => {
            this.openTeleSlotRemoveDialog(event)
          },
        }
      ];
    }

    return element;

  }

  _getDaysArray(start, end, flagIncludeWeekends=false) {
      start = new Date(start); 
      end = new Date(end); 

      for(var arr=[],dt=start; dt<=end; dt.setDate(dt.getDate()+1)){

          let newDate = new Date(dt); 

          if((newDate.getDay() == 0 || newDate.getDay() == 6) && flagIncludeWeekends){
              arr.push(newDate);
          }else if (newDate.getDay() < 6 && newDate.getDay() > 0){
              arr.push(newDate);
          }
          
      }
      return arr;
  };

  eventTimesChangedTele({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {

    console.log(event);
    event.start = newStart;
    event.end = newEnd;
    this.updateTeleSlot(event);
    
  }

  openTeleSlot(teleslotObj?){

    const dialogRef = this.dialog.open(TeleSlotComponent, {
      data: {teleslotObj},
      panelClass : "teleslot-dialog"
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result){

        if (result._id){
          this.updateTeleSlot(result);
        }else{
          this.addTeleSlot(result);
        }  
        
      }
      console.log('The dialog was closed');
    });

  }

  updateTeleSlot(teleSlotObj){
    this.api.put("/appointment/slots", teleSlotObj).then(res => {
      
      this.getAdminSlots();

      this.snackBar.open("Slot aktualisiert.", "", {
        duration: 1500
      })

      
    }).catch(err => {
      console.warn(err);
      this.snackBar.open("Der Slot konnte nicht aktualisiert werden, bitte erneut versuchen.", "", {
        duration: 1500
      })
    })
  }

  addTeleSlot(teleSlotObj){
    this.api.post("/appointment/slots", teleSlotObj).then(res => {
      
      this.getAdminSlots();
      this.snackBar.open("Slot zugefügt.", "", {
        duration: 1500
      })

      
    }).catch(err => {
      console.warn(err);
      this.snackBar.open("Der Slot konnte nicht aktualisiert werden, bitte erneut versuchen.", "", {
        duration: 1500
      })
    })
  }

  removeTeleSlot(teleSlotObj){
    this.api.delete("/appointment/slots/"+teleSlotObj._id).then(res => {
      
      this.getAdminSlots();
      this.snackBar.open("Slot gelöscht.", "", {
        duration: 1500
      })

      
    }).catch(err => {
      console.warn(err);
      this.snackBar.open("Der Slot konnte nicht aktualisiert werden, bitte erneut versuchen.", "", {
        duration: 1500
      })
    })
  }

  openTeleSlotRemoveDialog(teleSlotObj){

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {meta : {"type" : "confirm", "title" : "Slot löschen", "messageText" : "Sind Sie sicher, dass Sie den Slot löschen möchten?"}}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.answerConfirm){
        this.removeTeleSlot(teleSlotObj);   
      }
      console.log('The dialog was closed');
    });

  }

}
