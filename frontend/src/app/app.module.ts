import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS  } from '@angular/common/http'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { LoginComponent } from './pages/login/login.component';
import { MyComponent } from './pages/my/my.component';
import { NewsdetailComponent } from './pages/newsdetail/newsdetail.component';
import {AdminComponent} from './pages/admin/admin.component';

import { ApiService } from './services/api.service';
import { JwtInterceptor } from './services/jwt.intercept';
import { ErrorInterceptor } from './services/error.intercept';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { LeafletModule } from '@asymmetrik/ngx-leaflet'
import { TrimLongStr } from './services/pipes';
import { MedrequestComponent } from './components/medrequest/medrequest.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PrivacyComponent,
    LoginComponent,
    MyComponent,
    NewsdetailComponent,
    AdminComponent, 
    TrimLongStr, 
    MedrequestComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule, 
    FormsModule, ReactiveFormsModule,
    MaterialModule,
    LeafletModule.forRoot()
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    ApiService, 
    ErrorInterceptor, 
    JwtInterceptor
  ],
  bootstrap: [AppComponent], 
  entryComponents : [NewsdetailComponent, MedrequestComponent]
})
export class AppModule { }
