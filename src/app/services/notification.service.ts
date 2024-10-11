// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {Notification} from "../models/Notification";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: Notification[] = [];
  private notificationsSubject: BehaviorSubject<Notification[]> = new BehaviorSubject<Notification[]>([]);

  private idCounter: number = 0;

  constructor() {
    this.loadNotifications();
  }

  private loadNotifications() {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      this.notifications = JSON.parse(storedNotifications);
      this.idCounter = this.notifications.length > 0 ? Math.max(...this.notifications.map(n => n.id)) : 0;
      this.notificationsSubject.next(this.notifications);
    }
  }

  private saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  // Obtener el observable de notificaciones
  getNotifications(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable();
  }

  // Agregar una nueva notificación
  addNotification(message: string, image: string) {
    const newNotification: Notification = {
      id: ++this.idCounter,
      message,
      timestamp: new Date(),
      read: false,
      imageUrl: image
    };
    this.notifications.unshift(newNotification); // Agregar al inicio de la lista

    // Limitar a 50 notificaciones
    if (this.notifications.length > 50) {
      this.notifications.pop();
    }

    this.notificationsSubject.next(this.notifications);
    this.saveNotifications();
  }

  // Marcar una notificación como leída
  markAsRead(id: number) {
    const index = this.notifications.findIndex(notif => notif.id === id);
    if (index !== -1) {
      this.notifications[index].read = true;
      this.notificationsSubject.next(this.notifications);
      this.saveNotifications();
    }
  }

  // Marcar todas las notificaciones como leídas
  markAllAsRead() {
    this.notifications.forEach(notif => notif.read = true);
    this.notificationsSubject.next(this.notifications);
    this.saveNotifications();
  }

  // Eliminar una notificación
  removeNotification(id: number) {
    this.notifications = this.notifications.filter(notif => notif.id !== id);
    this.notificationsSubject.next(this.notifications);
    this.saveNotifications();
  }

  // Obtener el conteo de notificaciones no leídas
  getUnreadCount(): number {
    return this.notifications.filter(notif => !notif.read).length;
  }
}
