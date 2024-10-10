// activate-email.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-activate-email',
  templateUrl: './activate-email.component.html',
  standalone: true,
  styleUrls: ['./activate-email.component.css']
})
export class ActivateEmailComponent implements OnInit {
  message: string = '';
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  // ngOnInit(): void {
  //   const token = this.route.snapshot.queryParamMap.get('token');
  //   if (token) {
  //     this.userService.activateEmail(token).subscribe({
  //       next: (response) => {
  //         this.message = 'Correo electrónico activado correctamente.';
  //         this.error = '';
  //         // Redirigir al login o dashboard según sea necesario
  //         this.router.navigate(['/login']);
  //       },
  //       error: (err) => {
  //         this.error = err.error?.error || 'Error al activar el correo electrónico.';
  //         this.message = '';
  //       }
  //     });
  //   } else {
  //     this.error = 'Token de activación no proporcionado.';
  //   }
  // }
}
