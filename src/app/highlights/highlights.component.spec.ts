// src/app/highlights/highlights.component.spec.ts

import { ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { HighlightsComponent } from './highlights.component';
import { HighlightService } from '../highlights.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { KinguinGiftCard } from '../models/KinguinGiftCard';
import { HighlightItemWithGiftcard } from '../models/HighlightItem';

describe('HighlightsComponent', () => {
  let component: HighlightsComponent;
  let fixture: ComponentFixture<HighlightsComponent>;
  let highlightServiceMock: jasmine.SpyObj<HighlightService>;
  let router: Router;

  beforeEach(async () => {
    // Crear un mock para HighlightService con el método getHighlights
    highlightServiceMock = jasmine.createSpyObj('HighlightService', ['getHighlights']);

    // Definir los datos de prueba para HighlightItemWithGiftcard
    const mockHighlightData: HighlightItemWithGiftcard[] = [
      {
        hihlightItem: { id: 1, productId: 12345 }, // Nota: Asegúrate de que el nombre de la propiedad coincide con la interfaz
        giftcard: {
          imageUrl: 'test-image-url.jpg',
          name: 'Test Gift Card',
          description: 'A test description for a gift card.',
          coverImage: 'cover-image.jpg',
          coverImageOriginal: 'cover-image-original.jpg',
          developers: ['Developer1'],
          publishers: ['Publisher1'],
          genres: ['Action'],
          platform: 'PC',
          releaseDate: '2023-12-01',
          quantity: 10,
          qty: 10,
          textQty: 10,
          price: 29.99,
          cheapestOfferId: ['offer1'],
          isPreorder: false,
          regionalLimitations: 'None',
          regionId: 1,
          activationDetails: 'Activation instructions here',
          kinguinId: 12345,
          productId: 'prod-123',
          originalName: 'Original Gift Card Name',
          screenshots: [{ url: 'screenshot1.jpg', urlOriginal: 'screenshot1-original.jpg' }],
          videos: [{ name: 'Intro Video', videoId: 'vid-123' }],
          languages: ['EN'],
          systemRequirements: [{ system: 'Windows', requirement: ['4GB RAM'] }],
          tags: ['popular'],
          offers: [{
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
          }],
          offersCount: 1,
          totalQty: 10,
          merchantName: ['Merchant1'],
          ageRating: '18+',
          images: {
            screenshots: [{ url: 'screenshot1.jpg', urlOriginal: 'screenshot1-original.jpg' }],
            cover: { thumbnail: 'cover-thumbnail.jpg' }
          },
          updatedAt: '2023-12-01T12:00:00Z',
          wished: true,
          selectedImage: 'cover-image-original.jpg'
        }
      }
    ];

    // Configurar el mock para devolver los datos de prueba
    highlightServiceMock.getHighlights.and.returnValue(of(mockHighlightData));

    await TestBed.configureTestingModule({
      imports: [
        HighlightsComponent, // Importar el componente standalone
        HttpClientTestingModule, // Proporcionar HttpClient
        RouterTestingModule // Proporcionar Router
      ],
      providers: [
        { provide: HighlightService, useValue: highlightServiceMock } // Proveer el servicio mockeado
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HighlightsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges(); // Invoca ngOnInit y carga los highlights
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar los highlights al inicializar', fakeAsync(() => {
    // ngOnInit ya se invocó en fixture.detectChanges()
    tick(); // Simula el paso del tiempo para resolver las operaciones asíncronas

    expect(highlightServiceMock.getHighlights).toHaveBeenCalled();
    expect(component.highlights.length).toBe(1);
    expect(component.highlights[0].name).toBe('Test Gift Card');
    expect(component.highlights[0].selectedImage).toBe('cover-image-original.jpg');
  }));

  it('debería mover al siguiente slide', fakeAsync(() => {
    const mockTrack = {
      clientWidth: 300,
      style: { transform: '' }
    } as unknown as HTMLElement;

    spyOn(document as any, 'querySelector').and.returnValue(mockTrack);

    component.currentIndex = 0;
    component.moveToNextSlide();
    tick();

    expect(component.currentIndex).toBe(1);
    expect(mockTrack.style.transform).toBe('translateX(-300px)');
  }));

  it('debería navegar a los detalles de una gift card', fakeAsync(() => {
    const navigateSpy = spyOn(router as any, 'navigate').and.returnValue(Promise.resolve(true));
    const mockCard: KinguinGiftCard = {
      imageUrl: 'test-image-url.jpg',
      name: 'Test Gift Card',
      description: 'Test Description',
      coverImage: 'cover-image.jpg',
      coverImageOriginal: 'cover-image-original.jpg',
      developers: [],
      publishers: [],
      genres: [],
      platform: '',
      releaseDate: '',
      quantity: 0,
      qty: 0,
      textQty: 0,
      price: 0,
      cheapestOfferId: [],
      isPreorder: false,
      regionalLimitations: '',
      regionId: 0,
      activationDetails: '',
      kinguinId: 12345,
      productId: 'prod-123',
      originalName: '',
      screenshots: [],
      videos: [],
      languages: [],
      systemRequirements: [],
      tags: [],
      offers: [],
      offersCount: 0,
      totalQty: 0,
      merchantName: [],
      ageRating: '',
      images: { screenshots: [], cover: { thumbnail: '' } },
      updatedAt: '',
      wished: false,
      selectedImage: ''
    };

    component.viewDetails(mockCard);
    tick();

    expect(navigateSpy).toHaveBeenCalledWith(['/gift-card-details', 12345]);
  }));

  it('debería obtener resolución de imagen correctamente', async () => {
    const mockImageUrl = 'test-image.jpg';
    const mockResolution = { width: 100, height: 200 };
    const mockImage = {
      src: '',
      width: mockResolution.width,
      height: mockResolution.height,
      onload: () => {}
    } as unknown as HTMLImageElement;

    spyOn(window as any, 'Image').and.returnValue(mockImage);

    const result = await component.getImageResolution(mockImageUrl);
    expect(result).toEqual(mockResolution);
  });

  it('debería manejar el caso de error al cargar la imagen', async () => {
    const mockImageUrl = 'invalid-image.jpg';
    const mockImage = {
      src: '',
      onerror: (null as unknown) as (event: Event) => void // Ajuste de tipo para `onerror`
    } as unknown as HTMLImageElement;

    spyOn(window as any, 'Image').and.returnValue(mockImage);

    // Crear la promesa para obtener la resolución de la imagen
    const promise = component.getImageResolution(mockImageUrl);

    // Llamar manualmente a `onerror` con un `Event`
    const errorEvent = new Event('error');
    mockImage.onerror!(errorEvent);

    // Esperar que la promesa se rechace debido al evento de error
    await expectAsync(promise).toBeRejected();
  });


  it('debería establecer selectedImage a una imagen válida cuando esté disponible', fakeAsync(() => {
    // ngOnInit ya se invocó en fixture.detectChanges()
    tick(); // Simula el paso del tiempo para resolver las operaciones asíncronas

    expect(component.highlights.length).toBe(1);
    expect(component.highlights[0].selectedImage).toBe('cover-image-original.jpg');
  }));

  it('debería establecer selectedImage a una cadena vacía si no hay imágenes válidas', fakeAsync(() => {
    // Configurar el mock para retornar datos sin imágenes válidas
    const mockHighlightData: HighlightItemWithGiftcard[] = [
      {
        hihlightItem: { id: 2, productId: 456 },
        giftcard: {
          imageUrl: 'no-image.jpg',
          name: 'No Image Gift Card',
          description: '',
          coverImage: '',
          coverImageOriginal: '',
          developers: [],
          publishers: [],
          genres: [],
          platform: '',
          releaseDate: '',
          quantity: 0,
          qty: 0,
          textQty: 0,
          price: 0,
          cheapestOfferId: [],
          isPreorder: false,
          regionalLimitations: '',
          regionId: 0,
          activationDetails: '',
          kinguinId: 456,
          productId: 'prod-456',
          originalName: '',
          screenshots: [],
          videos: [],
          languages: [],
          systemRequirements: [],
          tags: [],
          offers: [],
          offersCount: 0,
          totalQty: 0,
          merchantName: [],
          ageRating: '',
          images: { screenshots: [], cover: { thumbnail: '' } },
          updatedAt: '',
          wished: false,
          selectedImage: ''
        }
      }
    ];

    // Actualizar el mock para devolver datos sin imágenes válidas
    highlightServiceMock.getHighlights.and.returnValue(of(mockHighlightData));

    // Llamar a loadHighlights nuevamente para cargar los nuevos datos
    component.loadHighlights();
    tick(); // Simula el paso del tiempo para resolver las operaciones asíncronas

    expect(component.highlights.length).toBe(1);
    expect(component.highlights[0].selectedImage).toBe('');
  }));
});
