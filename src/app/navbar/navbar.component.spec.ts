import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import {RouterLink} from "@angular/router";
import { NgIf } from '@angular/common';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import {RouterTestingModule} from "@angular/router/testing";

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    authServiceMock = {
      isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(true),
      performLogout: jasmine.createSpy('performLogout').and.returnValue(of(true))
    };
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      imports: [RouterTestingModule, RouterLink, NgIf],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check if user is logged in', () => {
    expect(component.isLoggedIn()).toBeTrue();
    expect(authServiceMock.isLoggedIn).toHaveBeenCalled();
  });

  it('should call performLogout and navigate to login on logout', async () => {
    await component.logout();
    expect(authServiceMock.performLogout).toHaveBeenCalledWith(routerMock);
  });

  it('should display login button if user is not logged in', () => {
    authServiceMock.isLoggedIn.and.returnValue(false);
    fixture.detectChanges();
    const loginButton = fixture.debugElement.query(By.css('.login-button'));
    expect(loginButton).toBeTruthy();
  });

  it('should display logout button if user is logged in', () => {
    authServiceMock.isLoggedIn.and.returnValue(true);
    fixture.detectChanges();
    const logoutButton = fixture.debugElement.query(By.css('.logout-button'));
    expect(logoutButton).toBeTruthy();
  });
});
