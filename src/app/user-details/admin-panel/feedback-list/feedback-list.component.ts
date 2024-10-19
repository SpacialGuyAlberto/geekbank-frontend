import { Component, OnInit } from '@angular/core';
import { FeedbackService } from '../../../services/feedback.service';
import { Feedback } from '../../../models/Feedback';
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-feedback-list',
  templateUrl: './feedback-list.component.html',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    NgForOf,
    NgIf
  ],
  styleUrls: ['./feedback-list.component.css']
})
export class FeedbackListComponent implements OnInit {
  feedbacks: Feedback[] = [];
  filteredFeedbacks: Feedback[] = [];
  filterCriteria: string = '';
  selectedFeedback: Feedback | null = null;

  constructor(private feedbackService: FeedbackService) { }

  ngOnInit(): void {
    this.loadFeedbacks();
    // this.loadDemoFeedbacks();
  }

  loadFeedbacks(): void {
    this.feedbackService.fetchAllFeedbacks().subscribe(
      data => {
        this.feedbacks = data;
        this.filteredFeedbacks = data;
      },
      error => {
        console.error('Error al obtener los feedbacks', error);
      }
    );
  }

  // loadDemoFeedbacks(): void {
  //   this.feedbacks = [
  //     {
  //       id: 1,
  //       // user: { id: 1, username: 'john_doe' },
  //       productId: 'PROD001',
  //       score: 5,
  //       message: 'Excelente producto, superó mis expectativas.',
  //       createdAt: new Date('2023-10-01T10:00:00')
  //     },
  //     {
  //       id: 2,
  //       // user: { id: 2, username: 'jane_smith' },
  //       productId: 'PROD002',
  //       score: 3,
  //       message: 'El producto es decente, pero podría mejorar la calidad.',
  //       createdAt: new Date('2023-10-02T14:30:00')
  //     },
  //     {
  //       id: 3,
  //       // user: { id: 3, username: 'alex_jones' },
  //       productId: 'PROD001',
  //       score: 4,
  //       message: 'Buen producto, entrega rápida y excelente atención al cliente.',
  //       createdAt: new Date('2023-10-03T09:15:00')
  //     },
  //     {
  //       id: 4,
  //       // user: { id: 4, username: 'chris_evans' },
  //       productId: 'PROD003',
  //       score: 2,
  //       message: 'El producto no cumple con las descripciones, muy decepcionado.',
  //       createdAt: new Date('2023-10-04T11:45:00')
  //     },
  //     {
  //       id: 5,
  //       // user: { id: 5, username: 'nina_brown' },
  //       productId: 'PROD002',
  //       score: 5,
  //       message: 'Increíble calidad, sin duda lo compraré nuevamente.',
  //       createdAt: new Date('2023-10-05T16:00:00')
  //     }
  //   ];

    // Inicialmente, todos los feedbacks están filtrados.
  //   this.filteredFeedbacks = this.feedbacks;
  // }

  filterFeedbacks(): void {
    if (this.filterCriteria) {
      this.filteredFeedbacks = this.feedbacks.filter(feedback =>
        feedback.message.toLowerCase().includes(this.filterCriteria.toLowerCase()) ||
        feedback.giftCardId.toLowerCase().includes(this.filterCriteria.toLowerCase()) ||
        feedback.userId
      );
    } else {
      this.filteredFeedbacks = this.feedbacks;
    }
  }

  selectFeedback(feedback: Feedback): void {
    if (this.selectedFeedback === feedback) {
      this.selectedFeedback = null;
    } else {
      this.selectedFeedback = feedback;
    }
  }

  closeFeedbackDetails(): void {
    this.selectedFeedback = null;
  }
}
