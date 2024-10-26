// src/app/home/home.component.spec.ts

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { KinguinService } from '../kinguin.service';
import { UIStateServiceService } from '../uistate-service.service';
import { KinguinGiftCard } from '../models/KinguinGiftCard';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {HighlightService} from "../highlights.service";
import { MatDialogModule } from '@angular/material/dialog'; // Si usas Angular Material Dialog
import { ReactiveFormsModule } from '@angular/forms'; // Si usas formularios reactivos
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

// Importa los componentes hijos
import { FreeFireGiftCardComponent } from "../free-fire-gift-card/free-fire-gift-card.component";
import { KinguinGiftCardsComponent } from "../kinguin-gift-cards/kinguin-gift-cards.component";
import { HighlightsComponent } from '../highlights/highlights.component';
import { RecommendationsComponent } from "../recommendations/recommendations.component";
import { FiltersComponent } from "../filters/filters.component";

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let kinguinServiceMock: jasmine.SpyObj<KinguinService>;
  let uiStateServiceMock: jasmine.SpyObj<UIStateServiceService>;
  let highlightServiceMock: jasmine.SpyObj<HighlightService>;
  let activatedRouteMock: any;

  beforeEach(async () => {
    // Crear mocks para los servicios
    kinguinServiceMock = jasmine.createSpyObj('KinguinService', ['searchGiftCards', 'getGiftCardsModel']);
    uiStateServiceMock = jasmine.createSpyObj('UIStateServiceService', ['showHighlights$']);
    highlightServiceMock = jasmine.createSpyObj('HighlightService', ['getHighlights']); // Añade métodos según sea necesario

    // Definir comportamientos por defecto para los mocks
    kinguinServiceMock.searchGiftCards.and.returnValue(of([]));
    kinguinServiceMock.getGiftCardsModel.and.returnValue(of([])); // Mock para getGiftCardsModel
    uiStateServiceMock.showHighlights$ = of(true);
    highlightServiceMock.getHighlights.and.returnValue(of([])); // Mock para getHighlights

    // Mock para ActivatedRoute
    activatedRouteMock = {
      queryParams: of({ search: 'test query' })
    };

    await TestBed.configureTestingModule({
      imports: [
        HomeComponent, // Importar el componente standalone
        HttpClientTestingModule, // Proporcionar HttpClient
        MatDialogModule, // Importar módulos adicionales si se utilizan
        ReactiveFormsModule, // Importar formularios reactivos si se utilizan
        CommonModule,
        RouterTestingModule,
        // Importa los componentes hijos si no son standalone, de lo contrario, no es necesario
        FreeFireGiftCardComponent,
        KinguinGiftCardsComponent,
        HighlightsComponent,
        RecommendationsComponent,
        FiltersComponent
      ],
      providers: [
        { provide: KinguinService, useValue: kinguinServiceMock },
        { provide: UIStateServiceService, useValue: uiStateServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: HighlightService, useValue: highlightServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Prueba para verificar la creación del componente
  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  // Prueba para asignar el nombre de usuario desde localStorage
  it('debería asignar el nombre de usuario desde localStorage', () => {
    localStorage.setItem('username', 'Test User');
    component.ngOnInit();
    expect(component.username).toBe('Test User');
  });

  // Prueba para ajustar el tamaño de la pantalla
  // it('debería ajustar el tamaño de la pantalla y establecer isSmallScreen en true o false', () => {
  //   spyOnProperty(window, 'innerWidth', 'get').and.returnValue(500);
  //   component.checkScreenSize();
  //   expect(component.isSmallScreen).toBeTrue();
  //
  //   spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1000);
  //   component.checkScreenSize();
  //   expect(component.isSmallScreen).toBeFalse();
  // });

  // Prueba para activar/desactivar el filtro
  it('debería activar o desactivar el filtro', () => {
    expect(component.isFilterVisible).toBeFalse();
    component.toggleFilter();
    expect(component.isFilterVisible).toBeTrue();
    component.toggleFilter();
    expect(component.isFilterVisible).toBeFalse();
  });

  // Prueba para aplicar filtros
  it('debería aplicar filtros y ocultar destacados y recomendaciones', () => {
    component.applyFilters();
    expect(component.isFilterVisible).toBeFalse();
    expect(component.showHighlightsAndRecommendations).toBeFalse();
  });

  // Prueba para realizar una búsqueda y asignar resultados
  it('debería realizar la búsqueda y asignar resultados a searchResults', fakeAsync(() => {
    const mockSearchResults: KinguinGiftCard[] = [
      {
        imageUrl: 'test-image-url.jpg',
        name: 'Test Gift Card',
        description: 'A test description for a gift card.',
        coverImage: 'cover-image.jpg',
        coverImageOriginal: 'cover-image-original.jpg',
        developers: ['Developer1', 'Developer2'],
        publishers: ['Publisher1'],
        genres: ['Action', 'Adventure'],
        platform: 'PC',
        releaseDate: '2023-12-01',
        quantity: 10,
        qty: 10,
        textQty: 10,
        price: 29.99,
        cheapestOfferId: ['offer1', 'offer2'],
        isPreorder: false,
        regionalLimitations: 'None',
        regionId: 1,
        activationDetails: 'Activation instructions here',
        kinguinId: 12345,
        productId: 'prod-123',
        originalName: 'Original Gift Card Name',
        screenshots: [
          { url: 'screenshot1.jpg', urlOriginal: 'screenshot1-original.jpg' }
        ],
        videos: [
          { name: 'Intro Video', videoId: 'vid-123' }
        ],
        languages: ['EN', 'ES'],
        systemRequirements: [
          { system: 'Windows', requirement: ['4GB RAM', '500MB HDD'] }
        ],
        tags: ['popular', 'new'],
        offers: [
          {
            name: 'Standard Offer',
            offerId: 'offer-123',
            price: 29.99,
            qty: 10,
            textQty: 10,
            availableQty: 10,
            availableTextQty: 10,
            merchantName: 'Merchant1',
            isPreorder: false,
            releaseDate: '2023-12-01'
          }
        ],
        offersCount: 1,
        totalQty: 10,
        merchantName: ['Merchant1'],
        ageRating: '18+',
        images: {
          screenshots: [
            { url: 'screenshot1.jpg', urlOriginal: 'screenshot1-original.jpg' }
          ],
          cover: {
            thumbnail: 'cover-thumbnail.jpg'
          }
        },
        updatedAt: '2023-12-01T12:00:00Z',
        wished: true,
        selectedImage: 'selected-image.jpg'
      }
    ];

    kinguinServiceMock.searchGiftCards.and.returnValue(of(mockSearchResults));

    component.searchQuery = 'test';
    component.executeSearch();

    tick();
    expect(component.searchResults).toEqual(mockSearchResults);
  }));

  // Prueba para abrir el modal de filtro
  it('debería abrir el modal de filtro', () => {
    component.openFilterModal();
    expect(component.isFilterVisible).toBeTrue();
  });

  // Prueba para cerrar el modal de filtro
  it('debería cerrar el modal de filtro', () => {
    component.openFilterModal();
    expect(component.isFilterVisible).toBeTrue();
    component.closeFilterModal();
    expect(component.isFilterVisible).toBeFalse();
  });

  // Prueba para suscribirse a showHighlights$ y actualizar el estado
  it('debería suscribirse a showHighlights$ y actualizar showHighlightsAndRecommendations', () => {
    uiStateServiceMock.showHighlights$ = of(false);
    component.ngOnInit();
    expect(component.showHighlightsAndRecommendations).toBeFalse();
  });

  // Prueba para ejecutar la búsqueda al detectar el parámetro de búsqueda en la URL
  it('debería ejecutar la búsqueda al detectar el parámetro de búsqueda en la URL', () => {
    spyOn(component as any, 'executeSearch'); // Usar `any` para omitir la verificación de tipo estricta
    component.ngOnInit();
    expect(component.searchQuery).toBe('test query');
    expect(component['executeSearch']).toHaveBeenCalled();
  });

  // // Prueba para desuscribirse al destruir el componente
  // it('debería desuscribirse de uiStateSubscription al destruirse', () => {
  //   component.ngOnDestroy();
  //   expect(component.uiStateSubscription?.closed).toBeTrue();
  // });


  // Agrega más pruebas según sea necesario
});
