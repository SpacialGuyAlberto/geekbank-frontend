import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TelegramListenerService {

  private readonly TELEGRAM_BOT_TOKEN = '7022402011:AAHf6k0ZolFa9hwiZMu1srj868j5-eqUecU';
  private readonly BASE_URL = `https://api.telegram.org/bot${this.TELEGRAM_BOT_TOKEN}/getUpdates`;
  private backendUrl = 'http://localhost:7070/';
  private lastUpdateId = 0;

  constructor(private http: HttpClient) {
    this.listenForMessages();
  }

  listenForMessages() {
    interval(1000).pipe(
      switchMap(() => this.http.get<any>(`${this.BASE_URL}?offset=${this.lastUpdateId + 1}`))
    ).subscribe(response => {
      if (response.result.length > 0) {
        response.result.forEach((update: any) => {
          this.processUpdate(update);
        });
      }
    }, error => {
      console.error('Error fetching updates from Telegram:', error);
    });
  }

  private processUpdate(update: any) {
    this.lastUpdateId = update.update_id;
    if (update.channel_post) {
      const message = update.channel_post.text;
      const chatId = update.channel_post.chat.id;

      console.log(`Message from channel ${chatId}: ${message}`);

      this.sendUpdateToBackend(message);
    }
  }

  private sendUpdateToBackend(message: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(this.backendUrl + 'api/telegram/update', { message }, { headers })
      .subscribe(response => {
        console.log('Update sent to backend:', response);
      }, error => {
        console.error('Error sending update to backend:', error);
      });
  }
}

