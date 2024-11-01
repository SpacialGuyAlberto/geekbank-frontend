// languages.component.ts
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

interface Language {
  code: string;
  emoji: string;
  name: string;
}

@Component({
  selector: 'app-languages',
  standalone: true,
  templateUrl: './languages.component.html'
})
export class LanguagesComponent implements OnInit {
  languages: Language[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Language[]>('https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/index.json')
      .subscribe((data) => {
        this.languages = data;
      });
  }
}
