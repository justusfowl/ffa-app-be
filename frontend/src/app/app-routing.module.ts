import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import {HomeComponent} from './pages/home/home.component';
import {AdminComponent} from './pages/admin/admin.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { LoginComponent } from './pages/login/login.component';
import { MyComponent } from './pages/my/my.component';
import { AuthGuard } from './services/authguard';

const routes: Routes = [
  { path: 'home', component: HomeComponent},
  { path: 'privacy', component: PrivacyComponent},
  { path: 'login', component: LoginComponent},
  { path: 'my', component: MyComponent, canActivate: [AuthGuard]},
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard]},
  
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
