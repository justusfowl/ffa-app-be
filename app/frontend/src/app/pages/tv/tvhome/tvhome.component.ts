import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { LivedataService } from 'src/app/services/livedata.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-tvhome',
  templateUrl: './tvhome.component.html',
  styleUrls: ['./tvhome.component.scss', '../../../app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TVHomeComponent implements OnInit {

  playlists : any[] = []

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
      "type" : "quote", 
      "title" : "Zitat",
      "icon": "format_quote"
    },
    {
      "type" : "clock", 
      "title" : "Weltuhr",
      "icon": "watch_later"
    },
    {
      "type" : "weather", 
      "title" : "Wetter",
      "icon": "wb_sunny"
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

    list.items.push(newObj);
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

  addDevice(event){

    event.stopPropagation();


    let addObj = this.newDeviceFormValue;
    addObj.pin = addObj.pin.toUpperCase();

    this.livedata.send("device:add", {pin: addObj.pin, title: addObj.title});

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


}
