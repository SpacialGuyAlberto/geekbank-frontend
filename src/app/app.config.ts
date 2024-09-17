import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection, isDevMode } from "@angular/core";
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { GoogleLoginProvider, SocialAuthServiceConfig } from "@abacritt/angularx-social-login";
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import {HttpLoaderFactory} from "./app.module";

// Esta es la función de fábrica para la carga de archivos JSON de traducción.
// export function HttpLoaderFactory(http: HttpClient) {
//   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }


// Configuración de la aplicación combinada
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Proveedor para las rutas
    provideClientHydration(), // Proveedor para la hidratación del lado del cliente
    provideHttpClient(withFetch()), // Proveedor para HTTP con Fetch
    provideAnimationsAsync(), // Proveedor para animaciones asincrónicas

    // Configuración de autenticación social con Google
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider('445500636748-2nuqarr3morlrul9bdadefcogo7rffcn.apps.googleusercontent.com', { oneTapEnabled: false })
          }
        ]
      } as SocialAuthServiceConfig
    },

    // Configuración de almacenamiento en NGRX
    provideStore(), // Proveedor para el store de NGRX
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }), // DevTools para NGRX

    // Configuración de la detección de zonas y optimización
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Proveedores para ngx-translate para la internacionalización (i18n)
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
  ],
};
