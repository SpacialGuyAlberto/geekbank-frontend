import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import { TransactionsService} from "./transactions.service";
import {UserService} from "../user-details/user.service";
import {User} from "../user-details/User";
import {MatFormField, MatFormFieldModule, MatLabel} from "@angular/material/form-field";
import {MatOptgroup, MatOption, MatSelect, MatSelectChange, MatSelectModule} from "@angular/material/select";
import {MatInputModule} from "@angular/material/input";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatTableModule} from "@angular/material/table";
import {MatPaginatorModule} from "@angular/material/paginator";
import {Transaction} from "./transaction.model";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {TigoPaymentAdminComponent} from "../tigo-payment-admin/tigo-payment-admin.component";

@Component({
    selector: 'app-transactions',
    imports: [
        FormsModule,
        DatePipe,
        CurrencyPipe,
        NgForOf,
        NgClass,
        MatFormFieldModule,
        MatSelectModule,
        MatFormField,
        MatSelect,
        MatOption,
        MatOptgroup,
        ReactiveFormsModule,
        MatLabel,
        NgStyle,
        NgIf,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatPaginatorModule,
        MatTab,
        TigoPaymentAdminComponent,
        MatTabGroup,
    ],
    templateUrl: './transactions.component.html',
    styleUrls: ['./transactions.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class TransactionsComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() selectedUserFromClients : User | undefined;
  startDate: any;
  displayedColumns: string[] = ['id', 'fecha', 'descripcion', 'estado', 'monto'];

  users: User[] = [];
  user: User | undefined;
  endDate: any;
  transactions: any[] = [];
  usersControl = new FormControl('');
  currentPage: number = 1;
  displayedTransactions: Transaction[] = [];
  itemsPerPage: number = 10;
  totalPages: number = 0;
  blockDropDown: boolean = false;
  selectedTabIndex = 0;
  constructor(private transactionService: TransactionsService, private userService: UserService) {}

  ngOnInit() {
    this.loadTransactions(1);
    this.loadAllTransactions();
    this.fetchAllUsers();
  }

  fetchAllUsers() {
    this.userService.getUsers()
      .subscribe(data => {
        this.users = data;

      })
  }

  filterTransactions() {
    console.log('Filtrar transacciones');
  }

  exportTransactions() {
    console.log('Exportar transacciones como CSV');
  }

  ngAfterViewInit(): void {
    this.updateTotalPages();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedUserFromClients'] && this.selectedUserFromClients) {
      this.fetchTransactionsForUser(this.selectedUserFromClients.id); // Cargar las transacciones para el cliente seleccionado
      this.user = this.selectedUserFromClients;
    }
    // @ts-ignore
    this.usersControl.setValue(this.selectedUserFromClients.id)
    if (this.selectedUserFromClients){
      this.blockDropDown = true;
    }
  }

  protected readonly String = String;

  onUserSelected(event: any): void {
    const selectedUserId = event.value;
    this.fetchTransactionsForUser(selectedUserId);
  }

  fetchTransactionsForUser(userId: number | undefined): void {
    this.transactionService.getTransactionsById(userId).subscribe(data => {
      this.transactions = data;
      this.currentPage = 1; // Reinicia a la primera página cuando se selecciona un nuevo usuario
      this.updateTotalPages(); // Actualiza el total de páginas basado en las transacciones obtenidas
      this.updateDisplayedTransactions();
    });
  }

  loadAllTransactions(): void {
    this.transactionService.getTransactions().subscribe(data => {
      this.transactions = data;
      this.updateTotalPages(); // Actualiza el total de páginas para todas las transacciones
    });
  }

  loadTransactions(page: number): void {
    this.currentPage = page;
    this.updateDisplayedTransactions(); // Actualiza las transacciones mostradas basadas en la página actual
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedTransactions();
    }
  }

  updateDisplayedTransactions(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedTransactions = this.transactions.slice(startIndex, endIndex);
  }

  updateTotalPages(): void {
    this.totalPages = Math.ceil(this.transactions.length / this.itemsPerPage);
    console.log('Total de páginas:', this.totalPages);
  }

}
