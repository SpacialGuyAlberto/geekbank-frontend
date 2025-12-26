import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComboService } from '../flash-sale/config/combo.service';
import {Combo} from "../flash-sale/config/models/Combo"; // Adjust import path if needed


@Component({
    selector: 'app-combos',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="combos-container" *ngIf="combos.length > 0">
      <h2 class="section-title">Combos & Deals</h2>
      <div class="combos-grid">
        <div class="combo-card" *ngFor="let combo of combos">
          <div class="combo-image">
            <img [src]="combo.imageUrl" [alt]="combo.name">
          </div>
          <div class="combo-details">
            <h3>{{ combo.name }}</h3>
            <p class="description">{{ combo.description }}</p>
            <div class="price-action">
              <span class="price">\${{ combo.price }}</span>
              <button class="buy-btn">Buy Combo</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .combos-container {
      padding: 20px;
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      margin-bottom: 30px;
    }
    .section-title {
      color: #fff;
      font-size: 1.5rem;
      margin-bottom: 20px;
      border-left: 4px solid #007bff;
      padding-left: 10px;
    }
    .combos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .combo-card {
      background: #1e1e1e;
      border-radius: 10px;
      overflow: hidden;
      transition: transform 0.3s ease;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    }
    .combo-card:hover {
      transform: translateY(-5px);
    }
    .combo-image img {
      width: 100%;
      height: 180px;
      object-fit: cover;
    }
    .combo-details {
      padding: 15px;
    }
    .combo-details h3 {
      color: #fff;
      margin: 0 0 10px 0;
      font-size: 1.2rem;
    }
    .description {
      color: #bbb;
      font-size: 0.9rem;
      margin-bottom: 15px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .price-action {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .price {
      color: #00ff88;
      font-size: 1.2rem;
      font-weight: bold;
    }
    .buy-btn {
      background: linear-gradient(45deg, #007bff, #00bcd4);
      border: none;
      padding: 8px 16px;
      border-radius: 20px;
      color: white;
      cursor: pointer;
      font-weight: bold;
      transition: opacity 0.3s;
    }
    .buy-btn:hover {
      opacity: 0.9;
    }
  `]
})
export class CombosComponent implements OnInit {
    combos: Combo[] = [];

    constructor(private comboService: ComboService) { }

    ngOnInit(): void {
        this.comboService.getAll().subscribe({
            next: (data) => {
                // Filter only active combos if needed, though backend currently returns all.
                // Assuming backend might implement filtering or we filter here.
                this.combos = data.filter(c => c.isActive);
            },
            error: (err) => console.error('Error loading combos', err)
        });
    }
}
