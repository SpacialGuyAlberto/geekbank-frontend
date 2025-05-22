import {AfterViewInit, Component, EventEmitter, NgIterable, OnInit, Output} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf, NgOptimizedImage, UpperCasePipe} from "@angular/common";
import {User} from "../user-details/User";
import {UserService} from "../user-details/user.service";
import { TransactionsService} from "../transactions/transactions.service";
import {TransactionsComponent} from "../transactions/transactions.component";
import {CreateCustomerComponent} from "../create-customer/create-customer.component";
import {KinguinGiftCard} from "../kinguin-gift-cards/KinguinGiftCard";
import {RegisterComponent} from "../register/register.component";
import {Transaction} from "../transactions/transaction.model";

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    CurrencyPipe,
    NgOptimizedImage,
    NgForOf,
    NgIf,
    NgClass,
    UpperCasePipe,
    TransactionsComponent,
    CreateCustomerComponent,
    RegisterComponent
  ],
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit, AfterViewInit{
  editMode: { [key: string]: boolean } = {};
  searchQuery: string = '';
  createNewCustomer: boolean = false;
  selectedClient: User | undefined;
  displayedUsers: User[] = [];
  users: User[] = [];
  transactions: Transaction[] = [];
  photo: string = "C:\\Users\\LuisA\\Documents\\GeekCoin\\geekbank-frontend\\src\\assets\\blank-profile-picture-973460_1280.png";
  currentPage: number = 1;
  itemsPerPage: number = 20;
  totalPages: number = 0;
  @Output() customersChange: EventEmitter<number> = new EventEmitter<number>();
  customers: number = 0;
  role: string = "";
  visibleTransactions: Transaction[] = [];
  activeTab: string | undefined;
  filteredClients: (NgIterable<User> & NgIterable<any>) | undefined | null;
  roles : string[] = ["ADMIN", "CUSTOMER", "SELLER"]
  constructor(private userService: UserService, private transactionService: TransactionsService){}

  ngOnInit() {
    this.fetchAllUsers()
    this.updateDisplayedUsers();
  }

  ngAfterViewInit(): void {
    this.updateTotalPages();
  }

  fetchAllUsers(){
    this.userService.getUsers()
    .subscribe(data => {
      this.users = data;
      this.customers = this.countCustomers();
      console.log('CUSTOMERS: ' + this.customers);
      this.customersChange.emit(this.customers);
    })
  }

  get filteredUsers() {
    if (this.searchQuery === '') {
      this.updateDisplayedUsers()
      return this.displayedUsers;
    }
    return this.users.filter(user => user.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }

  countCustomers() : number {
    return this.users.filter(user => user.role === 'CUSTOMER').length;
  }

  updateDisplayedUsers(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedUsers = this.users.slice(startIndex, endIndex);
    this.updateTotalPages();
  }

  addClient() {
    console.log('Agregar nuevo cliente');
    this.createNewCustomer = true;
  }

  toggleCustomerCreation(){
    this.createNewCustomer = !this.createNewCustomer;
  }

  toggleEdit(field: string): void {
    if (this.editMode[field]) {
    }
    this.editMode[field] = !this.editMode[field];
  }

  toggleUserDetails(client: User) {
    if (client == this.selectedClient){
      this.selectedClient = undefined;
    } else {
      this.selectedClient = client;
    }
    if (this.createNewCustomer){
      this.toggleCustomerCreation();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    //this.updateVisibleTransactions();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      //this.updateVisibleTransactions();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      //this.updateVisibleTransactions();
    }
  }

  showClientDetails(client: User) {
    this.selectedClient = client;
    if (this.createNewCustomer){
      this.toggleCustomerCreation();
    }
  }


  closeClientDetails() {

  }

  saveCustomerDetails(){

  }

  updateTotalPages(): void {
    this.totalPages = Math.ceil(this.users.length / this.itemsPerPage);
    console.log('Total de páginas:', this.totalPages);
  }
}
