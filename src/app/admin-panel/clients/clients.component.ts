import { Component } from '@angular/core';
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    NgForOf
  ],
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
