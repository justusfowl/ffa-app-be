import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatAutocomplete, MatAutocompleteSelectedEvent, MatChipInputEvent, MatSnackBar } from '@angular/material';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import * as moment from 'moment-timezone';


@Component({
  selector: 'app-editclock',
  templateUrl: './editclock.component.html',
  styleUrls: ['./editclock.component.scss']
})
export class EditclockComponent implements OnInit {

  @ViewChild('tzInput', {static : true}) tzInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', {static : true}) matAutocomplete: MatAutocomplete;

  displayItem : any;

  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tzControl = new FormControl();
  filteredTimezones: Observable<string[]>;
  timezones: any[] = [];
  allTz: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<EditclockComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private api : ApiService,
    private fb: FormBuilder, 
    private snackBar : MatSnackBar
  ) { 

    let tz = moment.tz.names();
    this.allTz = tz;

    if (data.item){
      this.displayItem = data.item;
      if (typeof(this.displayItem.clocks) == "undefined"){
        this.displayItem.clocks = [];
      }
      this.timezones = this.displayItem.clocks;
    }

    this.filteredTimezones = this.tzControl.valueChanges.pipe(
      startWith(null),
      map((tz: string | null) => tz ? this._filter(tz) : this.allTz.slice()));

  }

  ngOnInit() {
    

  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if (this.allTz.findIndex(x => x.toLowerCase() == value.toLowerCase()) < 0){
      return;
    }

    if (this.timezones.length == 4){
      this.snackBar.open("Sie können bis zu 4 Uhren hinzufügen", "", {
        duration: 2500
      })
      return;
    }

    if ((value || '').trim()) {
      this.timezones.push({"timeZone" : value.trim()});
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.tzControl.setValue(null);
  }

  remove(fruit: string): void {
    const index = this.timezones.indexOf(fruit);

    if (index >= 0) {
      this.timezones.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {

    if (this.allTz.findIndex(x => x.toLowerCase() == event.option.viewValue.toLowerCase()) < 0){
      return;
    }

    if (this.timezones.length == 4){
      this.snackBar.open("Sie können bis zu 4 Uhren hinzufügen", "", {
        duration: 2500
      })
      return;
    }

    this.timezones.push({"timeZone" : event.option.viewValue});
    this.tzInput.nativeElement.value = '';
    this.tzControl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allTz.filter(tz => tz.toLowerCase().includes(filterValue));
  }

  close(){

    this.dialogRef.close();

  }

}
