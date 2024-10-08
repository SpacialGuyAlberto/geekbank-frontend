// src/app/components/notification-bell/notification-bell.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService } from "../services/notification.service";
import { Notification } from '../models/Notification';
import { Subscription } from 'rxjs';
import { DatePipe, NgForOf, NgIf } from "@angular/common";

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  standalone: true,
  imports: [
    DatePipe,
    NgIf,
    NgForOf
  ],
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent implements OnInit, OnDestroy { // Implementa OnDestroy
  notifications: Notification[] = [];
  unreadCount: number = 0;
  isDropdownVisible: boolean = false;
  private subscription!: Subscription;

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.subscription = this.notificationService.getNotifications().subscribe(notifs => {
      this.notifications = notifs;
      this.unreadCount = this.notificationService.getUnreadCount();
    });
  }

  showDropdown() {
    this.isDropdownVisible = true;
  }

  hideDropdown() {
    setTimeout(() => {
      this.isDropdownVisible = false;
    }, 2000)
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  removeNotification(id: number) {
    this.notificationService.removeNotification(id);
  }

  openNotification(notif: Notification) {
    this.notificationService.markAsRead(notif.id);
    console.log('Abrir notificación:', notif.message);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
