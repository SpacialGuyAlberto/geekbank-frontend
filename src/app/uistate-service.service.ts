import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UIStateServiceService {

  constructor() { }

  private showHighlightsSubject = new BehaviorSubject<boolean>(true);
  showHighlights$ = this.showHighlightsSubject.asObservable();

  setShowHighlights(value: boolean) {
    this.showHighlightsSubject.next(value);
  }
}
