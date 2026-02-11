import { Component, Input, Output, EventEmitter } from '@angular/core';
import {NgForOf} from "@angular/common";

@Component({
    selector: 'app-pagination',
    imports: [
        NgForOf
    ],
    templateUrl: './pagination.component.html',
    styleUrl: './pagination.component.css'
})
export class PaginationComponent {
  @Input() totalPages: number = 0;
  @Input() currentPage: number = 1;
  @Output() pageChange: EventEmitter<number> = new EventEmitter<number>();

  pages: number[] = [];

  ngOnChanges() {
    this.pages = Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  goToPage(page: number) {
    this.pageChange.emit(page);
  }
}
