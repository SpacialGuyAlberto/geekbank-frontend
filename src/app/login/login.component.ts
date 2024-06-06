import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    FormsModule
  ],
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  message: string = '';
  messageClass: string = '';

  constructor(private authService: AuthService, private router: Router) { }

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
