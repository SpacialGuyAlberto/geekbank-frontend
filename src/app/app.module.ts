import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


// Importa los componentes standalone
import { RegisterComponent } from './register/register.component';
import {LoginComponent} from "./login/login.component";
import {AppRoutingModule} from "./app-routing.module";


const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
];

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
    // RouterModule.forRoot(routes),
    AppRoutingModule,
    RegisterComponent,
    AppComponent

  ],
  providers: [ HttpClientModule, HttpClient],
  bootstrap: []
})
export class AppModule { }
