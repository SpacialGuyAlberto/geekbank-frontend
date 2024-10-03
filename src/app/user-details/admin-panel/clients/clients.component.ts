import {AfterViewInit, Component, NgIterable, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf, NgOptimizedImage, UpperCasePipe} from "@angular/common";
import {User} from "../../../models/User";
import {UserService} from "../../../user.service";
import {Transaction, TransactionsService} from "../../../transactions.service";
import {TransactionsComponent} from "../transactions/transactions.component";
import {CreateCustomerComponent} from "../create-customer/create-customer.component";
import {KinguinGiftCard} from "../../../models/KinguinGiftCard";

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
    CreateCustomerComponent
  ],
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit, AfterViewInit{
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
  visibleTransactions: Transaction[] = [];
  activeTab: string | undefined;
  filteredClients: (NgIterable<User> & NgIterable<any>) | undefined | null;

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
      console.log(data);
    })
  }

  get filteredUsers() {
    if (this.searchQuery === '') {
      this.updateDisplayedUsers()
      return this.displayedUsers;
    }
    return this.users.filter(user => user.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
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

  // toggleProductDetails(product: KinguinGiftCard) {
  //   if (product == this.selectedProduct){
  //     this.selectedProduct = undefined;
  //   }
  //   else {
  //     this.selectedProduct = product;
  //   }
  // }

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

  updateTotalPages(): void {
    this.totalPages = Math.ceil(this.users.length / this.itemsPerPage);
    console.log('Total de páginas:', this.totalPages);
  }
}
