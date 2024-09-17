import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../cart.service';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core'; // Importa TranslateService
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    MatIconModule,
    FormsModule,
    RouterModule,
    TranslateModule // Asegúrate de importar TranslateModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  cartItemCount: number = 0;
  selectedLanguage: string = 'en'; // Idioma por defecto
  isLanguageMenuOpen: boolean = false; // Controla si el menú está abierto o no
  loginLabel: string = ''; // Variable para almacenar la traducción de 'Login'
  registerLabel: string = ''; // Variable para almacenar la traducción de 'Register'

  constructor(
    private authService: AuthService,
    protected router: Router,
    private cartService: CartService,
    protected activatedRoute: ActivatedRoute,
    public translate: TranslateService,
    private cd: ChangeDetectorRef // Inyecta TranslateService
  ) {

    this.translate.addLangs(['en', 'es', 'de']);  // Idiomas disponibles
    this.translate.setDefaultLang(this.selectedLanguage);
  }

  ngOnInit(): void {
    this.translate.addLangs(['en', 'es', 'de']); // Add available languages
    this.translate.setDefaultLang('en'); // Set default language
    this.selectedLanguage = 'en'; // Or read from a saved state (localStorage, etc.)
  }

  // Método para cambiar el idioma
  useLanguage(language: string): void {
    this.translate.use(language).subscribe({
      next: () => {
        this.translate.get("LOGIN").subscribe({
          next: (translation: string) => {
            console.log('Traducción de LOGIN:', translation); // Esto debería mostrar "Iniciar sesión" en español, por ejemplo
          },
          error: (err) => {
            console.error('Error al obtener la traducción de LOGIN:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error al cambiar el idioma:', err);
      }
    });
  }


  // Método para abrir/cerrar el menú de idioma
  toggleLanguageMenu(): void {
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  async logout() {
    await this.authService.performLogout(this.router);
  }
}
