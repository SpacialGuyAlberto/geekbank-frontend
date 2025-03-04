import { Component, OnInit } from '@angular/core';
import { FeedbackService } from '../services/feedback.service';
import { Feedback } from './Feedback';
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
