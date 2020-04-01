import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { LoginComponent } from '../login/login.component';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AuthComponent implements OnInit {

  returnUrl : string = "/";

  constructor(
    public dialog: MatDialog, 
    private route: ActivatedRoute, 
    private authenticationService : AuthenticationService,
    private router: Router) { 
      // redirect to home if already logged in
     if (this.authenticationService.currentUserValue) {
        this.router.navigate(['/']);
      }
    }

  ngOnInit() {
    this.openDialog();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }


  openDialog(): void {
    const dialogRef = this.dialog.open(LoginComponent, {
      data: {},
      panelClass : "login-dialog"
    });

    dialogRef.afterClosed().subscribe(result => {
      this.router.navigate([this.returnUrl]);
    });
  }

}
