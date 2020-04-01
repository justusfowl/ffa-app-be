import { BrowserModule } from '@angular/platform-browser';

import { NgModule, LOCALE_ID  } from '@angular/core';


import { HttpClientModule, HTTP_INTERCEPTORS  } from '@angular/common/http'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { LoginComponent } from './pages/login/login.component';
import { PassresetComponent } from './pages/passreset/passreset.component';
import { MyComponent } from './pages/my/my.component';
import { NewsdetailComponent } from './pages/newsdetail/newsdetail.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { NewappointmentComponent } from './pages/newappointment/newappointment.component';


import { ApiService } from './services/api.service';
import { JwtInterceptor } from './services/jwt.intercept';
import { ErrorInterceptor } from './services/error.intercept';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { LeafletModule } from '@asymmetrik/ngx-leaflet'
import { TrimLongStr } from './services/pipes';
import { MedrequestComponent } from './components/medrequest/medrequest.component';
import { AuthComponent } from './pages/auth/auth.component';

import { RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor';
import {NgcCookieConsentModule, NgcCookieConsentConfig} from 'ngx-cookieconsent';

import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { DatePipe } from '@angular/common';
import { TeleSlotComponent } from './components/tele-slot/tele-slot.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { ImprintComponent } from './pages/imprint/imprint.component';
import { GoogleAnalyticsService } from './services/google-analytics.service';
import { environment } from '../environments/environment';
import { CancelappointmentComponent } from './components/cancelappointment/cancelappointment.component';

const cookieConfig:NgcCookieConsentConfig = {
  cookie: {
    domain: environment.domain
  },
  palette: {
    popup: {
      background: '#000'
    },
    button: {
      background: '#972c30'
    }
  },
  theme: 'edgeless',
  type: 'opt-in',
  content : {
    "message": "Wir möchten Ihnen das bestmögliche Nutzererlebnis bei unseren digitalen Gesundheitsdiensten bieten und nutzen dafür Cookies.",
    "dismiss": "OK!",
    "allow": "OK!",
    "deny": "Ablehnen",
    "link": "mehr Infos",
    "href": "/privacy",
    "policy": "Datenschutz"
  }
};


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PrivacyComponent,
    LoginComponent,
    PassresetComponent,
    MyComponent,
    NewsdetailComponent,
    AdminComponent, 
    TrimLongStr, 
    MedrequestComponent, 
    AppointmentsComponent,
    NewappointmentComponent, 
    AuthComponent,
    TeleSlotComponent,
    ConfirmDialogComponent, 
    ImprintComponent, 
    CancelappointmentComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule, 
    FormsModule, ReactiveFormsModule,
    MaterialModule,
    LeafletModule.forRoot(), 
    RichTextEditorAllModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    NgcCookieConsentModule.forRoot(cookieConfig)
  ], 
  providers: [
    { provide: LOCALE_ID, useValue: "de-DE" },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    ApiService, 
    ErrorInterceptor, 
    JwtInterceptor,
    DatePipe,
    GoogleAnalyticsService
  ],
  bootstrap: [AppComponent], 
  entryComponents : [
    NewsdetailComponent, 
    MedrequestComponent,
    LoginComponent, 
    TeleSlotComponent, 
    ConfirmDialogComponent, 
    NewappointmentComponent, 
    CancelappointmentComponent
  ]
})
export class AppModule { }
