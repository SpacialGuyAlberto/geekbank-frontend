import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, NgForOf, NgIf } from "@angular/common";
import { KinguinGiftCard } from "../../../models/KinguinGiftCard";
import { WishListService } from "../../../wish-list.service";
import { WishItemWithGiftcard } from "../../../models/WishItem";

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    CurrencyPipe
  ],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css'] // Corregido a 'styleUrls'
})
export class WishlistComponent implements OnInit {

  wishedItems: WishItemWithGiftcard[] = [];
  userId: number = 0;

  constructor(private wishListService: WishListService) {}

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
    this.wishListService.removeWishItem(itemId).subscribe(
      () => {
        console.log(`Ítem con ID ${itemId} eliminado de la lista de deseos.`);
        this.loadItems(); // Recargar la lista después de eliminar un ítem
      },
      error => {
        console.error(`Error al eliminar el ítem con ID ${itemId}:`, error);
      }
    );
  }

}
