import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivationComponent } from './activation.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';

describe('ActivationComponent', () => {
  let component: ActivationComponent;
  let fixture: ComponentFixture<ActivationComponent>;
  let httpMock: HttpTestingController;
  let routeMock: any;
  let routerMock: any;
  let dialogMock: any;

  beforeEach(async () => {
    routeMock = {
      queryParams: of({ token: 'test-token' })
    };
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    dialogMock = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      declarations: [ActivationComponent],
      imports: [HttpClientTestingModule, MatDialogModule],
      providers: [
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: dialogMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivationComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call activateUser with the token from queryParams on ngOnInit', () => {
    spyOn(component, 'activateUser');
    component.ngOnInit();
    expect(component.activateUser).toHaveBeenCalledWith('test-token');
  });

  it('should handle successful account activation', async () => {
    component.activateUser('test-token');
    const req = httpMock.expectOne('http://localhost:7070/api/auth/activate?token=test-token');
    expect(req.request.method).toBe('GET');
    req.flush('Cuenta activada exitosamente.');

    expect(dialogMock.open).toHaveBeenCalledWith(AlertDialogComponent, {
      data: {
        title: 'Cuenta activada',
        message: 'Cuenta activada exitosamente. Ahora puedes iniciar sesión.'
      }
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle activation error with invalid token', async () => {
    component.activateUser('test-token');
    const req = httpMock.expectOne('http://localhost:7070/api/auth/activate?token=test-token');
    expect(req.request.method).toBe('GET');
    req.flush('Token inválido', { status: 400, statusText: 'Bad Request' });

    expect(dialogMock.open).toHaveBeenCalledWith(AlertDialogComponent, {
      data: {
        title: 'Error',
        message: 'Token de activación inválido o ya utilizado. Inténtalo nuevamente.'
      }
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle activation error with server error', async () => {
    component.activateUser('test-token');
    const req = httpMock.expectOne('http://localhost:7070/api/auth/activate?token=test-token');
    expect(req.request.method).toBe('GET');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    expect(dialogMock.open).toHaveBeenCalledWith(AlertDialogComponent, {
      data: {
        title: 'Error',
        message: 'Error al activar la cuenta. Inténtalo nuevamente.'
      }
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
