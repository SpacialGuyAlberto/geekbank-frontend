import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../auth.service';
import {NgClass, NgIf} from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../cart.service';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import { SearchBarComponent } from "../search-bar/search-bar.component";
import { filter } from 'rxjs/operators';
import { KinguinGiftCard } from '../models/KinguinGiftCard';
import {UIStateServiceService} from "../uistate-service.service";
import {Subscription} from "rxjs";
import {NotificationBellComponent} from "../notification-bell/notification-bell.component";
import {SharedService} from "../shared.service";
import {User} from "../models/User";

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
    NgClass,
    NotificationBellComponent,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  cartItemCount: number = 0;
  selectedLanguage: string = 'en';
  isLanguageMenuOpen: boolean = false;
  showNavbar: boolean = true;
  isMenuOpen: boolean = false;
  showSearchBar: boolean = true;
  showSearchModal: boolean = false;
  showUserDetailsModal: boolean = false;
  searchQuery: string = '';
  isSmallScreen: boolean = false;
  searchResultsMessage: string = '';
  navbarClass: string = '';
  showMenuModal: boolean = false;
  routerSubscription!: Subscription;
  user: User | any;
  inUserDetailsRoute: boolean = false;

  constructor(
    private authService: AuthService,
    protected router: Router,
    private cartService: CartService,
    public translate: TranslateService,
    private cd: ChangeDetectorRef,
    private uiStateService: UIStateServiceService,
    private sharedService: SharedService
  ) {
    this.translate.addLangs(['en', 'es', 'de']);
    this.translate.setDefaultLang(this.selectedLanguage);
  }

  ngOnInit(): void {
    this.translate.addLangs(['en', 'es', 'de']);
    this.translate.setDefaultLang('en');
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));

    this.routerSubscription = this.router.events.subscribe( event => {
      if (event instanceof NavigationEnd){
        this.updateNavBarStyle(this.router.url)
        if (this.router.url.includes('/user-details')){
          this.showUserDetailsModal = true;
          this.inUserDetailsRoute = true;
        } else {
          this.showUserDetailsModal = false;
          this.inUserDetailsRoute = false;
        }
      }
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const hiddenRoutes = ['/login', '/register'];
        this.showSearchBar = !hiddenRoutes.includes(event.url);
      });

    this.router.events.subscribe(() => {
      const hiddenRoutes = ['/admin-panel'];
      this.showNavbar = !hiddenRoutes.includes(this.router.url);
    });

    this.cartService.cartItemCount$.subscribe((count) => {
      this.cartItemCount = count;
      this.cd.detectChanges();
    });

    this.authService.getUserDetails().subscribe(data => {
      this.user = data;
      console.log(data.email)
      sessionStorage.setItem("email", data.email)
      console.log(this.user);
    });

  }

  updateNavBarStyle(url: string) : void {
    if (url.includes('/user-details')){
      this.navbarClass = 'navbar-user-details'
    } else {
      this.navbarClass = 'navbar'
    }
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
      this.closeSearchModal();
      this.router.navigate(['/home'], { queryParams: { search: this.searchQuery } });
    } else {
      this.searchResultsMessage = 'No hay resultados para esta búsqueda';
    }
  }

  goToHome() {
    this.uiStateService.setShowHighlights(true);
    this.router.navigate(['/home']);
  }

  checkScreenSize() {
    this.isSmallScreen = window.innerWidth <= 768;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  openMenuModal(): void {
    this.showMenuModal = true;
  }

  closeMenuModal(): void {
    this.showMenuModal = false;
  }

  selectTab(tab: string){
    this.sharedService.emitTableAction(tab)
  }
}
