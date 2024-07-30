import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from "@angular/forms";
import { RegisterComponent } from './register/register.component';
import {LoginComponent} from "./login/login.component";
import {AppRoutingModule} from "./app-routing.module";
import {environment} from "../environment";
import {SocialLoginModule,   SocialAuthServiceConfig} from '@abacritt/angularx-social-login';
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';
import {TelegramListenerService} from "./telegram-listener.service";


@NgModule({
  declarations: [
    // Si tienes otros componentes no standalone, puedes declararlos aquí

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule,
    SocialLoginModule,
    AppRoutingModule,
    RegisterComponent,
    AppComponent,
    ReactiveFormsModule,
  ],
  providers: [ HttpClientModule, HttpClient, TelegramListenerService
  ],
  bootstrap: []
})
export class AppModule { }
