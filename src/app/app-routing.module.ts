import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import {PurchaseConfirmationComponent} from "./purchase-confirmation/purchase-confirmation.component";
import {FreeFireDetailsComponent} from "./free-fire-details/free-fire-details.component";
import {FilteredPageComponent} from "./filtered-page/filtered-page.component";

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'purchase-confirmation', component: PurchaseConfirmationComponent }, { path: 'free-fire-details', component: FreeFireDetailsComponent},
  { path: 'filtered/:category', component: FilteredPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top', onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
