import {Component, OnInit} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {HomeService} from "../home.service";
import {FreeFireGiftCardComponent} from "../free-fire-gift-card/free-fire-gift-card.component";
import {KinguinGiftCardsComponent} from "../kinguin-gift-cards/kinguin-gift-cards.component";
import {NgModel} from "@angular/forms";

interface onInit {
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    RouterModule,
    CommonModule,
    FreeFireGiftCardComponent,
    KinguinGiftCardsComponent,
  ]
})
// export class HomeComponent implements onInit {
//   username: string = '';
//   homeData: any;
//   errorMessage: string = '';
//
//   constructor(private homeService: HomeService) {}
//
//   ngOnInit() {
//     const storedUsername = localStorage.getItem('username');
//
//     if (storedUsername) {
//       this.username = storedUsername;
//     }
//     this.loadHomeData();
//   }
//   loadHomeData(): void {
//     this.homeService.getHomeData().subscribe(
//       data => {
//         this.homeData = data;
//       },
//       error => {
//         if (error.status === 401) {
//           this.errorMessage = error.error.error;
//         } else {
//           this.errorMessage = 'Error fetching home data';
//         }
//         console.error('Error fetching home data', error);
//       }
//     );
//   }
//
// }
export class HomeComponent implements OnInit {
  username: string = '';

  ngOnInit() {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;
    }
  }
}


