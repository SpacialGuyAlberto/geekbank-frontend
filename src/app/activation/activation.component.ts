import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-activation',
  templateUrl: './activation.component.html',
  standalone: true,
  styleUrls: ['./activation.component.css']
})
export class ActivationComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.activateUser(token);
      }
    });
  }

  async activateUser(token: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.http.get(`http://localhost:7070/api/auth/activate?token=${token}`, { responseType: 'text' }));
      this.showDialog('Cuenta activada', 'Cuenta activada exitosamente. Ahora puedes iniciar sesión.');
      this.router.navigate(['/login']);
    } catch (error) {
      // @ts-ignore
      if (error.status === 400) {
        this.showDialog('Error', 'Token de activación inválido o ya utilizado. Inténtalo nuevamente.');
      } else {
        this.showDialog('Error', 'Error al activar la cuenta. Inténtalo nuevamente.');
      }
      this.router.navigate(['/login']);
    }
  }

  showDialog(title: string, message: string): void {
    this.dialog.open(AlertDialogComponent, {
      data: {
        title: title,
        message: message
      }
    });
  }
}
