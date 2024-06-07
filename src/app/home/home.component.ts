import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {HomeService} from "../home.service";

interface onInit {
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    RouterModule,
    CommonModule
  ]
})
export class HomeComponent implements onInit {
  username: string = '';
  homeData: any;

  constructor(private homeService: HomeService) {}

  ngOnInit() {
    const storedUsername = localStorage.getItem('username');

    if (storedUsername) {
      this.username = storedUsername;
    }

  }
  loadHomeData(): void {
    this.homeService.getHomeData().subscribe(
      data => {
        this.homeData = data;
      },
      error => {
        console.error('Error fetching home data', error);
      }
    );
  }

}

