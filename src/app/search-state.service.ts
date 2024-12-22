import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchStateService {
  private freeFireSearchSubject = new BehaviorSubject<boolean>(false);
  isFreeFireSearch$ = this.freeFireSearchSubject.asObservable();

  setFreeFireSearchState(isFreeFire: boolean): void {
    this.freeFireSearchSubject.next(isFreeFire);
  }
}
