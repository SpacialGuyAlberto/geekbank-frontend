import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';  // Aquí añadimos provideHttpClient
import {routes} from "./app/app.routes";
import { importProvidersFrom } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {BrowserAnimationsModule, provideAnimations} from "@angular/platform-browser/animations";


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    importProvidersFrom(TranslateModule.forRoot())  // Configuración de ngx-translate
  ]
}).catch(err => console.error(err));
