import { Component, OnInit, Inject } from '@angular/core';
import { Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA, ErrorStateMatcher } from '@angular/material';
import { ApiService } from 'src/app/services/api.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-adduser',
  templateUrl: './adduser.component.html',
  styleUrls: ['./adduser.component.scss']
})
export class AdduserComponent implements OnInit {

  matcher = new MyErrorStateMatcher();

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  constructor(
    public dialogRef: MatDialogRef<AdduserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private dialog : MatDialog, 
    private api : ApiService
  ) { }

  ngOnInit() {

  }

  preregisterUser(){

    let userName = this.emailFormControl.value;

    this.api.post("/auth/adminRegisterUser", {userName}, true).then((result : any) => {
      
      this.dialogRef.close(true);

    }).catch(err => {
      this.dialogRef.close();
    })

  }

}
