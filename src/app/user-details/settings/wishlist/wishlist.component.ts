import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, NgForOf, NgIf } from "@angular/common";
import { KinguinGiftCard } from "../../../models/KinguinGiftCard";
import { WishListService } from "../../../wish-list.service";
import { WishItemWithGiftcard } from "../../../models/WishItem";
import {MatIcon} from "@angular/material/icon";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import {NotificationService} from "../../../services/notification.service";
import {async} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    CurrencyPipe,
    MatIcon,
    MatSnackBarModule
  ],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css'] // Corregido a 'styleUrls'
})
export class WishlistComponent implements OnInit {

  wishedItems: WishItemWithGiftcard[] = [];
  notifyMessage: String = '';
  userId: number = 0;

  constructor(private wishListService: WishListService,
              private notificationService: NotificationService,
              private snackBar: MatSnackBar,
              private router: Router,) {}

  ngOnInit(): void {
    this.loadItems();
    const userIdString = sessionStorage.getItem("userId");
    if (userIdString) {
      this.userId = parseInt(userIdString, 10);
      console.log('USER ID : ' + this.userId);
    } else {
      console.warn('No se encontró el userId en sessionStorage.');
    }
  }

  loadItems(): void {
    this.wishListService.getWishItems().subscribe(
      data => {
        this.wishedItems = data;
        console.log("Loaded wish items: ", data);
      },
      error => {
        console.error("Error al cargar los ítems de la lista de deseos:", error);
      }
    );
  }

  removeFromWishlist(itemId: number): void {
    console.log(itemId)
    let element = this.wishedItems.find( item => item.wishedItem.id === itemId);

    this.wishListService.removeWishItem(itemId).subscribe(() => {
        this.notifyMessage = `The product ${itemId} was deleted from the wish list`;
        this.notificationService.addNotification(this.notifyMessage.toString(), element?.giftCard.coverImageOriginal);
        this.showSnackBar(`The product ${itemId} was deleted from the wish list`)
        this.loadItems();
      },
      error => {
        console.error(`Error al eliminar el ítem con ID ${itemId}:`, error);
      }
    );
  }
  showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }

  viewDetails(card: KinguinGiftCard): void {
    console.log('CARD ID: ' + card.productId);
    this.router.navigate(['/gift-card-details', card.kinguinId]).then(success => {
      if (success) {
        console.log('Navigation successful');
      } else {
        console.log('Navigation failed');
      }
    });
  }


  getGiftCard(itemId: string ) : void {
    this.wishListService.getWishItem(itemId).subscribe();
  }
  protected readonly Number = Number;
}



