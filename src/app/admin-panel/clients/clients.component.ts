import { Component } from '@angular/core';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent {
  clients: any;
  private _id: any;

  editClient(id: any) {
    this._id = id;

  }

  deleteClient(id: any) {
    this._id = id;

  }

  addClient() {

  }
}
