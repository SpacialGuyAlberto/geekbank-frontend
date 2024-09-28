import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../auth.service';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../cart.service';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import { SearchBarComponent } from "../search-bar/search-bar.component";
import { filter } from 'rxjs/operators';
import { KinguinGiftCard } from '../models/KinguinGiftCard';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    MatIconModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    SearchBarComponent,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  cartItemCount: number = 0;
  selectedLanguage: string = 'en';
  isLanguageMenuOpen: boolean = false;
  showNavbar: boolean = true;
  showSearchBar: boolean = true;
  showSearchModal: boolean = false;
  searchQuery: string = '';
  isSmallScreen: boolean = false;
  searchResultsMessage: string = '';

  constructor(
    private authService: AuthService,
    protected router: Router,
    private cartService: CartService,
    protected activatedRoute: ActivatedRoute,
    public translate: TranslateService,
    private cd: ChangeDetectorRef
  ) {
    this.translate.addLangs(['en', 'es', 'de']);
    this.translate.setDefaultLang(this.selectedLanguage);
  }

  ngOnInit(): void {
    this.translate.addLangs(['en', 'es', 'de']);
    this.translate.setDefaultLang('en');
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const hiddenRoutes = ['/login', '/register'];
      this.showSearchBar = !hiddenRoutes.includes(event.url);
    });

    this.router.events.subscribe(() => {
      const hiddenRoutes = ['/user-details', '/admin-panel'];
      this.showNavbar = !hiddenRoutes.includes(this.router.url);
    });

    this.cartService.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
      this.cd.detectChanges();
    });
  }

  useLanguage(language: string): void {
    this.translate.use(language).subscribe();
  }

  toggleLanguageMenu(): void {
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  async logout() {
    await this.authService.performLogout(this.router);
  }

  openSearchModal() {
    this.showSearchModal = true;
    this.searchResultsMessage = '';
  }

  closeSearchModal() {
    this.showSearchModal = false;
  }

  handleSearchResults(results: KinguinGiftCard[]): void {
    if (results.length > 0) {
      this.closeSearchModal(); // Cierra el modal si hay resultados
    } else {
      this.searchResultsMessage = 'No hay resultados para esta búsqueda'; // Muestra mensaje si no hay resultados
    }
  }

  checkScreenSize() {
    this.isSmallScreen = window.innerWidth <= 768;
  }
}
