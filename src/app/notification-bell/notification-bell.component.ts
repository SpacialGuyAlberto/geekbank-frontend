// src/app/components/notification-bell/notification-bell.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService } from "../services/notification.service";
import { Notification } from '../models/Notification';
import { Subscription } from 'rxjs';
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {Router, NavigationEnd} from "@angular/router";

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  standalone: true,
  imports: [
    DatePipe,
    NgIf,
    NgForOf,
    NgClass
  ],
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent implements OnInit, OnDestroy { // Implementa OnDestroy
  notifications: Notification[] = [];
  unreadCount: number = 0;
  isDropdownVisible: boolean = false;
  bellIcon: string = '';
  markAllButton: string = '';
  private subscription!: Subscription;
  private routerSubscription!: Subscription;

  constructor(private notificationService: NotificationService, private router: Router) { }

  ngOnInit(): void {
    this.subscription = this.notificationService.getNotifications().subscribe(notifs => {
      this.notifications = notifs;
      this.unreadCount = this.notificationService.getUnreadCount();
    });
    this.routerSubscription = this.router.events.subscribe( event => {
      if (event instanceof NavigationEnd){
       this.updateStyleClass(this.router.url);
      }
    });
  }

  updateStyleClass(url: string): void {
    if (url.includes('/admin-panel')){
      this.markAllButton = 'mark-all-button-admin';
      this.bellIcon = 'bell-icon-admin';
    } else {
      this.markAllButton = 'mark-all-button-default';
      this.bellIcon = 'bell-icon-default';
    }
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
