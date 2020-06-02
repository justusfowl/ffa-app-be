import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatSnackBar, MAT_DIALOG_DATA, MatDialogRef, MatChipInputEvent, MatAutocompleteSelectedEvent } from '@angular/material';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { startWith, map  } from 'rxjs/operators';
import { ENTER, COMMA } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-editquote',
  templateUrl: './editquote.component.html',
  styleUrls: ['./editquote.component.scss']
})
export class EditquoteComponent implements OnInit {

  @ViewChild('typeInput', {static : true}) typeInput: ElementRef<HTMLInputElement>;

  allQuoteTypes : any[] = [
    "historisch", 
    "romantisch", 
    "weise", 
    "medizinisch"
  ];

  quoteTypes : any[] = [];

  quoteItem : any;
  quoteForm : FormGroup;

  separatorKeysCodes: number[] = [ENTER, COMMA];
  typeControl = new FormControl();
  filteredTypes : Observable<string[]>;

  constructor(
    public dialogRef: MatDialogRef<EditquoteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private snackBar : MatSnackBar
  ) {
   
    if (data.item){
      this.quoteItem = data.item;
    }else{
      this.quoteItem = {};
    }

    this.filteredTypes = this.typeControl.valueChanges.pipe(
      startWith(null),
      map((type: string | null) => type ? this._filter(type) : this.allQuoteTypes.slice()));

      
   }

  ngOnInit() {

    let author = ""; 
    let quote = "";

    if (this.quoteItem.author){
      author = this.quoteItem.author;
    }

    if (this.quoteItem.quote){
      quote = this.quoteItem.quote;
    }

    this.quoteForm = new FormGroup({
      author : new FormControl(author, Validators.required),
      quote : new FormControl(quote, Validators.required)
    });

  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if (this.allQuoteTypes.findIndex(x => x.toLowerCase() == value.toLowerCase()) < 0){
      return;
    }

    if (this.quoteTypes.length == 4){
      this.snackBar.open("Sie können bis zu 4 Typen hinzufügen", "", {
        duration: 2500
      })
      return;
    }

    if ((value || '').trim()) {
      this.quoteTypes.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.typeControl.setValue(null);
  }

  remove(fruit: string): void {
    const index = this.quoteTypes.indexOf(fruit);

    if (index >= 0) {
      this.quoteTypes.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {

    if (this.allQuoteTypes.findIndex(x => x.toLowerCase() == event.option.viewValue.toLowerCase()) < 0){
      return;
    }

    if (this.quoteTypes.length == 4){
      this.snackBar.open("Sie können bis zu 4 Typen hinzufügen", "", {
        duration: 2500
      })
      return;
    }

    this.quoteTypes.push(event.option.viewValue);
    this.typeInput.nativeElement.value = '';
    this.typeControl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allQuoteTypes.filter(type => type.toLowerCase().includes(filterValue));
  }

  public get quoteFormValue() {
    return this.quoteForm.value;
}

  close(){

    this.dialogRef.close();

  }

  save(){

    let f = this.quoteFormValue;
    this.dialogRef.close(f);
    
  }

}
