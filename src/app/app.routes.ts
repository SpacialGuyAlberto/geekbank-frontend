import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import {HomeComponent} from "./home/home.component";
import {ActivationComponent} from "./activation/activation.component";
import {LogoutComponent} from "./logout/logout.component";
import {AuthGuard} from "./auth.guard";
import {NoAuthGuard} from "./noauth.guard";
export const routes: Routes = [
  { path: 'register', component: RegisterComponent, canActivate: [NoAuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'activate', component: ActivationComponent },
  { path: 'logout', component: LogoutComponent },
  { path: '', redirectTo: '/register', pathMatch: 'full' }
];
