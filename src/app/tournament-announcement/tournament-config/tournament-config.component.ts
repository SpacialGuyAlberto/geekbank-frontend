import {Component, OnInit} from '@angular/core';
import {FormControl, FormsModule} from "@angular/forms";
import {Observable, of} from "rxjs";
import {map, startWith} from "rxjs/operators";
import {Promotion} from "../../promotions/Promotion.model";
import {TournamentDTO} from "../model/TournamentDTO";
import {NgForOf} from "@angular/common";
import { TournamentService } from "../tournament.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UserService} from "../../user-details/user.service";
import {User} from "../../user-details/User";

@Component({
  selector: 'app-tournament-config',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf
  ],
  templateUrl: './tournament-config.component.html',
  styleUrl: './tournament-config.component.css'
})
export class TournamentConfigComponent implements OnInit {

  tournament: TournamentDTO | null = null;
  moderator: User | null = null;
  regions = ['Norteamérica', 'Europa', 'Asia', 'América Latina'];
  platforms = [
    { name: 'Facebook', selected: false },
    { name: 'Instagram', selected: false },
    { name: 'TikTok', selected: false },
    { name: 'Twitter', selected: false },
    { name: 'LinkedIn', selected: false }
  ];
  players = ['Juan Pérez', 'María Gómez', 'Luis Fernández'];

  productPrizeControl = new FormControl();
  filteredPrizeProducts: Observable<string[]> = of([]);
  products: string[] = [];
  moderators: User[] = [];
  tournamentDescription: string = '';
  startDate: Date = new Date();
  endDate: Date = new Date();
  tournamentName: string = '';

  constructor(
    private tournamentService: TournamentService,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) {}

  ngOnInit() {

    for (let i = 1; i <= 10; i++) {
      this.products.push(`Producto ${i}`);
    }

    this.filteredPrizeProducts = this.productPrizeControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterProducts(value || ''))
    );
    this.fetchModerator();
  }

  private _filterProducts(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.products.filter(product =>
      product.toLowerCase().includes(filterValue)
    );
  }

  submitTournament() {
    if (!this.tournamentName || !this.tournamentDescription || !this.moderator) {
      console.error('Todos los campos son obligatorios.');
      this.showSnackBar('Por favor, completa todos los campos obligatorios.');
      return;
    }

    const tournament: TournamentDTO = {
      name: this.tournamentName,
      description: this.tournamentDescription,
      startDate: this.startDate,
      endDate: this.endDate,
      status: 'ACTIVE',
      moderatorId: this.moderator?.id ?? 0
    };

    this.tournamentService.createTournament(tournament).subscribe({
      next: () => {
        this.showSnackBar("¡Torneo agregado correctamente!");
        this.resetForm();
      },
      error: (err) => {
        console.error("Error al agregar torneo:", err);
        this.showSnackBar("Error al agregar torneo.");
      }
    });
  }


  resetForm() {
    this.tournamentName = '';
    this.tournamentDescription = '';
    this.startDate = new Date();
    this.endDate = new Date();
    this.moderator = null;
    this.productPrizeControl.reset();
    this.platforms.forEach(platform => (platform.selected = false));
  }


  viewPromotionDetails(promotion: Promotion) {
    alert(`Detalles de la promoción:\n${JSON.stringify(promotion, null, 2)}`);
  }

  showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }

  fetchModerator() {
    this.userService.getUsers().subscribe(users => {
      this.moderators = users.filter(user => user.role === "MODERATOR");
    });
  }

}
