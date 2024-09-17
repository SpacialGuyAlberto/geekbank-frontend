import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth.service';

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
    public dialog: MatDialog,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      const token = params['token'];
      if (token) {
        this.activateUser(token).then(() => {
          this.showDialog('Cuenta activada', 'Cuenta activada exitosamente. Ahora puedes iniciar sesión.');
          this.router.navigate(['/login']);
        }).catch((error) => {
          console.error('Error activating user:', error);
          this.showDialog('Error', 'No se pudo activar la cuenta.');
        });
      }
    });
  }

  async activateUser(token: string): Promise<void> {
    try {
      await this.authService.activateUser(token).toPromise();
    } catch (error) {
      // @ts-ignore
      throw new Error(error);
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
