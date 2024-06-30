import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import {HomeComponent} from "./home/home.component";
import {ActivationComponent} from "./activation/activation.component";
import {LogoutComponent} from "./logout/logout.component";
import {AuthGuard} from "./auth.guard";
import {NoAuthGuard} from "./noauth.guard";
import {GiftCardDetailsComponent} from "./gift-card-details/gift-card-details.component";
import {UserDetailsComponent} from "./user-details/user-details.component";
import {CartComponent} from "./cart/cart.component";
import {TigoPaymentComponent} from "./tigo-payment/tigo-payment.component";
export const routes: Routes = [
  { path: 'register', component: RegisterComponent, canActivate: [NoAuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'activate', component: ActivationComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'gift-card-details/:id', component: GiftCardDetailsComponent },
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'user-details', component: UserDetailsComponent },
  { path: 'cart', component: CartComponent },
  { path:'tigo-payment', component: TigoPaymentComponent }
];
