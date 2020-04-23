import { Component, OnInit, OnDestroy, AfterViewInit, ViewEncapsulation, ElementRef, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Subject, Subscription } from 'rxjs';
import {debounceTime, distinctUntilChanged} from "rxjs/internal/operators";
import { MatSnackBar, MatChipInputEvent, MatAutocomplete, MatDialog, PageEvent } from '@angular/material';
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
import { SettingsService } from 'src/app/services/settings.service';
import { AdduserComponent } from 'src/app/components/adduser/adduser.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss', '../../app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService]
})
export class AdminComponent implements OnInit, AfterViewInit, OnDestroy{

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
  allUsers = [];
  userEmailSearch : any = "";

  userPaginatorLowValue: number = 0;
  userPaginatorHighValue: number = 20;

  news = [];
  times : any[] = [];
  vacation : any[] = [];
  pubholidays : any[] = [];
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



  settingsObj : any;

  configObj : any;

  teleSlots : any[] = [];
  // exclude weekends
  excludeDays: number[] = [0, 6];

  weekStartsOn = DAYS_OF_WEEK.MONDAY;

  CalendarView = CalendarView.Week;

  viewDate: Date = new Date();

  private settingsSubscription : Subscription;
  settings : any;

  private configSubscription : Subscription;
  config : any;

  timezones = ["Africa/Abidjan","Africa/Accra","Africa/Addis_Ababa","Africa/Algiers","Africa/Asmara","Africa/Asmera","Africa/Bamako","Africa/Bangui","Africa/Banjul","Africa/Bissau","Africa/Blantyre","Africa/Brazzaville","Africa/Bujumbura","Africa/Cairo","Africa/Casablanca","Africa/Ceuta","Africa/Conakry","Africa/Dakar","Africa/Dar_es_Salaam","Africa/Djibouti","Africa/Douala","Africa/El_Aaiun","Africa/Freetown","Africa/Gaborone","Africa/Harare","Africa/Johannesburg","Africa/Juba","Africa/Kampala","Africa/Khartoum","Africa/Kigali","Africa/Kinshasa","Africa/Lagos","Africa/Libreville","Africa/Lome","Africa/Luanda","Africa/Lubumbashi","Africa/Lusaka","Africa/Malabo","Africa/Maputo","Africa/Maseru","Africa/Mbabane","Africa/Mogadishu","Africa/Monrovia","Africa/Nairobi","Africa/Ndjamena","Africa/Niamey","Africa/Nouakchott","Africa/Ouagadougou","Africa/Porto-Novo","Africa/Sao_Tome","Africa/Timbuktu","Africa/Tripoli","Africa/Tunis","Africa/Windhoek","America/Adak","America/Anchorage","America/Anguilla","America/Antigua","America/Araguaina","America/Argentina/Buenos_Aires","America/Argentina/Catamarca","America/Argentina/ComodRivadavia","America/Argentina/Cordoba","America/Argentina/Jujuy","America/Argentina/La_Rioja","America/Argentina/Mendoza","America/Argentina/Rio_Gallegos","America/Argentina/Salta","America/Argentina/San_Juan","America/Argentina/San_Luis","America/Argentina/Tucuman","America/Argentina/Ushuaia","America/Aruba","America/Asuncion","America/Atikokan","America/Atka","America/Bahia","America/Bahia_Banderas","America/Barbados","America/Belem","America/Belize","America/Blanc-Sablon","America/Boa_Vista","America/Bogota","America/Boise","America/Buenos_Aires","America/Cambridge_Bay","America/Campo_Grande","America/Cancun","America/Caracas","America/Catamarca","America/Cayenne","America/Cayman","America/Chicago","America/Chihuahua","America/Coral_Harbour","America/Cordoba","America/Costa_Rica","America/Creston","America/Cuiaba","America/Curacao","America/Danmarkshavn","America/Dawson","America/Dawson_Creek","America/Denver","America/Detroit","America/Dominica","America/Edmonton","America/Eirunepe","America/El_Salvador","America/Ensenada","America/Fort_Nelson","America/Fort_Wayne","America/Fortaleza","America/Glace_Bay","America/Godthab","America/Goose_Bay","America/Grand_Turk","America/Grenada","America/Guadeloupe","America/Guatemala","America/Guayaquil","America/Guyana","America/Halifax","America/Havana","America/Hermosillo","America/Indiana/Indianapolis","America/Indiana/Knox","America/Indiana/Marengo","America/Indiana/Petersburg","America/Indiana/Tell_City","America/Indiana/Vevay","America/Indiana/Vincennes","America/Indiana/Winamac","America/Indianapolis","America/Inuvik","America/Iqaluit","America/Jamaica","America/Jujuy","America/Juneau","America/Kentucky/Louisville","America/Kentucky/Monticello","America/Knox_IN","America/Kralendijk","America/La_Paz","America/Lima","America/Los_Angeles","America/Louisville","America/Lower_Princes","America/Maceio","America/Managua","America/Manaus","America/Marigot","America/Martinique","America/Matamoros","America/Mazatlan","America/Mendoza","America/Menominee","America/Merida","America/Metlakatla","America/Mexico_City","America/Miquelon","America/Moncton","America/Monterrey","America/Montevideo","America/Montreal","America/Montserrat","America/Nassau","America/New_York","America/Nipigon","America/Nome","America/Noronha","America/North_Dakota/Beulah","America/North_Dakota/Center","America/North_Dakota/New_Salem","America/Ojinaga","America/Panama","America/Pangnirtung","America/Paramaribo","America/Phoenix","America/Port-au-Prince","America/Port_of_Spain","America/Porto_Acre","America/Porto_Velho","America/Puerto_Rico","America/Punta_Arenas","America/Rainy_River","America/Rankin_Inlet","America/Recife","America/Regina","America/Resolute","America/Rio_Branco","America/Rosario","America/Santa_Isabel","America/Santarem","America/Santiago","America/Santo_Domingo","America/Sao_Paulo","America/Scoresbysund","America/Shiprock","America/Sitka","America/St_Barthelemy","America/St_Johns","America/St_Kitts","America/St_Lucia","America/St_Thomas","America/St_Vincent","America/Swift_Current","America/Tegucigalpa","America/Thule","America/Thunder_Bay","America/Tijuana","America/Toronto","America/Tortola","America/Vancouver","America/Virgin","America/Whitehorse","America/Winnipeg","America/Yakutat","America/Yellowknife","Antarctica/Casey","Antarctica/Davis","Antarctica/DumontDUrville","Antarctica/Macquarie","Antarctica/Mawson","Antarctica/McMurdo","Antarctica/Palmer","Antarctica/Rothera","Antarctica/South_Pole","Antarctica/Syowa","Antarctica/Troll","Antarctica/Vostok","Arctic/Longyearbyen","Asia/Aden","Asia/Almaty","Asia/Amman","Asia/Anadyr","Asia/Aqtau","Asia/Aqtobe","Asia/Ashgabat","Asia/Ashkhabad","Asia/Atyrau","Asia/Baghdad","Asia/Bahrain","Asia/Baku","Asia/Bangkok","Asia/Barnaul","Asia/Beirut","Asia/Bishkek","Asia/Brunei","Asia/Calcutta","Asia/Chita","Asia/Choibalsan","Asia/Chongqing","Asia/Chungking","Asia/Colombo","Asia/Dacca","Asia/Damascus","Asia/Dhaka","Asia/Dili","Asia/Dubai","Asia/Dushanbe","Asia/Famagusta","Asia/Gaza","Asia/Harbin","Asia/Hebron","Asia/Ho_Chi_Minh","Asia/Hong_Kong","Asia/Hovd","Asia/Irkutsk","Asia/Istanbul","Asia/Jakarta","Asia/Jayapura","Asia/Jerusalem","Asia/Kabul","Asia/Kamchatka","Asia/Karachi","Asia/Kashgar","Asia/Kathmandu","Asia/Katmandu","Asia/Khandyga","Asia/Kolkata","Asia/Krasnoyarsk","Asia/Kuala_Lumpur","Asia/Kuching","Asia/Kuwait","Asia/Macao","Asia/Macau","Asia/Magadan","Asia/Makassar","Asia/Manila","Asia/Muscat","Asia/Nicosia","Asia/Novokuznetsk","Asia/Novosibirsk","Asia/Omsk","Asia/Oral","Asia/Phnom_Penh","Asia/Pontianak","Asia/Pyongyang","Asia/Qatar","Asia/Qostanay","Asia/Qyzylorda","Asia/Rangoon","Asia/Riyadh","Asia/Saigon","Asia/Sakhalin","Asia/Samarkand","Asia/Seoul","Asia/Shanghai","Asia/Singapore","Asia/Srednekolymsk","Asia/Taipei","Asia/Tashkent","Asia/Tbilisi","Asia/Tehran","Asia/Tel_Aviv","Asia/Thimbu","Asia/Thimphu","Asia/Tokyo","Asia/Tomsk","Asia/Ujung_Pandang","Asia/Ulaanbaatar","Asia/Ulan_Bator","Asia/Urumqi","Asia/Ust-Nera","Asia/Vientiane","Asia/Vladivostok","Asia/Yakutsk","Asia/Yangon","Asia/Yekaterinburg","Asia/Yerevan","Atlantic/Azores","Atlantic/Bermuda","Atlantic/Canary","Atlantic/Cape_Verde","Atlantic/Faeroe","Atlantic/Faroe","Atlantic/Jan_Mayen","Atlantic/Madeira","Atlantic/Reykjavik","Atlantic/South_Georgia","Atlantic/St_Helena","Atlantic/Stanley","Australia/ACT","Australia/Adelaide","Australia/Brisbane","Australia/Broken_Hill","Australia/Canberra","Australia/Currie","Australia/Darwin","Australia/Eucla","Australia/Hobart","Australia/LHI","Australia/Lindeman","Australia/Lord_Howe","Australia/Melbourne","Australia/NSW","Australia/North","Australia/Perth","Australia/Queensland","Australia/South","Australia/Sydney","Australia/Tasmania","Australia/Victoria","Australia/West","Australia/Yancowinna","Brazil/Acre","Brazil/DeNoronha","Brazil/East","Brazil/West","CET","CST6CDT","Canada/Atlantic","Canada/Central","Canada/Eastern","Canada/Mountain","Canada/Newfoundland","Canada/Pacific","Canada/Saskatchewan","Canada/Yukon","Chile/Continental","Chile/EasterIsland","Cuba","EET","EST","EST5EDT","Egypt","Eire","Etc/GMT","Etc/GMT+0","Etc/GMT+1","Etc/GMT+10","Etc/GMT+11","Etc/GMT+12","Etc/GMT+2","Etc/GMT+3","Etc/GMT+4","Etc/GMT+5","Etc/GMT+6","Etc/GMT+7","Etc/GMT+8","Etc/GMT+9","Etc/GMT-0","Etc/GMT-1","Etc/GMT-10","Etc/GMT-11","Etc/GMT-12","Etc/GMT-13","Etc/GMT-14","Etc/GMT-2","Etc/GMT-3","Etc/GMT-4","Etc/GMT-5","Etc/GMT-6","Etc/GMT-7","Etc/GMT-8","Etc/GMT-9","Etc/GMT0","Etc/Greenwich","Etc/UCT","Etc/UTC","Etc/Universal","Etc/Zulu","Europe/Amsterdam","Europe/Andorra","Europe/Astrakhan","Europe/Athens","Europe/Belfast","Europe/Belgrade","Europe/Berlin","Europe/Bratislava","Europe/Brussels","Europe/Bucharest","Europe/Budapest","Europe/Busingen","Europe/Chisinau","Europe/Copenhagen","Europe/Dublin","Europe/Gibraltar","Europe/Guernsey","Europe/Helsinki","Europe/Isle_of_Man","Europe/Istanbul","Europe/Jersey","Europe/Kaliningrad","Europe/Kiev","Europe/Kirov","Europe/Lisbon","Europe/Ljubljana","Europe/London","Europe/Luxembourg","Europe/Madrid","Europe/Malta","Europe/Mariehamn","Europe/Minsk","Europe/Monaco","Europe/Moscow","Europe/Nicosia","Europe/Oslo","Europe/Paris","Europe/Podgorica","Europe/Prague","Europe/Riga","Europe/Rome","Europe/Samara","Europe/San_Marino","Europe/Sarajevo","Europe/Saratov","Europe/Simferopol","Europe/Skopje","Europe/Sofia","Europe/Stockholm","Europe/Tallinn","Europe/Tirane","Europe/Tiraspol","Europe/Ulyanovsk","Europe/Uzhgorod","Europe/Vaduz","Europe/Vatican","Europe/Vienna","Europe/Vilnius","Europe/Volgograd","Europe/Warsaw","Europe/Zagreb","Europe/Zaporozhye","Europe/Zurich","GB","GB-Eire","GMT","GMT+0","GMT-0","GMT0","Greenwich","HST","Hongkong","Iceland","Indian/Antananarivo","Indian/Chagos","Indian/Christmas","Indian/Cocos","Indian/Comoro","Indian/Kerguelen","Indian/Mahe","Indian/Maldives","Indian/Mauritius","Indian/Mayotte","Indian/Reunion","Iran","Israel","Jamaica","Japan","Kwajalein","Libya","MET","MST","MST7MDT","Mexico/BajaNorte","Mexico/BajaSur","Mexico/General","NZ","NZ-CHAT","Navajo","PRC","PST8PDT","Pacific/Apia","Pacific/Auckland","Pacific/Bougainville","Pacific/Chatham","Pacific/Chuuk","Pacific/Easter","Pacific/Efate","Pacific/Enderbury","Pacific/Fakaofo","Pacific/Fiji","Pacific/Funafuti","Pacific/Galapagos","Pacific/Gambier","Pacific/Guadalcanal","Pacific/Guam","Pacific/Honolulu","Pacific/Johnston","Pacific/Kiritimati","Pacific/Kosrae","Pacific/Kwajalein","Pacific/Majuro","Pacific/Marquesas","Pacific/Midway","Pacific/Nauru","Pacific/Niue","Pacific/Norfolk","Pacific/Noumea","Pacific/Pago_Pago","Pacific/Palau","Pacific/Pitcairn","Pacific/Pohnpei","Pacific/Ponape","Pacific/Port_Moresby","Pacific/Rarotonga","Pacific/Saipan","Pacific/Samoa","Pacific/Tahiti","Pacific/Tarawa","Pacific/Tongatapu","Pacific/Truk",
  "Pacific/Wake","Pacific/Wallis","Pacific/Yap","Poland","Portugal","ROC","ROK","Singapore","Turkey","UCT","US/Alaska","US/Aleutian","US/Arizona","US/Central","US/East-Indiana","US/Eastern","US/Hawaii","US/Indiana-Starke","US/Michigan","US/Mountain","US/Pacific","US/Pacific-New","US/Samoa","UTC","Universal","W-SU","WET","Zulu"]

  states = [
    {
      "name" : "Hessen",
      "abbreviation" : "HE"
    },
    {
      "name" : "Berlin",
      "abbreviation" : "BE"
    },
    {
      "name" : "Baden-Würtemmberg",
      "abbreviation" : "BW"
    },
    {
      "name" : "Bayern",
      "abbreviation" : "BY"
    },
    {
      "name" : "Brandenburg",
      "abbreviation" : "BB"
    },
    {
      "name" : "Bremen",
      "abbreviation" : "HB"
    },
    {
      "name" : "Hamburg",
      "abbreviation" : "HH"
    },
    {
      "name" : "Mecklenburg-Vorpommern",
      "abbreviation" : "MV"
    },
    {
      "name" : "Niedersachsen",
      "abbreviation" : "NI"
    },
    {
      "name" : "Nordrhein-Westphalen",
      "abbreviation" : "NW"
    },
    {
      "name" : "Rheinland-Pfalz",
      "abbreviation" : "RP"
    },
    {
      "name" : "Saarland",
      "abbreviation" : "SL"
    },
    {
      "name" : "Sachsen",
      "abbreviation" : "SN"
    },
    {
      "name" : "Sachsen-Anhalt",
      "abbreviation" : "ST"
    },
    {
      "name" : "Schleswig-Holstein",
      "abbreviation" : "SH"
    },
    {
      "name" : "Thüringen",
      "abbreviation" : "TH"
    }
  ];


  constructor(
    private api : ApiService, 
    private snackBar : MatSnackBar,
    public dialog: MatDialog,
    private settingsSrv : SettingsService
  ) {
    this._filteredScopes = this.scopeCtrl.valueChanges.pipe(
      startWith(null),
      map((scope: string | null) => scope ? this._filterScopes(scope) : this.allScopes.slice()));

      this.settings = this.settingsSrv.getSettings();

      this.settingsSubscription = this.settingsSrv.settingsObjObservable.subscribe(result => {
        this.settings = result; 
        this.executeSettings();        
      });

      this.config = this.settingsSrv.getConfig();

      this.configSubscription = this.settingsSrv.configObjObservable.subscribe(result => {
        this.config = result; 
        this.executeConfig();       
      });

   }

  ngOnInit() {

    this.teamValChanged.pipe(
      debounceTime(1000), 
      distinctUntilChanged())
      .subscribe(model => {
        this.updateTeamMember(this.teamMemberLastChg);
      });

      this.executeConfig();
      this.executeSettings();

  }

  ngAfterViewInit(): void {
    this.getTeam();
  }

  ngOnDestroy() {
    this.settingsSubscription.unsubscribe();
    this.configSubscription.unsubscribe();
  }

  handleTabClick(evt){

      let labelClicked = evt.tab.textLabel;

      if (labelClicked == 'Team'){
        this.getTeam();
      }else if (labelClicked == 'Sprechzeiten'){
        this.getTimes();
      }else if (labelClicked == 'Urlaubszeiten'){
        this.getTimes();
      }else if (labelClicked == 'Praxisnews'){
        this.getNews();
      }else if (labelClicked == 'Benutzer'){
        this.getUsers();
      }else if (labelClicked == 'Telemedizin'){
        this.getAdminSlots();
      }else if (labelClicked == 'Allgemein'){
        this.getGeneralSettings();
      }else if (labelClicked == 'Konfiguration'){
        this.getConfigObject();
      }
  }

  executeConfig(){

    if (!this.config){
      return;
    }
    
    if (this.config.tele){
      if (typeof(this.config.tele.flagIncludeWeekends) != 'undefined'){
        if (this.config.tele.flagIncludeWeekends){
          this.excludeDays = [];
        }else{
          this.excludeDays = [0, 6];
        }
      }
    }
  }

  executeSettings(){

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

  getConfigObject(){
    this.api.get("/general/config").then((result : any) => {

      if (result){
        this.configObj = result;
      }else{
        this.configObj = { }
      }

    }).catch(err => {
      console.error(err);
    })
  }

  getTimes(refresher?){

    this.api.get("/times").then((result : any) => {
      this.times = result.opening;
      this.vacation = result.vacation.filter(x => !x.flagHoliday);
      this.pubholidays = result.vacation.filter(x => x.flagHoliday);
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

    if (!files){
      return;
    }

    if (teamMember._id){
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
  
        this.snackBar.open("Mitglied aktualisiert", "", {
          duration: 1500
        })
        
        teamMember.picture = fileStr;
  
      })
    }else{
      this.newTeamMemberFile = files.item(0);
      const fileStr = await this.convertToBase64(files.item(0));
      this.newTeamMemberFileStr = fileStr;
    }

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

    if (!member._id){
      return;
    }

    this.api.put("/team/" + member._id, member, true).then(res => {

      this.snackBar.open("Mitglied aktualisiert", "", {
        duration: 1500
      })
    })

  }

  addNewTeamMember(){

    let newUserObj = {
      "name" : "%Neuer Name%"
    };

    this.teamMembers.push(newUserObj);
  }

  handleUpdateTeamMember(teamMember, evt){
    this.teamMemberLastChg = teamMember;
    this.teamValChanged.next(evt);
  }

  addMember(member){

    if (!this.newTeamMemberFile || !member.name ||  !member.type){
      this.snackBar.open("Bitte alle Felder ausfüllen", "", {
        duration: 1500
      });
      return;
    }

    const formData: FormData = new FormData();
    formData.append('file', this.newTeamMemberFile, this.newTeamMemberFile.name);

    Object.keys(member).forEach(item => {
      formData.append(item, member[item]);
    });

    this.api.post("/team", formData, true).then(res => {
      
      this.snackBar.open("Hinzugefügt", "", {
        duration: 1500
      });

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

  syncPublicHolidays(){
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {meta : {"type" : "confirm", "title" : "Feiertage abgleichen", "messageText" : "Möchten Sie Feiertage für Ihr Bundesland abgleichen? Die bisherigen Feiertage werden überschrieben."}}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.answerConfirm){
       
        this.api.post("/times/holidays", {}).then(result => {

          this.snackBar.open("Erfolgreich abgeglichen", "OK", {
            duration: 2500
          });

          this.getTimes();

        }).catch(err => {
          console.warn(err);
          this.snackBar.open("Etwas hat nicht geklappt - bitte prüfen Sie, dass für Ihre Praxis ein Bundesland in den Stammdaten hinterlegt wurde.", "", {
            duration: 2500
          })
        })
      }
     
    });
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
      data: {meta : {"type" : "confirm", "title" : "Eintrag löschen", "messageText" : "Sind Sie sicher, dass Sie den Eintrag löschen möchten?"}}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.answerConfirm){
       
        this.api.delete("/times/vacation/"+ vacationObj._id, true).then(result => {

          let idx = this.vacation.findIndex(x => x._id == vacationObj._id);
          if (idx > -1){
            this.vacation.splice(idx, 1);
          }

          idx = this.pubholidays.findIndex(x => x._id == vacationObj._id);
          if (idx > -1){
            this.pubholidays.splice(idx, 1);
          }

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

      this.snackBar.open("Mitglied aktualisiert", "", {
        duration: 1500
      });
    })
  }

  removeUser(user){
    let self = this;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {meta : {"type" : "confirm", "title" : "Nutzer löschen", "messageText" : `WARNUNG: Sind Sie sicher, dass Sie ${user.userName} löschen möchten? Diese Aktion ist nicht umkehrbar.`}}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.answerConfirm){
       
      this.api.delete("/auth/users/"+user._id).then(result => {

        let idx = this.users.findIndex(x => x._id == user._id);
        this.users.splice(idx, 1);

        this.snackBar.open("Der Nutzer wurde gelöscht.", "", {
          duration: 2500
        });

      }).catch(err => {
        this.snackBar.open("Das hat leider nicht geklappt.", "", {
          duration: 1500
        });
        console.error(err);
      })

      }
      console.log('The dialog was closed');
    });
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


  getUsers(){
    this.api.get("/auth/users", {params : {}}, true).then((result : any) => {
      this.users = result;
      this.allUsers = JSON.parse(JSON.stringify(result));
    }).catch(err => {
      console.error(err);
    })

  }

  handleUserSearch(evt){
    this.users = this.allUsers.filter(x => {
      return x.userName.indexOf(this.userEmailSearch) > -1
    });
  }

  getUserPaginatorData(event : PageEvent){
    this.userPaginatorLowValue = event.pageIndex * event.pageSize;
    this.userPaginatorHighValue = this.userPaginatorLowValue + event.pageSize;
    return event;
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

      this.settingsSrv.setSettingsObj(this.settingsObj);

    }).catch(err => {
      console.error(err);
    })
  }

  getAdminSlots(){
        
    let viewPortTeleCal = this._getTeleViewStartEndDates();
    let flagIncludeWeekends = this.config.tele.flagIncludeWeekends || false;
    let daysArray = this._getDaysArray(viewPortTeleCal.start, viewPortTeleCal.end, flagIncludeWeekends);


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
    
      start = new Date(start.replace(/-/g, "/")); 
      end = new Date(end.replace(/-/g, "/")); 

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

  saveConfig(){
   
    if (!this.configObj._id){
      return;
    }

    this.api.put("/general/config/" + this.configObj._id, this.configObj, true).then((result : any) => {
     
      this.snackBar.open("Konfiguration aktualisiert.", "", {
        duration: 1500
      });

      this.settingsSrv.setConfigObj(this.configObj);

    }).catch(err => {
      console.error(err);
    })
  }

  addUser(){
    const dialogRef = this.dialog.open(AdduserComponent, {
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result){

        this.snackBar.open("Mitglied zugefügt. Bitte Postfach prüfen, um Kennwort zu setzen. Bevor der Benutzer das Konto nicht verifiziert hat, kann es nicht genutzt werden.", "", {
          duration: 5000
        });

        this.getUsers();

      }
    });
  }

  getImageUrl(imgUrl){
    if (imgUrl){
      return imgUrl;
    }else{
      return "https://www.facharztpraxis-fuer-allgemeinmedizin.de/assets/images/header-background.jpg";
    }
  }

}
