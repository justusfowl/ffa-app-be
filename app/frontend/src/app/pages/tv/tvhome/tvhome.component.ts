import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { LivedataService } from 'src/app/services/livedata.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { EditclockComponent } from 'src/app/components/tv/editclock/editclock.component';

import VideoSnapshot from 'video-snapshot';

import * as LZString from 'lz-string';
import { EditquoteComponent } from 'src/app/components/tv/editquote/editquote.component';
import { EditweatherComponent } from 'src/app/components/tv/editweather/editweather.component';
import { EditmediaComponent } from 'src/app/components/tv/editmedia/editmedia.component';
import { EditbulletslideComponent } from 'src/app/components/tv/editbulletslide/editbulletslide.component';

@Component({
  selector: 'app-tvhome',
  templateUrl: './tvhome.component.html',
  styleUrls: ['./tvhome.component.scss', '../../../app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TVHomeComponent implements OnInit {

  playlists : any[] = [];

  itemTypes : any[] = [
    {
      "type" : "image", 
      "title" : "Bild",
      "icon": "image"
    },
    {
      "type" : "video", 
      "title" : "Video",
      "icon": "video_library"
    },
    {
      "type" : "feed", 
      "title" : "RSS Feed",
      "icon": "rss_feed", 
      "avatar" : "/assets/images/news.jpg"
    },
    {
      "type" : "quote", 
      "title" : "Zitat",
      "icon": "format_quote", 
      "avatar" : "/assets/images/open_book.jpg"
    },
    {
      "type" : "clock", 
      "title" : "Weltuhr",
      "icon": "watch_later", 
      "avatar" : "/assets/images/clock.jpg"
    },
    {
      "type" : "weather", 
      "title" : "Wetter",
      "icon": "wb_sunny", 
      "avatar" : "/assets/images/weather.jpg"
    },
    {
      "type" : "bulletslide", 
      "title" : "Liste",
      "icon": "view_module"
    },
    {
      "type" : "designer", 
      "title" : "Designer",
      "icon": "view_compact"
    }
  ];

  durationOptions : any[] = [
    "5", "10", "15", "20", "30", "60"
  ];

  devices : any[] = [];
  
  newUploadFile : File;
  allowedUploadTypes : any = {"image" : ["jpeg", "jpg", "png" ], "video" : ["mp4", "ogg"]};

  tmpvideosrc : any; 

  newDeviceForm : FormGroup = new FormGroup({
    title : new FormControl("", Validators.required), 
    pin : new FormControl("", Validators.required), 
  })

  constructor(
    private livedata : LivedataService, 
    private _snackBar : MatSnackBar, 
    private api : ApiService,
    private dialog : MatDialog
  ) {

    this.livedata.socket.fromEvent('device:add-success').subscribe(data => {

        this._snackBar.open("Wurde zugefügt.", "", { duration: 1500 });

        this.newDeviceForm.reset();

        this.getDevices();

    });

    this.livedata.socket.fromEvent('device:do-reload').subscribe(data => {

      this._snackBar.open("Anzeige wurde aktualisiert.", "", { duration: 1500 });

      this.getDevices();

    });

    this.livedata.socket.fromEvent('device:update-error').subscribe(data => {
        this._snackBar.open("Leider konnten wir das Gerät nicht aktualisieren - bitte probieren Sie es erneut oder melden Sich erneut bei dieser Website an.", "", { duration: 1500 });
    });

    
    this.livedata.socket.fromEvent('device:update-success').subscribe((data:any) => {
      this._snackBar.open("Gerät aktualisiert.", "", { duration: 1500 });
    }); 

    this.livedata.socket.fromEvent('device:add-error').subscribe(data => {
        this._snackBar.open("Leider konnten wir das Gerät nicht zufügen - wir haben den Code nicht zuordnen können.", "", { duration: 1500 });
    });    

    this.livedata.socket.fromEvent('device:remove-error').subscribe(data => {
        this._snackBar.open("Leider konnten wir das Gerät nicht entfernen.", "", { duration: 1500 });
    });    

    this.livedata.socket.fromEvent('device:remove-success').subscribe((data:any) => {

        let _id = data._id;
        let idx = this.devices.findIndex(x => x._id == _id);

        if (idx > -1){
          this.devices.splice(idx, 1);
        }

        this._snackBar.open("Gerät gelöscht.", "", { duration: 1500 });
    });


   }

  ngOnInit() {
    this.getPlaylists();
    this.getDevices();
  }

  getPlaylists(){
    this.api.get("/devices/playlist").then((playlists : any[]) => {
      this.playlists = playlists;
    }).catch(err => {
      console.error(err);
      this._snackBar.open("Etwas ist schief gelaufen beim Abrufen der Playlists.", "", { duration: 2500 });
    });
  }

  addPlaylist(){

    let newList = {
      "title" : null, 
      "flagActive" : true, 
      "items" : []
    };

    this.playlists.push(newList);
  }

  removePlaylist(listObj){

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {meta : {"type" : "confirm", "title" : "Playliste löschen", "messageText" : "Sind Sie sicher, dass Sie diese Playliste löschen möchten?"}}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.answerConfirm){
       
        if(!listObj._id){
          let idx = this.playlists.findIndex(x => x == listObj);
          this.playlists.splice(idx, 1);
          return;
        }
    
        this.api.delete("/devices/playlist/" + listObj._id, listObj).then(() => {
          let idx = this.playlists.findIndex(x => x == listObj);
          this.playlists.splice(idx, 1);
        }).catch(err => {
          console.error(err);
          this._snackBar.open("Etwas ist schief gelaufen beim Löschen der Playlist.", "", { duration: 2500 });
        });

      }
      console.log('The dialog was closed');
    });


  }

  savePlaylist(listObj){

    let playlistId = "/new"; 

    if (listObj._id){
      playlistId = "/" + listObj._id;
    }

    this.api.put("/devices/playlist" + playlistId, listObj).then((storedPlaylist : any) => {
      listObj = storedPlaylist;
      this._snackBar.open("Gespeichert.", "", { duration: 2500 });
    }).catch(err => {
      console.error(err);
      this._snackBar.open("Etwas ist schief gelaufen beim Speichern der Playlist.", "", { duration: 2500 });
    });
  }

  getDevices(){

    this.api.get("/devices").then((devices : any[]) => {
      this.devices = devices;
    }).catch(err => {
      console.error(err);
      this._snackBar.open("Etwas ist schief gelaufen beim Abrufen der Geräte.", "", { duration: 2500 });
    });

  }

  public get newDeviceFormValue() {
      return this.newDeviceForm.value;
  }

  dropPlaylist(list, event: CdkDragDrop<string[]>) {
    moveItemInArray(list.items, event.previousIndex, event.currentIndex);
  }

  addNewItem(list, type){
    let title = ""; 

    if (type.type != "designer"){
      title = type.title;
    }else{
      title = "Unbenannt"
    }

    let newObj = {
      type : type, 
      title : title,
      duration: 30
    };

    list.items.push(JSON.parse(JSON.stringify(newObj)));
  };

  removeItem(list, item){
    let idx = list.items.findIndex(x => x == item);
    if (idx > -1){
      list.items.splice(idx, 1);
    }    
  }

  changeDurationItem(item, duration){
    item.duration = duration;
  }

  getSumDurationItem(list){
    let duration = 0;
    list.items.forEach(element => {
      duration += parseFloat(element.duration);
    });
    return duration;
  }

  addDevice(event?){

    if (event){
      event.stopPropagation();
    }

    let addObj = this.newDeviceFormValue;
    addObj.pin = addObj.pin.toUpperCase();

    this.livedata.send("device:add", {pin: addObj.pin, title: addObj.title});

  }

  updateDevice(deviceObj){
    this.livedata.send("device:update", {device: deviceObj});
  }

  removeDevice(deviceObj){
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {meta : {"type" : "confirm", "title" : "Gerät löschen", "messageText" : "Sind Sie sicher, dass Sie das Gerät löschen möchten?"}}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.answerConfirm){
       
        this.livedata.send("device:remove", {device: deviceObj});
      }
      console.log('The dialog was closed');
    });
    
  }

  reloadScreen(deviceObj){
    this.livedata.send("device:reload", {device: deviceObj});
  }

  toggleMute(item){
    if (item.mute){
      item.mute = false;
    }else{
      item.mute = true;
    }
  }

  editItem(item){

    if (item.type.type == 'clock'){

      const dialogRef = this.dialog.open(EditclockComponent, {
        data: {item : item}, 
        panelClass : "edit-clock-dialog"
      });
    }else if (item.type.type == 'quote'){

      const dialogRef = this.dialog.open(EditquoteComponent, {
        data: {item : item.quote || null}, 
        panelClass : "edit-quote-dialog"
      });

      dialogRef.afterClosed().subscribe(resultItem => {
        if (resultItem){
          console.log(resultItem);
         item["quote"] = resultItem;
        }
      });

    }else if (item.type.type == 'weather'){

      const dialogRef = this.dialog.open(EditweatherComponent, {
        data: {item : item}, 
        panelClass : "edit-weather-dialog"
      });

    }else if (item.type.type == 'video' || item.type.type == 'image'){

      const dialogRef = this.dialog.open(EditmediaComponent, {
        data: {item : item}, 
        panelClass : "edit-media-dialog"
      });

    }else if (item.type.type == 'bulletslide'){

      const dialogRef = this.dialog.open(EditbulletslideComponent, {
        data: {item : item}, 
        panelClass : "edit-bulletslide-dialog"
      });

      dialogRef.afterClosed().subscribe(resultItem => {
        if (resultItem){
          console.log(resultItem);
         item["slide"] = resultItem;
        }
      });

    }
    
  }

  getTypeAvatar(item){
    let defaultPath = "https://www.facharztpraxis-fuer-allgemeinmedizin.de/assets/images/header-background.jpg";
    try{
      let path = item.type.avatar;
      if (path){
        return path;
      }else{
        return defaultPath;
      }
      return path;
    }catch(err){
      return defaultPath;
    }
    
  }

  createSnapshot(file){
    let self = this;
    return new Promise(async (resolve, reject) => {
      var reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = function () {

        self.tmpvideosrc = reader.result;

        var video = document.getElementById('tmp_video_video_snap') as any;
        var canvas = document.getElementById('tmp_canvas_video_snap') as any;
        var context = canvas.getContext('2d');
  
        var w = 0 , h =0 , ratio = 0 as any;
        //add loadedmetadata which will helps to identify video attributes......
        video.addEventListener('loadeddata', function() {
          video.currentTime = 3;


          let maxWidth = 400;
          

          ratio = video.videoWidth / video.videoHeight as any;
          w = video.videoWidth - 100 as any;
          h = w  / ratio;

          let scaleRatio = w/maxWidth;

          canvas.width = maxWidth;
          canvas.height = h/scaleRatio; 

          setTimeout(function(){

            context.fillRect(0, 0, maxWidth, h/scaleRatio);
            context.drawImage(video, 0, 0, maxWidth, h/scaleRatio);
  
            var dataURL = canvas.toDataURL('image/jpeg', 0.5);

            let response = {
              "dataURL" : dataURL, 
              "duration" : video.duration
            };
  
            resolve(response)

          }, 1000);
        

        }, false);

      };
      reader.onerror = function (error) {
        reject(error);
      };
    })
  }

  async handleFileUpload(item, files: FileList){

    let self = this;

    this.newUploadFile = files.item(0);

    let ext = this.newUploadFile.type.substring(this.newUploadFile.type.indexOf("/")+1, this.newUploadFile.type.length).toLowerCase();

    if (this.allowedUploadTypes[item.type.type].indexOf(ext) < 0){
      this._snackBar.open("Bitte beachten Sie - es werden nur folgende Datei-Typen zugelassen: " + this.allowedUploadTypes[item.type.type].join(", "), "OK", {});
      this.newUploadFile = null;
      return;
    }

    if (ext == 'mp4'){
      let screenSnack = this._snackBar.open("Bitte warten, wir verarbeiten das Video...", "", {});
      let videoPreProcResponse = await this.createSnapshot(this.newUploadFile).catch(err => {
        this._snackBar.open("Ups - leider ist etwas schief gelaufen mit dem Screenshot.", "", {});
        console.error(err);
      }) as any;

      var previewSrc = videoPreProcResponse.dataURL; 
      var videoDuration = videoPreProcResponse.duration;

      screenSnack.dismiss();
    }
    
    const formData: FormData = new FormData();

    if (this.newUploadFile){
      formData.append('file', this.newUploadFile, this.newUploadFile.name);
    }

    
    if (previewSrc){
      formData.append("previewSrc", previewSrc); 
    }

    if (videoDuration){
      formData.append("duration", videoDuration); 
    }

    let uploadSnack = this._snackBar.open("Upload...", "", {});
    
    
    this.api.post("/general/content/tv", formData, true).then((res : any) => {

      uploadSnack.dismiss();

      if (res.filePath){
        
        if (item.type.type == 'image'){
          item.imageFullPath = res.filePath;
          item.type.avatar = res.filePath;
        }else if (item.type.type == 'video'){
          item.videoFullPath = res.filePath;
          item.type.avatar = res.avatarPath;
          item.duration = res.duration;
          item.videoDuration = res.videoDuration;
        }
        
      }
        
      this._snackBar.open("Upload erfolgreich", "", {
       duration: 1500
     });

     this.newUploadFile = null;

   }).catch(err=>{

    uploadSnack.dismiss();

     console.warn(err);
     this._snackBar.open("Etwas hat nicht geklappt", "", {
       duration: 1500
     });

   })
   


  } 

}
