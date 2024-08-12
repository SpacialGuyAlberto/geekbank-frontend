import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { User } from '../models/User';
import { CommonModule } from '@angular/common';
import {KinguinGiftCard} from "../models/KinguinGiftCard";
import {AdminPanelComponent} from "../admin-panel/admin-panel.component";


@Component({
  selector: 'app-user-details',
  standalone: true,
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
  imports: [CommonModule, AdminPanelComponent]
})
export class UserDetailsComponent implements OnInit {
  user: User | any;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getUserDetails().subscribe(data => {
      this.user = data;

    });
  }
}
