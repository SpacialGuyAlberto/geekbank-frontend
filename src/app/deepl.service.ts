import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class DeeplService {
  private apiUrl = 'https://api.deepl.com/v2/translate';
  private authKey = 'b9809fe3-aa7c-4802-b12b-cacef4df6e2a:fx';
  constructor(private http: HttpClient) { }

  translateText(text: string, targetLang: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `DeepL-Auth-Key ${this.authKey}`,
      'Content-Type': 'application/json'
    });

    const body = {
      text: "[text]",
      target_lang: targetLang
    };

    return this.http.post(this.apiUrl, body, { headers });
  }

}
