import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {HomeComponent} from './pages/home/home.component';
import {AdminComponent} from './pages/admin/admin.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { PassresetComponent } from './pages/passreset/passreset.component';
import { MyComponent } from './pages/my/my.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { AuthComponent } from './pages/auth/auth.component';

import { AuthGuard } from './services/authguard';
import { ImprintComponent } from './pages/imprint/imprint.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { TVHomeComponent } from './pages/tv/tvhome/tvhome.component';


const routes: Routes = [
  { path: 'home', component: HomeComponent},
  { path: 'termin', component: HomeComponent},
  { path: 'privacy', component: PrivacyComponent},
  { path: 'impressum', component: ImprintComponent},
  { path: 'login', component: AuthComponent},
  { path: 'passreset', component: PassresetComponent},
  { path: 'my', component: MyComponent, canActivate: [AuthGuard]},
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard]},
  { path: 'appointments', component: AppointmentsComponent, canActivate: [AuthGuard]},
  { path: 'tv', component: TVHomeComponent, canActivate: [AuthGuard]},

  { path: '', redirectTo: '/home', pathMatch: 'full' },
  // otherwise redirect to home
  { path: '**', component: NotfoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
