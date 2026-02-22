// src/app/components/navbar/navbar.component.ts
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterLink, ActivatedRoute, RouterModule, NavigationEnd } from '@angular/router';
import { AsyncPipe, CurrencyPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../cart/cart.service';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import { SearchBarComponent } from "../search-bar/search-bar.component";
import { filter } from 'rxjs/operators';
import { KinguinGiftCard } from '../kinguin-gift-cards/KinguinGiftCard';
import { UIStateServiceService } from "../services/uistate-service.service";
import { Observable, of, Subscription } from "rxjs";
import { NotificationBellComponent } from "../notification-bell/notification-bell.component";
import { SharedService } from "../services/shared.service";
import { User } from "../user-details/User";
import { BalanceComponent } from "../balance/balance.component";
import { AuthService } from "../services/auth.service";
import { Store } from "@ngrx/store";
import { selectUser, selectIsAuthenticated } from "../state/auth/auth.selectors";
import { AppState } from "../app.state";
import { loadUserFromSession, logout } from "../state/auth/auth.actions";
import { user } from "@angular/fire/auth";
import { loadUser } from "../state/user/user.actions";
import { CategoryItemsComponent } from "../components/category-items/category-items.component";
import { CartItemWithGiftcard } from "../cart/CartItem";
import { SearchStateService } from "../services/search-state.service";
import { Transaction } from "../transactions/transaction.model";


@Component({
  selector: 'app-navbar',
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
    BalanceComponent,
    AsyncPipe,
    NgForOf,
    CategoryItemsComponent,
    CurrencyPipe,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  cartItemCount: number = 0;
  isScrolled: boolean = false;

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  genres: { key: string; label: string, icon?: string }[] = [
    { key: 'Action', label: 'Action', icon: "fa-solid fa-plane" },
    { key: 'Adventure', label: 'Adventure', icon: "fa-brands fa-space-awesome" },
    { key: 'Anime', label: 'Anime' },
    { key: 'Casual', label: 'Casual' },
    { key: 'Co-op', label: 'Co op' },
    { key: 'Dating Simulator', label: 'Dating Simulator' },
    { key: 'Fighting', label: 'Fighting' },
    { key: 'Fps', label: 'FPS' },
    { key: 'Hack and Slash', label: 'Hack and Slash' },
    { key: 'Hidden Object', label: 'Hidden Object' },
    { key: 'Horror', label: 'Horror' },
    { key: 'Indie', label: 'Indie' },
    { key: 'Life simulation', label: 'Life simulation' },
    { key: 'Mmo', label: 'MMO' },
    { key: 'Music soundtrack', label: 'Music / Soundtrack' },
    { key: 'Online courses', label: 'Online Courses' },
    { key: 'Open World', label: 'Open World' },
    { key: 'Platformer', label: 'Platformer' },
    { key: 'Point and click', label: 'Point & click' },
    { key: 'PSN Card', label: 'PSN Card' },
    { key: 'Puzzle', label: 'Puzzle' },
    { key: 'Racing', label: 'Racing' },
    { key: 'Rpg', label: 'RPG' },
    { key: 'Simulation', label: 'Simulation' },
    { key: 'Software', label: 'Software' },
    { key: 'Sport', label: 'Sport' },
    { key: 'Story rich', label: 'Story rich' },
    { key: 'Strategy', label: 'Strategy' },
    { key: 'Subscription', label: 'Subscription' },
    { key: 'Survival', label: 'Survival' },
    { key: 'Third-Person Shooter', label: 'Third-Person Shooter' },
    { key: 'Visual novel', label: 'Visual Novel' },
    { key: 'VR Games', label: 'VR Games' },
    { key: 'XBOX LIVE Gold Card', label: 'XBOX LIVE Gold Card' },
    { key: 'XBOX LIVE Points', label: 'XBOX LIVE Points' },
  ];
  selectedLanguage: string = 'en';
  isLanguageMenuOpen: boolean = false;
  dropdownOpen: boolean = false;
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
  userMenu: string = "";
  inUserDetailsRoute: boolean = false;
  selectedCategory: string = '';
  selectedGenre: string | null = null;
  categoriesExpanded: boolean = false;
  tabsExpanded: boolean = false;
  role: string | undefined = '';
  user$: Observable<User | null>;
  isAuthenticated$: Observable<boolean | null>;
  isDropdownHovered: boolean = false;
  hideDropdownTimeout: any;
  showCartModal = false;
  cartItems: CartItemWithGiftcard[] = [];
  isFreeFireSearchActive: boolean = false;
  isSearchMode: boolean = false;
  isSearch: Subscription | null = null;

  private subscriptions: Subscription = new Subscription();
  private currentTransaction: Transaction | undefined = undefined;

  constructor(
    private authService: AuthService,
    private store: Store<AppState>,
    protected router: Router,
    private cartService: CartService,
    public translate: TranslateService,
    private cd: ChangeDetectorRef,
    private uiStateService: UIStateServiceService,
    private sharedService: SharedService,
    private searchStateService: SearchStateService
  ) {
    this.translate.addLangs(['en', 'es', 'de']);
    this.translate.setDefaultLang(this.selectedLanguage);
    this.user$ = this.store.select(selectUser);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
  }

  ngOnInit(): void {
    this.translate.addLangs(['en', 'es', 'de']);
    this.translate.setDefaultLang('en');
    this.checkScreenSize();
    this.loadCartItems();
    window.addEventListener('resize', this.checkScreenSize.bind(this));
    // this.user$.subscribe(data => this.role = data?.role)
    this.store.dispatch(loadUserFromSession());
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);

    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateNavBarStyle(this.router.url);
        if (this.router.url.includes('/user-details')) {
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

    // Elimina la llamada directa al AuthService
    // this.authService.getUserDetails().subscribe(data => { ... });

    // Suscripción adicional (si es necesario)
    this.subscriptions.add(
    );
  }

  @HostListener('window:load', ['$event'])
  onLoad(event: Event) {
    this.countCartItems();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.subscriptions.unsubscribe();
  }

  updateNavBarStyle(url: string): void {
    if (url.includes('/user-details')) {
      this.navbarClass = 'navbar-user-details';
      this.userMenu = 'sub-menu';
      this.inUserDetailsRoute = true;
    } else {
      this.navbarClass = 'navbar-user-details';
    }
  }

  useLanguage(language: string): void {
    this.translate.use(language).subscribe();
  }

  toggleLanguageMenu(): void {
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
  }

  isLoggedIn(): boolean {
    // Puedes eliminar este método si ya usas isAuthenticated$
    // return this.authService.isLoggedIn();
    return false; // Placeholder
  }

  // async logout() {
  //   this.store.dispatch(logout());
  //
  // }

  logout() {
    this.authService.logout();
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
    this.sharedService.deactivateSearchMode();
    window.location.href = '/home';
  }

  navigateToPurchaseConfirmation(): void {
    const transactionNumber = this.currentTransaction?.transactionNumber || ''; // Asegúrate de tener acceso a `currentTransaction`
    this.router.navigate(['/purchase-confirmation'], {
      queryParams: { transactionNumber }
    });
  }

  goToLogin() {
    this.router.navigate(['login']);
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

  selectTab(tab: string) {
    this.sharedService.emitTableAction(tab);
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  toggleCategories() {
    this.categoriesExpanded = !this.categoriesExpanded;
  }

  navigateToRandomKeys() {
    this.router.navigate(["/random-keys"]);
  }

  toggleUserTabs() {
    this.tabsExpanded = !this.tabsExpanded;
  }



  onDropdownMouseEnter(): void {
    this.isDropdownHovered = true;
    // Cancelar el temporizador si el mouse vuelve a entrar al dropdown
    if (this.hideDropdownTimeout) {
      clearTimeout(this.hideDropdownTimeout);
      this.hideDropdownTimeout = null;
    }
  }

  onDropdownMouseLeave(): void {
    // Configurar un temporizador para ocultar el dropdown después de 1 segundo
    this.hideDropdownTimeout = setTimeout(() => {
      this.isDropdownHovered = false;
      this.selectedGenre = null;
    }, 1000);
  }

  onHoverGenre(genre: string | null): void {
    if (genre) {
      this.selectedGenre = genre;
    } else {
      this.selectedGenre = null;
    }
  }
  onSelectGenre(genre: string): void {
    if (this.selectedGenre === genre) {
      // Si la misma categoría se selecciona nuevamente, deseleccionarla
      this.selectedGenre = null;
    } else {
      this.selectedGenre = genre;
    }
  }

  countCartItems() {
    this.cartService.loadCartItemCountFromServer();

    // Escucha cambios en el conteo de ítems
    this.cartService.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
    });
  }

  loadCartItems(): void {
    this.cartService.cartItems$.subscribe((items) => {
      this.cartItems = items;
    });
  }
  goToCart(): void {
    // Navegar al carrito
    window.location.href = '/cart';
  }

  onCartHover(): void {
    this.showCartModal = true;
  }
  closeCartModal(): void {
    this.showCartModal = false;
  }

  onCartLeave(): void {
    this.showCartModal = false;
  }

  handleFreeFireSearch(isFreeFire: boolean): void {
    this.searchStateService.setFreeFireSearchState(isFreeFire);
  }

  protected readonly user = user;
}
