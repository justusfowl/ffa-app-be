import { Component, OnInit, ViewEncapsulation} from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Subject } from 'rxjs';
import {debounceTime, distinctUntilChanged} from "rxjs/internal/operators";
import { MatSnackBar } from '@angular/material';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdminComponent implements OnInit {

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


  constructor(
    private api : ApiService, 
    private snackBar : MatSnackBar
  ) { }

  ngOnInit() {

    this.getTeam();
    this.getTimes();
    this.getNews();

    this.teamValChanged.pipe(
      debounceTime(1000), 
      distinctUntilChanged())
      .subscribe(model => {
        this.updateTeamMember(this.teamMemberLastChg);
      });

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
    this.api.get("/news", {params : params}).then((result : any) => {
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
    this.api.get("/team", {params : params}).then((data : any) => {

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
  

  convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
  }   

  updateTeamMember(member){
    this.api.put("/team/" + member._id, member).then(res => {
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

    const formData: FormData = new FormData()
    formData.append('file', this.newTeamMemberFile, this.newTeamMemberFile.name);

    Object.keys(this.newTeamMember).forEach(item => {
      formData.append(item, this.newTeamMember[item]);
    })

    this.api.post("/team", formData).then(res => {
      console.log(res);
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


    this.api.put("/times/open/", d).then(result => {
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

      this.api.put(endPoint, formData).then(res => {
        console.log(res);
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

      this.api.post(endPoint, formData).then(res => {
        console.log(res);
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
    this.api.put("/times/vacation", vacationObj).then(res => {
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
    cp.title = cp.title + " (Kopie) "
    this.vacation.push(cp);

     this.snackBar.open("Eintrag kopiert.", "", {
          duration: 1500
        })
  }

  deleteVacation(vacationObj){
    if (!vacationObj._id){
      return;
    }

    this.api.delete("/times/vacation/"+ vacationObj._id).then(result => {
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

}
