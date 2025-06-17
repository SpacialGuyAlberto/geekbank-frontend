import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from "./home/home.component";
import { ActivationComponent } from "./activation/activation.component";
import { LogoutComponent } from "./logout/logout.component";
import { AuthGuard } from "./services/auth.guard";
import { NoAuthGuard } from "./services/noauth.guard";
import { GiftCardDetailsComponent } from "./gift-card-details/gift-card-details.component";
import { UserDetailsComponent } from "./user-details/user-details.component";
import { CartComponent } from "./cart/cart.component";
import { TigoPaymentComponent } from "./tigo-payment/tigo-payment.component";
import { AdminPanelComponent } from "./admin-panel/admin-panel.component";
import { SetPasswordComponent } from "./set-password/set-password.component";
import { AccountInfoComponent } from "./user-details/settings/account-info/account-info.component";
import { PurchaseConfirmationComponent } from "./purchase-confirmation/purchase-confirmation.component";
import { FreeFireDetailsComponent } from "./free-fire-details/free-fire-details.component";
import { RandomKeysComponent } from "./random-keys/random-keys.component";
import { TournamentAnnouncementComponent } from "./tournament-announcement/tournament-announcement.component";
import { OrdersComponent } from "./user-details/settings/orders/orders.component";
import { WishlistComponent } from "./user-details/settings/wishlist/wishlist.component";
import { PaymentMethodsComponent } from "./user-details/settings/payment-methods/payment-methods.component";
import {FilteredPageComponent} from "./filtered-page/filtered-page.component";
import {TermsAndConditionsComponent} from "./terms-and-conditions/terms-and-conditions.component";
import {OfferComponent} from "./offer/offer.component";
import {PlatformFilterComponent} from "./platform-filter/platform-filter.component";
import {ResultComponent} from "./payment/Stripe/result/result.component";
import {CheckoutComponent} from "./payment/Stripe/checkout/checkout.component";
import {TournamentSignupComponent} from "./tournament-announcement/tournament-signup/tournament-signup.component";


export const routes: Routes = [
  { path: 'register', component: RegisterComponent, canActivate: [NoAuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'home', component: HomeComponent },
  { path: 'activate', component: ActivationComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'gift-card-details/:id', component: GiftCardDetailsComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Solo una ruta vacía
  { path: 'user-details', component: AccountInfoComponent, canActivate: [AuthGuard] },
  { path: 'cart', component: CartComponent },
  { path: 'tigo-payment', component: TigoPaymentComponent },
  { path: 'admin-panel', component: AdminPanelComponent },
  { path: 'set-password', component: SetPasswordComponent },
  // Opción 1: Si defines '/payment'
  // { path: 'payment', component: PaymentComponent },
  { path: 'purchase-confirmation', component: PurchaseConfirmationComponent },
  { path: 'free-fire-details', component: FreeFireDetailsComponent },
  { path: 'random-keys', component: RandomKeysComponent },
  { path: 'tournament', component: TournamentAnnouncementComponent },
  { path: 'signup', component: TournamentSignupComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'payment-methods', component: PaymentMethodsComponent },
  { path: 'wish-list', component: WishlistComponent },
  { path: 'platform/:name', component: PlatformFilterComponent },
  { path: 'filtered/:category', component: FilteredPageComponent },
  { path: 'terms', component: TermsAndConditionsComponent},
  {
    path: 'offer/:title',
    component: OfferComponent
  },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'checkout-result', component: ResultComponent },
  { path: '**', redirectTo: '/home' }
];
