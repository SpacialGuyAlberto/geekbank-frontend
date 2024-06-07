import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

declare const google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgClass
  ],
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  message: string = '';
  messageClass: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isBrowser()) {
      this.authService.loadGoogleScript().then(() => {
        this.authService.initializeGoogleSignIn();
      }).catch(error => {
        console.error('Error loading Google script', error);
      });
    }
  }

  onSubmit() {
    this.authService.login(this.email, this.password).subscribe(
      response => {
        if (response.status === 200) {
          const token = response.body.token;
          const username = response.body.username;
          localStorage.setItem('token', token);
          localStorage.setItem('username', username);
          this.router.navigate(['/home']);
        } else {
          this.message = 'Login failed. Please try again.';
          this.messageClass = 'error-message';
        }
      },
      error => {
        this.message = 'Login failed. Please try again.';
        this.messageClass = 'error-message';
      }
    );
  }
}
