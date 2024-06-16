import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['isBrowser', 'loadGoogleScript', 'initializeGoogleSignIn', 'login']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule, NgClass],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadGoogleScript and initializeGoogleSignIn on ngOnInit if isBrowser is true', fakeAsync(() => {
    authServiceMock.isBrowser.and.returnValue(true);
    authServiceMock.loadGoogleScript.and.returnValue(Promise.resolve());

    component.ngOnInit();
    tick(); // Wait for promises to resolve

    expect(authServiceMock.loadGoogleScript).toHaveBeenCalled();
    expect(authServiceMock.initializeGoogleSignIn).toHaveBeenCalled();
  }));

  it('should display an error if loadGoogleScript fails', fakeAsync(() => {
    const consoleErrorSpy = spyOn(console, 'error');
    authServiceMock.isBrowser.and.returnValue(true);
    authServiceMock.loadGoogleScript.and.returnValue(Promise.reject('Script load error'));

    component.ngOnInit();
    tick(); // Wait for promises to resolve

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading Google script', 'Script load error');
  }));

  it('should login and navigate to /home on successful login', fakeAsync(() => {
    const mockResponse = { status: 200, body: { token: 'fake-token', username: 'fake-username' } };
    authServiceMock.login.and.returnValue(of(mockResponse));

    component.email = 'test@example.com';
    component.password = 'password';
    component.onSubmit();
    tick(); // Simulate the async operation

    expect(localStorage.getItem('token')).toBe('fake-token');
    expect(localStorage.getItem('username')).toBe('fake-username');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/home']);
    flush(); // Clear pending timers
  }));

  it('should show an error message on failed login', fakeAsync(() => {
    const mockErrorResponse = { status: 401 };
    authServiceMock.login.and.returnValue(throwError(mockErrorResponse));

    component.email = 'test@example.com';
    component.password = 'password';
    component.onSubmit();
    tick(); // Simulate the async operation

    expect(component.message).toBe('Login failed. Please try again.');
    expect(component.messageClass).toBe('error-message');
  }));
});
