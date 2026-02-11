import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TournamentService } from '../tournament.service';
import { TournamentInscriptionDTO } from '../model/tournamentInscriptionDto.model';

@Component({
    selector: 'app-tournament-signup',
    imports: [CommonModule, FormsModule],
    templateUrl: './tournament-signup.component.html',
    styleUrls: ['./tournament-signup.component.css']
})
export class TournamentSignupComponent {
  player = {
    fullName: '',
    gamerTag: '',
    age: null,
    email: '',
    phone: '',
    country: '',
    platform: '',
    gameId: '',
    team: '',
    role: '',
    acceptRules: false,
    acceptMedia: false,
    comments: ''
  };

  emailValid: boolean | null = null; // null: sin validar, false: inválido, true: válido

  constructor(private tournamentService: TournamentService) {}

  validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailValid = emailRegex.test(this.player.email);
  }

  onSubmit() {
    if (!this.player.acceptRules) {
      alert('Debes aceptar las reglas del torneo para continuar.');
      return;
    }

    // Si el email no es válido, no enviamos el formulario
    if (!this.emailValid) {
      return;
    }

    const inscription: TournamentInscriptionDTO = {
      nickname: this.player.gamerTag,
      email: this.player.email,
      gamerId: this.player.gameId
    };

    this.tournamentService.sendTournamentInscription(inscription).subscribe({
      next: () => {
        alert('¡Inscripción completada con éxito!');
      },
      error: (err) => {
        console.error('Error al enviar inscripción:', err);
        alert('Ocurrió un error al enviar la inscripción. Intenta nuevamente.');
      }
    });
  }
}
