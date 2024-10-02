import { Component } from '@angular/core';
import {FormsModule, NgForm, ReactiveFormsModule} from "@angular/forms";
import {MatFormField, MatFormFieldModule, MatLabel} from "@angular/material/form-field";
import {UserService} from "../../../user.service";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {MatOptgroup, MatOption, MatSelect, MatSelectModule} from "@angular/material/select";
import {NgStyle} from "@angular/common";

@Component({
  selector: 'app-create-customer',
  standalone: true,
  imports: [
    FormsModule,
    MatFormField,
    MatInput,
    MatButton,
    MatFormFieldModule,
    MatSelectModule,
    MatFormField,
    MatSelect,
    MatOption,
    MatOptgroup,
    ReactiveFormsModule,
    MatLabel,
    NgStyle,
  ],
  templateUrl: './create-customer.component.html',
  styleUrl: './create-customer.component.css'
})
export class CreateCustomerComponent {
  client = {
    name: '',
    email: '',
    phone: '',
  }

  constructor(private userService: UserService) {}

  addClient() {

  }

  cancel() {

  }
}
