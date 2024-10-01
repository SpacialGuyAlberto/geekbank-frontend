import {Component, NgIterable} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf, NgOptimizedImage, UpperCasePipe} from "@angular/common";
import {User} from "../../../models/User";
import {UserService} from "../../../user.service";
import {Transaction, TransactionsService} from "../../../transactions.service";
import {TransactionsComponent} from "../transactions/transactions.component";

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
    TransactionsComponent
  ],
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent {
  searchQuery: string = '';
  selectedClient: User | undefined;
  users: User[] = [];
  transactions: Transaction[] = [];
  photo: string = "C:\\Users\\LuisA\\Documents\\GeekCoin\\geekbank-frontend\\src\\assets\\blank-profile-picture-973460_1280.png";

  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  visibleTransactions: Transaction[] = [];
  activeTab: string | undefined;
  filteredClients: (NgIterable<User> & NgIterable<any>) | undefined | null;

  constructor(private userService: UserService, private transactionService: TransactionsService){}

  ngOnInit() {
    this.fetchAllUsers()
  }

  fetchAllUsers(){
    this.userService.getUsers()
    .subscribe(data => {
      this.users = data;
      console.log(data);
    })
  }

  fetchTransactionsPerPage(userId: number | undefined){
    this.transactionService.getTransactionsById(userId).subscribe(data => {
      this.transactions = data;
      this.totalPages = Math.ceil(this.transactions.length / this.itemsPerPage);
      this.updateVisibleTransactions();
    })
    console.log('Fetching transactions')
  }

  updateVisibleTransactions(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.visibleTransactions = this.transactions.slice(startIndex, endIndex);
  }


  get filteredUsers() {
    return this.users.filter(user => user.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }

  showTransactions(client: User) {
    this.selectedClient = client;
    //this.fetchTransactionsForUser(client.id)
    this.fetchTransactionsPerPage(client.id)
  }

  addClient() {
    console.log('Agregar nuevo cliente');
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updateVisibleTransactions();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateVisibleTransactions();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateVisibleTransactions();
    }
  }

  showClientDetails(client: User) {
    this.selectedClient = client;
    this.updateVisibleTransactions()
  }

  editClient(client: User) {

  }

  deleteClient(client: User) {

  }

  selectTab(info: string) {

  }
}
