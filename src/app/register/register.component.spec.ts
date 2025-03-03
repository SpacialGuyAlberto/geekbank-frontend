import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientModule,
        RouterModule.forRoot([]), // Configura rutas si es necesario
        CommonModule
      ],
      declarations: [RegisterComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jasmine.createSpy('register')
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register successfully', () => {
    const response = new HttpResponse({ status: 200 });
    (authService.register as jasmine.Spy).and.returnValue(of(response));

    component.name = 'Test User';
    component.email = 'test@example.com';
    component.password = 'password';
    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith('test@example.com', 'password', 'Test User');
    expect(component.message).toBe('Registration successful!');
    expect(component.messageClass).toBe('success-message');
  });

  it('should handle registration failure', () => {
    const response = new HttpResponse({ status: 400 });
    (authService.register as jasmine.Spy).and.returnValue(of(response));

    component.name = 'Test User';
    component.email = 'test@example.com';
    component.password = 'password';
    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith('test@example.com', 'password', 'Test User');
    expect(component.message).toBe('Registration failed. Please try again.');
    expect(component.messageClass).toBe('error-message');
  });

  it('should handle registration error', () => {
    (authService.register as jasmine.Spy).and.returnValue(throwError(() => new Error('Registration error')));

    component.name = 'Test User';
    component.email = 'test@example.com';
    component.password = 'password';
    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith('test@example.com', 'password', 'Test User');
    expect(component.message).toBe('Registration failed. Please try again.');
    expect(component.messageClass).toBe('error-message');
  });
});
